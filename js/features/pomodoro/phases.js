/** Lógica pura del Pomodoro (sin React ni DOM): fases, transiciones y tiempo restante.
 *  Estado: {phase: "focus" | "short" | "long", done: sesiones de foco del ciclo, running, endsAt (ms) si corre, left (s) si está en pausa} */
import {POMODORO} from "../../config.js";

export const PHASE_LABEL = {focus: "Foco", short: "Descanso", long: "Descanso largo"};

export const phaseSecs = (cfg, phase) => cfg[phase] * 60;

/** Fase lista para empezar, con todo su tiempo */
export const idle = (cfg, phase = "focus", done = 0) => ({
  phase,
  done,
  running: false,
  endsAt: null,
  left: phaseSecs(cfg, phase)
});

/** Segundos que quedan; el tiempo se calcula con relojes (endsAt), no contando ticks, para no atrasarse en pestañas en segundo plano */
export const remaining = (s, now = Date.now()) =>
  s.running ? Math.max(0, Math.ceil((s.endsAt - now) / 1000)) : s.left;

export const start = (s, now = Date.now()) => ({...s, running: true, endsAt: now + s.left * 1000});
export const pause = (s, now = Date.now()) => ({
  ...s,
  running: false,
  endsAt: null,
  left: remaining(s, now)
});

/** Fase sin tocar desde que se preparó: un cambio de ajustes puede actualizar su duración */
export const isFresh = (s, cfg) => !s.running && s.left === phaseSecs(cfg, s.phase);

/** Siguiente fase, preparada y en pausa. Foco → descanso (largo al completar el ciclo) → foco.
 *  `completed` es false al saltar un foco: no cuenta como sesión. */
export function advance(s, cfg, completed = true) {
  const done = s.phase === "long" ? 0 : s.phase === "focus" && completed ? s.done + 1 : s.done;
  const phase = s.phase !== "focus" ? "focus" : done >= cfg.every ? "long" : "short";
  return idle(cfg, phase, done);
}

/** Ajustes válidos: enteros dentro de sus límites y valores predeterminados donde falte algo */
export function clampConfig(raw) {
  const cfg = {...POMODORO.defaults, ...raw};
  for (const [key, [min, max]] of Object.entries(POMODORO.limits)) {
    const n = Math.round(Number(cfg[key]));
    cfg[key] = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : POMODORO.defaults[key];
  }
  return cfg;
}

/** Estado guardado → estado inicial. Si el temporizador vencía con la página cerrada no se cuenta como sesión (no se sabe si hubo estudio). */
export function restore(saved, cfg, now = Date.now()) {
  const ok =
    saved && PHASE_LABEL[saved.phase] && Number.isFinite(saved.left) && Number.isFinite(saved.done);
  if (!ok) return idle(cfg);
  if (!saved.running) return saved;
  return saved.endsAt > now ? saved : advance(saved, cfg, false);
}
