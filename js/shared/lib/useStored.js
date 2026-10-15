/** Estado persistente en localStorage */
import {useState, useEffect} from "./react.js";
import {store} from "./storage.js";

export function useStored(key, init) {
  const [v, setV] = useState(() => store.get(key, init));
  useEffect(() => store.set(key, v), [key, v]);
  return [v, setV];
}
