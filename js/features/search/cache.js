/** Caché de páginas de resultados en localStorage: repetir una consulta no gasta cuota */
import {store} from "../../shared/lib/storage.js";
import {LIMITS} from "../../config.js";

const KEY = "yt_cache";
const isFresh = entry => Date.now() - entry.t < LIMITS.cacheTtl;

export const cache = {
  get(id) {
    const entry = store.get(KEY, {})[id];
    return entry && isFresh(entry) ? entry.v : null;
  },

  /* Conserva solo las entradas vigentes más recientes */
  set(id, value) {
    const all = {...store.get(KEY, {}), [id]: {t: Date.now(), v: value}};
    const kept = Object.entries(all)
      .filter(([, entry]) => isFresh(entry))
      .sort((a, b) => b[1].t - a[1].t)
      .slice(0, LIMITS.cacheEntries);
    store.set(KEY, Object.fromEntries(kept));
  }
};
