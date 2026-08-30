/**
 * La pantalla del coach. Única superficie bajo `/admin`.
 *
 * Es un catch-all a propósito. Antes no había función para `/admin`, así que
 * Cloudflare Pages caía en su reserva de página única y servía la SPA del
 * cliente: cargaba el shell porque Cloudflare Access dejaba pasar la petición,
 * pero sus imágenes y bundles viven fuera de `/admin` y chocaban con la puerta
 * del enlace mágico, que no ve ninguna `sfm_sesion`. Dos modelos de
 * autenticación mezclados en una sola pantalla, y todo roto a medias.
 *
 * Con este fichero, nada bajo `/admin` sirve ya aplicación de cliente.
 *
 * Quien protege esta ruta es Cloudflare Access con el OTP del coach. La
 * comprobación de la cabecera es una defensa secundaria: si alguien redujera el
 * alcance de Access por error, esto seguiría cerrado. Cloudflare elimina las
 * cabeceras `Cf-Access-*` que mande un cliente, así que su presencia sólo puede
 * venir de Access.
 */

import { crearInvitacion } from '../lib/invitacion'
import { crearCabeceraDeCookie, crearSesion, VIDA_DE_SESION } from '../lib/sesion'

type Entorno = {
  readonly ACCESO: D1Database
}

const CABECERA_DE_ACCESS = 'Cf-Access-Jwt-Assertion'

/**
 * Identidad del coach cuando prueba la app como participante.
 *
 * Es un cliente más: misma sesión, misma cookie, misma caducidad. Separarlo de
 * `santiago` evita que las pruebas se mezclen con sus datos reales.
 */
const CLIENTE_DE_PRUEBA = 'dayan-test'

