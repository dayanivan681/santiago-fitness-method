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
  leerCookie,
  renovarSesion,
  validarSesion,
  VIDA_DE_SESION,
} from './lib/sesion'
import { cambiarClave, entrarConClave, intentosAgotados, registrarConInvitacion, registrarFallo, restablecimientoValido } from './lib/cuentas'
import {
  paginaClaveCambiada,
  paginaEnlaceExpirado,
  paginaEnlaceInactivo,
  paginaEnlaceNoValido,
  paginaEnlaceUsado,
  paginaEntrar,
  paginaGoogleError,
  paginaLogin,
  paginaRestablecer,
  paginaSesionCerrada,
} from './lib/paginas'
import { esRutaPresentacion, servirPresentacion } from './lib/presentacion'
import { origenSeguro } from './lib/v2/seguridad'
import { conCabecerasDeShell } from './lib/cabecerasShell'
import { resumen } from './lib/cripto'
import { borrarEstadoGoogle, googleConfigurado, iniciarGoogle, terminarGoogle } from './lib/google'
import { crearStripe, procesarWebhook, stripeConfigurado } from './lib/stripe'

type Entorno = {
  readonly ACCESO: D1Database
  readonly ASSETS: Fetcher
  readonly GOOGLE_CLIENT_ID?: string
  readonly GOOGLE_CLIENT_SECRET?: string
  readonly GOOGLE_HABILITADO?: string
  readonly SFM_ENV?: string
  readonly STRIPE_SECRET_KEY?: string
  readonly STRIPE_WEBHOOK_SECRET?: string
  readonly STRIPE_HABILITADO?: string
  readonly STRIPE_MODO_REAL?: string
}

/** Rutas que gestiona el propio middleware. */
const RUTA_ACCESO = '/access'
const RUTA_ENTRAR = '/entrar'
const RUTA_RESTABLECER = '/restablecer'
const RUTA_GOOGLE = '/auth/google'
const RUTA_GOOGLE_RETORNO = '/auth/google/retorno'
const RUTA_SALIR = '/salir'
const RUTA_WEBHOOK_STRIPE = '/api/stripe/webhook'

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
  // Stripe no envía Origin: el webhook se autentica con su firma, antes del
  // filtro de origen que protege los formularios del navegador.
  if (url.pathname === RUTA_WEBHOOK_STRIPE) return atenderWebhookStripe(request, env)
  if (!origenSeguro(request)) return new Response('Origen no autorizado', { status: 403 })

  if (esRutaPresentacion(url.pathname)) return servirPresentacion(request, env.ASSETS)

  if (url.pathname === RUTA_SW) return atenderServiceWorker(next)

  // Sólo el segmento `/admin` pertenece a Access. No dejar pasar prefijos como
  // `/administrator` o `/adminish` por accidente.
  if (url.pathname === PREFIJO_ADMIN || url.pathname.startsWith(`${PREFIJO_ADMIN}/`)) return next()

  if (url.pathname === RUTA_ACCESO) return atenderAcceso(request, env)

  if (url.pathname === RUTA_ENTRAR) return atenderLogin(request, env)

  if (url.pathname === RUTA_RESTABLECER) return atenderRestablecimiento(request, env)

  if (url.pathname === RUTA_GOOGLE) return atenderGoogle(request, env)

  if (url.pathname === RUTA_GOOGLE_RETORNO) return atenderRetornoGoogle(request, env)

  if (url.pathname === RUTA_SALIR) return atenderSalir(request, env)

  return atenderApp(request, env, next)
}

