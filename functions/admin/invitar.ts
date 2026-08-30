/**
 * Generación de enlaces de invitación. Sólo para el coach.
 *
 * Quien protege esta ruta es Cloudflare Access con el OTP del coach, no código
 * de aquí: construir una segunda autenticación propia sería justo lo que se
 * quiere evitar.
 *
 * Aun así se comprueba que Access haya procesado la petición. Es una defensa
 * secundaria contra el fallo que más daño haría: que alguien reduzca el alcance
 * de la aplicación de Access por error y esta ruta quede abierta. Cloudflare
 * elimina las cabeceras `Cf-Access-*` que mande un cliente, así que su presencia
 * sólo puede venir de Access.
 */

import { crearInvitacion } from '../lib/invitacion'

type Entorno = {
  readonly ACCESO: D1Database
  readonly AUTH_MODE?: string
}

const CABECERA_DE_ACCESS = 'Cf-Access-Jwt-Assertion'

function pagina(cuerpo: string, estado = 200): Response {
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Invitaciones · Santiago Fitness Method</title>
<style>
 *{box-sizing:border-box}
 body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
      padding:24px;background:#0b0c0d;color:#f2f2f0;
      font-family:'Barlow','Helvetica Neue',system-ui,sans-serif}
 .caja{width:100%;max-width:520px;background:#111214;border:1px solid rgba(255,255,255,.1);
       border-radius:16px;padding:30px 28px}
 h1{font-size:24px;text-transform:uppercase;letter-spacing:.02em;margin:0 0 6px}
 p{color:rgba(242,242,240,.55);line-height:1.6;margin:0 0 20px}
 label{display:block;font-size:12px;letter-spacing:.14em;text-transform:uppercase;
       color:rgba(242,242,240,.4);margin:0 0 7px}
 select,button{width:100%;padding:14px;border-radius:12px;font-family:inherit;font-size:15px}
 select{background:#0e1012;color:#f2f2f0;border:1px solid rgba(255,255,255,.14);margin-bottom:16px}
 button{border:0;background:#f2f2f0;color:#0b0c0d;font-weight:600;letter-spacing:.1em;
        text-transform:uppercase;cursor:pointer}
 .enlace{word-break:break-all;background:#0e1012;border:1px solid rgba(255,255,255,.1);
         border-radius:12px;padding:16px;font-family:ui-monospace,Menlo,monospace;
         font-size:13px;line-height:1.5;color:#ffd9d6;margin:0 0 14px}
 .aviso{border-left:3px solid #e5352b;padding-left:14px;color:rgba(242,242,240,.55);font-size:14px}
</style></head><body><div class="caja">${cuerpo}</div></body></html>`,
    { status: estado, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  )
}

export const onRequest: PagesFunction<Entorno> = async ({ request, env }) => {
  if (!request.headers.get(CABECERA_DE_ACCESS)) {
    return pagina(
      `<h1>No autorizado</h1>
       <p>Esta página sólo se abre a través del acceso del coach.</p>`,
      403,
    )
  }

  if (request.method === 'GET') {
    return pagina(
      `<h1>Generar invitación</h1>
       <p>El enlace vale una sola vez y caduca a los 7 días. Al usarlo se abre una sesión de otros 7 días.</p>
       <form method="POST">
         <label for="cliente">Para quién</label>
         <select id="cliente" name="cliente">
           <option value="santiago">Santiago (participante)</option>
           <option value="coach">Coach (yo)</option>
         </select>
         <button type="submit">Generar enlace</button>
       </form>`,
    )
  }

  if (request.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 })
  }

  const formulario = await request.formData()
  const clienteId = String(formulario.get('cliente') ?? '')

  if (clienteId !== 'santiago' && clienteId !== 'coach') {
    return pagina(`<h1>Destinatario no válido</h1><p>Elige uno de la lista.</p>`, 400)
  }

  const { token, expiraEn } = await crearInvitacion(env.ACCESO, clienteId)
  const enlace = `${new URL(request.url).origin}/access?t=${token}`
  const caduca = new Date(expiraEn * 1000).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  })

  return pagina(
    `<h1>Enlace listo</h1>
     <p>Cópialo y mándaselo directamente. Caduca el ${caduca}, o antes si lo usa.</p>
     <div class="enlace">${enlace}</div>
     <p class="aviso">No se puede volver a ver. Si lo pierdes, genera otro — este quedará
     inservible en cuanto alguien lo use.</p>
     <p><a href="/admin/invitar" style="color:#ff9b93">Generar otro</a></p>`,
  )
}
