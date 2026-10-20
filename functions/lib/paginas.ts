/**
 * Las tres páginas que ve alguien que todavía no está dentro.
 *
 * Van en el borde, no en React: se sirven antes de que exista la app. Por eso
 * llevan su propio CSS mínimo, con los colores y la tipografía del método para
 * que no parezcan de otro sitio.
 *
 * Ninguna menciona Cloudflare. Quien las lee es el participante, no un
 * administrador.
 */

import { METADATOS_INICIO_PWA } from './inicioPwa'

const CSP_FORMULARIO = "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'"
const FONDO = '#0b0c0d'
const TARJETA = '#111214'
const TEXTO = '#f2f2f0'
const TENUE = 'rgba(242,242,240,0.55)'
const BORDE = 'rgba(255,255,255,0.1)'
const ROJO = '#e5352b'

function escapar(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function envolver(titulo: string, cuerpo: string, instalable = false): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="${FONDO}">
<meta name="robots" content="noindex, nofollow">
${instalable ? METADATOS_INICIO_PWA : ''}
<title>${escapar(titulo)}</title>
<style>
  *{box-sizing:border-box}
  html{background:${FONDO}}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       padding:24px;background:${FONDO};color:${TEXTO};
       font-family:'Barlow','Helvetica Neue',system-ui,-apple-system,sans-serif;
       -webkit-font-smoothing:antialiased}
  .caja{width:100%;max-width:380px;background:${TARJETA};border:1px solid ${BORDE};
        border-radius:16px;padding:32px 28px;text-align:center}
  .marca{font-size:11px;letter-spacing:.18em;text-transform:uppercase;
         color:rgba(242,242,240,.35);margin:0 0 18px}
  h1{font-size:26px;line-height:1.2;font-weight:700;margin:0 0 20px;text-wrap:balance}
  p{font-size:16px;line-height:1.6;color:${TENUE};margin:0 0 22px}
  p:last-child{margin-bottom:0}
  button{width:100%;min-height:52px;padding:14px;border:0;border-radius:12px;background:${TEXTO};
         color:${FONDO};font-family:inherit;font-size:17px;font-weight:600;cursor:pointer}
  button:active{transform:scale(.99)}
  button:focus-visible{outline:2px solid ${ROJO};outline-offset:3px}
  input{width:100%;min-height:48px;margin:0 0 12px;padding:12px;border:1px solid ${BORDE};
        border-radius:12px;background:${FONDO};color:${TEXTO};font:inherit;font-size:16px}
  label{display:block;text-align:left;font-size:14px;margin:0 0 6px}
  a{color:${TEXTO};text-decoration:underline;text-underline-offset:3px}
  .ayuda{font-size:14px;margin:16px 0 0}
  .error{color:#ffaba6}
  .boton-google{display:block;margin-top:12px;padding:13px;border:1px solid ${BORDE};
    border-radius:12px;text-decoration:none;font-size:15px;font-weight:600}
  /* Entrar: Google es la acción principal (un toque, sin contraseña); el email
     se despliega con details/summary, sin JavaScript (la CSP no permite scripts). */
  .boton-principal{display:flex;align-items:center;justify-content:center;min-height:52px;
    padding:14px;border-radius:12px;background:${TEXTO};color:${FONDO};text-decoration:none;
    font-size:17px;font-weight:600}
  .con-email{margin-top:12px;text-align:left}
  .con-email>summary{display:flex;align-items:center;justify-content:center;min-height:52px;
    border:1px solid ${BORDE};border-radius:12px;font-size:17px;font-weight:600;cursor:pointer;
    list-style:none}
  .con-email>summary::-webkit-details-marker{display:none}
  .con-email[open]>summary{margin-bottom:16px}
  .con-email>summary:focus-visible,.boton-principal:focus-visible{outline:2px solid ${ROJO};outline-offset:3px}
  form{text-align:left}
  .pie{font-size:14px;margin:12px 0 0;color:${TENUE}}
  /* Enlaces discretos, pero de 44 px de alto para el dedo. */
  .pie a{display:inline-block;padding:14px 6px}
  .barra{width:34px;height:3px;background:${ROJO};border-radius:2px;margin:0 auto 20px}
  @media (prefers-reduced-motion:reduce){button:active{transform:none}}
</style>
</head>
<body><div class="caja">${cuerpo}</div></body>
</html>`
}

function respuesta(html: string, estado: number, cabeceras: HeadersInit = {}): Response {
  return new Response(html, {
    status: estado,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      // El token viaja en la URL de esta página: que no salga hacia terceros.
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': CSP_FORMULARIO,
      ...cabeceras,
    },
  })
}

/**
 * Puerta del enlace de invitación.
 *
 * Abrirla no consume nada. WhatsApp, iMessage y los antivirus de correo abren
 * los enlaces que reciben para previsualizarlos; si el GET consumiera el token,
 * el enlace llegaría gastado. Sólo el POST de este botón lo consume, y los
 * rastreadores no envían POST.
 */
export function paginaEntrar(token: string, error = false, google = false): Response {
  return respuesta(
    envolver(
      'Crea tu cuenta · Santiago Fitness Method',
      `<div class="barra"></div>
       <p class="marca">Santiago Fitness Method</p>
       <h1>Crea tu cuenta</h1>
       <p>Tu coach te invitó. Elige un email y una contraseña para volver cuando quieras.</p>
       ${error ? '<p class="error">No pudimos crear la cuenta. Revisa los datos o pide un enlace nuevo a tu coach.</p>' : ''}
       <form method="POST" action="/access">
         <input type="hidden" name="t" value="${escapar(token)}">
         <label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required>
         <label for="clave">Contraseña (10 caracteres mínimo)</label><input id="clave" name="clave" type="password" autocomplete="new-password" minlength="10" required>
         <button type="submit">Crear cuenta</button>
       </form>
       ${google ? `<a class="boton-google" href="/auth/google?origen=invitacion&amp;t=${escapar(encodeURIComponent(token))}">Continuar con Google</a>` : ''}
       <p class="ayuda">¿Ya tienes cuenta? <a href="/entrar">Entrar</a></p>`,
    ),
    error ? 400 : 200,
    {
      // no-referrer convierte Origin en null en un POST de formulario. Enviar
      // sólo el origen permite validar CSRF sin revelar la ruta ni el token.
      'Referrer-Policy': 'strict-origin',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
    },
  )
}

/**
 * Entrar. Lo principal es «Continuar con Google»: un toque y sin contraseña que
 * recordar. El email queda detrás de «Entrar con email» (abierto de entrada si
 * Google no está habilitado, o si un intento con email acaba de fallar).
 */
export function paginaLogin(error = false, google = false): Response {
  const formulario = `<form method="POST" action="/entrar">
       <label for="email">Email</label><input id="email" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" required>
       <label for="clave">Contraseña</label><input id="clave" name="clave" type="password" autocomplete="current-password" autocapitalize="off" spellcheck="false" required>
       <button type="submit">Entrar</button></form>`
  return respuesta(envolver('Entrar · Santiago Fitness Method',
    `<div class="barra"></div><p class="marca">Santiago Fitness Method</p><h1>Entra a tu cuenta</h1>
     ${error ? '<p class="error" role="alert">No pudimos entrar. Revisa tu email y tu contraseña, o inténtalo de nuevo en unos minutos.</p>' : ''}
     ${google
       ? `<a class="boton-principal" href="/auth/google?origen=entrar">Continuar con Google</a>
     <details class="con-email"${error ? ' open' : ''}><summary>Entrar con email</summary>${formulario}</details>`
       : formulario}
     <p class="ayuda">¿Olvidaste tu contraseña? Pídele a tu coach un enlace nuevo.</p>
     <p class="pie"><a href="/demo">Explorar la demo</a> · <a href="/admin">Soy el coach</a></p>`, true), error ? 401 : 200, {
       'Content-Security-Policy': `${CSP_FORMULARIO}; img-src 'self'; manifest-src 'self'`,
       // Safari envía Origin:null en el POST si la página usa no-referrer.
       'Referrer-Policy': 'strict-origin',
     })
}

export function paginaGoogleError(): Response {
  return respuesta(envolver('Acceso con Google · Santiago Fitness Method',
    '<div class="barra"></div><h1>No pudimos entrar con Google</h1><p>Si ya tienes cuenta, entra con tu contraseña y conecta Google desde tu perfil. Si eres nuevo, pide una invitación a tu coach.</p><a href="/entrar">Volver a entrar</a>'), 401)
}

export function paginaRestablecer(token: string, error = false): Response {
  return respuesta(envolver('Cambiar contraseña · Santiago Fitness Method',
    `<div class="barra"></div><p class="marca">Santiago Fitness Method</p><h1>Cambiar contraseña</h1>
     ${error ? '<p class="error">No se pudo cambiar. Pide un enlace nuevo a tu coach.</p>' : '<p>Elige una contraseña de al menos 10 caracteres.</p>'}
     <form method="POST" action="/restablecer"><input type="hidden" name="t" value="${escapar(token)}">
       <label for="clave">Nueva contraseña</label><input id="clave" name="clave" type="password" autocomplete="new-password" minlength="10" required>
       <button type="submit">Guardar contraseña</button></form>`), error ? 400 : 200, { 'Referrer-Policy': 'strict-origin' })
}

export function paginaClaveCambiada(): Response {
  return respuesta(envolver('Contraseña actualizada · Santiago Fitness Method',
    '<div class="barra"></div><h1>Contraseña actualizada</h1><p>Ya puedes entrar con tu cuenta.</p><a href="/entrar">Ir a entrar</a>'), 200)
}

/**
 * Alguien abre la app sin sesión.
 *
 * No es lo mismo que un enlace gastado, y decirle "caducado" a quien nunca tuvo
 * uno confunde: parecería que algo se rompió cuando sólo falta la invitación.
 */
export function paginaAccesoRequerido(): Response {
  return respuesta(
    envolver(
      'Acceso requerido · Santiago Fitness Method',
      `<div class="barra"></div>
       <p class="marca">Santiago Fitness Method</p>
       <h1>Acceso requerido</h1>
       <p>Necesitas un enlace de acceso válido para entrar a Santiago Fitness Method.</p>`,
    ),
    401,
  )
}

/**
 * El enlace ya se usó.
 *
 * Se distingue de "no válido" porque el participante hizo lo correcto: entró.
 * Decirle que su enlace era inválido le haría dudar de si llegó a entrar.
 */
export function paginaEnlaceUsado(): Response {
  return respuesta(
    envolver(
      'Enlace ya utilizado · Santiago Fitness Method',
      `<div class="barra"></div>
       <p class="marca">Santiago Fitness Method</p>
       <h1>Este enlace ya fue utilizado</h1>
       <p>Solicita un nuevo enlace a tu coach para volver a acceder.</p>`,
    ),
    401,
  )
}

/** Pasaron los 7 días sin usarlo. */
export function paginaEnlaceExpirado(): Response {
  return respuesta(
    envolver(
      'Enlace expirado · Santiago Fitness Method',
      `<div class="barra"></div>
       <p class="marca">Santiago Fitness Method</p>
       <h1>Este enlace ha expirado</h1>
       <p>Solicita un nuevo enlace a tu coach.</p>`,
    ),
    401,
  )
}

/** El coach lo desactivó a propósito. */
export function paginaEnlaceInactivo(): Response {
  return respuesta(
    envolver(
      'Enlace no activo · Santiago Fitness Method',
      `<div class="barra"></div>
       <p class="marca">Santiago Fitness Method</p>
       <h1>Este enlace ya no está activo</h1>
       <p>Solicita un nuevo enlace a tu coach.</p>`,
    ),
    401,
  )
}

/** El token no corresponde a ninguna invitación, o falta. */
export function paginaEnlaceNoValido(): Response {
  return respuesta(
    envolver(
      'Enlace no válido · Santiago Fitness Method',
      `<div class="barra"></div>
       <p class="marca">Santiago Fitness Method</p>
       <h1>Enlace no válido</h1>
       <p>Solicita un nuevo enlace a tu coach.</p>`,
    ),
    401,
  )
}

/**
 * Después de cerrar sesión.
 *
 * Recibe la cabecera que borra la cookie: quien decide cómo se borra es el
 * módulo de sesión, no esta plantilla.
 */
export function paginaSesionCerrada(cookieBorrada: string): Response {
  return respuesta(
    envolver(
      'Sesión cerrada · Santiago Fitness Method',
      `<div class="barra"></div>
       <p class="marca">Santiago Fitness Method</p>
       <h1>Sesión cerrada</h1>
       <p>Ya no hay sesión en este dispositivo.</p><a href="/entrar">Volver a entrar</a>`,
    ),
    200,
    { 'Set-Cookie': cookieBorrada },
  )
}
