/** Capa base de la API: arma la petición, contabiliza la cuota y traduce los errores */
import {API} from "../config.js";
import {quota} from "./quota.js";

export class ApiError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind;
  }
}

const MESSAGES = {
  quota:
    "Cuota diaria agotada (se reinicia a medianoche, hora del Pacífico). Tus playlists y las búsquedas guardadas siguen disponibles.",
  key: "La API key no es válida. Revísala e inténtalo de nuevo.",
  disabled: "Falta habilitar «YouTube Data API v3» en el proyecto de esta clave.",
  referrer: "La restricción de referentes de la clave no incluye este sitio.",
  notFound: "No se encontró la playlist en YouTube (¿es privada o ya no existe?).",
  network: "No hay conexión con YouTube. Revisa tu red."
};

/* «reason» de Google (en errors[] o details[]) → tipo de error propio */
const REASONS = {
  quota: ["quotaExceeded", "dailyLimitExceeded"],
  key: ["API_KEY_INVALID", "keyInvalid"],
  disabled: ["accessNotConfigured", "SERVICE_DISABLED"],
  referrer: ["ipRefererBlocked", "API_KEY_HTTP_REFERRER_BLOCKED"],
  notFound: ["playlistNotFound", "playlistItemsNotAccessible"]
};

function classify(error) {
  const found = [...(error.errors || []), ...(error.details || [])].map(e => e.reason);
  return Object.keys(REASONS).find(kind => REASONS[kind].some(r => found.includes(r))) || "other";
}

/** GET a la API. `cost` son las unidades de cuota que gasta la llamada. */
export async function request(path, params, key, cost) {
  if (quota.read(key).exhausted) throw new ApiError("quota", MESSAGES.quota);

  const url = new URL(`${API}/${path}`);
  Object.entries({...params, key}).forEach(
    ([name, value]) => value != null && url.searchParams.set(name, value)
  );

  let json;
  try {
    json = await (await fetch(url)).json();
  } catch (e) {
    throw new ApiError("network", MESSAGES.network);
  }

  if (json.error) {
    const kind = classify(json.error);
    if (kind === "quota") quota.markExhausted(key);
    throw new ApiError(kind, MESSAGES[kind] || json.error.message);
  }
  quota.add(key, cost);
  return json;
}
