/** Conecta un <iframe> de YouTube con la IFrame Player API (no gasta cuota):
 *  avisa cuando termina el vídeo, emite un «tick» por segundo y permite saltar a un instante o pausar.
 *  El tick lleva {t: posición, d: duración, dt: segundos reproduciendo, live: posición fiable (reproduciendo o en pausa)}. */
import {useEffect, useRef} from "../../shared/lib/react.js";
import {loadYT} from "./ytapi.js";

export function useYTPlayer(frameRef, {onEnd, onTick}) {
  const latest = useRef({onEnd, onTick});
  latest.current = {onEnd, onTick}; // el iframe se enlaza una sola vez; los callbacks siempre son los más recientes
  const api = useRef(null);

  useEffect(() => {
    let player = null;
    let timer = 0;
    let last = Date.now();
    let disposed = false;

    loadYT()
      .then(YT => {
        if (disposed || !frameRef.current) return;
        const S = YT.PlayerState;

        const tick = () => {
          const state = player.getPlayerState();
          const now = Date.now();
          const dt = state === S.PLAYING ? Math.min((now - last) / 1000, 2) : 0; // un equipo dormido no suma horas de estudio
          last = now;
          latest.current.onTick({
            t: player.getCurrentTime(),
            d: player.getDuration(),
            dt,
            live: state === S.PLAYING || state === S.PAUSED
          });
        };

        player = new YT.Player(frameRef.current, {
          events: {
            onReady: () => {
              if (disposed) return;
              last = Date.now();
              api.current = player;
              timer = setInterval(() => {
                try {
                  tick();
                } catch (e) {}
              }, 1000);
            },
            onStateChange: e => e.data === S.ENDED && latest.current.onEnd()
          }
        });
      })
      .catch(() => {}); // sin la API el vídeo se reproduce igual, solo que sin avance automático ni progreso

    return () => {
      disposed = true;
      clearInterval(timer);
      api.current = null;
      try {
        if (player) player.destroy();
      } catch (e) {}
    };
  }, []);

  return {
    /** Salta al segundo `t` y reproduce (no hace nada hasta que el reproductor esté listo) */
    seek: t => {
      const player = api.current;
      if (!player) return;
      try {
        player.seekTo(t, true);
        player.playVideo();
      } catch (e) {}
    },
    /** Pausa el vídeo (no hace nada hasta que el reproductor esté listo) */
    pause: () => {
      const player = api.current;
      if (!player) return;
      try {
        player.pauseVideo();
      } catch (e) {}
    }
  };
}
