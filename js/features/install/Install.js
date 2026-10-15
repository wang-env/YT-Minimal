/** Botón «Instalar app»: solo aparece cuando el navegador permite instalarla */
import {html} from "../../shared/lib/react.js";
import {useInstall} from "./useInstall.js";

export function Install() {
  const offer = useInstall();
  return offer
    ? html`<button class="btn install" title="Instalar como aplicación: ventana propia y funciona sin conexión" onClick=${offer.install}>Instalar app</button>`
    : null;
}