/** Webhook de Stripe: sólo POST firmado. Sin configuración, 404 y nada más. */
async function atenderWebhookStripe(request: Request, env: Entorno): Promise<Response> {
  if (!stripeConfigurado(env)) return new Response('No disponible', { status: 404 })
  if (request.method !== 'POST') return new Response('Método no permitido', { status: 405 })
  try {
    const status = await procesarWebhook(request, env.ACCESO, crearStripe(env), env.STRIPE_WEBHOOK_SECRET!)
    return new Response(status === 200 ? 'ok' : 'Firma no válida', { status })
  } catch (e) {
    // 500 hace que Stripe reintente; el evento no quedó registrado.
    console.error('SFM Stripe webhook failure', e instanceof Error ? e.message : 'unknown')
    return new Response('Error', { status: 500 })
  }
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
    if (!token || token.length !== 43) return paginaEnlaceNoValido()

    // Sólo lectura: un previsualizador de enlaces no puede gastar la invitación.
    switch (await estadoDeInvitacion(env.ACCESO, token)) {
      case 'valida':
        return paginaEntrar(token, false, googleConfigurado(env))
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
  if (!token || token.length !== 43) return paginaEnlaceNoValido()

  const ahora = ahoraEnSegundos()
  const email = String(formulario.get('email') ?? '')
  const clave = String(formulario.get('clave') ?? '')
  let cookie: string | null = null
  try { cookie = await registrarConInvitacion(env.ACCESO, token, email, clave, ahora) }
  catch { return paginaEntrar(token, true, googleConfigurado(env)) }
  if (!cookie) {
    const estado = await estadoDeInvitacion(env.ACCESO, token, ahora)
    return estado === 'valida' ? paginaEntrar(token, true, googleConfigurado(env)) : paginaDelEstado(estado)
  }

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

function respuestaDeEntrada(cookie: string): Response {
  return new Response(null, { status: 302, headers: {
    Location: '/', 'Set-Cookie': crearCabeceraDeCookie(cookie, VIDA_DE_SESION),
    'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer',
  } })
}

async function atenderLogin(request: Request, env: Entorno): Promise<Response> {
  if (request.method === 'GET') return paginaLogin(false, googleConfigurado(env))
  if (request.method !== 'POST') return new Response('Método no permitido', { status: 405 })
  const formulario = await request.formData()
  const email = String(formulario.get('email') ?? '')
  const clave = String(formulario.get('clave') ?? '')
  if (email.length > 254 || clave.length > 1024) return paginaLogin(true, googleConfigurado(env))
  const cookie = await entrarConClave(env.ACCESO, email, clave)
  return cookie ? respuestaDeEntrada(cookie) : paginaLogin(true, googleConfigurado(env))
}

async function atenderGoogle(request: Request, env: Entorno): Promise<Response> {
  if (request.method !== 'GET') return new Response('Método no permitido', { status: 405 })
  try {
    const respuesta = await iniciarGoogle(request, env)
    return respuesta ?? paginaGoogleError()
  } catch { return paginaGoogleError() }
}

async function atenderRetornoGoogle(request: Request, env: Entorno): Promise<Response> {
  if (request.method !== 'GET') return new Response('Método no permitido', { status: 405 })
  try {
    const resultado = await terminarGoogle(request, env)
    if (!resultado.ok) {
      const error = paginaGoogleError()
      error.headers.append('Set-Cookie', borrarEstadoGoogle())
      return error
    }
    const headers = new Headers({ Location: '/', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' })
    headers.append('Set-Cookie', borrarEstadoGoogle())
    if (resultado.cookie) headers.append('Set-Cookie', crearCabeceraDeCookie(resultado.cookie, VIDA_DE_SESION))
    return new Response(null, { status: 302, headers })
  } catch {
    const error = paginaGoogleError()
    error.headers.append('Set-Cookie', borrarEstadoGoogle())
    return error
  }
}

async function atenderRestablecimiento(request: Request, env: Entorno): Promise<Response> {
  if (request.method === 'GET') {
    const token = new URL(request.url).searchParams.get('t') ?? ''
    return token && await restablecimientoValido(env.ACCESO, token)
      ? paginaRestablecer(token) : paginaRestablecer('', true)
  }
  if (request.method !== 'POST') return new Response('Método no permitido', { status: 405 })
  const formulario = await request.formData()
  const token = String(formulario.get('t') ?? '')
  const clave = String(formulario.get('clave') ?? '')
  if (token.length !== 43 || clave.length > 1024) return paginaRestablecer('', true)
  const claveIntento = `reset:${await resumen(token)}`
  if (await intentosAgotados(env.ACCESO, claveIntento)) return paginaRestablecer('', true)
  try {
    if (await cambiarClave(env.ACCESO, token, clave)) return paginaClaveCambiada()
    await registrarFallo(env.ACCESO, claveIntento)
    return paginaRestablecer('', true)
  }
  catch { return paginaRestablecer('', true) }
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
  request: Request,
  env: Entorno,
  next: () => Promise<Response>,
): Promise<Response> {
  // El shell no contiene datos personales. Cada API valida identidad y permisos;
  // esto permite una demo pública en memoria y recuperar el shell offline.
  // Lo que sí lleva es CSP y anti-framing: ver lib/cabecerasShell.ts.
  const cookie = leerCookie(request)
  if (new URL(request.url).pathname === '/' && (!cookie || !await validarSesion(env.ACCESO, cookie)))
    return new Response(null, { status: 302, headers: { Location: '/entrar', 'Cache-Control': 'no-store' } })
  // La API que sirve /inicio ya recibe la fecha nueva en su contexto.
  const renovada = cookie ? await renovarSesion(env.ACCESO, cookie) : false
  const respuesta = conCabecerasDeShell(await next())
  if (renovada && cookie) {
    const salida = new Response(respuesta.body, respuesta)
    salida.headers.set('Set-Cookie', crearCabeceraDeCookie(cookie, VIDA_DE_SESION))
    return salida
  }
  return respuesta
}
