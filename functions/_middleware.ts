/**
 * La puerta.
 *
 * Un middleware en la raíz de `functions/` se ejecuta en TODAS las peticiones
 * al proyecto de Pages, incluidos los ficheros estáticos, antes de servirlos.
 * Ésa es la razón de que la autenticación viva aquí y no en un Worker aparte:
 * un Worker delante del sitio crearía un segundo origen accesible por su
 * cuenta, y habría que inventar un secreto compartido para taparlo. Aquí no hay
 * nada que rodear porque no hay segundo origen.
 *
 * React no participa. La app no sabe que esto existe y no maneja ningún token.
 *
 * OJO: el proyecto está conectado a Git y el hostname sirve el despliegue
 * canónico, que sale de un push. La excepción pública temporal está aislada en
 * `demoPublica.ts`: sólo acepta `cliente-1` y cualquier otro valor falla
 * cerrado.
 */

import {
  ahoraEnSegundos,
  consumirInvitacion,
  estadoDeInvitacion,
  type EstadoDeInvitacion,
} from './lib/invitacion'
import {
  cabeceraDeCookieBorrada,
  cerrarSesion,
  crearCabeceraDeCookie,
  crearSesion,
  leerCookie,
  validarSesion,
  VIDA_DE_SESION,
} from './lib/sesion'
import {
  paginaAccesoRequerido,
  paginaEnlaceExpirado,
  paginaEnlaceInactivo,
  paginaEnlaceNoValido,
  paginaEnlaceUsado,
  paginaEntrar,
  paginaSesionCerrada,
} from './lib/paginas'
import { esRutaPresentacion, servirPresentacion } from './lib/presentacion'
import { clienteDemoPublico, type EntornoDemoPublica } from './lib/demoPublica'

type Entorno = EntornoDemoPublica & {
  readonly ACCESO: D1Database
  readonly ASSETS: Fetcher
}

/** Rutas que gestiona el propio middleware. */
const RUTA_ACCESO = '/access'
const RUTA_SALIR = '/salir'

/**
 * `/admin` lo protege Cloudflare Access con el OTP del coach. El middleware lo
 * deja pasar a propósito: son dos sistemas para dos personas distintas, y
 * mezclarlos obligaría a inventar autenticación propia para el coach.
 */
const PREFIJO_ADMIN = '/admin'

/**
 * La única ruta pública de la aplicación, y hay que entender por qué.
 *
 * Una instalación antigua de la PWA sigue controlada por el service worker de
 * entonces, que sirve la app desde su propia caché sin tocar la red — es decir,
 * saltándose esta puerta. La forma de desactivarlo es que el navegador descargue
 * el `/sw.js` de autodestrucción que lo sustituye.
 *
 * Pero el navegador pide ese fichero SIN sesión, y hasta ahora recibía la página
 * de "Acceso requerido": HTML con 401 en vez de JavaScript. La actualización
 * fallaba y el worker viejo se quedaba indefinidamente.
 *
 * Exceptuarlo no abre nada: `public/sw.js` no contiene aplicación, ni datos, ni
 * secretos, ni un manejador `fetch`. Sólo borra cachés, se desregistra y recarga
 * las pestañas para que vuelvan a pasar por aquí.
 */
const RUTA_SW = '/sw.js'

export const onRequest: PagesFunction<Entorno> = async (contexto) => {
  const { request, env, next } = contexto
  const url = new URL(request.url)

  if (esRutaPresentacion(url.pathname)) return servirPresentacion(request, env.ASSETS)

  if (url.pathname === RUTA_SW) return atenderServiceWorker(next)

  // Sólo el segmento `/admin` pertenece a Access. No dejar pasar prefijos como
  // `/administrator` o `/adminish` por accidente.
  if (url.pathname === PREFIJO_ADMIN || url.pathname.startsWith(`${PREFIJO_ADMIN}/`)) return next()

  if (url.pathname === RUTA_ACCESO) return atenderAcceso(request, env)

  if (url.pathname === RUTA_SALIR) return atenderSalir(request, env)

  return atenderApp(request, env, next)
}

/**
 * Sirve el service worker de autodestrucción, sin exigir sesión.
 *
 * Las cabeceras impiden que un intermediario devuelva una copia guardada: si el
 * navegador recibiera el fichero viejo, la migración no ocurriría nunca.
 */
async function atenderServiceWorker(next: () => Promise<Response>): Promise<Response> {
  const respuesta = await next()
  const servido = new Response(respuesta.body, respuesta)

  servido.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')

  return servido
}

/**
 * Entrada por enlace de invitación.
 *
 * El GET nunca consume: mira en qué estado está la invitación y lo dice. Sólo
 * el POST gasta el token.
 *
 * El GET consulta pero NO decide: entre esta lectura y el POST la invitación
 * puede consumirse desde otra pestaña. Por eso el POST repite la comprobación
 * con su UPDATE atómico en vez de fiarse de que aquí salió válida.
 */
