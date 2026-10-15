/** Estadísticas de estudio: tiempo reproducido por día, rachas y avance por playlist y tipo */
import {html, Fragment} from "../../shared/lib/react.js";
import {chipStyle, fmtSpan} from "../../shared/lib/format.js";
import {
  sumDays,
  allDays,
  lastDays,
  streaks,
  byPlaylist,
  byTag,
  countWatched,
  countStarted
} from "../../shared/domain/stats.js";

const DAYS_SHOWN = 14;

const Kpi = ({value, label, hint}) =>
  html`<div class="kpi" title=${hint}><b>${value}</b><span>${label}</span></div>`;

export function StatsView({prog, pomodoros, pls, onOpen}) {
  const {videos, days} = prog;
  const run = streaks(days);
  const chart = lastDays(days, DAYS_SHOWN);
  const peak = Math.max(...chart.map(d => d.sec), 1);
  const lists = byPlaylist(pls, videos);
  const tags = byTag(pls, videos);
  const nothing = !allDays(days);
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  return html`<div>
    <div class="phead"><h2 class="stitle">Estadísticas de estudio</h2></div>

    <div class="kpis">
      <${Kpi} value=${fmtSpan(sumDays(days, 1))} label="Hoy" hint="Tiempo real reproduciendo vídeo hoy"/>
      <${Kpi} value=${fmtSpan(sumDays(days, 7))} label="7 días"/>
      <${Kpi} value=${fmtSpan(sumDays(days, 30))} label="30 días"/>
      <${Kpi} value=${fmtSpan(allDays(days))} label="Total"/>
      <${Kpi} value=${plural(run.current, "día", "días")} label="Racha actual" hint="Días seguidos con al menos 1 minuto de estudio"/>
      <${Kpi} value=${plural(run.best, "día", "días")} label="Mejor racha"/>
      <${Kpi} value=${sumDays(pomodoros, 1)} label="Pomodoros hoy" hint="Sesiones de foco completadas hoy"/>
      <${Kpi} value=${allDays(pomodoros)} label="Pomodoros total"/>
      <${Kpi} value=${countWatched(videos)} label="Vídeos vistos"/>
      <${Kpi} value=${countStarted(videos)} label="En curso" hint="Vídeos empezados y sin terminar"/>
    </div>

    <h5 class="shead">Últimos ${DAYS_SHOWN} días</h5>
    <div class="bars" style=${{gridTemplateColumns: `repeat(${DAYS_SHOWN}, 1fr)`}}>${chart.map(
      (
        d,
        i
      ) => html`<div key=${d.key} class=${"bar" + (i === chart.length - 1 ? " today" : "") + (d.sec ? "" : " zero")}
      title=${d.date.toLocaleDateString("es", {weekday: "long", day: "numeric", month: "short"}) + " · " + fmtSpan(d.sec)}>
      <div class="fill"><i style=${{height: d.sec ? Math.max(4, (d.sec / peak) * 100) + "%" : "3px"}}></i></div>
      <span><b>${d.date.toLocaleDateString("es", {weekday: "narrow"})}</b>${d.date.getDate()}</span></div>`
    )}</div>
    ${nothing ? html`<p class="hint">Aún no hay actividad. El tiempo se cuenta mientras un vídeo se reproduce y se guarda solo en este navegador.</p>` : null}

    <h5 class="shead">Por playlist</h5>
    ${lists.map(
      l => html`<button key=${l.pl.id} class="srow" onClick=${() => onOpen(l.pl.id)}>
      <span class="sname">${l.pl.name}</span><span class="sval" title="Tiempo estudiado en sus vídeos">${fmtSpan(l.studied)}</span>
      <span class="smeta">${l.done}/${l.count} vistos · quedan ${fmtSpan(l.remaining)} de ${fmtSpan(l.total)}</span>
      <span class="pbar big"><i style=${{width: l.pct * 100 + "%"}}></i></span></button>`
    )}
    ${!pls.length ? html`<div class="empty">Crea una playlist para seguir tu avance.</div>` : null}

    ${
      tags.length
        ? html`<${Fragment}><h5 class="shead">Por tipo de vídeo</h5>
      ${tags.map(
        g => html`<div key=${g.tag} class="srow flat">
        <span class="sname"><span class="ptag" style=${chipStyle(g.tag)}>${g.tag}</span></span><span class="sval">${fmtSpan(g.sec)}</span>
        <span class="smeta">${plural(g.count, "vídeo", "vídeos")}</span></div>`
      )}<//>`
        : null
    }
  </div>`;
}
