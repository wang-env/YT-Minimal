/** Raíz de la aplicación: conecta hooks, barra lateral, vistas y reproductor */
import {html, useState, useRef} from "./shared/lib/react.js";
import {useStored} from "./shared/lib/useStored.js";
import {useSearch} from "./features/search/useSearch.js";
import {usePlayer} from "./features/player/usePlayer.js";
import {usePlaylists} from "./features/playlists/usePlaylists.js";
import {useQuota} from "./features/apikey/useQuota.js";
import {useProgress} from "./features/progress/useProgress.js";
import {usePomodoro} from "./features/pomodoro/usePomodoro.js";
import {useAutosave} from "./features/backup/useAutosave.js";
import {useShortcuts} from "./layout/useShortcuts.js";
import {Sidebar} from "./layout/Sidebar.js";
import {TopBar} from "./layout/TopBar.js";
import {Player} from "./features/player/Player.js";
import {SearchView} from "./features/search/SearchView.js";
import {PlaylistView} from "./features/playlists/PlaylistView.js";
import {StatsView} from "./features/progress/StatsView.js";
import {chaptersFor} from "./api/youtube.js";
import {LIMITS} from "./config.js";
import {DEFAULT_FILTERS, normalize, filtersKey} from "./shared/domain/filters.js";

export function App() {
  const [view, setView] = useState("search");
  const [q, setQ] = useState("");
  const [apiKey, setApiKey] = useStored("yt_key", "");
  const [sideOpen, setSideOpen] = useStored("yt_side", true);
  const [savedFilters, setFilters] = useStored("yt_filters", DEFAULT_FILTERS);
  const filters = normalize(savedFilters);
  const inputRef = useRef();
  const playlists = usePlaylists();
  const search = useSearch(apiKey);
  const player = usePlayer();
  const quota = useQuota(apiKey);
  const prog = useProgress();
  const pomo = usePomodoro();

  /* Todo lo que va al archivo de guardado automático; al recuperarlo, se une a lo que ya hay */
  const autosave = useAutosave(
    {pls: playlists.pls, videos: prog.videos, days: prog.days, pomoDays: pomo.days},
    data => {
      playlists.merge(data.playlists);
      prog.merge(data);
      pomo.mergeDays(data.pomoDays);
    }
  );

  const isStats = view === "stats";
  const pl = playlists.pls.find(p => p.id === view);
  const isSearch = !pl && !isStats;
  const idle = isSearch && search.items === null && !search.loading;
  /* Cambiar un filtro no relanza la búsqueda (gastaría cuota): queda pendiente hasta pulsar Aplicar o Enter */
  const filtersDirty =
    search.kind === "search" && filtersKey(filters) !== filtersKey(search.filters);
  const hint = search.error
    ? {text: search.error, error: true}
    : {
        text: apiKey
          ? ""
          : "Modo demo · añade una API key de YouTube Data v3 para resultados reales",
        error: false
      };

  useShortcuts(inputRef, player.minimize);

  /* Al cambiar de sección o buscar, el vídeo en curso pasa a segundo plano */
  const go = v => {
    if (v !== view) {
      setView(v);
      if (player.cur) player.minimize();
    }
  };

  const doSearch = () => {
    const text = q.trim();
    if (!text) return;
    if (player.cur) player.minimize();
    search.run(text, filters);
  };

  const importList = async () => {
    const items = await search.collect();
    if (items) go(playlists.createFrom(search.title || "Playlist importada", items));
  };

  /* Una sola llamada (1 unidad) trae los capítulos del vídeo en curso y de los siguientes de la cola que aún no los tienen */
  const loadChapters = async v => {
    const ids = [
      v.id,
      ...player.queue.filter(x => x.id !== v.id && x.ch === undefined && !x.demo).map(x => x.id)
    ];
    const found = await chaptersFor(apiKey, [...new Set(ids)].slice(0, LIMITS.fetchSize));
    playlists.setChapters(found);
    player.setChapters(found);
    return found[v.id];
  };

  const curProg = player.cur && prog.videos[player.cur.id];

  return html`<div class="shell">
    <datalist id="tags">${playlists.tags.map(t => html`<option key=${t} value=${t}/>`)}</datalist>
    <${Sidebar} pls=${playlists.pls} active=${isStats ? "stats" : isSearch ? "search" : pl.id} go=${go} visible=${!!sideOpen} autosave=${autosave}
      onCreate=${name => go(playlists.create(name))} onMerge=${playlists.merge}/>
    <div class=${"app" + (idle ? " idle" : "")}>
      <${TopBar} label=${isStats ? "estadísticas" : isSearch ? "buscar" : "playlist"} isSearch=${isSearch} q=${q} setQ=${setQ} onSearch=${doSearch} inputRef=${inputRef}
        filters=${filters} setFilters=${setFilters} filtersDirty=${filtersDirty}
        onToggleSide=${() => setSideOpen(!sideOpen)} hint=${hint} apiKey=${apiKey} setApiKey=${setApiKey} quota=${quota} pomo=${pomo}/>
      <div class="col">
        ${
          isStats
            ? html`<${StatsView} prog=${prog} pomodoros=${pomo.days} pls=${playlists.pls} onOpen=${go}/>`
            : isSearch
              ? html`<${SearchView} search=${search} player=${player} playlists=${playlists} prog=${prog.videos} apiKey=${apiKey} setApiKey=${setApiKey} onImportList=${importList}/>`
              : html`<${PlaylistView} key=${pl.id} pl=${pl} player=${player} playlists=${playlists} prog=${prog.videos} onWatched=${prog.setWatched} onDelete=${() => go("search")}/>`
        }
      </div>
    </div>
    ${
      player.cur &&
      html`<${Player} key=${player.cur.id} v=${player.cur} mini=${player.mini} focus=${player.focus} pomo=${pomo} pls=${playlists.pls}
      queue=${player.queue} queueLabel=${player.label} seen=${!!(curProg && curProg.w)} onWatched=${prog.setWatched}
      onLoadChapters=${apiKey ? loadChapters : null} onPick=${player.play} onEnded=${player.next} onToggleFocus=${player.toggleFocus}
      onSave=${(pid, t) => playlists.save(pid, player.cur, t)} onCreate=${(n, t) => playlists.create(n, player.cur, t)}
      onMinimize=${player.minimize} onExpand=${player.expand} onClose=${player.close}/>`
    }
  </div>`;
}