async function atenderAcceso(request: Request, env: Entorno): Promise<Response> {
  if (request.method === 'GET') {
    const token = new URL(request.url).searchParams.get('t')
    if (!token) return paginaEnlaceNoValido()

    // Sólo lectura: un previsualizador de enlaces no puede gastar la invitación.
    switch (await estadoDeInvitacion(env.ACCESO, token)) {
      case 'valida':
        return paginaEntrar(token)
      case 'consumida':
        return paginaEnlaceUsado()
      case 'expirada':
        return paginaEnlaceExpirado()
      case 'revocada':
        return paginaEnlaceInactivo()
      default:
        return paginaEnlaceNoValido()
    }
  }

  if (request.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 })
  }

  const formulario = await request.formData()
  const token = String(formulario.get('t') ?? '')
  if (!token) return paginaEnlaceNoValido()

  const ahora = ahoraEnSegundos()
  const invitacion = await consumirInvitacion(env.ACCESO, token, ahora)

  // Una sola sentencia decidió si existía, si estaba sin usar, sin revocar y
  // sin caducar. Si devuelve null no se entra, y da igual por qué: la sesión no
  // se crea. El estado sólo se consulta después, para decir algo útil.
  if (!invitacion) return paginaDelEstado(await estadoDeInvitacion(env.ACCESO, token, ahora))

  const { cookie } = await crearSesion(
    env.ACCESO,
    invitacion.clienteId,
    invitacion.tokenHash,
    ahora,
  )

  // Redirección a la raíz: el token desaparece de la barra y del historial.
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': crearCabeceraDeCookie(cookie, VIDA_DE_SESION),
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  })
}

/** Traduce un estado a su pantalla. El rechazo ya ocurrió antes de llamar aquí. */
function paginaDelEstado(estado: EstadoDeInvitacion): Response {
  if (estado === 'consumida') return paginaEnlaceUsado()
  if (estado === 'expirada') return paginaEnlaceExpirado()
  if (estado === 'revocada') return paginaEnlaceInactivo()

  return paginaEnlaceNoValido()
}

/** Cierre de sesión: revoca en el servidor y borra la cookie. */
async function atenderSalir(request: Request, env: Entorno): Promise<Response> {
  const cookie = leerCookie(request)

  // Revocar antes de borrar la cookie: si sólo se borrase, quien tuviera una
  // copia del valor seguiría entrando.
  if (cookie) await cerrarSesion(env.ACCESO, cookie)

  // La previsualización del coach usa la misma sesión que un participante,
  // pero deja una salida inequívoca al panel. El marcador no concede ningún
  // permiso: sólo permite limpiar la sesión y volver a pedir Cloudflare Access.
  const pedidoVolver = new URL(request.url).searchParams.get('volver') === 'admin'
  const destino = pedidoVolver && leerCookieConNombre(request, 'sfm_preview') === '1' ? '/admin/' : null
  if (destino) {
    const cabeceras = new Headers({ Location: destino, 'Cache-Control': 'no-store' })
    cabeceras.append('Set-Cookie', cabeceraDeCookieBorrada())
    cabeceras.append('Set-Cookie', cookieDePreviewBorrada())
    return new Response(null, {
      status: 302,
      headers: cabeceras,
    })
  }

  return paginaSesionCerrada(cabeceraDeCookieBorrada())
}

function leerCookieConNombre(request: Request, nombre: string): string | null {
  const cabecera = request.headers.get('Cookie')
  if (!cabecera) return null
  for (const trozo of cabecera.split(';')) {
    const separador = trozo.indexOf('=')
    if (separador !== -1 && trozo.slice(0, separador).trim() === nombre) {
      return trozo.slice(separador + 1).trim() || null
    }
  }
  return null
}

function cookieDePreviewBorrada(): string {
  return 'sfm_preview=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
}

/**
 * Todo lo demás: la app y sus ficheros estáticos.
 *
 * Aquí el mensaje es "te falta un enlace", no "tu enlace no vale": quien abre
 * la URL a secas puede no haber tenido nunca uno.
 */
async function atenderApp(
  request: Request,
  env: Entorno,
  next: () => Promise<Response>,
): Promise<Response> {
  // Sólo libera el shell y sus assets. La identidad que devuelve la API se
  // resuelve de nuevo, exclusivamente en servidor, con la misma configuración.
  if (clienteDemoPublico(env)) return next()

  const cookie = leerCookie(request)
  if (!cookie) return paginaAccesoRequerido()

  const sesion = await validarSesion(env.ACCESO, cookie)
  if (!sesion) return paginaAccesoRequerido()

  return next()
}
