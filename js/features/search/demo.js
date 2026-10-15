/** Página de demostración: la app funciona sin API key (los filtros se aplican en local) */
import {DEMO} from "../../config.js";
import {applyLocal} from "../../shared/domain/filters.js";

export const demoPage = filters =>
  new Promise(resolve =>
    setTimeout(() => resolve({items: applyLocal(DEMO, filters), next: null}), 500)
  );
