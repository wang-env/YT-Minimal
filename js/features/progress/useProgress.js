/** Progreso de visionado y estadísticas de estudio, compartidos por toda la interfaz */
import {useState, useEffect} from "../../shared/lib/react.js";
import {progress} from "./progress.js";

export function useProgress() {
  const [snap, setSnap] = useState(progress.get);
  useEffect(() => {
    const refresh = () => setSnap(progress.get());
    refresh();
    return progress.subscribe(refresh);
  }, []);
  return {...snap, setWatched: progress.setWatched, merge: progress.merge};
}
