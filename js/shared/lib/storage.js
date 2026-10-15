/** Almacenamiento local tolerante a fallos (acepta valores antiguos en texto plano) */

export const store = {
  get: (k, d) => {
    try {
      const v = localStorage.getItem(k);
      if (v === null) return d;
      try {
        return JSON.parse(v);
      } catch (e) {
        return v;
      }
    } catch (e) {
      return d;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }
};
