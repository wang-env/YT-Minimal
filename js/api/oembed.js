/** Título y canal de un vídeo sin API key ni cuota (oEmbed); no incluye duración, vistas ni fecha */

export async function oembedVideo(id) {
  const target = encodeURIComponent("https://www.youtube.com/watch?v=" + id);
  let json;
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${target}`);
    if (!res.ok) throw new Error(res.status);
    json = await res.json();
  } catch (e) {
    throw new Error(
      "No se pudo obtener el vídeo sin la API. Añade una API key e inténtalo de nuevo."
    );
  }
  return {id, title: json.title, channel: json.author_name, date: null, dur: null, views: null};
}
