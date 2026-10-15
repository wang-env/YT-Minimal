/** Tema de color: «system» sigue al sistema; «light» y «dark» lo fijan. La preferencia se guarda en el navegador. */
import {useEffect} from "../../shared/lib/react.js";
import {useStored} from "../../shared/lib/useStored.js";

export const THEMES = [
  {id: "system", label: "Seguir el sistema", icon: "monitor"},
  {id: "light", label: "Claro", icon: "sun"},
  {id: "dark", label: "Oscuro", icon: "moon"}
];

/* Color de la barra del navegador en móvil (meta theme-color) para cada tema */
const BAR = {light: "#f4f6fa", dark: "#0c0c0e"};

/* Los colores viven en css/base/tokens.css: sin data-theme manda el sistema; con data-theme se fuerza un tema.
   index.html aplica el tema guardado antes de pintar, para que la página no parpadee al abrirse. */
function apply(theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);

  document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
    const own = /dark/.test(meta.media) ? "dark" : "light";
    meta.content = BAR[theme === "system" ? own : theme];
  });
}

/** @returns {[string, function]} tema elegido («system», «light» o «dark») y su setter */
export function useTheme() {
  const [saved, setTheme] = useStored("yt_theme", "system");
  const theme = THEMES.some(t => t.id === saved) ? saved : "system";
  useEffect(() => {
    apply(theme);
  }, [theme]);
  return [theme, setTheme];
}
