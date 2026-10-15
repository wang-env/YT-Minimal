/** Fila de resultado (sin miniatura), con el estado de visionado si lo hay */
import {html, Fragment} from "../lib/react.js";
import {fmtDur, fmtClock, fmtViews, fmtDate} from "../lib/format.js";
import {isStarted, videoSecs} from "../domain/stats.js";

/* Dato de la línea de metadatos precedido por su separador */
const dot = (t, cls) => html`<${Fragment}><i>•</i><span class=${cls}>${t}</span><//>`;

export function Row({v, i, active, onPlay, right, below, prog}) {
  const seen = !!prog && prog.w,
    started = isStarted(prog);
  const total = videoSecs(v, prog);
  return html`<div class=${"row" + (active ? " on" : "") + (seen ? " seen" : "")} style=${{animationDelay: (i % 15) * 45 + "ms"}}>
  <div class="head" onClick=${onPlay}>
   <h3>${v.title}</h3><span class="dur">${fmtDur(v.dur)}${right}</span>
   <div class="meta"><span>${v.channel}</span>${v.views ? dot(fmtViews(v.views) + " vistas") : null}${v.date ? dot(fmtDate(v.date)) : null}
    ${seen ? dot("✓ Visto", "ok") : started ? dot("Retomar en " + fmtClock(prog.t), "ok") : null}</div>
   ${started && total ? html`<div class="pbar"><i style=${{width: Math.min(100, (prog.t / total) * 100) + "%"}}></i></div>` : null}
  </div>${below}
 </div>`;
}
