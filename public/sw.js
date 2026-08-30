/**
 * Service worker de autodestrucción.
 *
 * La app dejó de funcionar sin conexión: ahora cada carga tiene que llegar al
 * servidor para que Cloudflare Access la autorice. Una versión cacheada por el
 * service worker anterior se serviría sin pasar por el login, así que este
 * fichero existe sólo para desmontar lo que dejó la versión anterior.
 *
 * No registra ningún `fetch`: mientras esté activo, todas las peticiones van a
 * la red. Se desregistra a sí mismo y recarga las pestañas abiertas para que
 * pasen por Cloudflare.
 *
 * Se puede borrar cuando ya no queden navegadores con la versión antigua.
 */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      for (const nombre of await caches.keys()) {
        await caches.delete(nombre)
      }

      await self.registration.unregister()

      // Recargar: la pestaña abierta todavía muestra el HTML que sirvió la
      // caché, y esa copia nunca pasó por Cloudflare Access.
      const pestanas = await self.clients.matchAll({ type: 'window' })
      for (const pestana of pestanas) {
        pestana.navigate(pestana.url)
      }
    })(),
  )
})
