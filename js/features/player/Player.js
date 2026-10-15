/** Reproductor: pantalla de cine independiente y mini reproductor */
import {html, useState, useEffect, useRef, Fragment} from "../../shared/lib/react.js";
import {Ic} from "../../shared/ui/Icon.js";
import {Adder} from "../playlists/Adder.js";
import {Chapters} from "./Chapters.js";
import {Pomodoro} from "../pomodoro/Pomodoro.js";
import {useYTPlayer} from "./useYTPlayer.js";
import {progress} from "../progress/progress.js";
import {chapterAt} from "../../shared/domain/chapters.js";
import {fmtDur, fmtClock, metaLine, parseDur} from "../../shared/lib/format.js";
import {PROGRESS} from "../../config.js";

/* enablejsapi + origin permiten leer la posición y detectar el final del vídeo; «start» retoma donde se quedó */
const embedUrl = (id, start) =>
  `https://www.youtube.com/embed/${id}?` +
  new URLSearchParams({
    autoplay: 1,
    rel: 0,
    enablejsapi: 1,
    origin: location.origin,
    ...(start ? {start} : {})
  });

/* Duración de la clase de transición del modo concentración (algo más que la animación más larga del CSS) */
const FOCUS_FX_MS = 900;

/* Un solo nodo para cine y mini: cambiar de modo solo cambia CSS, así el vídeo no se reinicia */
export function Player({
  v,
  mini,
  focus,
  pomo,
  pls,
  queue,
  queueLabel,
  seen,
  onPick,
  onEnded,
  onToggleFocus,
  onWatched,
  onLoadChapters,
  onSave,
  onCreate,
  onMinimize,
  onExpand,
  onClose
}) {
  const [adding, setAdding] = useState(false);
  /* El punto de retorno se decide al abrir el vídeo y la URL ya no cambia: modificar el src recargaría el iframe */
  const [from] = useState(() => (v.demo ? 0 : progress.resumeAt(v.id)));
  const [src] = useState(() => embedUrl(v.id, from));
  const [resumed, setResumed] = useState(from > 0);
  const chs = v.ch || [];
  const [idx, setIdx] = useState(-1); // capítulo en curso
  const [tab, setTab] = useState(chs.length ? "ch" : "queue");
  const [chState, setChState] = useState(""); // "", "loading", "none" o un mensaje de error
  const frame = useRef();

  /* Transición al entrar («in») o salir («out») del modo concentración. Se decide durante el render, al cambiar la prop,
     para que la clase llegue en el mismo pintado que el cambio de diseño (sin parpadeo). Al abrir un vídeo con el modo
     ya activo no hay transición: solo cuando se elige la opción. */
  const [prevFocus, setPrevFocus] = useState(focus);
  const [fx, setFx] = useState("");
  if (prevFocus !== focus) {
    setPrevFocus(focus);
    setFx(focus ? "in" : "out");
  }
  useEffect(() => {
    if (!fx) return;
    const t = setTimeout(() => setFx(""), FOCUS_FX_MS);
    return () => clearTimeout(t);
  }, [fx]);

  const yt = useYTPlayer(frame, {
    onEnd: () => {
      progress.finish(v.id);
      onEnded();
    },
    onTick: e => {
      /* Si la duración no es la del vídeo, el reproductor está en un anuncio: ese tiempo no es del vídeo y no debe tocar el progreso */
      const known = parseDur(v.dur);
      if (known && Math.abs(e.d - known) > Math.max(PROGRESS.adTolerance, known * 0.05)) return;
      progress.track(v.id, e);
      if (chs.length) setIdx(chapterAt(chs, e.t)); // si el capítulo no cambia, React no vuelve a pintar
    }
  });
  useEffect(() => () => progress.flush(), []);

  /* Al empezar un descanso el vídeo se pausa; volver a darle al play es decisión de quien estudia */
  const rest = pomo.config.pauseVideo && pomo.phase !== "focus";
  useEffect(() => {
    if (rest) yt.pause();
  }, [rest]);
  // al cerrar o cambiar de vídeo se guarda ya, sin esperar al próximo guardado

  const seek = t => {
    yt.seek(t);
    setIdx(chapterAt(chs, t));
    setResumed(false);
  };
  const canLoad = v.ch === undefined && !v.demo && !!onLoadChapters;
  const loadChapters = async () => {
    setChState("loading");
    try {
      const ch = await onLoadChapters(v);
      setChState(ch.length ? "" : "none");
      if (ch.length) setTab("ch");
    } catch (e) {
      setChState(e.message || "No se pudieron cargar los capítulos.");
    }
  };

  const canFullscreen = !v.demo && !!document.fullscreenEnabled;
  const toggleFullscreen = () => {
    const el = frame.current;
    if (!el) return;
    const change = document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen();
    if (change) change.catch(() => {});
  };
  useEffect(() => {
    document.body.style.overflow = mini ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mini]);

  const tabKey = chs.length ? tab : "queue";
  const chapterList = html`<${Chapters} chapters=${chs} current=${idx} onSeek=${seek}/>`;

  return html`<div class=${"theater " + (mini ? "mini" : "cine" + (focus ? " focus" : "") + (fx ? " fx-" + fx : ""))}>
    ${
      !mini &&
      html`<div class="cbar">
      <button class="icon-btn" title="Volver · el vídeo sigue sonando (Esc)" onClick=${onMinimize}><${Ic} n="back"/></button>
      <span class="ctitle"><${Ic} n="play" s=${13}/>${focus ? "Concentración" : "Cine"}</span>
      <${Pomodoro} pomo=${pomo}/>
      <button class="icon-btn" title="Cerrar vídeo" onClick=${onClose}><${Ic} n="close"/></button></div>`
    }
    <div class="cbody">
      <div class="cmain">
        <div class="screen">${
          v.demo
            ? html`<span>Modo demo: añade tu API key para reproducir vídeos reales</span>`
            : html`<iframe ref=${frame} src=${src} referrerPolicy="strict-origin-when-cross-origin" title=${v.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen></iframe>`
        }</div>
        <div class="tinfo">
          <div class="tmeta" onClick=${mini ? onExpand : null}><h2>${v.title}</h2><p>${metaLine(v)}${
            resumed && !mini
              ? html`<${Fragment}> · retomado en ${fmtClock(from)} · <button class="link" onClick=${() => seek(0)}>desde el inicio</button><//>`
              : null
          }</p></div>
          <div class="tact">${
            mini
              ? html`<${Fragment}><button class="icon-btn" title="Expandir" onClick=${onExpand}><${Ic} n="expand" s=${16}/></button>
              <button class="icon-btn" title="Cerrar" onClick=${onClose}><${Ic} n="close" s=${16}/></button><//>`
              : html`<${Fragment}>
              <button class=${"btn" + (adding ? " on" : "")} title="Guardar en playlist" onClick=${() => setAdding(!adding)}><${Ic} n="addlist" s=${15}/>Playlist</button>
              <button class=${"btn" + (seen ? " on" : "")} aria-pressed=${!!seen} title=${seen ? "Quitar la marca de visto" : "Marcar como visto"} onClick=${() => onWatched(v.id, !seen)}>${seen ? "✓ Visto" : "Marcar visto"}</button>
              ${canLoad ? html`<button class="btn" disabled=${chState === "loading"} title="Lee los capítulos de la descripción de este vídeo y de los siguientes de la cola, con una sola llamada (1 unidad de cuota)" onClick=${loadChapters}><${Ic} n="chapters" s=${15}/>${chState === "loading" ? "Cargando…" : "Capítulos"}</button>` : null}
              ${chState === "none" ? html`<span class="tnote">Este vídeo no tiene capítulos</span>` : null}
              ${chState && chState !== "none" && chState !== "loading" ? html`<span class="tnote err">${chState}</span>` : null}
              <button class=${"btn focusbtn" + (focus ? " on" : "")} aria-pressed=${!!focus} title=${focus ? "Salir del modo concentración" : "Modo concentración: vídeo al centro, sin la cola"} onClick=${onToggleFocus}><${Ic} n="focus" s=${15}/>Concentración</button>
              ${canFullscreen ? html`<button class="btn" title="Pantalla completa" onClick=${toggleFullscreen}><${Ic} n="fullscreen" s=${15}/>Pantalla completa</button>` : null}
              ${v.demo ? null : html`<a class="btn" title="Abrir en YouTube" href=${"https://www.youtube.com/watch?v=" + v.id} target="_blank" rel="noopener"><${Ic} n="ext" s=${15}/>YouTube</a>`}
            <//>`
          }</div>
        </div>
        ${adding && !mini ? html`<div class="tadder"><${Adder} video=${v} pls=${pls} onSave=${onSave} onCreate=${onCreate} onClose=${() => setAdding(false)}/></div>` : null}
        ${!mini && focus && chs.length ? html`<div class="tchap">${chapterList}</div>` : null}
      </div>
      ${
        !mini && !focus && (queue.length || chs.length)
          ? html`<aside class="queue">
        ${
          chs.length
            ? html`<div class="qtabs">
          <button class=${"qtab" + (tabKey === "queue" ? " on" : "")} onClick=${() => setTab("queue")}>Cola</button>
          <button class=${"qtab" + (tabKey === "ch" ? " on" : "")} onClick=${() => setTab("ch")}>Capítulos · ${chs.length}</button></div>`
            : null
        }
        ${
          tabKey === "ch"
            ? chapterList
            : html`<${Fragment}><h5>${queueLabel}</h5>
          ${queue.map(x => html`<button key=${x.id} class=${"qi" + (x.id === v.id ? " on" : "")} onClick=${() => onPick(x)}><b>${x.title}</b><span>${x.channel}${x.dur ? " · " + fmtDur(x.dur) : ""}</span></button>`)}<//>`
        }
      </aside>`
          : null
      }
    </div>
  </div>`;
}
