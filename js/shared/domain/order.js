/** Orden de los elementos de una lista (lógica pura, sin React ni DOM) */

/* Devuelve una copia con el elemento de la posición `from` colocado en la posición `to`.
   Si no hay cambio (mismas posiciones o fuera de rango) devuelve la misma lista. */
export function moveItem(list, from, to) {
  const last = list.length - 1;
  if (from === to || from < 0 || to < 0 || from > last || to > last) return list;
  const next = [...list];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}
