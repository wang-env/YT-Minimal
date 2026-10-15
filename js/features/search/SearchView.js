/** Vista de búsqueda e importación */
import {html, useState} from "../../shared/lib/react.js";
import {Row} from "../../shared/ui/Row.js";
import {Adder} from "../playlists/Adder.js";
import {Ic} from "../../shared/ui/Icon.js";
import {KeySetup} from "../apikey/KeySetup.js";

export function SearchView({search, player, playlists, prog, apiKey, setApiKey, onImportList}) {
  const [adding, setAdding] = useState(null);
  const {items, hasMore, loading, kind, title} = search;
  const queueLabel = kind === "playlist" ? title || "Playlist de YouTube" : "Resultados";

  const plus = v =>
    html`<button class="add" title="Guardar en playlist" onClick=${e => {
      e.stopPropagation();
      setAdding(adding && adding.id === v.id ? null : v);
    }}><${Ic} n="plus" s=${17}/></button>`;
  const adder = v =>
    adding && adding.id === v.id
      ? html`<${Adder} video=${v} pls=${playlists.pls} onSave=${(pid, t) => playlists.save(pid, v, t)} onCreate=${(n, t) => playlists.create(n, v, t)} onClose=${() => setAdding(null)}/>`
      : null;

  return html`<div>
    ${!apiKey && items === null && !loading ? html`<${KeySetup} setApiKey=${setApiKey}/>` : null}
    ${loading && !(items && items.length) ? [0, 1, 2, 3].map(n => html`<div class="skel" key=${n} style=${{animationDelay: n * 80 + "ms"}}></div>`) : null}
    ${
      kind === "playlist" && items && items.length
        ? html`<div class="source">
      <span>Playlist de YouTube · <b>${title || "sin título"}</b></span>
      <button class="btn" disabled=${loading} onClick=${onImportList}>${loading ? "Importando…" : "Guardar como playlist"}</button></div>`
        : null
    }
    ${
      items &&
      items.map(
        (
          v,
          i
        ) => html`<${Row} key=${v.id} v=${v} i=${i} prog=${prog[v.id]} active=${!!player.cur && player.cur.id === v.id}
      onPlay=${() => player.play(v, items, queueLabel)} right=${plus(v)} below=${adder(v)}/>`
      )
    }
    ${items && !items.length && !loading ? html`<div class="empty">Sin resultados</div>` : null}
    ${hasMore && html`<button class="btn more" onClick=${search.more} disabled=${loading}>${loading ? "Cargando…" : "Cargar más"}</button>`}
  </div>`;
}
