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
 */

import {
  ahoraEnSegundos,
  consumirInvitacion,
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
import { paginaEntrar, paginaSesionCerrada, paginaSinAcceso } from './lib/paginas'

type Entorno = {
  readonly ACCESO: D1Database
  readonly AUTH_MODE?: string
  readonly CF_PAGES_COMMIT_SHA?: string
}

/** Rutas que gestiona el propio middleware. */
const RUTA_ACCESO = '/access'
const RUTA_SALIR = '/salir'

/**
 * TEMPORAL — comprobación de que el middleware llega al borde.
 *
 * Existe porque Cloudflare Access impide sondear el sitio desde fuera: sin esto
 * no hay forma de distinguir "el middleware no se ejecuta" de "se ejecuta y deja
 * pasar". No devuelve nada sensible: ni tokens, ni cookies, ni identificadores
 * de base de datos. Quitar en cuanto se confirme la segunda puerta.
 */
const RUTA_DIAGNOSTICO = '/diagnostico'

/**
 * `/admin` lo protege Cloudflare Access con el OTP del coach. El middleware lo
 * deja pasar a propósito: son dos sistemas para dos personas distintas, y
 * mezclarlos obligaría a inventar autenticación propia para el coach.
 */
const PREFIJO_ADMIN = '/admin'

export const onRequest: PagesFunction<Entorno> = async (contexto) => {
  const { request, env, next } = contexto
  const url = new URL(request.url)

  // Falla cerrado: sin variable, manda el middleware. Un despliegue mal
  // configurado deja a todo el mundo fuera, nunca a todo el mundo dentro.
  const modo = env.AUTH_MODE ?? 'magic'

  if (url.pathname === RUTA_DIAGNOSTICO) return diagnostico(modo, env)

  const respuesta = await resolver(url, request, env, next, modo)

  return conSello(respuesta, modo, env)
}

async function resolver(
  url: URL,
  request: Request,
  env: Entorno,
  next: () => Promise<Response>,
  modo: string,
): Promise<Response> {
  if (modo === 'access') return next()

  if (url.pathname.startsWith(PREFIJO_ADMIN)) return next()

  if (url.pathname === RUTA_ACCESO) return atenderAcceso(request, env)

  if (url.pathname === RUTA_SALIR) return atenderSalir(request, env)

  return atenderApp(request, env, next)
}

/**
 * TEMPORAL — sella cada respuesta con prueba de que pasó por aquí.
 *
 * Sin secretos: sólo si el middleware corrió, en qué modo, y los 8 primeros
 * caracteres del commit desplegado.
 */
function conSello(respuesta: Response, modo: string, env: Entorno): Response {
  const sellada = new Response(respuesta.body, respuesta)
  sellada.headers.set('X-SFM-Auth-Middleware', 'active')
  sellada.headers.set('X-SFM-Auth-Mode', modo)
  sellada.headers.set('X-SFM-Commit', (env.CF_PAGES_COMMIT_SHA ?? 'desconocido').slice(0, 8))

  return sellada
}

/** TEMPORAL — página legible sin abrir las herramientas del navegador. */
function diagnostico(modo: string, env: Entorno): Response {
  const lineas = [
    'middleware      : ACTIVO',
    `AUTH_MODE       : ${modo}`,
    `segunda puerta  : ${modo === 'magic' ? 'SÍ (exige sesión)' : 'NO (deja pasar)'}`,
    `commit          : ${(env.CF_PAGES_COMMIT_SHA ?? 'desconocido').slice(0, 8)}`,
    `binding D1      : ${env.ACCESO ? 'presente' : 'AUSENTE'}`,
  ]

  return new Response(`${lineas.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-SFM-Auth-Middleware': 'active',
      'X-SFM-Auth-Mode': modo,
    },
  })
}

/**
 * Entrada por enlace de invitación.
 *
 * El GET nunca consume: enseña un botón. Sólo el POST valida y gasta el token.
 */
async function atenderAcceso(request: Request, env: Entorno): Promise<Response> {
  if (request.method === 'GET') {
    const token = new URL(request.url).searchParams.get('t')

    return token ? paginaEntrar(token) : paginaSinAcceso()
  }

  if (request.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 })
  }

  const formulario = await request.formData()
  const token = String(formulario.get('t') ?? '')
  if (!token) return paginaSinAcceso()

  const ahora = ahoraEnSegundos()
  const invitacion = await consumirInvitacion(env.ACCESO, token, ahora)

  // Una sola sentencia decidió si existía, si estaba sin usar, sin revocar y
  // sin caducar. Si devuelve null, no hay nada más que comprobar.
  if (!invitacion) return paginaSinAcceso()

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

/** Cierre de sesión: revoca en el servidor y borra la cookie. */
async function atenderSalir(request: Request, env: Entorno): Promise<Response> {
  const cookie = leerCookie(request)

  // Revocar antes de borrar la cookie: si sólo se borrase, quien tuviera una
  // copia del valor seguiría entrando.
  if (cookie) await cerrarSesion(env.ACCESO, cookie)

  return paginaSesionCerrada(cabeceraDeCookieBorrada())
}

/** Todo lo demás: la app y sus ficheros estáticos. */
async function atenderApp(
  request: Request,
  env: Entorno,
  next: () => Promise<Response>,
): Promise<Response> {
  const cookie = leerCookie(request)
  if (!cookie) return paginaSinAcceso()

  const sesion = await validarSesion(env.ACCESO, cookie)
  if (!sesion) return paginaSinAcceso()

  return next()
}
