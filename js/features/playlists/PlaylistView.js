/** Vista de una playlist: filtro por tipo, duración total y restante, visto/retomar y reordenar vídeos */
import {html, useState} from "../../shared/lib/react.js";
import {Row} from "../../shared/ui/Row.js";
import {Ic} from "../../shared/ui/Icon.js";
import {chipStyle, fmtClock, fmtSpan} from "../../shared/lib/format.js";
import {isStarted, totals, nextUp} from "../../shared/domain/stats.js";
import {moveItem} from "../../shared/domain/order.js";

export function PlaylistView({pl, player, playlists, prog, onWatched, onDelete}) {
  const [filt, setFilt] = useState("");
  const [sorting, setSorting] = useState(false); // modo reordenar
  const [drag, setDrag] = useState(null); // arrastre en curso: {from, over}
  const tags = [...new Set(pl.items.map(x => x.tag).filter(Boolean))];
  const shown = pl.items.filter(x => sorting || !filt || x.tag === filt); // al reordenar se ve la playlist completa
  const remove = () => {
    if (confirm("¿Eliminar la playlist «" + pl.name + "»?")) {
      playlists.remove(pl.id);
      onDelete();
    }
  };

  /* Reordenar trabaja siempre sobre la playlist completa, así que se quita el filtro por tipo al entrar */
  const toggleSort = () => {
    setSorting(!sorting);
    setFilt("");
    setDrag(null);
  };

  /* La cola del reproductor también adopta el nuevo orden, para que «siguiente» lo respete */
  const move = (from, to) => {
    const next = moveItem(pl.items, from, to);
    if (next === pl.items) return;
    playlists.move(pl.id, from, to);
    player.reorderQueue(
      pl.name,
      next.map(x => x.id)
    );
  };

  /* Arrastrar y soltar (escritorio); en móvil y con teclado se usan las flechas de cada fila */
  const dragStart = i => e => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(i)); // Firefox lo exige para iniciar el arrastre
    setDrag({from: i, over: i});
  };
  const dragOver = i => e => {
    if (!drag) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (drag.over !== i) setDrag({...drag, over: i});
  };
  const drop = i => e => {
    if (!drag) return;
    e.preventDefault();
    move(drag.from, i);
    setDrag(null);
  };

  /* Con un tipo seleccionado, los tiempos son los de ese tipo */
  const t = totals(shown, prog);
  const up = nextUp(shown, prog);
  const upProg = up && prog[up.id];
  const label = isStarted(upProg) ? "Retomar" : t.done ? "Continuar" : "Empezar";

  return html`<div>
  <div class="phead">
   <input class="ptitle" value=${pl.name} onInput=${e => playlists.rename(pl.id, e.target.value)}/>
   <div class="psub"><span>${pl.items.length} vídeos · ${tags.length} tipos</span>
    <button class=${"btn sq" + (sorting ? " on" : "")} aria-label=${sorting ? "Terminar de reordenar" : "Reordenar vídeos"} title=${sorting ? "Listo" : "Reordenar vídeos"} disabled=${pl.items.length < 2} onClick=${toggleSort}><${Ic} n=${sorting ? "check" : "reorder"} s=${16}/></button>
    <button class="btn sq" aria-label="Eliminar playlist" title="Eliminar playlist" onClick=${remove}><${Ic} n="trash" s=${16}/></button></div>
   ${sorting ? html`<p class="hint">Arrastra los vídeos o usa las flechas para cambiar su orden.</p>` : null}
   ${
     tags.length
       ? html`<div class=${"chips" + (sorting ? " lock" : "")}>
    <button class=${"btn" + (!filt ? " on" : "")} onClick=${() => setFilt("")}>Todos</button>
    ${tags.map(g => html`<button key=${g} class=${"btn" + (filt === g ? " on" : "")} style=${filt === g ? chipStyle(g) : {}} onClick=${() => setFilt(filt === g ? "" : g)}>${g} · ${pl.items.filter(x => x.tag === g).length}</button>`)}</div>`
       : null
   }
   ${
     shown.length
       ? html`<div>
    <div class="pstats">
     ${filt ? html`<span class="ptag" style=${chipStyle(filt)}>${filt}</span>` : null}
     <span><b>${fmtSpan(t.total)}</b> en total</span>
     <span><b>${fmtSpan(t.remaining)}</b> por ver</span>
     <span><b>${Math.round(t.pct * 100)} %</b> completado</span>
     ${t.unknown ? html`<span title="Vídeos sin duración conocida (añadidos por enlace sin API key): no cuentan en los totales hasta que los reproduzcas">${t.unknown} sin duración</span>` : null}
    </div>
    <div class="pbar big"><i style=${{width: t.pct * 100 + "%"}}></i></div>
    ${
      up
        ? html`<div class="resume">
     <button class="btn on" onClick=${() => player.play(up, shown, pl.name)}><${Ic} n="play" s=${13}/>${label}</button>
     <span>${up.title}${isStarted(upProg) ? " · " + fmtClock(upProg.t) : ""}</span></div>`
        : html`<p class="hint">✓ Todo visto</p>`
    }
   </div>`
       : null
   }
  </div>
  ${shown.map((v, i) => {
    const p = prog[v.id],
      seen = !!p && p.w;
    if (sorting) {
      const over =
        drag && drag.over === i && drag.from !== i ? (drag.from < i ? " after" : " before") : "";
      return html`<div key=${v.id} class=${"srow" + (drag && drag.from === i ? " drag" : "") + over} draggable="true"
   onDragStart=${dragStart(i)} onDragOver=${dragOver(i)} onDrop=${drop(i)} onDragEnd=${() => setDrag(null)}>
   <${Row} v=${v} i=${i} prog=${p} active=${!!player.cur && player.cur.id === v.id} onPlay=${() => {}}
    below=${html`<div class="tagrow sortbar">
     <span class="pos"><${Ic} n="grip" s=${14}/>${i + 1}</span>
     <span class="tagact">
      <button class="btn" aria-label="Subir" title="Subir" disabled=${i === 0} onClick=${() => move(i, i - 1)}><${Ic} n="up" s=${14}/></button>
      <button class="btn" aria-label="Bajar" title="Bajar" disabled=${i === shown.length - 1} onClick=${() => move(i, i + 1)}><${Ic} n="down" s=${14}/></button></span></div>`}/></div>`;
    }
    return html`<${Row} key=${v.id} v=${v} i=${i} prog=${p} active=${!!player.cur && player.cur.id === v.id} onPlay=${() => player.play(v, shown, pl.name)}
   below=${html`<div class="tagrow">
    <input class="tagin" list="tags" placeholder="+ tipo" style=${chipStyle(v.tag)} value=${v.tag || ""} onInput=${e => playlists.setTag(pl.id, v.id, e.target.value)}/>
    <span class="tagact">
     <button class="btn" onClick=${() => onWatched(v.id, !seen)}>${seen ? "Quitar visto" : "Marcar visto"}</button>
     <button class="btn" onClick=${() => playlists.removeVideo(pl.id, v.id)}>Quitar</button></span></div>`}/>`;
  })}
  ${!pl.items.length ? html`<div class="empty">Playlist vacía. Busca un vídeo y pulsa + para guardarlo aquí.</div>` : null}
 </div>`;
}
