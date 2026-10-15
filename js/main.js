/** Punto de entrada */
import {html} from "./shared/lib/react.js";
import {App} from "./App.js";

window.ReactDOM.createRoot(document.getElementById("root")).render(html`<${App}/>`);

/* PWA: el service worker permite instalar la app y abrirla sin conexión (necesita https o localhost) */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
