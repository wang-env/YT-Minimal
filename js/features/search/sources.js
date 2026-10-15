/** Convierte lo que escribe el usuario en una «fuente» paginada de vídeos y aplica la caché */
import {parseYouTubeUrl} from "./urls.js";
import {filtersKey} from "../../shared/domain/filters.js";
import {searchPage, playlistPage, videoPage} from "../../api/youtube.js";
import {oembedVideo} from "../../api/oembed.js";
import {demoPage} from "./demo.js";
import {cache} from "./cache.js";
import {ApiError} from "../../api/request.js";

/* Un vídeo suelto: si no hay clave o se agotó la cuota, oEmbed da lo básico gratis (resultado «partial», no se cachea) */
async function loadVideo(key, id) {
  if (key) {
    try {
      return await videoPage(key, id);
    } catch (e) {
      if (e.kind !== "quota") throw e;
    }
  }
  return {items: [await oembedVideo(id)], next: null, partial: true};
}

/* Los filtros forman parte del id: la misma consulta con otros filtros es otra búsqueda (y otra entrada de caché) */
const searchSource = (q, key, filters) => ({
  kind: "search",
  id: `q:${q.toLowerCase()}|${filtersKey(filters)}`,
  cacheable: !!key,
  load: token => (key ? searchPage(key, q, filters, token) : demoPage(filters))
});

const playlistSource = (playlistId, key) => ({
  kind: "playlist",
  id: "pl:" + playlistId,
  cacheable: true,
  load: token => {
    if (!key) throw new ApiError("key", "Importar una playlist de YouTube requiere una API key.");
    return playlistPage(key, playlistId, token);
  }
});

const videoSource = (videoId, key) => ({
  kind: "video",
  id: "v:" + videoId,
  cacheable: true,
  load: () => loadVideo(key, videoId)
});

/** Los filtros solo afectan a las búsquedas por texto; los enlaces los ignoran.
 *  @returns {{kind, id, cacheable, load(token)}} */
export function resolveSource(input, apiKey, filters) {
  const ref = parseYouTubeUrl(input);
  if (!ref) return searchSource(input, apiKey, filters);
  return ref.type === "playlist" ? playlistSource(ref.id, apiKey) : videoSource(ref.id, apiKey);
}

/** Página de una fuente; si está en la caché no se llama a la API */
export async function loadPage(source, token = null) {
  const id = `${source.id}|${token || ""}`;
  const hit = source.cacheable ? cache.get(id) : null;
  if (hit) return hit;

  const page = await source.load(token);
  if (source.cacheable && !page.partial) cache.set(id, page);
  return page;
}
