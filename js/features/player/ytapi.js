/** Carga única de la IFrame Player API de YouTube (fin del vídeo, posición para el progreso y saltos a capítulos) */

let loading = null;

export function loadYT() {
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) return resolve(window.YT);
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previous) previous();
        resolve(window.YT);
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => {
        loading = null;
        reject(new Error("No se pudo cargar la IFrame Player API"));
      };
      document.head.appendChild(script);
    });
  }
  return loading;
}
