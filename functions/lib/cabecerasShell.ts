/**
 * Cabeceras de seguridad del shell de la app.
 *
 * `/`, `/demo/*` y `/admin` sirven el mismo index.html, y hasta el 15 de
 * septiembre salían sin CSP ni protección contra el framing: cualquier web podía
 * incrustar la app en un iframe. `public/_headers` no sirve para esto: sólo casa
 * con `/` y `/index.html`, y las rutas del SPA como `/demo/coach` llegan con las
 * cabeceras por defecto de Cloudflare. Por eso se ponen aquí, en código y con
 * test, igual que en `presentacion.ts`.
 */

export const CSP_SHELL = [
  "default-src 'self'",
  // index.html sólo carga módulos de /assets: no hay scripts en línea.
  "script-src 'self'",
  // Los style={{…}} de React son atributos en línea.
  "style-src 'self' 'unsafe-inline'",
  // Fotos desde /api/v2/medios; las vistas previas locales usan createObjectURL.
  "img-src 'self' blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  // 'self' y no 'none': /presentacion incrusta /demo/cliente en su maqueta.
  "frame-ancestors 'self'",
].join('; ')

/** Devuelve una respuesta nueva con las cabeceras; lo que no es HTML sale intacto. */
export function conCabecerasDeShell(respuesta: Response): Response {
  const tipo = respuesta.headers.get('Content-Type') ?? ''
  if (!tipo.includes('text/html')) return respuesta

  const cabeceras = new Headers(respuesta.headers)
  cabeceras.set('Content-Security-Policy', CSP_SHELL)
  // Para navegadores que aún no leen frame-ancestors.
  cabeceras.set('X-Frame-Options', 'SAMEORIGIN')
  return new Response(respuesta.body, {
    status: respuesta.status,
    statusText: respuesta.statusText,
    headers: cabeceras,
  })
}
