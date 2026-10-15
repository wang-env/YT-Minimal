/** Barra lateral: navegación, playlists desplegables y copia de seguridad */
import {html, useState} from "../shared/lib/react.js";
import {Ic} from "../shared/ui/Icon.js";
import {Backup} from "../features/backup/Backup.js";
import {AutoSave} from "../features/backup/AutoSave.js";
import {Install} from "../features/install/Install.js";
import {ThemeToggle} from "../features/theme/ThemeToggle.js";
import {useStored} from "../shared/lib/useStored.js";

export function Sidebar({pls, active, go, onCreate, onMerge, visible, autosave}) {
  const [open, setOpen] = useStored("yt_plopen", true);
  const [creating, setCreating] = useState(false);

  const onKey = e => {
    const name = e.target.value.trim();
    if (e.key === "Enter" && name) {
      onCreate(name);
      setCreating(false);
    }
    if (e.key === "Escape") setCreating(false);
  };

  return html`<aside class=${"side" + (visible ? "" : " hide")}>
    <div class="logo"><b><${Ic} n="play" s=${13}/></b>estudio</div>
    <button class=${"nav" + (active === "search" ? " on" : "")} onClick=${() => go("search")}><${Ic} n="search"/><span class="nm">Buscar</span></button>
    <button class=${"nav" + (active === "stats" ? " on" : "")} onClick=${() => go("stats")}><${Ic} n="stats"/><span class="nm">Estadísticas</span></button>
    <div class="slabel">
      <button class="fold-btn" aria-expanded=${!!open} onClick=${() => setOpen(!open)}><${Ic} n="chev" s=${14} cls=${"chev" + (open ? " open" : "")}/>Playlists<em>${pls.length}</em></button>
      <button title="Nueva playlist" onClick=${() => {
        setCreating(!creating);
        setOpen(true);
      }}><${Ic} n="plus" s=${16}/></button>
    </div>
    <div class=${"fold" + (open ? " open" : "")}><div>
      ${creating && html`<input class="tagin wide" autoFocus placeholder="Nombre y Enter" onKeyDown=${onKey}/>`}
      ${pls.map(p => html`<button key=${p.id} class=${"nav" + (active === p.id ? " on" : "")} onClick=${() => go(p.id)}><${Ic} n="list" s=${16}/><span class="nm">${p.name}</span><em>${p.items.length}</em></button>`)}
      ${!pls.length && !creating ? html`<p class="hint">Crea tu primera playlist con +</p>` : null}
    </div></div>
    <div class="foot">
      <${AutoSave} auto=${autosave}/>
      <${Backup} pls=${pls} onMerge=${onMerge}/>
      <${Install}/>
      <${ThemeToggle}/>
    </div>
  </aside>`;
}
