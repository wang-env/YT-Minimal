/** Filtros de búsqueda: opciones, conversión a parámetros de search.list y filtrado local para el modo demo.
 *  Los filtros no cambian el costo de la búsqueda (101 unidades). */
import {parseDur} from "../lib/format.js";

export const DEFAULT_FILTERS = {
  order: "relevance",
  duration: "any",
  period: "any",
  captions: false
};

/* Cada filtro: etiqueta y opciones [valor, texto]. El primer valor es el predeterminado */
export const FILTER_FIELDS = [
  {
    key: "order",
    label: "Orden",
    options: [
      ["relevance", "Relevancia"],
      ["date", "Más recientes"],
      ["viewCount", "Más vistos"],
      ["rating", "Mejor valorados"]
    ]
  },
  {
    key: "duration",
    label: "Duración",
    options: [
      ["any", "Cualquiera"],
      ["short", "Menos de 4 min"],
      ["medium", "4 – 20 min"],
      ["long", "Más de 20 min"]
    ]
  },
  {
    key: "period",
    label: "Fecha",
    options: [
      ["any", "Cualquiera"],
      ["day", "Hoy"],
      ["week", "Esta semana"],
      ["month", "Este mes"],
      ["year", "Este año"]
    ]
  }
];

/* Rangos de duración (s) que usa YouTube: corto < 4 min, medio 4–20 min, largo > 20 min */
const DURATION_RANGES = {
  any: [0, Infinity],
  short: [0, 240],
  medium: [240, 1200],
  long: [1200, Infinity]
};
const PERIOD_DAYS = {day: 1, week: 7, month: 30, year: 365};

const sinceMs = period => Date.now() - PERIOD_DAYS[period] * 864e5;

/** Completa con los valores predeterminados (tolera filtros guardados por versiones anteriores) */
export const normalize = f => ({...DEFAULT_FILTERS, ...f});

/** Cuántos filtros se apartan del valor predeterminado */
export const activeCount = f =>
  Object.keys(DEFAULT_FILTERS).filter(k => normalize(f)[k] !== DEFAULT_FILTERS[k]).length;

/** Identificador estable de una combinación: forma parte de la clave de caché */
export const filtersKey = f =>
  Object.keys(DEFAULT_FILTERS)
    .map(k => normalize(f)[k])
    .join(".");

/** Parámetros extra de search.list (YouTube Data API v3) */
export function toApiParams(filters) {
  const f = normalize(filters);
  return {
    order: f.order,
    videoDuration: f.duration,
    videoCaption: f.captions ? "closedCaption" : "any",
    publishedAfter: f.period === "any" ? undefined : new Date(sinceMs(f.period)).toISOString()
  };
}

/** Aplica los filtros a una lista local (modo demo, sin API) */
export function applyLocal(items, filters) {
  const f = normalize(filters);
  const [min, max] = DURATION_RANGES[f.duration];
  const since = f.period === "any" ? 0 : sinceMs(f.period);
  const by = {date: v => +new Date(v.date), viewCount: v => +v.views};

  const kept = items.filter(v => {
    const s = parseDur(v.dur);
    return s >= min && s < max && +new Date(v.date) >= since;
  });
  return by[f.order] ? [...kept].sort((a, b) => by[f.order](b) - by[f.order](a)) : kept;
}
