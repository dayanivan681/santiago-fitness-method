/** Shell público sin datos; APIs privadas, invitaciones de un uso y sesiones revocables. */
import {
  ahoraEnSegundos,
  estadoDeInvitacion,
  type EstadoDeInvitacion,
} from './lib/invitacion'
import {
  cabeceraDeCookieBorrada,
  cerrarSesion,
  crearCabeceraDeCookie,
  entrarConInvitacion,
  leerCookie,
  VIDA_DE_SESION,
} from './lib/sesion'
import {
  paginaEnlaceExpirado,
  paginaEnlaceInactivo,
  paginaEnlaceNoValido,
  paginaEnlaceUsado,
  paginaEntrar,
  paginaSesionCerrada,
} from './lib/paginas'
import { esRutaPresentacion, servirPresentacion } from './lib/presentacion'
import { origenSeguro } from './lib/v2/seguridad'

type Entorno = {
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

const RUTA_SW = '/sw.js'

export const onRequest: PagesFunction<Entorno> = async (contexto) => {
  const { request, env, next } = contexto
  const url = new URL(request.url)
  if (!origenSeguro(request)) return new Response('Origen no autorizado', { status: 403 })

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
 * Sirve el service worker del shell sin exigir sesión.
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
  const entrada=await entrarConInvitacion(env.ACCESO,token,ahora)
  if(!entrada)return paginaDelEstado(await estadoDeInvitacion(env.ACCESO,token,ahora))
  const {cookie}=entrada

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
  if(request.method==='GET')return new Response(`<!doctype html><html lang="es"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cerrar sesión · Santiago</title><body style="background:#0b0c0d;color:#f4f3f0;font:18px system-ui;padding:48px 24px"><h1>Cerrar sesión</h1><p>Los cambios pendientes se conservarán para cuando vuelvas.</p><form method="post" action="/salir"><button style="min-height:48px;padding:12px 24px">Cerrar sesión</button></form><p><a style="color:inherit" href="/">Volver a mi espacio</a></p></body></html>`,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'"}})
  if(request.method!=='POST')return new Response('Método no permitido',{status:405})
  const cookie=leerCookie(request)
  if(cookie)await cerrarSesion(env.ACCESO,cookie)
  return paginaSesionCerrada(cabeceraDeCookieBorrada())
}

/**
 * Todo lo demás: la app y sus ficheros estáticos.
 *
 * Aquí el mensaje es "te falta un enlace", no "tu enlace no vale": quien abre
 * la URL a secas puede no haber tenido nunca uno.
 */
async function atenderApp(
  _request: Request,
  _env: Entorno,
  next: () => Promise<Response>,
): Promise<Response> {
  // El shell no contiene datos personales. Cada API valida identidad y permisos;
  // esto permite una demo pública en memoria y recuperar el shell offline.
  return next()
}
