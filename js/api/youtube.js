/** Cliente de YouTube Data API v3. Las funciones *Page devuelven {items, next, title?} */
import {COST, LIMITS} from "../config.js";
import {decode, parseDur} from "../shared/lib/format.js";
import {parseChapters} from "../shared/domain/chapters.js";
import {toApiParams} from "../shared/domain/filters.js";
import {request} from "./request.js";

const MAX = LIMITS.fetchSize;
const PROBE_ID = "dQw4w9WgXcQ"; // cualquier vídeo público: solo sirve para comprobar que la clave funciona

/* `ch` (capítulos) sale de la descripción, que ya viene en esta misma llamada: no cuesta nada extra.
   Solo se guardan los capítulos, nunca la descripción, para no inflar la caché. */
const toVideo = x => {
  const dur = x.contentDetails && x.contentDetails.duration;
  return {
    id: x.id,
    title: decode(x.snippet.title),
    channel: decode(x.snippet.channelTitle),
    date: x.snippet.publishedAt,
    dur,
    views: x.statistics && x.statistics.viewCount,
    ch: parseChapters(x.snippet.description, parseDur(dur))
  };
};

/* IDs → vídeos completos, en el mismo orden. 1 unidad por llamada (hasta 50 IDs); descarta los eliminados o privados */
async function hydrate(key, ids) {
  if (!ids.length) return [];
  const json = await request(
    "videos",
    {part: "snippet,contentDetails,statistics", id: ids.join(",")},
    key,
    COST.read
  );
  const byId = new Map((json.items || []).map(x => [x.id, x]));
  return ids
    .map(id => byId.get(id))
    .filter(Boolean)
    .map(toVideo);
}

/** Búsqueda: 101 unidades por página de hasta 50 vídeos (los filtros no cambian el costo) */
export async function searchPage(key, q, filters, pageToken) {
  const json = await request(
    "search",
    {
      part: "snippet",
      type: "video",
      videoEmbeddable: "true",
      maxResults: MAX,
      q,
      ...toApiParams(filters),
      pageToken
    },
    key,
    COST.search
  );
  const ids = json.items.map(item => item.id.videoId);
  return {items: await hydrate(key, ids), next: json.nextPageToken || null};
}

/** Playlist de YouTube: 2 unidades por página de hasta 50 vídeos (+1 por el título, solo en la primera) */
export async function playlistPage(key, playlistId, pageToken) {
  const [list, meta] = await Promise.all([
    request(
      "playlistItems",
      {part: "contentDetails", playlistId, maxResults: MAX, pageToken},
      key,
      COST.read
    ),
    pageToken
      ? null
      : request("playlists", {part: "snippet", id: playlistId}, key, COST.read).catch(() => null)
  ]);
  const ids = list.items.map(item => item.contentDetails.videoId);
  const title = meta && meta.items && meta.items[0] && meta.items[0].snippet.title;
  return {items: await hydrate(key, ids), next: list.nextPageToken || null, title};
}

/** Un vídeo por ID: 1 unidad */
export async function videoPage(key, videoId) {
  return {items: await hydrate(key, [videoId]), next: null};
}

/** Capítulos de hasta 50 vídeos con UNA sola llamada (1 unidad): {id: capítulos}. Un vídeo que ya no existe queda sin capítulos. */
export async function chaptersFor(key, ids) {
  const found = Object.fromEntries(ids.map(id => [id, []]));
  (await hydrate(key, ids)).forEach(v => {
    found[v.id] = v.ch;
  });
  return found;
}

/** Comprueba una clave con una llamada de 1 unidad; lanza ApiError si no sirve */
export const validateKey = key => request("videos", {part: "id", id: PROBE_ID}, key, COST.read);
