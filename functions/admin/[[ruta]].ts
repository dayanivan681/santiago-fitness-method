/**
 * Consola real del Coach/Admin.
 *
 * `/admin/*` nunca cae en la SPA del participante. Cloudflare Access es la
 * primera puerta y esta función exige además la cabecera que Access inyecta.
 * La consola escribe clientes y rutinas en D1; el participante sólo puede leer
 * su propia configuración mediante su sesión mágica normal.
 */

import { crearInvitacion } from '../lib/invitacion'
import { crearCabeceraDeCookie, crearSesion, VIDA_DE_SESION } from '../lib/sesion'
import {
  asegurarDatosIniciales,
  CATALOGO_EJERCICIOS,
  crearPerfil,
  crearSlotCloud,
  guardarPerfil,
  guardarRutina,
  listarPerfiles,
  listarRutinas,
  obtenerPerfil,
  obtenerRutina,
  type Estimulo,
  type Progresion,
  type RutinaCloud,
  validarSlots,
} from '../lib/roles'

type Entorno = { readonly ACCESO: D1Database }

const CABECERA_DE_ACCESS = 'Cf-Access-Jwt-Assertion'
const MAX_EJERCICIOS = 8
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
<title>Coach/Admin · Santiago Fitness Method</title>
<style>
 *{box-sizing:border-box}
 body{margin:0;min-height:100vh;padding:28px 18px 72px;background:#0b0c0d;color:#f2f2f0;
      font-family:'Barlow','Helvetica Neue',system-ui,-apple-system,sans-serif;
      -webkit-font-smoothing:antialiased}
 .caja{width:100%;max-width:960px;margin:0 auto}.barra{width:34px;height:3px;background:#e5352b;
      border-radius:2px;margin:0 0 16px}.marca{font-size:11px;letter-spacing:.18em;
      text-transform:uppercase;color:rgba(242,242,240,.35);margin:0 0 6px}
 h1{font-size:32px;line-height:1.05;letter-spacing:.01em;text-transform:uppercase;
    font-weight:700;margin:0 0 22px}h2{font-size:17px;letter-spacing:.1em;
    text-transform:uppercase;font-weight:600;margin:0 0 8px}h3{font-size:15px;
    letter-spacing:.06em;text-transform:uppercase;margin:0 0 12px}
 p{color:rgba(242,242,240,.62);line-height:1.55;margin:0 0 14px;font-size:14px}
 p:last-child{margin-bottom:0}a{color:#ffd9d6}.rejilla{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
 section,.cliente-card,.slot{background:#111214;border:1px solid rgba(255,255,255,.1);
      border-radius:16px;padding:20px;margin:0 0 14px}.cliente-card{display:flex;align-items:center;
      justify-content:space-between;gap:14px}.cliente-card strong{display:block;font-size:17px}
 .muted{color:rgba(242,242,240,.45);font-size:13px}.acciones{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
 button,.boton{display:inline-flex;align-items:center;justify-content:center;min-height:40px;
      padding:10px 14px;border:0;border-radius:10px;background:#f2f2f0;color:#0b0c0d;
      font-family:inherit;font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;text-decoration:none}
 button.secundario,.boton.secundario{background:transparent;color:#f2f2f0;border:1px solid rgba(255,255,255,.22)}
 button.peligro{background:transparent;color:#ffd9d6;border:1px solid rgba(229,53,43,.6)}
 button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,a:focus-visible{outline:2px solid #e5352b;outline-offset:3px}
 label{display:block}.campo{display:flex;flex-direction:column;gap:6px}.campo span,.etiqueta{font-size:10px;
      letter-spacing:.12em;text-transform:uppercase;color:rgba(242,242,240,.46)}
 input,select,textarea{width:100%;background:#0e1012;border:1px solid rgba(255,255,255,.16);
      border-radius:9px;color:#f2f2f0;padding:10px;font:inherit}textarea{min-height:80px;resize:vertical}
 .form-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.form-grid--profile{grid-template-columns:repeat(3,minmax(0,1fr))}
 .form-grid .ancho{grid-column:span 2}.form-grid .completo{grid-column:1/-1}
 .cabecera-seccion{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}
 .slot{padding:14px}.slot-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
 .slot-actions{display:flex;gap:5px}.slot-actions button{min-height:32px;padding:6px 9px;font-size:11px}
 .flash{border-left:3px solid #e5352b;padding:10px 12px;background:#181012;color:#ffd9d6;margin-bottom:14px}
 .enlace{word-break:break-all;background:#0e1012;border:1px solid rgba(255,255,255,.1);border-radius:10px;
      padding:12px;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.5;color:#ffd9d6}
 table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;font-size:10px;letter-spacing:.12em;
      text-transform:uppercase;color:rgba(242,242,240,.35);padding:0 10px 8px 0;border-bottom:1px solid rgba(255,255,255,.12)}
 td{padding:9px 10px 9px 0;border-bottom:1px solid rgba(255,255,255,.07);color:rgba(242,242,240,.7)}
 @media(max-width:700px){body{padding:22px 12px 56px}.rejilla{grid-template-columns:1fr}.form-grid,.form-grid--profile{grid-template-columns:repeat(2,minmax(0,1fr))}.form-grid .ancho,.form-grid .completo{grid-column:1/-1}.cliente-card{align-items:flex-start;flex-direction:column}.cliente-card .acciones{width:100%}.cliente-card .boton{flex:1}}
 @media(prefers-reduced-motion:reduce){button:active{transform:none}}
</style></head><body><main class="caja">${cuerpo}</main></body></html>`,
    {
      status: estado,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    },
  )
}

function cabecera(): string {
  return `<div class="barra"></div><p class="marca">Santiago Fitness Method · consola protegida</p><h1>Coach / Admin</h1>`
}

function boton(href: string, texto: string, clase = ''): string {
  return `<a class="boton ${clase}" href="${escapar(href)}">${escapar(texto)}</a>`
}

function redirect(url: string): Response {
  return new Response(null, { status: 303, headers: { Location: url, 'Cache-Control': 'no-store' } })
}

function idSeguro(id: string): boolean {
  return /^[a-z0-9][a-z0-9_-]{1,40}$/.test(id)
}

function entero(valor: unknown, porDefecto: number, min: number, max: number): number {
  const numero = Number(valor)
  if (!Number.isFinite(numero)) return porDefecto
  return Math.max(min, Math.min(max, Math.round(numero)))
}

function estimulo(valor: unknown): Estimulo {
  const texto = String(valor ?? '')
  return texto === 'fuerza' || texto === 'resistencia' ? texto : 'hipertrofia'
}

function progresion(valor: unknown): Progresion | undefined {
  const texto = String(valor ?? '')
  return texto === 'mantener' || texto === 'subirReps' || texto === 'subirCarga' || texto === 'revisarReducir'
    ? texto
    : undefined
}

function nombreEjercicio(id: string): string {
  return CATALOGO_EJERCICIOS.find((ejercicio) => ejercicio.id === id)?.nombre ?? id
}

function opcionesEjercicio(actual: string): string {
  const opciones = CATALOGO_EJERCICIOS.some((ejercicio) => ejercicio.id === actual)
    ? CATALOGO_EJERCICIOS
    : [{ id: actual, nombre: actual }, ...CATALOGO_EJERCICIOS]
  return opciones
    .map((ejercicio) => `<option value="${escapar(ejercicio.id)}"${ejercicio.id === actual ? ' selected' : ''}>${escapar(ejercicio.nombre)}</option>`)
    .join('')
}

function opcionesProgresion(actual?: Progresion): string {
  const opciones: readonly [string, string][] = [
    ['', 'Automática'],
    ['mantener', 'Mantener'],
    ['subirReps', 'Subir repeticiones'],
    ['subirCarga', 'Subir carga'],
    ['revisarReducir', 'Revisar / reducir'],
  ]
  return opciones
    .map(([id, etiqueta]) => `<option value="${id}"${(actual ?? '') === id ? ' selected' : ''}>${etiqueta}</option>`)
    .join('')
}

async function resumenDeEstado(db: D1Database): Promise<string> {
  const ahora = Math.floor(Date.now() / 1000)
  const sesiones = await db
    .prepare(
      `SELECT cliente_id, COUNT(*) AS n FROM sesiones
       WHERE revocada_en IS NULL AND expira_en > ?1 GROUP BY cliente_id ORDER BY cliente_id`,
    )
    .bind(ahora)
    .all<{ cliente_id: string; n: number }>()
  const invitaciones = await db
    .prepare(
      `SELECT cliente_id, COUNT(*) AS n FROM invitaciones
       WHERE consumida_en IS NULL AND revocada_en IS NULL AND expira_en > ?1 GROUP BY cliente_id ORDER BY cliente_id`,
    )
    .bind(ahora)
    .all<{ cliente_id: string; n: number }>()
  const filas = [
    ...(sesiones.results ?? []).map((fila) => `<tr><td>${escapar(fila.cliente_id)}</td><td>Sesión activa</td><td>${fila.n}</td></tr>`),
    ...(invitaciones.results ?? []).map((fila) => `<tr><td>${escapar(fila.cliente_id)}</td><td>Invitación pendiente</td><td>${fila.n}</td></tr>`),
  ]
  if (filas.length === 0) return '<p>No hay sesiones activas ni invitaciones pendientes.</p>'
  return `<table><thead><tr><th>Cliente</th><th>Estado</th><th>Cantidad</th></tr></thead><tbody>${filas.join('')}</tbody></table>`
}

async function estadoCliente(db: D1Database, clienteId: string): Promise<string> {
  const ahora = Math.floor(Date.now() / 1000)
  const sesiones = await db
    .prepare(`SELECT COUNT(*) AS n FROM sesiones WHERE cliente_id = ?1 AND revocada_en IS NULL AND expira_en > ?2`)
    .bind(clienteId, ahora)
    .first<{ n: number }>()
  const invitaciones = await db
    .prepare(`SELECT COUNT(*) AS n FROM invitaciones WHERE cliente_id = ?1 AND consumida_en IS NULL AND revocada_en IS NULL AND expira_en > ?2`)
    .bind(clienteId, ahora)
    .first<{ n: number }>()
  return `<p class="muted">Sesiones activas: ${sesiones?.n ?? 0} · Invitaciones pendientes: ${invitaciones?.n ?? 0}</p>`
}

async function pantallaPrincipal(db: D1Database, extra = ''): Promise<Response> {
  const perfiles = await listarPerfiles(db)
  const clientes = perfiles
    .map(
      (perfil) => `<article class="cliente-card">
        <div><strong>${escapar(perfil.nombre)}</strong><span class="muted">cliente_id: ${escapar(perfil.id)}</span></div>
        <div class="acciones">${boton(`/admin/?cliente=${encodeURIComponent(perfil.id)}`, 'Abrir ficha')}</div>
      </article>`,
    )
    .join('')
  return pagina(
    `${cabecera()}${extra}
     <section><div class="cabecera-seccion"><div><h2>Clientes</h2><p>Identidad y programación administradas en D1. El registro de series e historial sigue local en el dispositivo del participante.</p></div></div>
       ${clientes || '<p>No hay clientes activos.</p>'}
     </section>
     <section><h2>Crear cliente</h2><form method="POST"><input type="hidden" name="accion" value="crear-cliente">
       <div class="form-grid"><label class="campo"><span>cliente_id</span><input name="cliente_id" required pattern="[a-z0-9][a-z0-9_-]{1,40}"></label>
       <label class="campo"><span>Nombre</span><input name="nombre" required></label></div><div class="acciones" style="margin-top:12px"><button type="submit">Crear cliente</button></div>
     </form></section>
     <section><h2>Estado de acceso</h2>${await resumenDeEstado(db)}</section>`,
  )
}

async function pantallaCliente(db: D1Database, clienteId: string, extra = ''): Promise<Response> {
  const perfil = await obtenerPerfil(db, clienteId)
  if (!perfil) return pagina(`${cabecera()}<section><h2>Cliente no encontrado</h2>${boton('/admin/', 'Volver a clientes')}</section>`, 404)
  const rutinas = await listarRutinas(db, clienteId)
  return pagina(
    `${cabecera()}${extra}
     <p>${boton('/admin/', '← Clientes', 'secundario')}</p>
     <section><div class="cabecera-seccion"><div><h2>Ficha de ${escapar(perfil.nombre)}</h2><p class="muted">cliente_id: ${escapar(perfil.id)} · perfil gestionado por el coach</p></div>
       <div class="acciones"><form method="POST"><input type="hidden" name="accion" value="previsualizar"><input type="hidden" name="cliente_id" value="${escapar(perfil.id)}"><button type="submit">Previsualizar cliente</button></form></div></div>
       <form method="POST"><input type="hidden" name="accion" value="guardar-perfil"><input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
       <div class="form-grid form-grid--profile">
        <label class="campo"><span>Nombre</span><input name="nombre" value="${escapar(perfil.nombre)}" required></label>
        <label class="campo"><span>Sexo</span><select name="sexo"><option value="masculino"${perfil.sexo === 'masculino' ? ' selected' : ''}>Masculino</option><option value="femenino"${perfil.sexo === 'femenino' ? ' selected' : ''}>Femenino</option></select></label>
        <label class="campo"><span>Edad</span><input type="number" name="edad" min="1" max="120" value="${perfil.edad}"></label>
        <label class="campo"><span>Estatura (cm)</span><input type="number" name="estatura_cm" min="50" max="250" step="0.01" value="${perfil.estaturaCm}"></label>
        <label class="campo"><span>Peso (lb)</span><input type="number" name="peso_lb" min="0" max="1000" step="0.1" value="${perfil.pesoCorporalLb}"></label>
        <label class="campo"><span>Días / semana</span><input type="number" name="frecuencia" min="1" max="7" value="${perfil.frecuenciaEntrenamiento}"></label>
        <label class="campo completo"><span>Objetivo</span><input name="objetivo" value="${escapar(perfil.objetivo)}"></label>
        <label class="campo completo"><span>Limitaciones</span><textarea name="limitaciones">${escapar(perfil.limitaciones)}</textarea></label>
        <label class="campo completo"><span>Notas del coach</span><textarea name="notas">${escapar(perfil.notas)}</textarea></label>
       </div><div class="acciones" style="margin-top:12px"><button type="submit">Guardar perfil</button></div></form>
     </section>
     <section><div class="cabecera-seccion"><div><h2>Acceso del cliente</h2>${await estadoCliente(db, clienteId)}</div></div>
       <div class="acciones"><form method="POST"><input type="hidden" name="accion" value="generar-enlace"><input type="hidden" name="cliente_id" value="${escapar(perfil.id)}"><button type="submit">Generar enlace</button></form>
       <form method="POST"><input type="hidden" name="accion" value="revocar-enlaces"><input type="hidden" name="cliente_id" value="${escapar(perfil.id)}"><button type="submit" class="peligro">Revocar pendientes</button></form></div>
     </section>
     <section><div class="cabecera-seccion"><div><h2>Rutina administrada</h2><p>Los cambios se guardan en D1 y se sincronizan al cliente. Puedes elegir ejercicios, añadir/quitar/reordenar y ajustar series, rango, descanso y progresión.</p></div></div>
       ${rutinas.map((rutina) => renderRutina(rutina)).join('')}
     </section>`,
  )
}

function renderRutina(rutina: RutinaCloud): string {
  const slots = rutina.slots
    .map(
      (slot, indice) => `<article class="slot"><div class="slot-head"><strong>${slot.orden}. ${escapar(nombreEjercicio(slot.ejercicioId))}</strong><div class="slot-actions">
        <form method="POST"><input type="hidden" name="accion" value="mover-slot"><input type="hidden" name="cliente_id" value="${escapar(rutina.clienteId)}"><input type="hidden" name="dia" value="${rutina.orden}"><input type="hidden" name="orden" value="${slot.orden}"><input type="hidden" name="direccion" value="arriba"><button type="submit" aria-label="Subir ejercicio ${slot.orden}"${indice === 0 ? ' disabled' : ''}>↑</button></form>
        <form method="POST"><input type="hidden" name="accion" value="mover-slot"><input type="hidden" name="cliente_id" value="${escapar(rutina.clienteId)}"><input type="hidden" name="dia" value="${rutina.orden}"><input type="hidden" name="orden" value="${slot.orden}"><input type="hidden" name="direccion" value="abajo"><button type="submit" aria-label="Bajar ejercicio ${slot.orden}"${indice === rutina.slots.length - 1 ? ' disabled' : ''}>↓</button></form>
        <form method="POST"><input type="hidden" name="accion" value="quitar-slot"><input type="hidden" name="cliente_id" value="${escapar(rutina.clienteId)}"><input type="hidden" name="dia" value="${rutina.orden}"><input type="hidden" name="orden" value="${slot.orden}"><button type="submit" class="peligro">Quitar</button></form>
      </div></div>
      <form method="POST"><input type="hidden" name="accion" value="guardar-slot"><input type="hidden" name="cliente_id" value="${escapar(rutina.clienteId)}"><input type="hidden" name="dia" value="${rutina.orden}"><input type="hidden" name="orden" value="${slot.orden}">
        <div class="form-grid"><label class="campo ancho"><span>Ejercicio</span><select name="ejercicio">${opcionesEjercicio(slot.ejercicioId)}</select></label>
        <label class="campo"><span>Estímulo</span><select name="estimulo"><option value="fuerza"${slot.estimulo === 'fuerza' ? ' selected' : ''}>Fuerza</option><option value="hipertrofia"${slot.estimulo === 'hipertrofia' ? ' selected' : ''}>Hipertrofia</option><option value="resistencia"${slot.estimulo === 'resistencia' ? ' selected' : ''}>Resistencia</option></select></label>
        <label class="campo"><span>Series</span><input type="number" name="series" min="1" max="20" value="${slot.seriesObjetivo}"></label>
        <label class="campo"><span>Reps mín.</span><input type="number" name="rep_min" min="1" max="100" value="${slot.repMin}"></label>
        <label class="campo"><span>Reps máx.</span><input type="number" name="rep_max" min="1" max="100" value="${slot.repMax}"></label>
        <label class="campo"><span>Descanso (s)</span><input type="number" name="descanso" min="0" max="3600" step="15" value="${slot.descansoSegundos}"></label>
        <label class="campo ancho"><span>Progresión</span><select name="progresion">${opcionesProgresion(slot.progresionFijada)}</select></label>
        </div><div class="acciones" style="margin-top:10px"><button type="submit">Guardar ejercicio ${slot.orden}</button></div>
      </form></article>`,
    )
    .join('')
  const puedeAnadir = rutina.slots.length < MAX_EJERCICIOS
  return `<div style="margin:0 0 18px"><h3>${escapar(rutina.nombre)} <span class="muted">· ${rutina.slots.length}/${MAX_EJERCICIOS}</span></h3>${slots || '<p>No hay ejercicios configurados todavía.</p>'}
    ${puedeAnadir ? `<form method="POST" class="acciones"><input type="hidden" name="accion" value="anadir-slot"><input type="hidden" name="cliente_id" value="${escapar(rutina.clienteId)}"><input type="hidden" name="dia" value="${rutina.orden}"><label class="campo" style="flex:1;min-width:220px"><span>Añadir ejercicio</span><select name="ejercicio" required><option value="">Elegir…</option>${CATALOGO_EJERCICIOS.map((ejercicio) => `<option value="${escapar(ejercicio.id)}">${escapar(ejercicio.nombre)}</option>`).join('')}</select></label><button type="submit">Añadir</button></form>` : '<p class="muted">Máximo de 8 ejercicios.</p>'}</div>`
}

async function atenderApi(request: Request, db: D1Database, path: string): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Método no permitido' }, 405, { Allow: 'GET' })
  if (path === '/admin/api/clientes') return json({ clients: await listarPerfiles(db) }, 200)
  const id = decodeURIComponent(path.replace('/admin/api/clientes/', ''))
  if (!idSeguro(id)) return json({ error: 'Cliente no válido' }, 400)
  const perfil = await obtenerPerfil(db, id)
  if (!perfil) return json({ error: 'Cliente no encontrado' }, 404)
  return json({ profile: perfil, routines: await listarRutinas(db, id) }, 200)
}

function json(body: unknown, status: number, extras: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extras },
  })
}

export const onRequest: PagesFunction<Entorno> = async ({ request, env }) => {
  if (!request.headers.get(CABECERA_DE_ACCESS)) {
    return pagina(`${cabecera()}<section><h2>No autorizado</h2><p>Esta consola sólo se abre a través de Cloudflare Access.</p></section>`, 403)
  }

  await asegurarDatosIniciales(env.ACCESO)
  const url = new URL(request.url)
  const path = url.pathname

  if (request.method === 'GET') {
    if (path.startsWith('/admin/api/clientes')) return atenderApi(request, env.ACCESO, path)
    if (path !== '/admin' && path !== '/admin/') {
      return pagina(`${cabecera()}<section><h2>Ruta admin no encontrada</h2><p>No se sirve la aplicación del cliente bajo /admin.</p>${boton('/admin/', 'Volver')}</section>`, 404)
    }
    const clienteId = url.searchParams.get('cliente')
    const estado = url.searchParams.get('estado')
    const extra = estado ? `<div class="flash">${escapar(estado)}</div>` : ''
    return clienteId && idSeguro(clienteId)
      ? pantallaCliente(env.ACCESO, clienteId, extra)
      : pantallaPrincipal(env.ACCESO, extra)
  }

  if (request.method !== 'POST') return new Response('Método no permitido', { status: 405 })
  const formulario = await request.formData()
  const accion = String(formulario.get('accion') ?? '')

  try {
    if (accion === 'crear-cliente') {
      const id = String(formulario.get('cliente_id') ?? '').trim().toLowerCase()
      const nombre = String(formulario.get('nombre') ?? '').trim()
      if (!idSeguro(id) || !nombre) return pagina(`${cabecera()}<div class="flash">cliente_id y nombre son obligatorios.</div>${boton('/admin/', 'Volver')}`, 400)
      await crearPerfil(env.ACCESO, {
        id,
        nombre,
        sexo: 'masculino',
        edad: 30,
        estaturaCm: 175.26,
        pesoCorporalLb: 175,
        objetivo: 'Pendiente de confirmar',
        frecuenciaEntrenamiento: 4,
        limitaciones: '',
        notas: '',
        ejerciciosEvitados: [],
      })
      return redirect(`/admin/?cliente=${encodeURIComponent(id)}&estado=Cliente%20creado`)
    }

    const clienteId = String(formulario.get('cliente_id') ?? '')
    // Compatibilidad con el botón de prueba de la primera consola: sigue
    // creando una sesión normal, pero siempre sobre el cliente QA y no sobre
    // Santiago.
    if (accion === 'probar') {
      const { cookie } = await crearSesion(env.ACCESO, CLIENTE_DE_PRUEBA, null)
      const cabeceras = new Headers({ Location: '/', 'Cache-Control': 'no-store' })
      cabeceras.append('Set-Cookie', crearCabeceraDeCookie(cookie, VIDA_DE_SESION))
      cabeceras.append('Set-Cookie', 'sfm_preview=1; Secure; SameSite=Lax; Path=/; Max-Age=604800')
      return new Response(null, { status: 302, headers: cabeceras })
    }
    if (!idSeguro(clienteId)) return pagina(`${cabecera()}<div class="flash">Cliente no válido.</div>${boton('/admin/', 'Volver')}`, 400)

    if (accion === 'guardar-perfil') {
      const perfil = await obtenerPerfil(env.ACCESO, clienteId)
      if (!perfil) return pagina(`${cabecera()}<div class="flash">Cliente no encontrado.</div>`, 404)
      await guardarPerfil(env.ACCESO, {
        ...perfil,
        nombre: String(formulario.get('nombre') ?? perfil.nombre).trim() || perfil.nombre,
        sexo: String(formulario.get('sexo')) === 'femenino' ? 'femenino' : 'masculino',
        edad: entero(formulario.get('edad'), perfil.edad, 1, 120),
        estaturaCm: Number(formulario.get('estatura_cm')) || perfil.estaturaCm,
        pesoCorporalLb: Number(formulario.get('peso_lb')) || perfil.pesoCorporalLb,
        frecuenciaEntrenamiento: entero(formulario.get('frecuencia'), perfil.frecuenciaEntrenamiento, 1, 7),
        objetivo: String(formulario.get('objetivo') ?? ''),
        limitaciones: String(formulario.get('limitaciones') ?? ''),
        notas: String(formulario.get('notas') ?? ''),
      })
      return redirect(`/admin/?cliente=${encodeURIComponent(clienteId)}&estado=Perfil%20guardado`)
    }

    if (accion === 'guardar-slot') {
      const dia = entero(formulario.get('dia'), 1, 1, 4)
      const orden = entero(formulario.get('orden'), 1, 1, MAX_EJERCICIOS)
      const rutina = await obtenerRutina(env.ACCESO, clienteId, dia)
      if (!rutina) return pagina(`${cabecera()}<div class="flash">Día no encontrado.</div>`, 404)
      const ejercicioEntrada = String(formulario.get('ejercicio') ?? '')
      if (ejercicioEntrada && !CATALOGO_EJERCICIOS.some((item) => item.id === ejercicioEntrada)) {
        return redirect(`/admin/?cliente=${encodeURIComponent(clienteId)}&estado=Elige%20un%20ejercicio%20válido`)
      }
      const slots = rutina.slots.map((slot) => {
        if (slot.orden !== orden) return slot
        const ejercicioId = ejercicioEntrada || slot.ejercicioId
        const repMin = entero(formulario.get('rep_min'), slot.repMin, 1, 100)
        const repMax = entero(formulario.get('rep_max'), slot.repMax, 1, 100)
        return {
          ...slot,
          ejercicioId,
          estimulo: estimulo(formulario.get('estimulo')),
          seriesObjetivo: entero(formulario.get('series'), slot.seriesObjetivo, 1, 20),
          repMin: Math.min(repMin, repMax),
          repMax: Math.max(repMin, repMax),
          descansoSegundos: entero(formulario.get('descanso'), slot.descansoSegundos, 0, 3600),
          progresionFijada: progresion(formulario.get('progresion')),
        }
      })
      await guardarRutina(env.ACCESO, { ...rutina, slots: validarSlots(slots), actualizadoEn: Math.floor(Date.now() / 1000) })
      return redirect(`/admin/?cliente=${encodeURIComponent(clienteId)}&estado=Ejercicio%20guardado`)
    }

    if (accion === 'anadir-slot') {
      const dia = entero(formulario.get('dia'), 1, 1, 4)
      const rutina = await obtenerRutina(env.ACCESO, clienteId, dia)
      if (!rutina) return pagina(`${cabecera()}<div class="flash">Día no encontrado.</div>`, 404)
      if (rutina.slots.length >= MAX_EJERCICIOS) return redirect(`/admin/?cliente=${encodeURIComponent(clienteId)}&estado=M%C3%A1ximo%20de%208%20ejercicios`)
      const ejercicio = String(formulario.get('ejercicio') ?? '')
      if (!CATALOGO_EJERCICIOS.some((item) => item.id === ejercicio)) return redirect(`/admin/?cliente=${encodeURIComponent(clienteId)}&estado=Elige%20un%20ejercicio`)
      const posicion = rutina.slots.length + 1
      const tipo: Estimulo = posicion === 1 ? 'fuerza' : posicion === 5 ? 'resistencia' : 'hipertrofia'
      await guardarRutina(env.ACCESO, { ...rutina, slots: [...rutina.slots, crearSlotCloud(posicion, ejercicio, tipo)], actualizadoEn: Math.floor(Date.now() / 1000) })
      return redirect(`/admin/?cliente=${encodeURIComponent(clienteId)}&estado=Ejercicio%20a%C3%B1adido`)
    }

    if (accion === 'quitar-slot') {
      const dia = entero(formulario.get('dia'), 1, 1, 4)
      const orden = entero(formulario.get('orden'), 1, 1, MAX_EJERCICIOS)
      const rutina = await obtenerRutina(env.ACCESO, clienteId, dia)
      if (!rutina) return pagina(`${cabecera()}<div class="flash">Día no encontrado.</div>`, 404)
      const slots = rutina.slots.filter((slot) => slot.orden !== orden).map((slot, indice) => ({ ...slot, orden: indice + 1 }))
      await guardarRutina(env.ACCESO, { ...rutina, slots, actualizadoEn: Math.floor(Date.now() / 1000) })
      return redirect(`/admin/?cliente=${encodeURIComponent(clienteId)}&estado=Ejercicio%20quitado`)
    }

    if (accion === 'mover-slot') {
      const dia = entero(formulario.get('dia'), 1, 1, 4)
      const orden = entero(formulario.get('orden'), 1, 1, MAX_EJERCICIOS)
      const direccion = String(formulario.get('direccion')) === 'arriba' ? -1 : 1
      const rutina = await obtenerRutina(env.ACCESO, clienteId, dia)
      if (!rutina) return pagina(`${cabecera()}<div class="flash">Día no encontrado.</div>`, 404)
      const indice = rutina.slots.findIndex((slot) => slot.orden === orden)
      const destino = indice + direccion
      if (indice >= 0 && destino >= 0 && destino < rutina.slots.length) {
        const slots = [...rutina.slots]
        ;[slots[indice], slots[destino]] = [slots[destino], slots[indice]]
        await guardarRutina(env.ACCESO, { ...rutina, slots: slots.map((slot, i) => ({ ...slot, orden: i + 1 })), actualizadoEn: Math.floor(Date.now() / 1000) })
      }
      return redirect(`/admin/?cliente=${encodeURIComponent(clienteId)}&estado=Orden%20guardado`)
    }

    if (accion === 'generar-enlace') {
      const { token, expiraEn } = await crearInvitacion(env.ACCESO, clienteId)
      const enlace = `${url.origin}/access?t=${token}`
      const caduca = new Date(expiraEn * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
      return pantallaCliente(env.ACCESO, clienteId, `<section class="flash"><strong>Enlace de un solo uso listo</strong><p>Caduca el ${escapar(caduca)}. Cópialo ahora; después sólo queda su huella en D1.</p><div class="enlace">${escapar(enlace)}</div></section>`)
    }

    if (accion === 'revocar-enlaces') {
      await env.ACCESO.prepare(`UPDATE invitaciones SET revocada_en = ?1 WHERE cliente_id = ?2 AND consumida_en IS NULL AND revocada_en IS NULL`).bind(Math.floor(Date.now() / 1000), clienteId).run()
      return redirect(`/admin/?cliente=${encodeURIComponent(clienteId)}&estado=Invitaciones%20pendientes%20revocadas`)
    }

    if (accion === 'previsualizar') {
      const perfil = await obtenerPerfil(env.ACCESO, clienteId || CLIENTE_DE_PRUEBA)
      const id = perfil?.id ?? CLIENTE_DE_PRUEBA
      const { cookie } = await crearSesion(env.ACCESO, id, null)
      const cabeceras = new Headers({ Location: '/', 'Cache-Control': 'no-store' })
      cabeceras.append('Set-Cookie', crearCabeceraDeCookie(cookie, VIDA_DE_SESION))
      cabeceras.append('Set-Cookie', 'sfm_preview=1; Secure; SameSite=Lax; Path=/; Max-Age=604800')
      return new Response(null, { status: 303, headers: cabeceras })
    }
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'No se pudo completar la acción.'
    return pagina(`${cabecera()}<div class="flash">${escapar(detalle)}</div>${boton('/admin/', 'Volver a clientes')}`, 400)
  }

  return redirect('/admin/')
}
