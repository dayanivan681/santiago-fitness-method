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

function envolver(titulo: string, cuerpo: string): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="${FONDO}">
<meta name="robots" content="noindex, nofollow">
<title>${escapar(titulo)}</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       padding:24px;background:${FONDO};color:${TEXTO};
       font-family:'Barlow','Helvetica Neue',system-ui,-apple-system,sans-serif;
       -webkit-font-smoothing:antialiased}
  .caja{width:100%;max-width:380px;background:${TARJETA};border:1px solid ${BORDE};
        border-radius:16px;padding:32px 28px;text-align:center}
  .marca{font-size:11px;letter-spacing:.18em;text-transform:uppercase;
         color:rgba(242,242,240,.35);margin:0 0 18px}
  h1{font-size:25px;line-height:1.15;letter-spacing:.01em;text-transform:uppercase;
     font-weight:700;margin:0 0 12px;text-wrap:balance}
  p{font-size:16px;line-height:1.6;color:${TENUE};margin:0 0 22px}
  p:last-child{margin-bottom:0}
  button{width:100%;padding:15px;border:0;border-radius:12px;background:${TEXTO};
         color:${FONDO};font-family:inherit;font-size:15px;font-weight:600;
         letter-spacing:.1em;text-transform:uppercase;cursor:pointer}
  button:active{transform:scale(.99)}
  button:focus-visible{outline:2px solid ${ROJO};outline-offset:3px}
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
export function paginaEntrar(token: string): Response {
  return respuesta(
    envolver(
      'Entrar · Santiago Fitness Method',
      `<div class="barra"></div>
       <p class="marca">Santiago Fitness Method</p>
       <h1>Tu acceso está listo</h1>
       <p>Toca el botón para entrar. No hace falta contraseña ni cuenta.</p>
       <form method="POST" action="/access">
         <input type="hidden" name="t" value="${escapar(token)}">
         <button type="submit">Entrar</button>
       </form>`,
    ),
    200,
  )
}

/** Sin sesión válida, enlace gastado, caducado o inventado. */
export function paginaSinAcceso(): Response {
  return respuesta(
    envolver(
      'Acceso caducado · Santiago Fitness Method',
      `<div class="barra"></div>
       <p class="marca">Santiago Fitness Method</p>
       <h1>Acceso caducado</h1>
       <p>Este enlace ya se usó o venció. Pídele uno nuevo a tu entrenador y entrarás igual de rápido.</p>`,
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
       <p>Ya no hay sesión en este dispositivo. Para volver a entrar necesitas un enlace nuevo.</p>`,
    ),
    200,
    { 'Set-Cookie': cookieBorrada },
  )
}
