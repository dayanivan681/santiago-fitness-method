/**
 * Desmonta el modo sin conexión que dejó la versión anterior.
 *
 * La app pasó a ser cloud-first: cada carga debe llegar al servidor para que
 * Cloudflare Access decida si autoriza. Un service worker o una caché de la
 * versión antigua serviría la app sin pasar por el login, así que hay que
 * quitarlos en cuanto el navegador ejecute esta versión.
 *
 * Nunca lanza: si el navegador no soporta algo, o lo prohíbe, arrancar la app
 * es más importante que limpiar. El `sw.js` de autodestrucción cubre el caso
 * en el que este código ni siquiera llega a ejecutarse porque la caché antigua
 * sirvió el bundle viejo.
 *
 * No toca `localStorage`: ahí vive configuración de la app, no autenticación.
 */

async function quitarServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return

  const registros = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registros.map((registro) => registro.unregister()))
}

async function borrarCaches(): Promise<void> {
  if (typeof caches === 'undefined') return

  const nombres = await caches.keys()
  await Promise.all(nombres.map((nombre) => caches.delete(nombre)))
}

export async function limpiarOffline(): Promise<void> {
  try {
    await quitarServiceWorkers()
    await borrarCaches()
  } catch {
    // Arrancar la app importa más que limpiar. El sw.js de autodestrucción
    // vuelve a intentarlo en la siguiente carga.
  }
}
