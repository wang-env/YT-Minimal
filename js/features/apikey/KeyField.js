/** Campo para pegar la API key: se valida antes de guardarla */
import {html, useState} from "../../shared/lib/react.js";
import {useKeyCheck} from "./useKeyCheck.js";

export function KeyField({setApiKey, onSaved}) {
  const [draft, setDraft] = useState("");
  const {busy, error, submit} = useKeyCheck(setApiKey);

  const save = async () => {
    if (await submit(draft)) {
      setDraft("");
      if (onSaved) onSaved();
    }
  };

  return html`<div>
    <div class="arow">
      <input class="tagin wide" placeholder="Pega tu API key (AIza…)" value=${draft}
        onInput=${e => setDraft(e.target.value)} onKeyDown=${e => e.key === "Enter" && save()}/>
      <button class="btn" disabled=${busy} onClick=${save}>${busy ? "Comprobando…" : "Guardar"}</button>
    </div>
    ${error && html`<p class="hint err">${error}</p>`}
  </div>`;
}
