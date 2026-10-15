/** Almacén clave-valor mínimo en IndexedDB. Hace falta porque los accesos a archivos del equipo no caben en localStorage. */
const open = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open("yt-minimal", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("kv");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const run = (mode, fn) =>
  open().then(
    db =>
      new Promise((resolve, reject) => {
        const tx = db.transaction("kv", mode);
        const req = fn(tx.objectStore("kv"));
        tx.oncomplete = () => {
          db.close();
          resolve(req.result);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      })
  );

export const idb = {
  get: key => run("readonly", store => store.get(key)),
  set: (key, value) => run("readwrite", store => store.put(value, key)),
  del: key => run("readwrite", store => store.delete(key))
};
