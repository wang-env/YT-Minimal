/** Iconos de línea minimalistas (SVG) */
import {html} from "../lib/react.js";

/* Iconos de línea minimalistas */
const ICONS = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>',
  list: '<path d="M4 7h11M4 12h11M4 17h6"/><path d="m16 14 5 3-5 3z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  panel: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M9.5 4.5v15"/>',
  play: '<path d="m8 5 11 7-11 7z"/>',
  back: '<path d="m15 6-6 6 6 6"/>',
  expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  ext: '<path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>',
  addlist: '<path d="M4 7h11M4 12h7M4 17h7M17 13v6M14 16h6"/>',
  fullscreen:
    '<path d="M8 4H5a1 1 0 0 0-1 1v3M16 4h3a1 1 0 0 1 1 1v3M8 20H5a1 1 0 0 1-1-1v-3M16 20h3a1 1 0 0 0 1-1v-3"/>',
  reorder: '<path d="M8 20V4M4.5 7.5 8 4l3.5 3.5M16 4v16M12.5 16.5 16 20l3.5-3.5"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 12.5h9L17.5 7M10 11v5M14 11v5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  grip: '<circle cx="9" cy="6" r="0.8"/><circle cx="15" cy="6" r="0.8"/><circle cx="9" cy="12" r="0.8"/><circle cx="15" cy="12" r="0.8"/><circle cx="9" cy="18" r="0.8"/><circle cx="15" cy="18" r="0.8"/>',
  chapters: '<path d="M4 6h2M10 6h10M4 12h2M10 12h10M4 18h2M10 18h10"/>',
  stats: '<path d="M5 20v-8M12 20V5M19 20v-5"/>',
  focus: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.5"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  timer: '<circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.5l2.2 1.5M9.5 3.5h5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  monitor: '<rect x="3.5" y="4.5" width="17" height="12" rx="2"/><path d="M9 20h6M12 16.5V20"/>'
};
export const Ic = ({n, s = 18, cls = ""}) =>
  html`<svg class=${"ic " + cls} viewBox="0 0 24 24" width=${s} height=${s} fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" dangerouslySetInnerHTML=${{__html: ICONS[n]}}/>`;
