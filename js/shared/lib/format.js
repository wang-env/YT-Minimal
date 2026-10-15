/** Formateo de duración, vistas, fechas y color de etiquetas */

const p2 = n => String(n).padStart(2, "0");

/* «PT1H2M3S» (ISO 8601, con días opcionales) → segundos; 0 si no se conoce */
export const parseDur = iso => {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(iso || "");
  return m ? ((+m[1] || 0) * 24 + (+m[2] || 0)) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0) : 0;
};
/* Segundos → reloj: 4:05 o 1:02:03 */
export const fmtClock = s => {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60);
  return h ? `${h}:${p2(m)}:${p2(s % 60)}` : `${m}:${p2(s % 60)}`;
};
export const fmtDur = iso => {
  const s = parseDur(iso);
  return s ? fmtClock(s) : "";
};
/* Segundos → lectura humana: «8 h 20 min», «45 min», «<1 min» */
export const fmtSpan = s => {
  const m = Math.round(s / 60);
  if (m < 1) return s > 0 ? "<1 min" : "0 min";
  const h = Math.floor(m / 60),
    r = m % 60;
  return h ? (r ? `${h} h ${r} min` : `${h} h`) : `${r} min`;
};
/* Día local «2026-10-13»: clave de las estadísticas diarias */
export const dayKey = (ms = Date.now()) => new Date(ms).toLocaleDateString("en-CA");
export const fmtViews = n => {
  n = +n;
  return n >= 1e6 ? (n / 1e6).toFixed(1) + " M" : n >= 1e3 ? Math.round(n / 1e3) + " K" : n + "";
};
export const fmtDate = d =>
  d ? new Date(d).toLocaleDateString("es", {year: "numeric", month: "short", day: "numeric"}) : "";
/* «Canal · 1,2 M vistas · fecha», omitiendo lo que no se conoce (vídeos obtenidos sin API) */
export const metaLine = v =>
  [v.channel, v.views && fmtViews(v.views) + " vistas", fmtDate(v.date)]
    .filter(Boolean)
    .join(" · ");
export const decode = s => {
  const t = document.createElement("textarea");
  t.innerHTML = s;
  return t.value;
};
export const chipStyle = t => {
  if (!t) return {};
  let h = 0;
  for (const c of t.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) % 360;
  return {
    background: `hsl(${h} 70% 50% / .14)`,
    color: `hsl(${h} 65% 58%)`,
    borderColor: `hsl(${h} 70% 50% / .35)`
  };
};
