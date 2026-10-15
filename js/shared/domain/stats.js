/** Cálculos puros sobre playlists, progreso de visionado y días de estudio */
import {PROGRESS} from "../../config.js";
import {dayKey, parseDur} from "../lib/format.js";

/* Duración conocida de un vídeo: la de la API o, si falta (vídeos de oEmbed), la que midió el reproductor */
export const videoSecs = (v, p) => parseDur(v.dur) || (p && p.d) || 0;
export const isStarted = p => !!p && !p.w && p.t >= PROGRESS.minResume;

/** Duración total, tiempo restante y vídeos vistos/empezados de una lista */
export function totals(items, videos) {
  const r = {count: items.length, total: 0, remaining: 0, unknown: 0, done: 0, started: 0, pct: 0};
  for (const v of items) {
    const p = videos[v.id];
    if (p && p.w) r.done++;
    else if (isStarted(p)) r.started++;
    const d = videoSecs(v, p);
    if (!d) {
      r.unknown++;
      continue;
    }
    r.total += d;
    if (!(p && p.w)) r.remaining += Math.max(0, d - (p ? p.t : 0));
  }
  r.pct = r.total ? 1 - r.remaining / r.total : 0;
  return r;
}

/** Qué ver a continuación: el vídeo empezado con actividad más reciente o, si no hay, el primero sin ver */
export function nextUp(items, videos) {
  let best = null;
  for (const v of items) {
    const p = videos[v.id];
    if (isStarted(p) && (!best || p.at > videos[best.id].at)) best = v;
  }
  return best || items.find(v => !(videos[v.id] && videos[v.id].w)) || null;
}

/* ── Días de estudio ── */
const daysAgo = n => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};
const nextDay = key => {
  const d = new Date(key + "T12:00:00");
  d.setDate(d.getDate() + 1);
  return dayKey(d.getTime());
};

export const sumDays = (days, n) => {
  let s = 0;
  for (let i = 0; i < n; i++) s += days[dayKey(daysAgo(i).getTime())] || 0;
  return s;
};
/** Une dos mapas {día: valor} quedándose con el mayor de cada día */
export const mergeDays = (a, b) => {
  const out = {...a};
  for (const [key, value] of Object.entries(b)) out[key] = Math.max(value, out[key] || 0);
  return out;
};
export const allDays = days => Object.values(days).reduce((a, b) => a + b, 0);

/** Los últimos n días, del más antiguo a hoy */
export const lastDays = (days, n) =>
  Array.from({length: n}, (_, i) => {
    const date = daysAgo(n - 1 - i);
    const key = dayKey(date.getTime());
    return {key, date, sec: days[key] || 0};
  });

/** Racha actual (días seguidos hasta hoy; si hoy aún no se estudia, cuenta desde ayer) y mejor racha */
export function streaks(days) {
  const ok = key => (days[key] || 0) >= PROGRESS.streakMin;
  let current = 0;
  for (let i = ok(dayKey(daysAgo(0).getTime())) ? 0 : 1; ok(dayKey(daysAgo(i).getTime())); i++)
    current++;

  let best = 0,
    run = 0,
    prev = null;
  for (const key of Object.keys(days).filter(ok).sort()) {
    run = prev && nextDay(prev) === key ? run + 1 : 1;
    best = Math.max(best, run);
    prev = key;
  }
  return {current, best: Math.max(best, current)};
}

/* ── Desgloses ── */
const studied = (items, videos) =>
  items.reduce((sum, v) => sum + ((videos[v.id] && videos[v.id].s) || 0), 0);

export const byPlaylist = (pls, videos) =>
  pls.map(pl => ({pl, ...totals(pl.items, videos), studied: studied(pl.items, videos)}));

/** Tiempo estudiado por tipo de vídeo (un vídeo en varias playlists cuenta una vez) */
export function byTag(pls, videos) {
  const map = new Map();
  for (const pl of pls)
    for (const v of pl.items) {
      if (!v.tag) continue;
      const e = map.get(v.tag) || {tag: v.tag, ids: new Set(), sec: 0};
      if (!e.ids.has(v.id)) {
        e.ids.add(v.id);
        e.sec += (videos[v.id] && videos[v.id].s) || 0;
      }
      map.set(v.tag, e);
    }
  return [...map.values()]
    .map(e => ({tag: e.tag, count: e.ids.size, sec: e.sec}))
    .sort((a, b) => b.sec - a.sec || b.count - a.count);
}

export const countWatched = videos => Object.values(videos).filter(p => p.w).length;
export const countStarted = videos => Object.values(videos).filter(isStarted).length;
