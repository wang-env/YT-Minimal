/** Reconoce enlaces de YouTube pegados en el buscador: vídeo o playlist */

const HOSTS = /^(www\.|m\.|music\.)?(youtube\.com|youtu\.be)$/;
const VIDEO_ID = /^[\w-]{11}$/;
const PATH_ID = /^\/(embed|shorts|live)\/([^/?]+)/;

/** @returns {{type:"video"|"playlist", id:string}|null} */
export function parseYouTubeUrl(text) {
  const raw = text.trim();
  if (!raw || /\s/.test(raw)) return null;

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
  } catch (e) {
    return null;
  }
  if (!HOSTS.test(url.hostname)) return null;

  const list = url.searchParams.get("list");
  if (url.pathname === "/playlist" && list) return {type: "playlist", id: list};

  const fromPath =
    url.hostname === "youtu.be" ? url.pathname.slice(1) : (url.pathname.match(PATH_ID) || [])[2];
  const video = url.searchParams.get("v") || fromPath;
  if (video && VIDEO_ID.test(video)) return {type: "video", id: video};

  return list ? {type: "playlist", id: list} : null;
}
