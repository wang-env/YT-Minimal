/** Selector de tema en la barra lateral: seguir el sistema, claro u oscuro */
import {html} from "../../shared/lib/react.js";
import {Ic} from "../../shared/ui/Icon.js";
import {useTheme, THEMES} from "./useTheme.js";

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  return html`<div class="theme">
    <span class="alabel">Tema</span>
    <div class="seg" role="radiogroup" aria-label="Tema de color">
      ${THEMES.map(
        t => html`<button key=${t.id} role="radio" aria-checked=${theme === t.id} aria-label=${t.label} title=${t.label}
        onClick=${() => setTheme(t.id)}><${Ic} n=${t.icon} s=${15}/></button>`
      )}
    </div>
  </div>`;
}
