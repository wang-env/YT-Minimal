/** Búsqueda e importación con buffer: se piden 50 vídeos por llamada y se muestran de 15 en 15 */
import {useState, useRef} from "../../shared/lib/react.js";
import {LIMITS} from "../../config.js";
import {DEFAULT_FILTERS} from "../../shared/domain/filters.js";
import {resolveSource, loadPage} from "./sources.js";

const INITIAL = {
  items: null,
  shown: LIMITS.pageSize,
  next: null,
  source: null,
  filters: DEFAULT_FILTERS,
  title: "",
  loading: false,
  error: ""
};

export function useSearch(apiKey) {
  const [st, setSt] = useState(INITIAL);
  const latest = useRef(0); // descarta respuestas de una consulta que ya fue reemplazada

  const run = async (input, filters) => {
    const id = ++latest.current;
    const source = resolveSource(input, apiKey, filters);
    setSt(s => ({...s, loading: true, error: ""}));
    try {
      const page = await loadPage(source);
      if (id === latest.current)
        setSt({
          ...INITIAL,
          items: page.items,
          next: page.next,
          title: page.title || "",
          source,
          filters
        });
    } catch (e) {
      if (id === latest.current) setSt({...INITIAL, items: [], error: e.message, filters});
    }
  };

  /* Mientras queden vídeos en el buffer no se llama a la API */
  const more = async () => {
    if (st.shown < st.items.length) return setSt(s => ({...s, shown: s.shown + LIMITS.pageSize}));
    if (!st.next) return;

    const id = ++latest.current;
    setSt(s => ({...s, loading: true, error: ""}));
    try {
      const page = await loadPage(st.source, st.next);
      if (id !== latest.current) return;
      setSt(s => ({
        ...s,
        items: [...s.items, ...page.items],
        next: page.next,
        shown: Math.min(s.shown, s.items.length) + LIMITS.pageSize,
        loading: false
      }));
    } catch (e) {
      if (id === latest.current) setSt(s => ({...s, loading: false, error: e.message}));
    }
  };

  /* Trae todas las páginas restantes (para guardar una playlist de YouTube completa); null si falla */
  const collect = async () => {
    setSt(s => ({...s, loading: true, error: ""}));
    try {
      let items = st.items;
      let next = st.next;
      for (let pages = 1; next && pages < LIMITS.importPages; pages++) {
        const page = await loadPage(st.source, next);
        items = [...items, ...page.items];
        next = page.next;
      }
      setSt(s => ({...s, loading: false}));
      return items;
    } catch (e) {
      setSt(s => ({...s, loading: false, error: e.message}));
      return null;
    }
  };

  return {
    items: st.items && st.items.slice(0, st.shown),
    hasMore: !!st.items && (st.shown < st.items.length || !!st.next),
    kind: st.source && st.source.kind,
    filters: st.filters, // los de la última búsqueda lanzada
    title: st.title,
    loading: st.loading,
    error: st.error,
    run,
    more,
    collect
  };
}
