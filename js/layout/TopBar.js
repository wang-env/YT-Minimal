/** Cabecera: barra lateral, buscador, cuota del día y API key */
import {html, useState, Fragment} from "../shared/lib/react.js";
import {LIMITS} from "../config.js";
import {Ic} from "../shared/ui/Icon.js";
import {KeyField} from "../features/apikey/KeyField.js";
import {SearchFilters} from "../features/search/SearchFilters.js";
import {Pomodoro} from "../features/pomodoro/Pomodoro.js";
import {activeCount} from "../shared/domain/filters.js";

const num = n => n.toLocaleString("es");

export function TopBar({
  label,
  isSearch,
  q,
  setQ,
  onSearch,
  inputRef,
  filters,
  setFilters,
  filtersDirty,
  hint,
  apiKey,
  setApiKey,
  quota,
  pomo,
  onToggleSide
}) {
  const [showKey, setShowKey] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const nFilters = activeCount(filters);
  const quotaText = quota.exhausted
    ? "cuota agotada"
    : `≈ ${num(quota.used)} / ${num(LIMITS.dailyQuota)}`;
  const removeKey = () => {
    setApiKey("");
    setShowKey(false);
  };

  return html`<div class="top"><div class="col">
    <div class="brand">
      <span class="bl">
        <button class="icon-btn" title="Mostrar u ocultar la barra lateral" onClick=${onToggleSide}><${Ic} n="panel"/></button>
        <b><${Ic} n="play" s=${13}/></b>${label}
      </span>
      <span class="kr">
        ${
          apiKey &&
          html`<span class=${"quota" + (quota.exhausted ? " out" : "")}
          title="Unidades de cuota gastadas hoy (estimación local). Se reinicia a medianoche, hora del Pacífico.">${quotaText}</span>`
        }
        <${Pomodoro} pomo=${pomo}/>
        <button onClick=${() => setShowKey(!showKey)}>${apiKey ? "API key ✓" : "API key"}</button>
      </span>
    </div>
    ${
      isSearch &&
      html`<${Fragment}><div class="box">
      <input ref=${inputRef} value=${q} placeholder="Buscar en YouTube o pegar un enlace" autoFocus
        onInput=${e => setQ(e.target.value)} onKeyDown=${e => e.key === "Enter" && onSearch()}/>
      <button class=${"fbtn" + (showFilters ? " on" : "") + (nFilters ? " set" : "")} title="Filtros de búsqueda" aria-expanded=${showFilters}
        onClick=${() => setShowFilters(!showFilters)}><${Ic} n="filter"/>${nFilters ? html`<em>${nFilters}</em>` : null}</button>
      <kbd>/</kbd></div>
      ${showFilters && html`<${SearchFilters} filters=${filters} onChange=${setFilters} dirty=${filtersDirty} onApply=${onSearch}/>`}
      <div class=${"hint" + (hint.error ? " err" : "")}>${hint.text}</div><//>`
    }
    ${
      showKey &&
      html`<div class="key">
      <div class="keyform">
        ${apiKey && html`<p class="hint">Clave activa: …${apiKey.slice(-4)}</p>`}
        <${KeyField} setApiKey=${setApiKey} onSaved=${() => setShowKey(false)}/>
      </div>
      <button class="btn" onClick=${() => setShowKey(false)}>Cerrar</button>
      ${apiKey && html`<button class="btn" onClick=${removeKey}>Quitar clave</button>`}
    </div>`
    }
  </div></div>`;
}
