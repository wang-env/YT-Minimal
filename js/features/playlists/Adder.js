/** Panel para guardar un vídeo en playlists con su tipo */
import {html, useState} from "../../shared/lib/react.js";
import {chipStyle} from "../../shared/lib/format.js";

export function Adder({video, pls, onSave, onCreate, onClose}) {
  const [tag, setTag] = useState("");
  const [name, setName] = useState("");
  const create = e => {
    if (e.key === "Enter" && name.trim()) {
      onCreate(name.trim(), tag.trim());
      setName("");
    }
  };
  return html`<div class="adder">
  <div class="arow"><span>Tipo de este vídeo</span>
   <input class="tagin" list="tags" placeholder="ej. Cocina, Política…" style=${chipStyle(tag)} value=${tag} onInput=${e => setTag(e.target.value)}/></div>
  <div class="plist">${pls.map(p => {
    const has = p.items.some(x => x.id === video.id);
    return html`<button key=${p.id} class=${"btn" + (has ? " on" : "")} onClick=${() => onSave(p.id, tag.trim())}>${has ? "✓ " : ""}${p.name}</button>`;
  })}</div>
  <div class="arow"><input class="tagin wide" placeholder="Nueva playlist con este vídeo… (Enter)" value=${name} onInput=${e => setName(e.target.value)} onKeyDown=${create}/>
   <button class="btn" onClick=${onClose}>Cerrar</button></div>
 </div>`;
}
