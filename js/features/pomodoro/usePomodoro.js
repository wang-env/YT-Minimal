/** Sesiones con temporizador (Pomodoro): estado de la fase, ajustes y pomodoros completados por día.
 *  No hace re-renderizar la app cada segundo: quien muestre la cuenta atrás se refresca por su cuenta. */
import {useState, useEffect, useRef} from "../../shared/lib/react.js";
import {store} from "../../shared/lib/storage.js";
import {beep} from "./beep.js";
import {useStored} from "../../shared/lib/useStored.js";
import {POMODORO, PROGRESS} from "../../config.js";
import {dayKey, fmtClock} from "../../shared/lib/format.js";
import {mergeDays} from "../../shared/domain/stats.js";
import {
  PHASE_LABEL,
  idle,
  remaining,
  start,
  pause,
  advance,
  isFresh,
  clampConfig,
  restore
} from "./phases.js";

const STATE = "yt_pomo"; // fase en curso (sobrevive a recargar la página)
const DAYS = "yt_pomo_days"; // {"2026-10-13": pomodoros completados ese día}

const addToday = days => {
  const min = dayKey(Date.now() - PROGRESS.keepDays * 864e5);
  const kept = Object.fromEntries(Object.entries(days).filter(([key]) => key >= min));
  const today = dayKey();
  return {...kept, [today]: (kept[today] || 0) + 1};
};

export function usePomodoro() {
  const [saved, setSaved] = useStored("yt_pomo_cfg", POMODORO.defaults);
  const config = clampConfig(saved);
  const [days, setDays] = useStored(DAYS, {});
  const [s, setS] = useState(() => restore(store.get(STATE, null), config));
  useEffect(() => store.set(STATE, s), [s]);

  /* El intervalo se crea una vez por fase y necesita siempre el estado y los ajustes más recientes */
  const latest = useRef({s, config});
  latest.current = {s, config};

  /* Un foco completado suma un pomodoro; después se pasa a la siguiente fase (que arranca sola solo si «auto») */
  const finish = () => {
    const {s, config} = latest.current;
    if (config.sound) beep();
    if (s.phase === "focus") setDays(addToday);
    const next = advance(s, config);
    setS(config.auto ? start(next) : next);
  };

  /* Una vez por segundo: detecta el final y muestra la cuenta atrás en el título de la pestaña */
  useEffect(() => {
    if (!s.running) return;
    const base = document.title;
    const tick = () => {
      const left = remaining(latest.current.s);
      if (left <= 0) return finish();
      document.title = `${fmtClock(left)} · ${PHASE_LABEL[latest.current.s.phase]} · ${base}`;
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => {
      clearInterval(timer);
      document.title = base;
    };
  }, [s.running, s.endsAt]);

  return {
    phase: s.phase,
    done: s.done,
    running: s.running,
    config,
    days,
    remaining: () => remaining(s),
    mergeDays: incoming => setDays(d => mergeDays(d, incoming)),
    toggle: () => setS(p => (p.running ? pause(p) : start(p))),
    skip: () => setS(p => advance(p, config, false)),
    reset: () => setS(idle(config)),
    /* Una fase sin empezar adopta la nueva duración; una en curso la conserva hasta la siguiente */
    configure: patch => {
      const next = clampConfig({...config, ...patch});
      setSaved(next);
      setS(p => (isFresh(p, config) ? idle(next, p.phase, p.done) : p));
    }
  };
}
