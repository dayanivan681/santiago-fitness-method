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
 * canónico, que sale de un push. `AUTH_MODE` sólo cuenta si está commiteado;
 * un `wrangler pages deploy` a mano crea un despliegue más reciente que nunca
 * llega a servirse.
 */

import { ahoraEnSegundos, consumirInvitacion } from './lib/invitacion'
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
  paginaEnlaceNoValido,
  paginaEntrar,
  paginaSesionCerrada,
} from './lib/paginas'

type Entorno = {
  readonly ACCESO: D1Database
  readonly AUTH_MODE?: string
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

export const onRequest: PagesFunction<Entorno> = async (contexto) => {
  const { request, env, next } = contexto
  const url = new URL(request.url)

  // Falla cerrado: sin variable, manda el middleware. Un despliegue mal
  // configurado deja a todo el mundo fuera, nunca a todo el mundo dentro.
  const modo = env.AUTH_MODE ?? 'magic'

  if (modo === 'access') return next()

  if (url.pathname.startsWith(PREFIJO_ADMIN)) return next()

  if (url.pathname === RUTA_ACCESO) return atenderAcceso(request, env)

  if (url.pathname === RUTA_SALIR) return atenderSalir(request, env)

  return atenderApp(request, env, next)
}

/**
 * Entrada por enlace de invitación.
 *
 * El GET nunca consume: enseña un botón. Sólo el POST valida y gasta el token.
 */
async function atenderAcceso(request: Request, env: Entorno): Promise<Response> {
  if (request.method === 'GET') {
    const token = new URL(request.url).searchParams.get('t')

    return token ? paginaEntrar(token) : paginaEnlaceNoValido()
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
  // sin caducar. Si devuelve null, no hay nada más que comprobar.
  if (!invitacion) return paginaEnlaceNoValido()

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
  const cookie = leerCookie(request)
  if (!cookie) return paginaAccesoRequerido()

  const sesion = await validarSesion(env.ACCESO, cookie)
  if (!sesion) return paginaAccesoRequerido()

  return next()
}
