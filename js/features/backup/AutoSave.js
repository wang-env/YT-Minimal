/** Guardado automático en un archivo del equipo: estado y acciones */
import {html} from "../../shared/lib/react.js";

const time = d => d.toLocaleTimeString("es", {hour: "2-digit", minute: "2-digit"});

export function AutoSave({auto}) {
  const {status, name, savedAt, error} = auto;

  if (status === "unsupported")
    return html`<div class="autosave"><p class="hint" title="Usa Chrome, Edge u Opera de escritorio para guardar en un archivo.">Guardado automático no disponible en este navegador. Usa Exportar.</p></div>`;

  const head = html`<div class="alabel">Guardado automático</div>`;
  if (status === "off")
    return html`<div class="autosave">${head}
    <div class="acts">
      <button class="btn" title="Crear un archivo nuevo donde se guardará todo solo" onClick=${auto.create}>Crear archivo</button>
      <button class="btn" title="Seguir con un archivo de otro dispositivo o de una copia anterior: se une a lo que tienes" onClick=${auto.open}>Usar existente</button>
    </div>
    ${error ? html`<p class="hint err">${error}</p>` : html`<p class="hint">Playlists, progreso y estadísticas se guardan solos en un archivo de tu equipo.</p>`}
  </div>`;

  const line =
    status === "on"
      ? html`<span class="ok">✓</span> ${name} · ${savedAt ? "guardado " + time(savedAt) : "guardando…"}`
      : status === "paused"
        ? html`${name} · falta confirmar el permiso`
        : html`${name}`;

  return html`<div class="autosave">${head}
    <p class="hint aname" title=${name}>${line}</p>
    ${error ? html`<p class="hint err">${error}</p>` : null}
    <div class="acts">
      ${status !== "on" ? html`<button class="btn on" onClick=${auto.reconnect}>${status === "paused" ? "Reconectar" : "Reintentar"}</button>` : null}
      <button class="btn" title="Deja de guardar en este archivo (el archivo no se borra)" onClick=${auto.unlink}>Desactivar</button>
    </div>
  </div>`;
}
