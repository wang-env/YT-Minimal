/** Lista de capítulos de un vídeo: el actual se resalta y al pulsar uno se salta a su inicio */
import {html, useEffect, useRef} from "../../shared/lib/react.js";
import {fmtClock} from "../../shared/lib/format.js";

export function Chapters({chapters, current, onSeek}) {
  const box = useRef();

  /* Mantiene visible el capítulo en curso dentro de la lista, sin desplazar el resto de la página */
  useEffect(() => {
    const list = box.current;
    const item = list && list.children[current];
    if (!item) return;
    const top = item.offsetTop;
    if (top < list.scrollTop || top + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = top - (list.clientHeight - item.offsetHeight) / 2;
    }
  }, [current]);

  return html`<ol class="chlist" ref=${box}>${chapters.map(
    ([t, title], i) => html`<li key=${i}>
    <button class=${"qi ch" + (i === current ? " on" : "")} onClick=${() => onSeek(t)}><span class="ct">${fmtClock(t)}</span><b>${title}</b></button>
  </li>`
  )}</ol>`;
}
