/** Copia de seguridad de las playlists: exportar e importar JSON */
import {html, useState, useRef} from "../../shared/lib/react.js";
import {exportPlaylists, readBackup} from "./backupFormat.js";

export function Backup({pls, onMerge}) {
  const input = useRef();
  const [msg, setMsg] = useState("");

  const load = async e => {
    const file = e.target.files[0];
    e.target.value = ""; // permite elegir el mismo archivo otra vez
    if (!file) return;
    try {
      const incoming = await readBackup(file);
      onMerge(incoming);
      setMsg(`${incoming.length} playlists importadas`);
    } catch (err) {
      setMsg(err.message);
    }
  };

  return html`<div class="backup">
    <button class="btn" disabled=${!pls.length} title="Descargar las playlists como JSON" onClick=${() => exportPlaylists(pls)}>Exportar</button>
    <button class="btn" title="Cargar playlists desde un JSON" onClick=${() => input.current.click()}>Importar</button>
    <input ref=${input} type="file" accept="application/json,.json" hidden onChange=${load}/>
    ${msg && html`<p class="hint">${msg}</p>`}
  </div>`;
}
