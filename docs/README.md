# yt-minimal · YouTube minimalista para estudiar

> Un reproductor de YouTube sin miniaturas, sin recomendaciones y sin comentarios, pensado para **concentrarse**: buscas, guardas lo que te sirve en playlists propias, lo reproduces en bloque y la app recuerda por dónde ibas.

Es una aplicación web **estática** (React por CDN, módulos ES nativos, sin compilación ni servidor) que cada persona usa con **su propia API key gratuita** de YouTube. Todos los datos se quedan en tu navegador, y si quieres, en un archivo tuyo.

---

## Capturas

### Buscar sin distracciones

Resultados solo con texto: título, canal, vistas, fecha y duración. Sin miniaturas ni recomendaciones.

![Vista de búsqueda con resultados en filas tipográficas](captures/cine.gif)

### Filtros de búsqueda

Orden, duración, fecha y subtítulos. Se aplican a petición para no gastar cuota de más.

![Panel de filtros de búsqueda](captures/filtros.gif)

### Modo cine y modo concentración

A la izquierda, el modo cine con la cola de la playlist; a la derecha, el modo concentración con el vídeo centrado y los capítulos debajo.

| Modo cine | Modo concentración |
|---|---|
| ![Modo cine con la cola lateral](captures/cine.gif) | ![Modo concentración con capítulos](captures/concentracion.png) |

### Mini reproductor

El vídeo sigue sonando mientras buscas o cambias de sección.

![Mini reproductor flotante](captures/mini.png)

### Playlists con tipos y progreso

Tipos de colores, duración total, tiempo por ver y el botón para retomar donde lo dejaste.

![Playlist con tipos de vídeo y barra de progreso](captures/playlist.png)

### Estadísticas de estudio

Tiempo diario, racha, gráfico de 14 días y desglose por playlist y por tipo.

![Vista de estadísticas de estudio](captures/estadisticas.png)

### Pomodoro integrado

Temporizador en la cabecera con foco, descansos y ajustes.

![Panel del Pomodoro](captures/pomodoro.png)

### Tema claro y oscuro

Se elige con el selector **Tema** de la barra lateral: seguir el sistema, claro u oscuro.

| Claro | Oscuro |
|---|---|
| ![Tema claro](captures/tema-claro.png) | ![Tema oscuro](captures/tema-oscuro.png) |

---

## Índice

