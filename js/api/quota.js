/** Contador local de las unidades de cuota gastadas hoy con la clave actual (es una estimación) */
import {store} from "../shared/lib/storage.js";

const KEY = "yt_quota";
const listeners = new Set();

/* YouTube reinicia la cuota a medianoche, hora del Pacífico */
const today = () => new Date().toLocaleDateString("en-CA", {timeZone: "America/Los_Angeles"});
const tag = key => key.slice(-6);
const blank = key => ({day: today(), tag: tag(key), used: 0, exhausted: false});

/* Un día nuevo o una clave distinta empiezan de cero */
const read = key => {
  const saved = store.get(KEY, null);
  return saved && saved.day === today() && saved.tag === tag(key) ? saved : blank(key);
};

const write = record => {
  store.set(KEY, record);
  listeners.forEach(fn => fn());
};

export const quota = {
  read,
  add: (key, units) => write({...read(key), used: read(key).used + units}),
  markExhausted: key => write({...read(key), exhausted: true}),
  subscribe: fn => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};
