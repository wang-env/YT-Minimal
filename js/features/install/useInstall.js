/** Instalación como app (PWA): el navegador avisa cuando se puede instalar y aquí se guarda el aviso para lanzarlo desde un botón */
import {useState, useEffect} from "../../shared/lib/react.js";

/** @returns {{install: Function} | null} null si no se puede (o ya está instalada) */
export function useInstall() {
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    const onOffer = e => {
      e.preventDefault();
      setOffer(e);
    };
    const onDone = () => setOffer(null);
    window.addEventListener("beforeinstallprompt", onOffer);
    window.addEventListener("appinstalled", onDone);
    return () => {
      window.removeEventListener("beforeinstallprompt", onOffer);
      window.removeEventListener("appinstalled", onDone);
    };
  }, []);

  return (
    offer && {
      install: async () => {
        offer.prompt();
        await offer.userChoice;
        setOffer(null);
      }
    }
  );
}