function escapar(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function pagina(cuerpo: string, estado = 200): Response {
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0b0c0d">
<title>Coach · Santiago Fitness Method</title>
<style>
 *{box-sizing:border-box}
 body{margin:0;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;
      padding:32px 20px 64px;background:#0b0c0d;color:#f2f2f0;
      font-family:'Barlow','Helvetica Neue',system-ui,-apple-system,sans-serif;
      -webkit-font-smoothing:antialiased}
 .caja{width:100%;max-width:520px}
 .barra{width:34px;height:3px;background:#e5352b;border-radius:2px;margin:0 0 18px}
 .marca{font-size:11px;letter-spacing:.18em;text-transform:uppercase;
        color:rgba(242,242,240,.35);margin:0 0 6px}
 h1{font-size:30px;line-height:1.05;letter-spacing:.01em;text-transform:uppercase;
    font-weight:700;margin:0 0 26px}
 section{background:#111214;border:1px solid rgba(255,255,255,.09);border-radius:16px;
         padding:22px 20px;margin:0 0 14px}
 h2{font-size:16px;letter-spacing:.1em;text-transform:uppercase;font-weight:600;margin:0 0 6px}
 p{color:rgba(242,242,240,.55);line-height:1.6;margin:0 0 16px;font-size:15px}
 p:last-child{margin-bottom:0}
 button{width:100%;padding:15px;border:0;border-radius:12px;background:#f2f2f0;color:#0b0c0d;
        font-family:inherit;font-size:15px;font-weight:600;letter-spacing:.1em;
        text-transform:uppercase;cursor:pointer}
 button.secundario{background:transparent;color:#f2f2f0;border:1px solid rgba(255,255,255,.2)}
 button:active{transform:scale(.99)}
 button:focus-visible{outline:2px solid #e5352b;outline-offset:3px}
 .enlace{word-break:break-all;background:#0e1012;border:1px solid rgba(255,255,255,.1);
         border-radius:12px;padding:16px;font-family:ui-monospace,Menlo,monospace;
         font-size:13px;line-height:1.5;color:#ffd9d6;margin:0 0 14px}
 table{width:100%;border-collapse:collapse;font-size:14px}
 th{text-align:left;font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:rgba(242,242,240,.35);font-weight:600;padding:0 10px 8px 0;
    border-bottom:1px solid rgba(255,255,255,.12)}
 td{padding:9px 10px 9px 0;border-bottom:1px solid rgba(255,255,255,.07);
    color:rgba(242,242,240,.7)}
 td:first-child{color:#f2f2f0}
 .aviso{border-left:3px solid #e5352b;padding-left:14px;font-size:14px}
 @media (prefers-reduced-motion:reduce){button:active{transform:none}}
</style></head><body><div class="caja">${cuerpo}</div></body></html>`,
    {
      status: estado,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    },
  )
}

function cabecera(): string {
  return `<div class="barra"></div>
    <p class="marca">Santiago Fitness Method</p>
    <h1>Coach</h1>`
}

/** Estado resumido. Cuenta filas; nunca enseña un token ni un hash. */
async function resumenDeEstado(db: D1Database): Promise<string> {
  const ahora = Math.floor(Date.now() / 1000)

  const sesiones = await db
    .prepare(
      `SELECT cliente_id, COUNT(*) AS n
         FROM sesiones
        WHERE revocada_en IS NULL AND expira_en > ?1
        GROUP BY cliente_id`,
    )
    .bind(ahora)
    .all<{ cliente_id: string; n: number }>()

  const invitaciones = await db
    .prepare(
      `SELECT cliente_id, COUNT(*) AS n
         FROM invitaciones
        WHERE consumida_en IS NULL AND revocada_en IS NULL AND expira_en > ?1
        GROUP BY cliente_id`,
    )
    .bind(ahora)
    .all<{ cliente_id: string; n: number }>()

  const filas = [
    ...(sesiones.results ?? []).map((f) => [escapar(f.cliente_id), 'Sesión activa', String(f.n)]),
    ...(invitaciones.results ?? []).map((f) => [
      escapar(f.cliente_id),
      'Invitación sin usar',
      String(f.n),
    ]),
  ]

  if (filas.length === 0) return '<p>No hay sesiones activas ni invitaciones pendientes.</p>'

  return `<table>
    <thead><tr><th>Quién</th><th>Qué</th><th>Nº</th></tr></thead>
    <tbody>${filas
      .map(([quien, que, n]) => `<tr><td>${quien}</td><td>${que}</td><td>${n}</td></tr>`)
      .join('')}</tbody>
  </table>`
}

async function pantallaPrincipal(db: D1Database, extra = ''): Promise<Response> {
  return pagina(
    `${cabecera()}
     ${extra}
     <section>
       <h2>Probar como cliente</h2>
       <p>Abre una sesión igual que la de un participante y entra en la app.
          Dura 7 días y caduca sola, como cualquier otra.</p>
       <form method="POST">
         <input type="hidden" name="accion" value="probar">
         <button type="submit">Entrar como cliente</button>
       </form>
     </section>

     <section>
       <h2>Generar acceso para Santiago</h2>
       <p>Un enlace de un solo uso, válido 7 días. Se muestra una vez.</p>
       <form method="POST">
         <input type="hidden" name="accion" value="invitar">
         <button type="submit" class="secundario">Generar enlace</button>
       </form>
     </section>

     <section>
       <h2>Estado</h2>
       ${await resumenDeEstado(db)}
     </section>`,
  )
}

export const onRequest: PagesFunction<Entorno> = async ({ request, env }) => {
  if (!request.headers.get(CABECERA_DE_ACCESS)) {
    return pagina(
      `${cabecera()}
       <section><h2>No autorizado</h2>
       <p>Esta pantalla sólo se abre a través del acceso del coach.</p></section>`,
      403,
    )
  }

  if (request.method === 'GET') return pantallaPrincipal(env.ACCESO)

  if (request.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 })
  }

  const formulario = await request.formData()
  const accion = String(formulario.get('accion') ?? '')

  if (accion === 'probar') {
    // Una sesión de cliente normal y corriente: mismo formato, misma cookie,
    // misma caducidad. Sin invitación asociada porque no hubo enlace, que es la
    // única diferencia y no cambia cómo se valida después.
    const { cookie } = await crearSesion(env.ACCESO, CLIENTE_DE_PRUEBA, null)

    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
        'Set-Cookie': crearCabeceraDeCookie(cookie, VIDA_DE_SESION),
        'Cache-Control': 'no-store',
      },
    })
  }

  if (accion === 'invitar') {
    const { token, expiraEn } = await crearInvitacion(env.ACCESO, 'santiago')
    const enlace = `${new URL(request.url).origin}/access?t=${token}`
    const caduca = new Date(expiraEn * 1000).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
    })

    return pantallaPrincipal(
      env.ACCESO,
      `<section>
         <h2>Enlace listo</h2>
         <p>Cópialo y mándaselo directamente. Caduca el ${caduca}, o antes si lo usa.</p>
         <div class="enlace">${escapar(enlace)}</div>
         <p class="aviso">No se puede volver a ver: en la base sólo queda su huella.
            Si lo pierdes, genera otro — este quedará inservible en cuanto se use.</p>
       </section>`,
    )
  }

  return pantallaPrincipal(env.ACCESO)
}
