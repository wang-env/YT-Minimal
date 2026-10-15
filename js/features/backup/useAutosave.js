/** Guardado automático en un archivo del equipo: escribe una copia completa tras cada cambio (agrupando los seguidos).
 *  Estados: unsupported (el navegador no puede) · off · on · paused (hay que confirmar el permiso) · error */
import {useState, useEffect, useRef} from "../../shared/lib/react.js";
import {autosave} from "./fileAccess.js";
import {buildSnapshot, parseSnapshot} from "./backupFormat.js";
import {AUTOSAVE} from "../../config.js";

const OFF = {
  status: autosave.supported ? "off" : "unsupported",
  name: "",
  savedAt: null,
  error: ""
};
const isEmpty = d => !d.pls.length && !Object.keys(d.videos).length && !Object.keys(d.days).length;

/** @param data {pls, videos, days, pomoDays} lo que se guarda
 *  @param onImport recibe {playlists, videos, days, pomoDays} del archivo y los une a los datos de la app */
export function useAutosave(data, onImport) {
  const [st, setSt] = useState(OFF);
  const handle = useRef(null);
  const timer = useRef(0);
  const lastWrite = useRef(0);
  const latest = useRef({data, onImport});
  latest.current = {data, onImport};

  const flush = async () => {
    clearTimeout(timer.current);
    timer.current = 0;
    if (!handle.current) return;
    try {
      await autosave.write(
        handle.current,
        JSON.stringify(buildSnapshot(latest.current.data), null, 1)
      );
      lastWrite.current = Date.now();
      setSt(s => ({...s, status: "on", savedAt: new Date(), error: ""}));
    } catch (e) {
      const denied = e.name === "NotAllowedError";
      setSt(s => ({
        ...s,
        status: denied ? "paused" : "error",
        error: denied ? "" : "No se pudo escribir en el archivo (¿se movió o se borró?)."
      }));
    }
  };

  /* Los cambios seguidos se agrupan: ya hay una escritura pendiente, no se reprograma (así el progreso, que cambia cada pocos segundos, no la aplaza para siempre) */
  const schedule = () => {
    if (timer.current || !handle.current) return;
    const wait = lastWrite.current
      ? Math.max(AUTOSAVE.delay, lastWrite.current + AUTOSAVE.minGap - Date.now())
      : 0;
    timer.current = setTimeout(flush, wait);
  };

  useEffect(() => {
    if (st.status === "on") schedule();
  }, [st.status, data.pls, data.videos, data.days, data.pomoDays]);

  /* Al ocultar o cerrar la pestaña no se espera al temporizador */
  useEffect(() => {
    const now = () => timer.current && flush();
    const hidden = () => document.visibilityState === "hidden" && now();
    window.addEventListener("pagehide", now);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("pagehide", now);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, []);

  /* Activa el guardado en un archivo. Si esta app no tiene datos (navegador nuevo o borrado), recupera primero lo que haya en el archivo
     en lugar de sobrescribirlo con nada; con datos locales el archivo es solo una copia y no se lee. */
  const activate = async (file, {restore = true} = {}) => {
    handle.current = file;
    setSt({...OFF, status: "on", name: file.name});
    if (!restore || !isEmpty(latest.current.data)) return;
    try {
      latest.current.onImport(parseSnapshot(await (await file.getFile()).text()));
    } catch (e) {} // archivo nuevo o ajeno: no hay nada que recuperar
  };

  /* Archivo recordado de una visita anterior */
  useEffect(() => {
    if (!autosave.supported) return;
    autosave
      .restore()
      .then(saved => {
        if (!saved) return;
        handle.current = saved.handle;
        if (saved.granted) activate(saved.handle);
        else setSt({...OFF, status: "paused", name: saved.handle.name});
      })
      .catch(() => {});
  }, []);

  const fail = e => setSt(s => ({...s, error: e.message || "No se pudo abrir el archivo."}));

  return {
    ...st,
    supported: autosave.supported,
    /** Crear un archivo nuevo (o sustituir uno: el navegador pide confirmación) */
    create: () =>
      autosave
        .create()
        .then(file => file && activate(file))
        .catch(fail),
    /** Usar un archivo de otro dispositivo o de una copia anterior: su contenido se une a los datos de la app */
    open: () =>
      autosave
        .open()
        .then(found => {
          if (!found) return;
          onImport(parseSnapshot(found.text));
          return activate(found.handle, {restore: false});
        })
        .catch(fail),
    /** Confirmar otra vez el permiso (tras reiniciar el navegador) o reintentar tras un error */
    reconnect: () =>
      autosave
        .grant(handle.current)
        .then(ok => ok && activate(handle.current))
        .catch(fail),
    unlink: async () => {
      clearTimeout(timer.current);
      timer.current = 0;
      handle.current = null;
      lastWrite.current = 0;
      await autosave.forget().catch(() => {});
      setSt(OFF);
    }
  };
}
