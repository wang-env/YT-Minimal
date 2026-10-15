/** Pomodoro: botón con la cuenta atrás y panel desplegable (controles, ciclo y ajustes) */
import {html, useState, useEffect, useRef} from "../../shared/lib/react.js";
import {Ic} from "../../shared/ui/Icon.js";
import {POMODORO} from "../../config.js";
import {fmtClock} from "../../shared/lib/format.js";
import {sumDays} from "../../shared/domain/stats.js";
import {PHASE_LABEL, phaseSecs} from "./phases.js";

/* Segundos restantes; mientras corre, solo este componente se refresca cada segundo */
function useRemaining(pomo) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!pomo.running) return;
    const timer = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(timer);
  }, [pomo.running]);
  return pomo.remaining();
}

/* Los ajustes se confirman al salir del campo: así se puede borrar y reescribir sin que se corrija a mitad */
const NumField = ({label, name, pomo}) => {
  const [min, max] = POMODORO.limits[name];
  const value = pomo.config[name];
  return html`<label class="fsel"><span>${label}</span>
    <input key=${value} class="tagin num" type="number" min=${min} max=${max} defaultValue=${value}
      onBlur=${e => pomo.configure({[name]: e.target.value})} onKeyDown=${e => e.key === "Enter" && e.target.blur()}/></label>`;
};

const Check = ({label, name, pomo}) => html`<label class="chk">
  <input type="checkbox" checked=${pomo.config[name]} onChange=${e => pomo.configure({[name]: e.target.checked})}/>${label}</label>`;

export function Pomodoro({pomo}) {
  const [open, setOpen] = useState(false);
  const box = useRef();
  const left = useRemaining(pomo);
  const {phase, running, done, config} = pomo;
  const pct = Math.min(1, Math.max(0, 1 - left / phaseSecs(config, phase)));
  const today = sumDays(pomo.days, 1);

  useEffect(() => {
    if (!open) return;
    const close = e => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return html`<div class="pomo-wrap" ref=${box}>
    <button class=${"pomo" + (running ? " run" : "") + (phase === "focus" ? "" : " rest")} aria-expanded=${open}
      title=${"Pomodoro · " + PHASE_LABEL[phase]} onClick=${() => setOpen(!open)}>
      <${Ic} n="timer" s=${15}/><span>${fmtClock(left)}</span></button>
    ${
      open &&
      html`<div class="pomo-panel" role="dialog" aria-label="Pomodoro">
      <div class="pphase">
        <b>${PHASE_LABEL[phase]}</b>
        <span class="pdots" title=${`Sesión ${Math.min(done + 1, config.every)} de ${config.every}`}>${Array.from(
          {length: config.every},
          (_, i) =>
            html`<i key=${i} class=${i < done ? "on" : phase === "focus" && i === done ? "cur" : ""}></i>`
        )}</span>
      </div>
      <div class="pclock">${fmtClock(left)}</div>
      <div class="pbar big"><i style=${{width: pct * 100 + "%"}}></i></div>
      <div class="pctl">
        <button class="btn on" onClick=${pomo.toggle}>${running ? "Pausar" : "Iniciar"}</button>
        <button class="btn" title="Pasa a la siguiente fase (un foco saltado no cuenta)" onClick=${pomo.skip}>Saltar</button>
        <button class="btn" title="Vuelve al primer foco del ciclo" onClick=${pomo.reset}>Reiniciar</button>
      </div>
      <p class="hint">Hoy: ${today === 1 ? "1 pomodoro" : today + " pomodoros"}</p>
      <div class="pcfg">
        <${NumField} label="Foco (min)" name="focus" pomo=${pomo}/>
        <${NumField} label="Descanso" name="short" pomo=${pomo}/>
        <${NumField} label="Descanso largo" name="long" pomo=${pomo}/>
        <${NumField} label="Sesiones/ciclo" name="every" pomo=${pomo}/>
      </div>
      <${Check} label="Iniciar la siguiente fase automáticamente" name="auto" pomo=${pomo}/>
      <${Check} label="Sonido al terminar cada fase" name="sound" pomo=${pomo}/>
      <${Check} label="Pausar el vídeo al empezar un descanso" name="pauseVideo" pomo=${pomo}/>
    </div>`
    }
  </div>`;
}
