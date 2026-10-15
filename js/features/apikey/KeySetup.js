/** Guía breve para obtener e ingresar la API key */
import {html} from "../../shared/lib/react.js";
import {KeyField} from "./KeyField.js";

const link = (href, text) => html`<a href=${href} target="_blank" rel="noopener">${text}</a>`;

const STEPS = [
  html`<span>${link("https://console.cloud.google.com/projectcreate", "Crea un proyecto")} con tu cuenta de Google (el nombre es libre)</span>`,
  html`<span>${link("https://console.cloud.google.com/apis/library/youtube.googleapis.com", "Habilita «YouTube Data API v3»")} en ese proyecto</span>`,
  html`<span>En ${link("https://console.cloud.google.com/apis/credentials", "Credenciales")}: Crear credenciales → Clave de API, y cópiala</span>`,
  "Pégala aquí abajo: se comprueba antes de guardarla"
];

export function KeySetup({setApiKey}) {
  return html`<div class="setup">
    <h4>Activa la búsqueda real en unos minutos <span>gratis</span></h4>
    <ol>${STEPS.map((t, i) => html`<li key=${i}>${t}</li>`)}</ol>
    <${KeyField} setApiKey=${setApiKey}/>
    <p class="hint">Ver vídeos no gasta cuota. Cada búsqueda cuesta 101 de las 10 000 unidades diarias; pegar el enlace de una playlist cuesta unas 2.</p>
  </div>`;
}
