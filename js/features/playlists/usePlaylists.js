/** CRUD de playlists, tipos de vídeo y orden de los vídeos */
import {useStored} from "../../shared/lib/useStored.js";
import {moveItem} from "../../shared/domain/order.js";

export function usePlaylists() {
  const [pls, setPls] = useStored("yt_pl", []);
  const patch = (pid, fn) => setPls(ps => ps.map(p => (p.id === pid ? fn(p) : p)));
  const items = (pid, fn) => patch(pid, p => ({...p, items: fn(p.items)}));

  const createFrom = (name, videos = [], tag = "") => {
    const id = "p" + Date.now();
    setPls(ps => [...ps, {id, name, items: videos.map(v => ({...v, tag}))}]);
    return id;
  };

  /* Une playlists importadas: las que ya existen reciben solo los vídeos que les faltan */
  const merge = incoming =>
    setPls(ps => {
      const byId = new Map(ps.map(p => [p.id, p]));
      incoming.forEach(p => {
        const mine = byId.get(p.id);
        const missing = mine ? p.items.filter(v => !mine.items.some(x => x.id === v.id)) : [];
        byId.set(p.id, mine ? {...mine, items: [...mine.items, ...missing]} : p);
      });
      return [...byId.values()];
    });

  return {
    pls,
    tags: [...new Set(pls.flatMap(p => p.items.map(x => x.tag).filter(Boolean)))],
    createFrom,
    merge,
    create: (name, video, tag = "") => createFrom(name, video ? [video] : [], tag),
    rename: (pid, name) => patch(pid, p => ({...p, name})),
    remove: pid => setPls(ps => ps.filter(p => p.id !== pid)),
    save: (pid, video, tag) =>
      items(pid, its =>
        its.some(x => x.id === video.id)
          ? its.map(x => (x.id === video.id ? {...x, tag} : x))
          : [...its, {...video, tag}]
      ),
    setTag: (pid, vid, tag) => items(pid, its => its.map(x => (x.id === vid ? {...x, tag} : x))),
    /* Guarda los capítulos cargados ({id: capítulos}) en todas las playlists que tengan esos vídeos */
    setChapters: found =>
      setPls(ps =>
        ps.map(p =>
          p.items.some(x => found[x.id])
            ? {...p, items: p.items.map(x => (found[x.id] ? {...x, ch: found[x.id]} : x))}
            : p
        )
      ),
    removeVideo: (pid, vid) => items(pid, its => its.filter(x => x.id !== vid)),
    /* Cambia un vídeo de posición dentro de la playlist */
    move: (pid, from, to) => items(pid, its => moveItem(its, from, to))
  };
}
