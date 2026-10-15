/** Estado del reproductor: vídeo actual, cola de la que salió, modo (cine o mini) y modo concentración */
import {useState} from "../../shared/lib/react.js";

const IDLE = {cur: null, queue: [], label: "", mini: false};
const INITIAL = {...IDLE, focus: false};

export function usePlayer() {
  const [st, setSt] = useState(INITIAL);

  return {
    ...st,
    /* La cola es la lista desde la que se pulsó el vídeo; si no se indica, se conserva la anterior */
    play: (v, queue, label) =>
      setSt(s => ({...s, cur: v, queue: queue || s.queue, label: label ?? s.label, mini: false})),
    /* Pasa al siguiente de la cola sin cambiar de modo (cine o mini) */
    next: () =>
      setSt(s => {
        const i = s.queue.findIndex(x => s.cur && x.id === s.cur.id);
        return i >= 0 && s.queue[i + 1] ? {...s, cur: s.queue[i + 1]} : s;
      }),
    /* Añade los capítulos recién cargados ({id: capítulos}) al vídeo en curso y a la cola, sin cambiar de vídeo */
    setChapters: found =>
      setSt(s => ({
        ...s,
        cur: s.cur && found[s.cur.id] ? {...s.cur, ch: found[s.cur.id]} : s.cur,
        queue: s.queue.map(x => (found[x.id] ? {...x, ch: found[x.id]} : x))
      })),
    /* Reordena la cola según el nuevo orden de la playlist de la que salió (ids en orden), sin cambiar de vídeo */
    reorderQueue: (label, ids) =>
      setSt(s => {
        const pos = new Map(ids.map((id, i) => [id, i]));
        if (s.label !== label || !s.queue.length || !s.queue.every(x => pos.has(x.id))) return s;
        return {...s, queue: [...s.queue].sort((a, b) => pos.get(a.id) - pos.get(b.id))};
      }),
    expand: () => setSt(s => ({...s, mini: false})),
    minimize: () => setSt(s => ({...s, mini: true})),
    /* Modo concentración: vídeo centrado y sin cola. Es una preferencia de la sesión, no del vídeo */
    toggleFocus: () => setSt(s => ({...s, focus: !s.focus})),
    close: () => setSt(s => ({...IDLE, focus: s.focus}))
  };
}
