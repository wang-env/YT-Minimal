/** Service worker: la app funciona sin conexión.
 *  - Archivos de la app: red primero (los cambios se ven al recargar) y, sin red, la copia guardada.
 *  - React y htm (CDN, con versión fija): copia guardada primero.
 *  - API de YouTube, vídeos y miniaturas: nunca se tocan (siempre van a la red). */
const CACHE = "yt-minimal-v5";

/* Archivos de la app. Si añades o quitas un archivo en css/ o js/, actualiza esta lista (y sube la versión de CACHE). */
const SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "css/base/animations.css",
  "css/base/reset.css",
  "css/base/tokens.css",
  "css/components/rows.css",
  "css/components/ui.css",
  "css/features/apikey.css",
  "css/features/filters.css",
  "css/features/player.css",
  "css/features/playlists.css",
  "css/features/pomodoro.css",
  "css/features/stats.css",
  "css/layout/responsive.css",
  "css/layout/shell.css",
  "css/layout/sidebar.css",
  "css/layout/topbar.css",
  "css/main.css",
  "js/App.js",
  "js/api/oembed.js",
  "js/api/quota.js",
  "js/api/request.js",
  "js/api/youtube.js",
  "js/config.js",
  "js/features/apikey/KeyField.js",
  "js/features/apikey/KeySetup.js",
  "js/features/apikey/useKeyCheck.js",
  "js/features/apikey/useQuota.js",
  "js/features/backup/AutoSave.js",
  "js/features/backup/Backup.js",
  "js/features/backup/backupFormat.js",
  "js/features/backup/fileAccess.js",
  "js/features/backup/idb.js",
  "js/features/backup/useAutosave.js",
  "js/features/install/Install.js",
  "js/features/install/useInstall.js",
  "js/features/player/Chapters.js",
  "js/features/player/Player.js",
  "js/features/player/usePlayer.js",
  "js/features/player/useYTPlayer.js",
  "js/features/player/ytapi.js",
  "js/features/playlists/Adder.js",
  "js/features/playlists/PlaylistView.js",
  "js/features/playlists/usePlaylists.js",
  "js/features/pomodoro/Pomodoro.js",
  "js/features/pomodoro/beep.js",
  "js/features/pomodoro/phases.js",
  "js/features/pomodoro/usePomodoro.js",
  "js/features/progress/StatsView.js",
  "js/features/progress/progress.js",
  "js/features/progress/useProgress.js",
  "js/features/search/SearchFilters.js",
  "js/features/search/SearchView.js",
  "js/features/search/cache.js",
  "js/features/search/demo.js",
  "js/features/search/sources.js",
  "js/features/search/urls.js",
  "js/features/search/useSearch.js",
  "js/features/theme/ThemeToggle.js",
  "js/features/theme/useTheme.js",
  "js/layout/Sidebar.js",
  "js/layout/TopBar.js",
  "js/layout/useShortcuts.js",
  "js/main.js",
  "js/shared/domain/chapters.js",
  "js/shared/domain/filters.js",
  "js/shared/domain/order.js",
  "js/shared/domain/stats.js",
  "js/shared/lib/format.js",
  "js/shared/lib/react.js",
  "js/shared/lib/storage.js",
  "js/shared/lib/useStored.js",
  "js/shared/ui/Icon.js",
  "js/shared/ui/Row.js"
];

const CDN = [
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js",
  "https://cdn.jsdelivr.net/npm/htm@3.1.1/dist/htm.umd.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(SHELL);
      await Promise.all(
        CDN.map(url =>
          fetch(url)
            .then(res => res.ok && cache.put(url, res))
            .catch(() => {})
        )
      ); // sin red al instalar: se guardan al usarse
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })()
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (e) {
    return (
      (await cache.match(request, {ignoreSearch: true})) ||
      (request.mode === "navigate" ? cache.match("index.html") : Response.error())
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", event => {
  const {request} = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin === location.origin) event.respondWith(networkFirst(request));
  else if (CDN.includes(request.url)) event.respondWith(cacheFirst(request));
});