0. [Capturas](#capturas)
1. [El problema y la idea](#1-el-problema-y-la-idea)
2. [Qué deja fuera a propósito](#2-qué-deja-fuera-a-propósito)
3. [Un día de estudio con la app](#3-un-día-de-estudio-con-la-app)
4. [Características en detalle](#4-características-en-detalle)
5. [Atajos de teclado](#5-atajos-de-teclado)
6. [Puesta en marcha](#6-puesta-en-marcha)
7. [API key y cuota](#7-api-key-y-cuota)
8. [Guardado automático en un archivo](#8-guardado-automático-en-un-archivo)
9. [Instalar como app (PWA)](#9-instalar-como-app-pwa)
10. [Publicar en GitHub Pages](#10-publicar-en-github-pages)
11. [Privacidad y datos locales](#11-privacidad-y-datos-locales)
12. [Cómo se mide el estudio](#12-cómo-se-mide-el-estudio)
13. [Arquitectura y estructura del proyecto](#13-arquitectura-y-estructura-del-proyecto)
14. [Limitaciones conocidas](#14-limitaciones-conocidas)
15. [Solución de problemas](#15-solución-de-problemas)
16. [Desarrollo](#16-desarrollo)
17. [Licencia](#17-licencia)

---

## 1. El problema y la idea

YouTube es una biblioteca enorme de contenido educativo (clases, conferencias, tutoriales, documentales), pero su interfaz está diseñada para **retener la atención**, no para **concentrarla**: miniaturas llamativas, recomendaciones infinitas, comentarios, vídeos relacionados al terminar. Estudiar con YouTube suele acabar en otra cosa.

**yt-minimal conserva lo útil y elimina lo que distrae.** Lo útil es: buscar, guardar, reproducir y retomar. El resto no está.

El flujo que propone es simple:

> **Descubrir** (gasta cuota) → **Guardar** en playlists con un tipo → **Estudiar** (no gasta cuota) → **Medir** el avance.

Esa separación explica varias decisiones de diseño: ver vídeos es gratis y se favorece sobre buscar de nuevo; las búsquedas se guardan; las playlists importadas se guardan con todos sus datos para no volver a pedirlos.

## 2. Qué deja fuera a propósito

| No hay | Por qué |
|---|---|
| Miniaturas | Son el principal gancho visual. Las filas muestran solo texto: título, canal, vistas, fecha y duración. |
| Feed de recomendaciones | Nadie decide qué ves a continuación salvo tú y tu cola. |
| Comentarios | Son una fuente de distracción y de discusión ajena al estudio. |
| Vídeos relacionados al terminar | Se configura el reproductor con `rel=0` y la app pasa sola al siguiente de *tu* cola. |
| Cuentas, backend o analítica | No hay servidor: nada sale de tu navegador salvo las llamadas a la API de YouTube. |
| Compilación y dependencias | Sin `npm install`, sin *bundler*. Se sirve la carpeta tal cual. |

El tema es sobrio, con un único color de acento. Por defecto sigue al sistema (`prefers-color-scheme`), y desde la barra lateral puedes fijarlo en **claro** u **oscuro** ([ver tema](#48-tema-claro-oscuro-o-del-sistema)).

## 3. Un día de estudio con la app

1. **Abres la app** (en el navegador o instalada). El buscador tiene el foco; pulsa `/` desde cualquier sitio para volver a él.
2. **Buscas un tema** o **pegas un enlace**: un vídeo se abre directamente y una playlist de YouTube se importa entera.
3. **Guardas** lo que sirve con el botón `+`, asignándole un **tipo** (teoría, práctica, repaso…) y la playlist de destino.
4. **Abres tu playlist**: ves cuánto dura, cuánto te falta y un botón **Retomar / Continuar / Empezar** que te lleva al vídeo que toca.
5. **Estudias en modo concentración**, con un **Pomodoro** en la cabecera. Si un vídeo tiene capítulos, saltas de tema en tema.
6. Al terminar un vídeo **pasa solo al siguiente**; al día siguiente la app retoma exactamente donde lo dejaste.
7. En **Estadísticas** ves cuánto has estudiado, tu racha y tu avance por playlist y por tipo.

## 4. Características en detalle

### 4.1 Buscar y descubrir

- **Búsqueda sin miniaturas**, con filas tipográficas que se atenúan cuando ya viste el vídeo y muestran «Retomar en 5:00» con una barra de avance si lo dejaste a medias.
- **Solo vídeos que se pueden insertar.** La búsqueda pide `videoEmbeddable=true`, así que no aparecen vídeos que no se podrán reproducir aquí.
- **Filtros de búsqueda** (botón de filtros junto al buscador, con un contador de los activos):
  - *Orden*: relevancia, más recientes, más vistos, mejor valorados.
  - *Duración*: cualquiera, menos de 4 min, 4–20 min, más de 20 min.
  - *Fecha*: cualquiera, hoy, esta semana, este mes, este año.
  - *Solo con subtítulos*.
  - Se guardan como preferencia y **no cambian el costo** de la búsqueda. Cambiar un filtro **no relanza** la búsqueda (gastaría cuota): se aplica con **Aplicar** o con Enter.
- **Pegar un enlace en el buscador** (reconoce `youtube.com`, `m.`, `music.`, `youtu.be`, y rutas `/embed`, `/shorts`, `/live`):
  - Enlace de **vídeo** → se abre directamente (1 unidad de cuota).
  - Enlace de **playlist** → se muestra y puedes **Guardar como playlist** propia, con todos sus vídeos y metadatos (hasta ≈1000 vídeos).
  - Los filtros se ignoran con enlaces.
- **«Cargar más»**: cada búsqueda descarga 50 resultados y se muestran de 15 en 15; mientras queden resultados ya descargados, cargar más no gasta nada.
- **Modo demo**: sin API key la app arranca con resultados de ejemplo para que puedas explorar la interfaz. El reproductor lo indica y no reproduce vídeo.

### 4.2 Reproducir sin distracciones

El reproductor es un único elemento en pantalla que cambia de aspecto con CSS según el modo; por eso **cambiar de modo nunca reinicia el vídeo**.

- **Modo cine**: pantalla propia con el vídeo, la información, las acciones y la **cola** lateral (los vídeos de la lista desde la que lo abriste).
- **Modo concentración**: oculta la cola y centra el vídeo en la página. Es una preferencia de la sesión: se mantiene al cambiar de vídeo. Si el vídeo tiene capítulos, estos aparecen bajo el vídeo. Al elegirlo hay una **transición breve**: el vídeo se asienta en el centro con un anillo del color de acento, el título aparece un instante después y el icono del botón «apunta» al objetivo; al salir, la cola vuelve deslizándose. Solo se anima la propia elección (no al abrir un vídeo con el modo ya activo), el vídeo no se reinicia y todo se desactiva si el sistema pide reducir el movimiento.
- **Mini reproductor flotante**: al cambiar de sección, hacer otra búsqueda o pulsar `Esc`, el vídeo **sigue sonando** en una ventana pequeña. Desde ahí se puede expandir o cerrar.
- **Avance automático**: al terminar, pasa al siguiente de la cola sin cambiar de modo.
- **Pantalla completa** con un botón, y enlace para **abrir el vídeo en YouTube**.
- **Marcar visto / quitar visto** desde el propio reproductor.
- **Guardar en playlist** sin salir del vídeo.

### 4.3 Organizar: playlists y tipos

- **Playlists propias**: crear (botón `+` de la barra lateral), renombrar (se edita el título directamente) y eliminar (con confirmación). La lista de la barra lateral se puede plegar y muestra el número de vídeos de cada una.
- **Tipos de vídeo**: cada vídeo guardado lleva una etiqueta libre (*teoría*, *práctica*, *repaso*, *cocina*, lo que te sirva). El campo sugiere los tipos que ya usaste y cada tipo tiene **un color propio**, estable según su nombre.
- **Filtro por tipo** dentro de cada playlist, con el recuento por tipo. Con un tipo seleccionado, los tiempos y el botón de continuar se calculan solo con ese tipo.
- **Un mismo vídeo puede estar en varias playlists**; guardarlo de nuevo en la misma solo actualiza su tipo.
- **Reordenar vídeos**: el botón con el icono de flechas ⇅, junto a la papelera de eliminar la playlist, activa un modo en el que cada vídeo se arrastra a su nueva posición (escritorio) o se mueve con las flechas ▲▼ de su fila (móvil y teclado). El orden se guarda en la playlist, entra en la exportación y en el guardado automático, y la cola del reproductor lo adopta al instante. Mientras se reordena se ve la playlist completa (el filtro por tipo se quita) y no se puede editar el tipo; el icono de check (**Listo**) sale del modo.
- **Quitar** un vídeo de una playlist o **eliminar** la playlist entera.

### 4.4 Seguir el avance

- **Retomar donde lo dejaste.** La posición de cada vídeo se guarda sola. Al reabrirlo continúa desde ahí, retrocediendo 3 s para recuperar el hilo, y aparece un enlace **«desde el inicio»**. Por debajo de 10 s se empieza desde el principio.
- **Marcado automático como visto**: un vídeo cuenta como visto al terminar o al quedar a menos de 20 s (o el 5 % de su duración) del final. También se puede marcar o desmarcar a mano. Un vídeo visto no guarda posición: al abrirlo otra vez empieza desde cero (ese tiempo de repaso sí suma a tus estadísticas).
- **Resumen de cada playlist**: vídeos y tipos, duración total, tiempo por ver, porcentaje completado y barra de progreso.
- **Botón de continuar inteligente**: abre el vídeo empezado con actividad más reciente; si no hay ninguno, el primero sin ver. Se llama **Retomar** (hay un vídeo a medias), **Continuar** (ya viste alguno) o **Empezar**. Si todo está visto, lo indica.
- **Capítulos**: los vídeos que los tienen muestran una pestaña «Capítulos» junto a la cola (o bajo el vídeo en modo concentración) con el capítulo en curso resaltado; al pulsar uno se salta a su inicio. Ver [cómo se obtienen](#capítulos).

### 4.5 Estadísticas de estudio

La vista **Estadísticas** reúne, sin gastar cuota:

- **Tiempo estudiado**: hoy, 7 días, 30 días y total.
- **Racha** actual y mejor racha (días seguidos con al menos 1 minuto de estudio).
- **Pomodoros** completados hoy y en total.
- **Vídeos vistos** y **en curso**.
- **Gráfico de los últimos 14 días**, con el día de hoy destacado.
- **Desglose por playlist**: vistos/total, tiempo estudiado, tiempo restante y barra de avance (al pulsarla abres la playlist).
- **Desglose por tipo de vídeo**: tiempo estudiado y número de vídeos (un vídeo en varias playlists cuenta una sola vez).

### 4.6 Pomodoro integrado

Un temporizador en la cabecera (y también dentro del modo cine) que acompaña la sesión:

- **Fases**: foco → descanso → foco…, y un descanso largo cada cierto número de sesiones.
- **Valores por defecto**: 25 min de foco, 5 de descanso, 15 de descanso largo, descanso largo cada 4 sesiones. Todo es configurable (foco 1–180 min, descanso 1–60, descanso largo 1–120, ciclo de 2–12 sesiones).
- **Controles**: iniciar, pausar, saltar fase y reiniciar el ciclo.
- **Opciones**: iniciar la siguiente fase automáticamente, sonido al terminar cada fase y **pausar el vídeo al empezar un descanso** (volver a darle al play es decisión tuya).
- **Cuenta atrás en el título de la pestaña**, para verla aunque estés en otra.
- **Preciso**: el tiempo se calcula con la hora de fin, no contando segundos, así que no se atrasa con la pestaña en segundo plano.
- **Sobrevive a recargar la página**: la fase en curso continúa; si venció con la página cerrada, pasa a la siguiente sin contar como sesión.
- **Qué cuenta**: un pomodoro es un foco completado hasta el final; saltarlo no suma. Se guarda el total por día (hasta 400 días).

### 4.7 Tus datos, portables

- **Exportar / importar playlists** en JSON desde la barra lateral. La importación **une** con lo que ya tienes (no sustituye). Incluye los capítulos, pero no el progreso ni las estadísticas.
- **Guardado automático en un archivo del equipo** con todo (playlists, progreso, estadísticas y pomodoros). Ver [sección 8](#8-guardado-automático-en-un-archivo).
- **App instalable** con ventana propia y uso sin conexión. Ver [sección 9](#9-instalar-como-app-pwa).
- La **API key nunca** se incluye en ninguna copia.

### 4.8 Tema claro, oscuro o del sistema

Al pie de la barra lateral hay un selector **Tema** con tres opciones, representadas por un icono cada una:

| Opción | Comportamiento |
|---|---|
| Seguir el sistema (predeterminada) | Usa el tema claro u oscuro de tu sistema operativo o navegador y cambia sola si el sistema cambia. |
| Claro | Fija el tema claro, sea cual sea el del sistema. |
| Oscuro | Fija el tema oscuro, sea cual sea el del sistema. |

- **El tema claro está construido por capas de tonos claros** que contrastan entre sí: la barra lateral es el tono más profundo (gris azulado), la página es más luminosa, y los paneles, tarjetas, campos y botones son blancos con una sombra suave. La fila bajo el cursor o en reproducción se tiñe levemente, y los estados activos (filtros, Pomodoro en marcha) usan un rosa muy pálido. La tinta es azul muy oscuro y el acento, un rosa intenso. Todos los textos cumplen contraste AA (≥ 4.5:1).
- El tema oscuro se mantiene como estaba.
- La elección se guarda en el navegador (`yt_theme`) y se aplica **antes de pintar la página**, así que al abrir la app no hay parpadeo entre temas.
- Los controles nativos (casillas, campos numéricos, barras de desplazamiento) y el color de la barra del navegador en móvil también se adaptan al tema elegido.
- Es una preferencia del navegador: no entra en el archivo de guardado automático ni en la exportación de playlists.

## 5. Atajos de teclado

| Tecla | Acción |
|---|---|
| `/` | Enfoca el buscador (si no estás escribiendo en un campo) |
| `Enter` | Lanza la búsqueda / aplica los filtros pendientes |
| `Esc` | Pasa el vídeo en curso al mini reproductor (sigue sonando) |

## 6. Puesta en marcha

No hay nada que instalar ni compilar. Los módulos ES y el reproductor de YouTube necesitan una dirección `http://`: abrir `index.html` con doble clic provoca el *error 153*. Sirve la carpeta con cualquier servidor estático:

```bash
python -m http.server 8000
# o: npx serve
```

Abre <http://localhost:8000>.

Requisitos: un navegador moderno con soporte de módulos ES, conexión para cargar React y htm desde CDN la primera vez (después quedan en la caché del service worker) y, para resultados reales, una API key gratuita.

## 7. API key y cuota

### Obtener la clave (gratis)

Sin clave la app funciona en **modo demo**. Para resultados reales, cada persona usa **su propia clave**, así que tiene su propia cuota y nadie depende de la de otro:

1. [Crea un proyecto](https://console.cloud.google.com/projectcreate) en Google Cloud.
2. [Habilita «YouTube Data API v3»](https://console.cloud.google.com/apis/library/youtube.googleapis.com) en ese proyecto.
3. En [Credenciales](https://console.cloud.google.com/apis/credentials): *Crear credenciales → Clave de API*.
4. Pégala en la app (botón **API key** de la cabecera). Se comprueba con una llamada de 1 unidad antes de guardarse y, si algo falla, indica qué: clave inválida, API sin habilitar, restricción de referentes o falta de conexión.

La clave se guarda solo en el `localStorage` de tu navegador. Recomendado: restringirla a *YouTube Data API v3* y por *Referentes HTTP* (`http://localhost:8000/*` para uso local, `https://<usuario>.github.io/*` si publicas la web).

### Cuota

La cuota gratuita es de **10 000 unidades al día por proyecto** y se reinicia a medianoche (hora del Pacífico). **Ver vídeos no gasta cuota** (el reproductor es un `<iframe>` de embed); solo gasta descubrirlos.

| Acción | Costo |
|---|---|
| Búsqueda (hasta 50 resultados), con o sin filtros | 101 |
| Repetir una búsqueda con los mismos filtros (caché de 24 h) | 0 |
| «Cargar más» con resultados ya descargados | 0 |
| Playlist de YouTube, por cada 50 vídeos | 2 (+1 por el título, solo en la primera página) |
| Enlace a un vídeo | 1 |
| Capítulos de vídeos nuevos (búsquedas, enlaces, playlists importadas) | 0 (vienen en la misma llamada) |
| Botón «Capítulos» en un vídeo guardado antes de tener capítulos (incluye hasta 49 vídeos más de su cola) | 1 |
| Validar la clave al guardarla | 1 |
| Reproducir, retomar, marcar como visto, estadísticas, Pomodoro, usar tus playlists, exportar/importar | 0 |

**Cómo se ahorra cuota:**

- Cada búsqueda pide siempre 50 resultados (cuesta lo mismo que pedir 15) y se muestran de 15 en 15.
- Las búsquedas se guardan **24 h** (hasta 30 páginas de resultados). La misma consulta con otros filtros es otra búsqueda y gasta cuota, por eso los filtros se aplican a petición.
- Las playlists importadas se guardan localmente con sus metadatos y capítulos.
- El contador de la cabecera (`≈ usado / 10 000`) es una **estimación local** que se reinicia sola con el día del Pacífico o al cambiar de clave.

**Con la cuota agotada** siguen funcionando tus playlists, el progreso, el Pomodoro, las búsquedas guardadas y los enlaces de vídeo (título y canal vía *oEmbed*, sin clave y sin cuota; esos vídeos no traen duración hasta que los reproduces).

## 8. Guardado automático en un archivo

Usa la *File System Access API*, disponible en **Chrome, Edge y Opera de escritorio** (no en Firefox ni Safari: allí sigue estando Exportar/Importar). En la barra lateral:

- **Crear archivo**: eliges dónde guardar `yt-minimal.json`; desde ese momento se escribe solo, unos segundos después de cada cambio (como mucho una vez cada 10 s) y al ocultar o cerrar la pestaña.
- **Usar existente**: eliges un archivo guardado antes (por ejemplo, el de otro dispositivo). Su contenido se **une** a lo que ya tienes: por vídeo gana el progreso más reciente, por día el mayor tiempo y las playlists se completan con lo que falte. Después sigue guardándose ahí.
- **Reconectar**: tras reiniciar el navegador, Chrome puede pedir confirmar otra vez el permiso sobre el archivo; hasta entonces el guardado queda en pausa.
- **Desactivar**: deja de escribir en el archivo (no lo borra).

Detalles que conviene saber:

- El archivo es una **copia** de lo que hay en el navegador, no una fuente que se lea a cada arranque. La única vez que se lee solo es cuando la app está vacía (por ejemplo, tras borrar los datos del navegador): entonces **recupera** el archivo en lugar de sobrescribirlo con nada.
- Contiene playlists (con tipos y capítulos), progreso por vídeo, segundos estudiados por día y pomodoros por día. **Nunca** incluye la API key, la caché de búsquedas ni tus preferencias (tema, filtros, ajustes del Pomodoro).
- Para usar la misma información en dos equipos, pon el archivo en una carpeta sincronizada y usa **Usar existente** en el segundo. Si editas en los dos a la vez, el último en guardar gana: mejor no tener la app abierta en ambos al mismo tiempo.
- La escritura es **atómica**: un corte a mitad no deja el archivo a medias.

## 9. Instalar como app (PWA)

La app incluye `manifest.webmanifest`, iconos (`icons/`) y un service worker (`sw.js`). Para instalarla hace falta servirla por `https://` o `http://localhost` (GitHub Pages sirve): en Chrome o Edge aparece el botón **Instalar app** en la barra lateral (o el icono de instalar de la barra de direcciones); en Safari/iOS, *Compartir → Añadir a pantalla de inicio*. Se presenta como «Estudio» y se clasifica como educación y productividad.

- **Sin conexión.** El service worker guarda los archivos de la app y las librerías de React y htm; sin red se abre igual y funcionan tus playlists, el progreso, las estadísticas, el Pomodoro y las búsquedas guardadas. Reproducir vídeos y buscar de nuevo sí necesitan conexión.
- **Actualizaciones.** Los archivos de la app se piden primero a la red, así que los cambios se ven al recargar. La API de YouTube, los vídeos y las miniaturas **nunca** pasan por la caché.
- Los datos son los mismos que en la web: la app instalada y la pestaña comparten el almacenamiento del mismo origen.

## 10. Publicar en GitHub Pages

1. Sube el repositorio a GitHub (el archivo `.nojekyll` ya está incluido).
2. *Settings → Pages → Build and deployment →* **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. Tu app quedará en `https://<usuario>.github.io/<repositorio>/`.
4. Si restringiste tu API key por referentes, añade `https://<usuario>.github.io/*`.

Cada persona que visite tu página usará **su propia** clave: nunca publiques la tuya dentro del código.

## 11. Privacidad y datos locales

No hay backend. La app solo se comunica con:

- **YouTube Data API v3** (`googleapis.com`) para buscar, importar y leer metadatos.
- **YouTube embed** (`youtube.com/embed`) para reproducir vídeos.
- **oEmbed de YouTube**, para el título y el canal de un enlace sin clave.
- **cdnjs y jsDelivr**, para cargar React, ReactDOM y htm (versiones fijas).

Lo que se guarda en tu navegador, por origen (dirección):

| Clave | Contenido |
|---|---|
| `yt_key` | Tu API key |
| `yt_pl` | Playlists, con tipos y capítulos |
| `yt_prog` · `yt_days` | Progreso por vídeo y segundos estudiados por día |
| `yt_pomo_cfg` · `yt_pomo` · `yt_pomo_days` | Ajustes, fase en curso y pomodoros por día |
| `yt_cache` | Búsquedas guardadas (24 h) |
| `yt_quota` | Contador local de cuota |
| `yt_filters` · `yt_side` · `yt_plopen` · `yt_theme` | Preferencias de filtros, de la barra lateral y del tema |
| IndexedDB `yt-minimal` | Permiso al archivo de guardado automático |

Borrar los datos del sitio elimina todo lo anterior; si tenías guardado automático, la app recupera tus datos desde el archivo.

## 12. Cómo se mide el estudio

- **Tiempo estudiado.** Se cuentan los segundos reales con el vídeo *reproduciéndose*. En pausa no suma, y un equipo suspendido tampoco. Se conservan 400 días de historial.
- **Racha.** Un día cuenta con al menos 1 minuto. La racha actual cuenta hasta hoy; si hoy aún no has estudiado, cuenta desde ayer.
- **Visto.** Al terminar el vídeo, o al quedar a menos de 20 s (o el 5 %) del final. Un vídeo de menos de 30 s solo se da por visto al terminar.
- **Anuncios.** Si el embed muestra un anuncio, se ignora mientras la duración que informa el reproductor no coincida con la del vídeo (tolerancia de 10 s o 5 %), para no marcar como visto ni perder la posición.
- **Duraciones.** Los vídeos añadidos por enlace sin API key no tienen duración hasta que los reproduces; aparecen como «sin duración» y no cuentan en los totales.
- **Guardado.** El progreso vive en memoria al instante y se escribe cada 5 s, y siempre al cerrar el vídeo, ocultar o cerrar la pestaña.

### Capítulos

La API de YouTube no los expone: se leen de la **descripción del vídeo** con las mismas reglas que usa YouTube (la lista empieza en `0:00`, tiene al menos tres capítulos y va en orden ascendente). Solo se guardan los capítulos, nunca la descripción. Los vídeos guardados antes de que existieran los capítulos traen un botón «Capítulos» (1 unidad de cuota, y de paso carga hasta 49 vídeos más de la cola).

## 13. Arquitectura y estructura del proyecto

**Stack:** React 18 (UMD por CDN) + [htm](https://github.com/developit/htm) para plantillas JSX-sin-compilar + módulos ES nativos + CSS plano. Sin `package.json`.

### Decisiones de diseño

- **Organizado por función, no por tipo de archivo.** Cada carpeta de `js/features/` reúne todo lo de una función (sus componentes, hooks y lógica), así que para tocar el Pomodoro o el reproductor basta con abrir una carpeta.
- **Dependencias en un solo sentido**: `config.js` ← `shared/` ← `api/` ← `features/` ← `layout/` ← `App.js`. `shared/` y `api/` nunca importan de `features/` ni de `layout/`, y no hay ciclos. Entre funciones solo hay dependencias claras: el reproductor usa el Pomodoro, el progreso y el selector de playlists; la búsqueda usa la clave de API y el selector de playlists.
- **Lógica pura aparte**: las reglas sin React ni DOM (`shared/domain/`, `features/pomodoro/phases.js`) están separadas del estado y de la interfaz, para razonarlas y probarlas sin navegador.
- **El progreso es un almacén aparte** (`features/progress/progress.js`) con cambios en memoria al instante y escritura limitada, para que reproducir un vídeo no vuelva a pintar toda la app cada segundo. Lo mismo ocurre con la cuenta atrás del Pomodoro.
- **Un solo nodo de reproductor** para cine y mini: cambiar de modo solo cambia CSS y el `<iframe>` no se recarga.
- **La URL del embed no cambia** una vez abierta (el punto de retorno se decide al abrir): modificar el `src` recargaría el iframe.
- **Fuentes de vídeos** (`features/search/sources.js`): lo que escribes se convierte en una fuente paginada (búsqueda, playlist o vídeo) con la caché aplicada de forma uniforme.

### Estructura de carpetas

```
index.html            Punto de entrada (carga React, htm y los módulos)
manifest.webmanifest  Datos de la app instalable (nombre, iconos, colores)
sw.js                 Service worker: uso sin conexión
icons/                Iconos de la app (PNG y SVG)

css/
├── main.css          Punto de entrada: importa todo en el orden de la cascada (index.html enlaza solo este)
├── base/             tokens.css (colores y temas claro/oscuro) · reset.css · animations.css
├── components/       ui.css (botones, campos, avisos) · rows.css (filas de vídeo)
├── layout/           shell.css (estructura) · sidebar.css · topbar.css · responsive.css (siempre el último)
└── features/         apikey · filters · player · playlists · pomodoro · stats

js/
├── main.js           Monta la aplicación y registra el service worker
├── App.js            Raíz: conecta los hooks de cada función con las vistas y el reproductor
├── config.js         Constantes (costos de cuota, límites, progreso, Pomodoro) y datos de demostración
│
├── shared/           Lo que usan varias funciones
│   ├── lib/          react.js (globales UMD) · storage.js (localStorage) · useStored.js (estado persistente)
│   │                 format.js (duraciones, vistas, fechas y color de los tipos)
│   ├── domain/       Reglas puras: filters.js (filtros de búsqueda) · chapters.js (capítulos)
│   │                 stats.js (totales, rachas y desgloses) · order.js (orden de los vídeos)
│   └── ui/           Icon.js (iconos SVG) · Row.js (fila de vídeo: la comparten búsqueda y playlists)
│
├── api/              Datos externos (YouTube) y cuota
│   ├── request.js    Petición base: arma la llamada, contabiliza cuota y traduce errores
│   ├── youtube.js    Cliente: búsqueda (con filtros), playlists, vídeos, validación de clave
│   ├── oembed.js     Título y canal sin clave
│   └── quota.js      Contador local de cuota
│
├── layout/           Estructura de la pantalla: Sidebar · TopBar · useShortcuts (atajos de teclado)
│
└── features/         Una carpeta por función
    ├── search/       SearchView · SearchFilters · useSearch · sources (entrada → fuente paginada)
    │                 cache (caché con vigencia) · demo (resultados de ejemplo) · urls (reconoce enlaces de YouTube)
    ├── playlists/    PlaylistView · Adder (guardar en playlist) · usePlaylists
    ├── player/       Player · Chapters · usePlayer · useYTPlayer · ytapi (IFrame Player API)
    ├── progress/     progress (posición, vistos y segundos por día) · useProgress · StatsView
    ├── pomodoro/     Pomodoro · usePomodoro · phases (fases y transiciones) · beep (aviso sonoro)
    ├── backup/       Backup (exportar/importar) · AutoSave · useAutosave
    │                 backupFormat (formato de las copias) · fileAccess (File System Access API) · idb (IndexedDB)
    ├── apikey/       KeySetup · KeyField · useKeyCheck · useQuota
    ├── theme/        ThemeToggle · useTheme
    └── install/      Install · useInstall
```

### ¿Dónde toco para…?

| Quiero cambiar… | Archivo o carpeta |
|---|---|
| Colores y temas claro/oscuro | `css/base/tokens.css` (y `js/features/theme/` para el selector) |
| Costos de cuota, tamaños de página, umbrales de «visto», valores del Pomodoro | `js/config.js` |
| Cómo se busca, los filtros o la caché | `js/features/search/` y `js/shared/domain/filters.js` |
| Las llamadas a la API de YouTube | `js/api/` |
| El reproductor, el modo concentración o los capítulos | `js/features/player/` y `css/features/player.css` |
| El Pomodoro | `js/features/pomodoro/` y `css/features/pomodoro.css` |
| El progreso, las rachas o las estadísticas | `js/features/progress/` y `js/shared/domain/stats.js` |
| La barra lateral o la cabecera | `js/layout/` y `css/layout/` |
| Exportar, importar o el guardado automático | `js/features/backup/` |
| Estilos de botones, campos o filas de vídeo | `css/components/` |
| Estilos para móvil | `css/layout/responsive.css` |

### Convenciones

- **Nombres**: `PascalCase.js` es un componente de React (uno por archivo), `useXxx.js` es un hook y `camelCase.js` es lógica o servicio sin React. Los nombres no se repiten ni cambiando mayúsculas y minúsculas dentro de una carpeta, para que el proyecto funcione igual en Windows, macOS y Linux.
- **CSS**: un archivo por pieza, con el mismo nombre que su función cuando existe. El orden de `css/main.css` es el de la cascada: añade los archivos nuevos en el bloque que les corresponde y deja `responsive.css` el último.
- **Formato del código**: CSS y JS se escriben expandidos: el selector (o la función) con su llave en la misma línea, una declaración o sentencia por línea, sangría de 2 espacios y la llave de cierre sola en la suya. El archivo `.prettierrc` fija estas reglas; para reaplicarlas: `npx prettier --write "css/**/*.css" "js/**/*.js" sw.js`.
- **Añadir una función nueva**: crea `js/features/<nombre>/` con sus archivos, su CSS en `css/features/<nombre>.css` (impórtalo en `css/main.css`), conéctala desde `App.js` o `layout/` y añade los archivos a `SHELL` en `sw.js`.

## 14. Limitaciones conocidas

- Algunos vídeos tienen la inserción desactivada por su autor: la búsqueda ya los excluye, pero pueden aparecer en playlists importadas.
- Las playlists tipo **«Mix»** generadas por YouTube (`list=RD…`) no se pueden importar: la API no las expone.
- La importación de una playlist tiene un tope de 20 páginas (≈1000 vídeos).
- Los datos se guardan **por origen** en el navegador: `localhost:8000` y tu página de GitHub Pages son almacenes distintos. Usa el guardado automático o Exportar para llevarlos de uno a otro.
- El guardado automático en archivo no está disponible en Firefox ni Safari.
- Las playlists exportadas en JSON **no** incluyen el progreso ni las estadísticas; para eso está el guardado automático.
- El contador de cuota es una estimación local: no consulta a Google.
- Si abres la app en dos equipos a la vez con el mismo archivo de guardado, el último en guardar gana.

## 15. Solución de problemas

| Síntoma | Causa y solución |
|---|---|
| El vídeo no carga y aparece el *error 153* | Abriste `index.html` con doble clic. Sirve la carpeta con un servidor estático ([sección 6](#6-puesta-en-marcha)). |
| «La API key no es válida» | Revisa que copiaste la clave completa y que no tiene espacios. |
| «Falta habilitar YouTube Data API v3» | Habilítala en el proyecto de esa clave desde la biblioteca de APIs. |
| «La restricción de referentes no incluye este sitio» | Añade `http://localhost:8000/*` o tu dirección de GitHub Pages en las restricciones de la clave. |
| «Cuota diaria agotada» | Se reinicia a medianoche (hora del Pacífico). Mientras tanto usa tus playlists y las búsquedas guardadas. |
| Actualicé los archivos y no veo los cambios | El navegador guarda en caché los módulos JS. Haz una recarga forzada (`Ctrl+Shift+R`, o `Cmd+Shift+R` en Mac) o activa *Disable cache* en las herramientas de desarrollador (F12 → Network). Si usas la app instalada, súbele la versión a `CACHE` en `sw.js`. |
| El guardado automático aparece en pausa | Tras reiniciar el navegador Chrome pide confirmar el permiso: pulsa **Reconectar**. |
| Un vídeo añadido por enlace no tiene duración | Se añadió sin API key o con la cuota agotada; la duración se completa al reproducirlo. |

## 16. Desarrollo

- No hay paso de compilación: edita los archivos y recarga.
- **Si añades, mueves o quitas archivos** en `css/` o `js/`, actualiza la lista `SHELL` de `sw.js` y sube la versión de `CACHE`; si no, no estarán disponibles sin conexión. Los archivos CSS nuevos también se importan en `css/main.css` ([estructura](#13-arquitectura-y-estructura-del-proyecto)).
- Las constantes ajustables (costos de cuota, tamaño de página, vigencia de la caché, umbrales de «visto», valores del Pomodoro, ritmo del guardado automático) están todas en `js/config.js`.
- Los colores son variables CSS en `css/base/tokens.css`, con los mismos nombres en ambos temas: superficies (`--bg` página, `--side` barra lateral, `--card` paneles, `--field` campos y botones, `--hover` fila bajo el cursor), líneas (`--line`, `--side-line`), texto (`--fg`, `--mut`), acento (`--acc`, `--acc-soft`) y sombras (`--shadow`, `--pop-sm`, `--pop-md`). Para retocar la paleta clara edita el bloque `:root`; el oscuro está definido dos veces (modo «sistema» y oscuro forzado), así que cambia ambos bloques a la vez. Si cambias `--bg`, actualiza también `BAR` en `js/features/theme/useTheme.js`, el `theme-color` de `index.html` y los colores de `manifest.webmanifest`.
- La lógica pura (`js/shared/domain/` y `js/features/pomodoro/phases.js`) está separada del estado y de la interfaz para poder probarla sin navegador.
- Los cálculos de cuota deben seguir la [tabla oficial de costos de la API](https://developers.google.com/youtube/v3/determine_quota_cost).

## 17. Licencia

[MIT](LICENSE)
