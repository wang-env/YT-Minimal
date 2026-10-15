/** Capítulos de un vídeo. La API de YouTube no los expone: salen de las líneas «0:00 Título» de la descripción,
 *  con las mismas reglas que usa YouTube (empiezan en 0:00, mínimo 3 y en orden ascendente).
 *  Se guardan como pares compactos [segundo, título] para no inflar la caché ni las playlists. */

const LINE =
  /^\W{0,4}(?:\d{1,2}[.)]\s+)?[(\[]?((?:\d{1,2}:)?\d{1,2}:\d{2})[)\]]?\s*[-–—:|.)]*\s*(.+)$/;

const toSeconds = clock => clock.split(":").reduce((total, n) => total * 60 + +n, 0);

/** @returns {Array<[number, string]>} lista vacía si la descripción no define capítulos válidos */
export function parseChapters(description, duration = 0) {
  const found = [];
  for (const line of String(description || "").split(/\r?\n/)) {
    const m = LINE.exec(line.trim());
    if (m) found.push([toSeconds(m[1]), m[2].trim().slice(0, 90)]);
  }
  const valid =
    found.length >= 3 &&
    found[0][0] === 0 &&
    found.every(([t], i) => (i === 0 || t > found[i - 1][0]) && (!duration || t < duration));
  return valid ? found : [];
}

/** Índice del capítulo que contiene el segundo `t` (-1 si no hay capítulos) */
export function chapterAt(chapters, t) {
  let index = -1;
  for (let i = 0; i < chapters.length && chapters[i][0] <= t; i++) index = i;
  return index;
}
