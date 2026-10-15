/** Exportar e importar playlists como JSON, y formato del archivo de guardado automático. La API key nunca se incluye. */

const APP = "yt-minimal";

const isVideo = v => v && typeof v.id === "string" && typeof v.title === "string";
const isPlaylist = p =>
  p && typeof p.id === "string" && typeof p.name === "string" && Array.isArray(p.items);

/* Solo se conservan los campos conocidos de cada vídeo */
const isChapter = c => Array.isArray(c) && Number.isFinite(c[0]) && typeof c[1] === "string";
const cleanVideo = v => ({
  id: v.id,
  title: v.title,
  channel: v.channel || "",
  date: v.date || null,
  dur: v.dur || null,
  views: v.views || null,
  tag: v.tag || "",
  ...(Array.isArray(v.ch) ? {ch: v.ch.filter(isChapter).map(c => [c[0], c[1]])} : {}) // sin «ch» = capítulos aún sin cargar
});
const cleanPlaylist = p => ({
  id: p.id,
  name: p.name,
  items: p.items.filter(isVideo).map(cleanVideo)
});

export function exportPlaylists(playlists) {
  const data = {app: APP, version: 1, playlists};
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 1)], {type: "application/json"})
  );
  link.download = `${APP}-playlists-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

const isDay = key => /^\d{4}-\d{2}-\d{2}$/.test(key);
const cleanDays = days =>
  Object.fromEntries(
    Object.entries(days || {}).filter(([key, sec]) => isDay(key) && Number.isFinite(sec))
  );
const cleanProgress = p => {
  const n = v => (Number.isFinite(v) ? v : 0);
  return {
    t: n(p.t),
    d: n(p.d),
    s: n(p.s),
    w: !!p.w,
    at: n(p.at),
    ...(Number.isFinite(p.wat) ? {wat: p.wat} : {})
  };
};

/** Archivo de guardado automático: playlists + progreso + estadísticas + pomodoros. Sigue sin incluir la API key. */
export const buildSnapshot = ({pls, videos, days, pomoDays}) => ({
  app: APP,
  version: 2,
  savedAt: new Date().toISOString(),
  playlists: pls,
  progress: {videos, days},
  pomodoro: {days: pomoDays}
});

function parse(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error("El archivo no es un JSON válido.");
  }
  if (!data || data.app !== APP || !Array.isArray(data.playlists))
    throw new Error("El archivo no es una copia de yt-minimal.");
  return data;
}

/** @returns {Promise<Array>} playlists válidas del archivo; lanza Error con un mensaje legible */
export async function readBackup(file) {
  return parse(await file.text())
    .playlists.filter(isPlaylist)
    .map(cleanPlaylist);
}

/** Texto de un archivo de guardado → {playlists, videos, days, pomoDays} limpios (lo que falte, vacío) */
export function parseSnapshot(text) {
  const data = parse(text);
  const videos = (data.progress && data.progress.videos) || {};
  return {
    playlists: data.playlists.filter(isPlaylist).map(cleanPlaylist),
    videos: Object.fromEntries(
      Object.entries(videos)
        .filter(([, p]) => p && typeof p === "object")
        .map(([id, p]) => [id, cleanProgress(p)])
    ),
    days: cleanDays(data.progress && data.progress.days),
    pomoDays: cleanDays(data.pomodoro && data.pomodoro.days)
  };
}
