/** Progreso de cada vídeo y segundos estudiados por día. Vive en el navegador y no gasta cuota. */
import {store} from "../../shared/lib/storage.js";
import {PROGRESS} from "../../config.js";
import {dayKey} from "../../shared/lib/format.js";
import {mergeDays} from "../../shared/domain/stats.js";

const VIDEOS = "yt_prog"; // {[id]: {t: posición (s), d: duración (s), s: segundos estudiados, w: visto, at: última actividad (ms), wat: cuándo se vio (ms)}}
const DAYS = "yt_days"; // {"2026-10-13": segundos estudiados ese día}

const prune = days => {
  const min = dayKey(Date.now() - PROGRESS.keepDays * 864e5);
  return Object.fromEntries(Object.entries(days).filter(([key]) => key >= min));
};

let videos = store.get(VIDEOS, {});
let days = prune(store.get(DAYS, {}));
let snap = {videos, days};
let lastSave = 0;
const listeners = new Set();

/* Los cambios viven en memoria al instante; a disco y a la interfaz llegan como mucho cada «saveEvery» (o ya, con force) */
function commit(force) {
  const now = Date.now();
  if (!force && now - lastSave < PROGRESS.saveEvery) return;
  lastSave = now;
  snap = {videos, days};
  store.set(VIDEOS, videos);
  store.set(DAYS, days);
  listeners.forEach(fn => fn());
}

const blank = {t: 0, d: 0, s: 0, w: false, at: 0};
const update = (id, fn) => {
  videos = {...videos, [id]: fn({...blank, ...videos[id]})};
};
const r1 = n => Math.round(n * 10) / 10;
const isDone = (t, d) =>
  d >= PROGRESS.minDone && d - t <= Math.max(PROGRESS.endSlack, d * PROGRESS.endRatio);

export const progress = {
  /** Estado confirmado: {videos, days} (inmutable; cambia de identidad en cada guardado) */
  get: () => snap,

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /** Un tick del reproductor. `live`: la posición es fiable (reproduciendo o en pausa). `dt`: segundos que estuvo reproduciendo. */
  track(id, {t, d, dt, live}) {
    if (!live) return;
    const now = Date.now();
    update(id, p => {
      const next = {...p, at: now};
      if (d > 0) next.d = Math.round(d);
      if (dt > 0) next.s = r1(p.s + dt);
      /* Un vídeo visto no guarda posición: al volver a abrirlo empieza desde el principio */
      if (!p.w) {
        if (isDone(t, next.d)) Object.assign(next, {w: true, t: 0, wat: now});
        else next.t = Math.floor(t);
      }
      return next;
    });
    if (dt > 0) {
      const key = dayKey(now);
      days = {...days, [key]: r1((days[key] || 0) + dt)};
    }
    commit();
  },

  /** Une datos importados: por vídeo gana el de actividad más reciente; por día, el mayor tiempo */
  merge(incoming) {
    const next = {...videos};
    for (const [id, p] of Object.entries(incoming.videos)) {
      if (!next[id] || (p.at || 0) > (next[id].at || 0)) next[id] = {...blank, ...p};
    }
    videos = next;
    days = prune(mergeDays(days, incoming.days));
    commit(true);
  },

  /** El vídeo llegó al final */
  finish(id) {
    const now = Date.now();
    update(id, p => ({...p, w: true, t: 0, at: now, wat: p.w ? p.wat : now}));
    commit(true);
  },

  setWatched(id, watched) {
    const now = Date.now();
    update(id, p =>
      watched
        ? {...p, w: true, t: 0, wat: p.w ? p.wat : now}
        : {...p, w: false, t: 0, wat: undefined}
    );
    commit(true);
  },

  /** Segundo desde el que reanudar (0 = desde el principio) */
  resumeAt(id) {
    const p = videos[id];
    return p && !p.w && p.t >= PROGRESS.minResume
      ? Math.max(0, Math.floor(p.t) - PROGRESS.rewind)
      : 0;
  },

  flush: () => commit(true)
};

window.addEventListener("pagehide", () => commit(true));
document.addEventListener(
  "visibilitychange",
  () => document.visibilityState === "hidden" && commit(true)
);
