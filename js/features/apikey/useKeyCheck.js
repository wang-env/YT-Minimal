/** Valida una API key con una llamada de 1 unidad antes de guardarla */
import {useState} from "../../shared/lib/react.js";
import {validateKey} from "../../api/youtube.js";

export function useKeyCheck(setApiKey) {
  const [st, setSt] = useState({busy: false, error: ""});

  /** @returns {Promise<boolean>} true si la clave se guardó */
  const submit = async raw => {
    const key = raw.trim();
    if (!key) return false;
    setSt({busy: true, error: ""});
    try {
      await validateKey(key);
    } catch (e) {
      /* Con la cuota agotada la clave es válida: se guarda y el aviso aparece al usarla */
      if (e.kind !== "quota") {
        setSt({busy: false, error: e.message});
        return false;
      }
    }
    setApiKey(key);
    setSt({busy: false, error: ""});
    return true;
  };

  return {...st, submit};
}
