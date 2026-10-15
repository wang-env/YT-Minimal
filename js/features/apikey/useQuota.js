/** Cuota gastada hoy con la clave actual (estimación local) */
import {useState, useEffect} from "../../shared/lib/react.js";
import {quota} from "../../api/quota.js";

export function useQuota(apiKey) {
  const [record, setRecord] = useState(() => quota.read(apiKey));
  useEffect(() => {
    const refresh = () => setRecord(quota.read(apiKey));
    refresh();
    return quota.subscribe(refresh);
  }, [apiKey]);
  return record;
}
