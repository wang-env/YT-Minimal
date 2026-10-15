/** Panel de filtros de búsqueda: orden, duración, fecha y subtítulos. Se aplican al lanzar la búsqueda. */
import {html} from "../../shared/lib/react.js";
import {FILTER_FIELDS, DEFAULT_FILTERS, activeCount} from "../../shared/domain/filters.js";

export function SearchFilters({filters, onChange, dirty, onApply}) {
  const set = (key, value) => onChange({...filters, [key]: value});

  return html`<div class="filters">
    ${FILTER_FIELDS.map(
      f => html`<label key=${f.key} class="fsel"><span>${f.label}</span>
      <select value=${filters[f.key]} onChange=${e => set(f.key, e.target.value)}>
        ${f.options.map(([value, text]) => html`<option key=${value} value=${value}>${text}</option>`)}
      </select></label>`
    )}
    <button class=${"btn" + (filters.captions ? " on" : "")} aria-pressed=${filters.captions} title="Solo vídeos con subtítulos"
      onClick=${() => set("captions", !filters.captions)}>Con subtítulos</button>
    <span class="factions">
      ${activeCount(filters) ? html`<button class="link" onClick=${() => onChange(DEFAULT_FILTERS)}>Limpiar</button>` : null}
      ${dirty ? html`<button class="btn on" title="Repite la búsqueda con estos filtros (101 unidades de cuota si no está guardada)" onClick=${onApply}>Aplicar</button>` : null}
    </span>
  </div>`;
}
