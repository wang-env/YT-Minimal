/** Constantes y datos de demostración */

export const API = "https://www.googleapis.com/youtube/v3";

/* Costo en unidades de cuota por tipo de llamada (developers.google.com/youtube/v3/determine_quota_cost) */
export const COST = {search: 100, read: 1};

export const LIMITS = {
  dailyQuota: 10000, // cuota gratuita diaria por proyecto de Google Cloud
  fetchSize: 50, // máximo por llamada: siempre se pide el máximo (search.list cuesta lo mismo con 5 que con 50)
  pageSize: 15, // vídeos que se muestran por tanda («Cargar más» no gasta cuota mientras queden en el buffer)
  importPages: 20, // tope de llamadas al guardar una playlist de YouTube (≈1000 vídeos)
  cacheTtl: 24 * 3600e3, // vigencia de una búsqueda guardada
  cacheEntries: 30 // páginas de resultados que se conservan
};

/* Progreso y estadísticas: todo vive en el navegador y no gasta cuota */
export const PROGRESS = {
  saveEvery: 5000, // ms entre guardados en localStorage (además se guarda al cerrar el vídeo o la pestaña)
  minResume: 10, // s: por debajo de esto el vídeo se reproduce desde el principio
  rewind: 3, // s que se retroceden al retomar, para recuperar el hilo
  endSlack: 20, // s: si faltan menos de esto (o el endRatio de la duración) el vídeo cuenta como visto
  endRatio: 0.05,
  minDone: 30, // s: por posición solo se da por visto un vídeo de al menos esta duración (los más cortos, al terminar)
  adTolerance: 10, // s (o 5 %): si la duración que informa el reproductor se aparta más de esto de la del vídeo, se trata de un anuncio
  streakMin: 60, // s de estudio para que un día cuente en la racha
  keepDays: 400 // días de historial que se conservan
};

/* Pomodoro (minutos). Las preferencias y los pomodoros por día viven en el navegador */
export const POMODORO = {
  defaults: {
    focus: 25,
    short: 5,
    long: 15,
    every: 4, // sesiones de foco antes de un descanso largo
    auto: false, // false: cada fase espera a que la inicies
    sound: true, // aviso sonoro al terminar una fase
    pauseVideo: true // pausa el vídeo al empezar un descanso
  },
  limits: {focus: [1, 180], short: [1, 60], long: [1, 120], every: [2, 12]}
};

/* Guardado automático en un archivo del equipo (ms) */
export const AUTOSAVE = {
  delay: 2000, // espera tras un cambio antes de escribir (agrupa cambios seguidos)
  minGap: 10000 // tiempo mínimo entre escrituras: el progreso cambia cada pocos segundos mientras se reproduce
};

export const DEMO = [
  ["Introducción a React en 10 minutos", "Código Limpio", "PT10M4S", "1204552", "2024-03-02"],
  ["Diseño minimalista: principios esenciales", "Estudio Forma", "PT8M31S", "388210", "2023-11-18"],
  ["Lo-fi para concentrarte · 2 horas", "Ondas Suaves", "PT2H1M", "5120330", "2022-06-09"],
  ["Animaciones CSS que debes conocer", "Pixel & Co", "PT14M22S", "92411", "2025-01-21"]
].map((d, i) => ({
  id: "demo" + i,
  title: d[0],
  channel: d[1],
  dur: d[2],
  views: d[3],
  date: d[4],
  demo: true
}));
