/** Atajos de teclado: "/" enfoca el buscador, Esc minimiza */
import {useEffect} from "../shared/lib/react.js";

export function useShortcuts(inputRef, onEscape) {
  useEffect(() => {
    const f = e => {
      if (e.key === "Escape") onEscape();
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && inputRef.current) {
        e.preventDefault();
        inputRef.current.focus();
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
}
