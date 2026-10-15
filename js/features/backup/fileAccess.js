/** Acceso a un archivo del equipo (File System Access API: Chrome, Edge, Opera de escritorio).
 *  El permiso a un archivo se recuerda con su «handle» en IndexedDB; tras reiniciar el navegador puede pedir confirmación otra vez. */
import {idb} from "./idb.js";

const KEY = "autosave-file";
const MODE = {mode: "readwrite"};
const TYPES = {
  types: [{description: "Copia de yt-minimal (JSON)", accept: {"application/json": [".json"]}}]
};

/* Cerrar el diálogo sin elegir no es un error */
const pick = fn =>
  fn().catch(e => {
    if (e.name === "AbortError") return null;
    throw e;
  });

export const autosave = {
  supported: "showSaveFilePicker" in window && "showOpenFilePicker" in window,

  /** Elegir dónde crear el archivo; null si se cancela */
  async create() {
    const handle = await pick(() =>
      window.showSaveFilePicker({suggestedName: "yt-minimal.json", ...TYPES})
    );
    if (handle) await idb.set(KEY, handle);
    return handle;
  },

  /** Elegir un archivo existente y leerlo: {handle, text}; null si se cancela o se niega el permiso de escritura */
  async open() {
    const [handle] = (await pick(() => window.showOpenFilePicker(TYPES))) || [];
    if (!handle || (await handle.requestPermission(MODE)) !== "granted") return null;
    const text = await (await handle.getFile()).text();
    await idb.set(KEY, handle);
    return {handle, text};
  },

  /** El archivo elegido en una visita anterior: {handle, granted} o null */
  async restore() {
    const handle = await idb.get(KEY);
    return handle ? {handle, granted: (await handle.queryPermission(MODE)) === "granted"} : null;
  },

  /** Pide de nuevo el permiso (necesita un clic del usuario) */
  grant: async handle => (await handle.requestPermission(MODE)) === "granted",

  /** createWritable escribe en un archivo temporal y lo sustituye al cerrar: un corte a mitad no deja el archivo a medias */
  async write(handle, text) {
    const file = await handle.createWritable();
    try {
      await file.write(text);
      await file.close();
    } catch (e) {
      try {
        await file.abort();
      } catch (_) {}
      throw e;
    }
  },

  forget: () => idb.del(KEY)
};
