/**
 * Consola del Coach/Admin, pensada para el móvil.
 *
 * `/admin/*` nunca cae en la SPA del participante. Cloudflare Access es la
 * primera puerta y esta función exige además la cabecera que Access inyecta.
 *
 * La organización es por pantallas, no por formularios apilados: cada una
 * responde a una sola pregunta y enseña resúmenes antes que campos. El detalle
 * aparece sólo cuando se pide.
 *
 *   /admin/                                        ¿A quién gestiono?
 *   /admin/?cliente=X&seccion=programa             ¿Qué quiero gestionar?
 *   …&seccion=programa&dia=N                       ¿Qué día?
 *   …&seccion=programa&dia=N&ejercicio=O           ¿Qué ejercicio?
 *   …&seccion=perfil[&grupo=G]                     ¿Qué datos del cliente?
 *   …&seccion=acceso                               ¿Cómo entra este cliente?
 *
 * El estado vive en la URL a propósito: el servidor sigue renderizando todo, el
 * botón «atrás» del navegador funciona solo y no hace falta JavaScript para
 * nada. Guardar redirige al mismo sitio desde el que se guardó, así que no se
 * pierde el contexto.
 */

import { crearInvitacion } from '../lib/invitacion'
import { crearCabeceraDeCookie, crearSesion, VIDA_DE_SESION } from '../lib/sesion'
import { clienteQaBloqueado, filtrarClientesQa, qaHabilitado } from '../lib/qa'
import {
  asegurarDatosIniciales,
  CATALOGO_EJERCICIOS,
  camposPendientesPerfil,
  crearPerfil,
  crearSlotCloud,
  evaluarEstadoProgramacion,
  guardarPerfil,
  guardarRutina,
  listarPerfiles,
  listarRutinas,
  obtenerPerfil,
  obtenerRutina,
  type Estimulo,
  type EstadoProgramacion,
  type PerfilCloud,
  type Progresion,
  type RutinaCloud,
  type SlotCloud,
  validarSlots,
} from '../lib/roles'

type Entorno = {
  readonly ACCESO: D1Database
  /** "true" sólo en preview y desarrollo. Ver functions/lib/qa.ts. */
  readonly SHOW_QA_CLIENTS?: string
}

const CABECERA_DE_ACCESS = 'Cf-Access-Jwt-Assertion'
const MAX_EJERCICIOS = 8
const CLIENTE_DE_PRUEBA = 'dayan-test'

type Seccion = 'programa' | 'perfil' | 'acceso'
type GrupoPerfil = 'datos' | 'objetivo' | 'limitaciones' | 'notas'

// ── utilidades ──────────────────────────────────────────────────────────────

function escapar(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function idSeguro(id: string): boolean {
  return /^[a-z0-9][a-z0-9_-]{1,40}$/.test(id)
}

/**
 * Entero de un formulario, con respaldo.
 *
 * El campo ausente devuelve el valor actual, no cero: los formularios de esta
 * consola son parciales —cada grupo manda sólo lo suyo— y `Number(null)` es 0,
 * que colaría como válido y borraría el dato.
 */
function entero(valor: unknown, porDefecto: number, min: number, max: number): number {
  if (valor === null || valor === undefined || valor === '') return porDefecto
  const numero = Number(valor)
  if (!Number.isFinite(numero)) return porDefecto
  return Math.max(min, Math.min(max, Math.round(numero)))
}

/** Decimal de un formulario, con el mismo respaldo que `entero`. */
function decimal(valor: unknown, porDefecto: number): number {
  if (valor === null || valor === undefined || valor === '') return porDefecto
  const numero = Number(valor)
  return Number.isFinite(numero) && numero > 0 ? numero : porDefecto
}

/** Texto de un formulario. Ausente devuelve el actual; vacío sí borra. */
function texto(valor: unknown, actual: string): string {
  return valor === null || valor === undefined ? actual : String(valor)
}

function estimulo(valor: unknown): Estimulo {
  const cadena = String(valor ?? '')
  return cadena === 'fuerza' || cadena === 'resistencia' ? cadena : 'hipertrofia'
}

function progresion(valor: unknown): Progresion | undefined {
  const cadena = String(valor ?? '')
  return cadena === 'mantener' || cadena === 'subirReps' || cadena === 'subirCarga' || cadena === 'revisarReducir'
    ? cadena
    : undefined
}

function nombreEjercicio(id: string): string {
  return CATALOGO_EJERCICIOS.find((ejercicio) => ejercicio.id === id)?.nombre ?? id
}

function minutos(segundos: number): string {
  const minuto = Math.floor(segundos / 60)
  const resto = segundos % 60
  return `${minuto}:${String(resto).padStart(2, '0')}`
}

const NOMBRE_ESTIMULO: Readonly<Record<Estimulo, string>> = {
  fuerza: 'Fuerza',
  hipertrofia: 'Hipertrofia',
  resistencia: 'Resistencia',
}

const NOMBRE_PROGRESION: Readonly<Record<Progresion, string>> = {
  mantener: 'Mantener',
  subirReps: 'Subir repeticiones',
  subirCarga: 'Subir carga',
  revisarReducir: 'Revisar / reducir',
}

/** Construye una URL de la consola sin repetir concatenaciones por todas partes. */
function ruta(params: {
  cliente?: string
  seccion?: Seccion
  dia?: number
  ejercicio?: number
  grupo?: GrupoPerfil
  modo?: string
  confirmar?: string
  nuevo?: boolean
  aviso?: string
}): string {
  const busqueda = new URLSearchParams()
  if (params.cliente) busqueda.set('cliente', params.cliente)
  if (params.seccion) busqueda.set('seccion', params.seccion)
  if (params.dia !== undefined) busqueda.set('dia', String(params.dia))
  if (params.ejercicio !== undefined) busqueda.set('ejercicio', String(params.ejercicio))
  if (params.grupo) busqueda.set('grupo', params.grupo)
  if (params.modo) busqueda.set('modo', params.modo)
  if (params.confirmar) busqueda.set('confirmar', params.confirmar)
  if (params.nuevo) busqueda.set('nuevo', '1')
  if (params.aviso) busqueda.set('aviso', params.aviso)
  const cadena = busqueda.toString()
  return cadena ? `/admin/?${cadena}` : '/admin/'
}

// ── plantilla ───────────────────────────────────────────────────────────────

function pagina(cuerpo: string, estado = 200): Response {
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0b0c0d">
<title>Coach/Admin · Santiago Fitness Method</title>
<style>
 *{box-sizing:border-box}
 :root{--fondo:#0b0c0d;--tarjeta:#111214;--hundido:#0e1012;--texto:#f2f2f0;
   --tenue:rgba(242,242,240,.55);--apagado:rgba(242,242,240,.38);
   --borde:rgba(255,255,255,.09);--borde-fuerte:rgba(255,255,255,.2);
   --rojo:#e5352b;--verde:#50c878;--radio:14px;--toque:44px}
 html,body{overflow-x:hidden}
 body{margin:0;min-height:100vh;background:var(--fondo);color:var(--texto);
   font-family:'Barlow','Helvetica Neue',system-ui,-apple-system,sans-serif;
   font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased}
 .marco{max-width:560px;margin:0 auto;padding:0 16px 96px}
 /* Barra superior: una sola vuelta atrás, siempre en el mismo sitio. */
 .barra{position:sticky;top:0;z-index:5;background:rgba(11,12,13,.94);
   backdrop-filter:blur(8px);border-bottom:1px solid var(--borde);
   margin:0 -16px 18px;padding:10px 16px 12px}
 .barra__fila{display:flex;align-items:center;gap:10px;min-height:var(--toque)}
 .atras{display:inline-flex;align-items:center;justify-content:center;
   min-width:var(--toque);min-height:var(--toque);margin-left:-10px;
   color:var(--texto);text-decoration:none;font-size:22px;line-height:1;flex:none}
 .barra__titulo{font-weight:700;font-size:19px;letter-spacing:.01em;
   text-transform:uppercase;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .barra__contexto{font-size:11px;letter-spacing:.16em;text-transform:uppercase;
   color:var(--apagado);margin:0}
 .cinta{width:30px;height:3px;background:var(--rojo);border-radius:2px;margin:18px 0 14px}
 h2{font-size:14px;letter-spacing:.13em;text-transform:uppercase;color:var(--apagado);
   font-weight:600;margin:24px 0 10px}
 h3{font-size:17px;margin:0 0 4px;letter-spacing:.01em}
 p{margin:0 0 12px;color:var(--tenue);font-size:14px}
 p:last-child{margin-bottom:0}
 /* Fila tocable: el patrón que se repite en clientes, días y ejercicios. */
 .fila{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;
   padding:13px 14px;margin:0 0 8px;background:var(--tarjeta);border:1px solid var(--borde);
   border-radius:var(--radio);color:inherit;text-decoration:none;text-align:left}
 .fila:last-of-type{margin-bottom:0}
 .fila__cuerpo{flex:1;min-width:0}
 .fila__titulo{display:block;font-size:16px;font-weight:600;line-height:1.25}
 .fila__detalle{display:block;font-size:13px;color:var(--tenue);margin-top:2px;
   overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .fila__orden{flex:none;width:26px;font-size:13px;color:var(--apagado);
   font-variant-numeric:tabular-nums}
 .fila__flecha{flex:none;color:var(--apagado);font-size:18px}
 .insignia{display:inline-flex;align-items:center;flex:none;padding:4px 8px;
   border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.1em}
 .insignia--ready{background:rgba(80,200,120,.15);color:#8ce7ab}
 .insignia--incompleta{background:rgba(229,53,43,.15);color:#ffaaa4}
 /* Navegación de secciones dentro del cliente. */
 .segmentado{display:flex;gap:4px;padding:4px;background:var(--hundido);
   border:1px solid var(--borde);border-radius:12px;margin:0 0 20px}
 .segmentado a{flex:1;display:flex;align-items:center;justify-content:center;
   min-height:var(--toque);border-radius:9px;color:var(--tenue);text-decoration:none;
   font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
 .segmentado a[aria-current="page"]{background:var(--texto);color:var(--fondo)}
 .tarjeta{background:var(--tarjeta);border:1px solid var(--borde);
   border-radius:var(--radio);padding:16px;margin:0 0 12px}
 .tarjeta--aviso{border-left:3px solid var(--rojo)}
 .tarjeta--ok{border-left:3px solid var(--verde)}
 /* Una sola acción dominante por pantalla. */
 .cta,button.cta{display:flex;align-items:center;justify-content:center;width:100%;
   min-height:var(--toque);padding:13px;border:0;border-radius:12px;
   background:var(--texto);color:var(--fondo);font-family:inherit;font-size:15px;
   font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;
   text-decoration:none;margin-top:16px}
 .cta--suave,button.cta--suave{background:transparent;color:var(--texto);
   border:1px solid var(--borde-fuerte)}
 .cta--peligro,button.cta--peligro{background:transparent;color:#ffaaa4;
   border:1px solid rgba(229,53,43,.5)}
 .cta:disabled{opacity:.4;cursor:not-allowed}
 button:active:not(:disabled),.fila:active{transform:scale(.995)}
 :focus-visible{outline:2px solid var(--rojo);outline-offset:3px;border-radius:6px}
 .campo{display:block;margin:0 0 14px}
 .campo span,.etiqueta{display:block;font-size:11px;letter-spacing:.12em;
   text-transform:uppercase;color:var(--apagado);margin:0 0 6px}
 input,select,textarea{width:100%;min-height:var(--toque);background:var(--hundido);
   border:1px solid var(--borde-fuerte);border-radius:10px;color:var(--texto);
   padding:11px 12px;font:inherit;font-size:16px}
 textarea{min-height:96px;resize:vertical}
 .pareja{display:grid;grid-template-columns:1fr 1fr;gap:10px}
 .pendiente{display:inline-block;margin-left:6px;padding:2px 6px;border-radius:999px;
   background:rgba(229,53,43,.15);color:#ffaaa4;font-size:9px;font-weight:700;
   letter-spacing:.08em;text-transform:uppercase}
 .lista{margin:8px 0 0;padding-left:18px;color:var(--tenue);font-size:13px}
 .lista li{margin-bottom:4px}
 .enlace-generado{word-break:break-all;background:var(--hundido);
   border:1px solid var(--borde);border-radius:10px;padding:13px;
   font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.5;color:#ffd9d6}
 .vacio{text-align:center;padding:30px 16px;color:var(--tenue)}
 .acciones-menores{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
 .acciones-menores form{flex:1;min-width:140px}
 .acciones-menores .cta{margin-top:0}
 .subordinada{margin-top:28px;padding-top:18px;border-top:1px solid var(--borde)}
 @media(min-width:760px){
   .marco{max-width:820px;padding-bottom:64px}
   .rejilla-dias{display:grid;grid-template-columns:1fr 1fr;gap:8px}
   .rejilla-dias .fila{margin:0}
   .cta{max-width:320px}
 }
 @media(prefers-reduced-motion:reduce){button:active,.fila:active{transform:none}}
</style></head><body><main class="marco">${cuerpo}</main></body></html>`,
    {
      status: estado,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    },
  )
}

/**
 * Barra superior.
 *
 * `atras` es siempre el nivel de arriba en la jerarquía, así que el camino de
 * vuelta es el mismo se haya llegado como se haya llegado: ejercicio → día →
 * programa → clientes.
 */
function barra(titulo: string, contexto: string, atras?: string): string {
  const volver = atras
    ? `<a class="atras" href="${escapar(atras)}" aria-label="Volver">←</a>`
    : ''
  return `<header class="barra"><div class="barra__fila">${volver}
    <div style="min-width:0"><p class="barra__contexto">${escapar(contexto)}</p>
    <h1 class="barra__titulo">${escapar(titulo)}</h1></div></div></header>`
}

function avisoDe(mensaje: string | null): string {
  if (!mensaje) return ''
  return `<div class="tarjeta tarjeta--ok" role="status">${escapar(mensaje)}</div>`
}

function insignia(listo: boolean): string {
  return listo
    ? '<span class="insignia insignia--ready">READY</span>'
    : '<span class="insignia insignia--incompleta">INCOMPLETE</span>'
}

// ── resúmenes de dominio ────────────────────────────────────────────────────

function resumenPrograma(estado: EstadoProgramacion): string {
  const dias = estado.dias.length
  const ejercicios = estado.dias.reduce((total, dia) => total + dia.ejercicios, 0)
  if (estado.ready) return `${dias} días · ${ejercicios} ejercicios`
  const faltan = estado.dias.filter((dia) => !dia.completo).map((dia) => dia.nombre)
  return faltan.length ? `Falta completar: ${faltan.join(', ')}` : `${dias} días · ${ejercicios} ejercicios`
}

function resumenSlot(slot: SlotCloud): string {
  const base = `${slot.seriesObjetivo} series · ${slot.repMin}–${slot.repMax} reps · ${minutos(slot.descansoSegundos)}`
  return slot.progresionFijada ? `${base} · ${NOMBRE_PROGRESION[slot.progresionFijada]}` : base
}

async function contarAcceso(db: D1Database, clienteId: string): Promise<{ sesiones: number; invitaciones: number }> {
  const ahora = Math.floor(Date.now() / 1000)
  const sesiones = await db
    .prepare(`SELECT COUNT(*) AS n FROM sesiones WHERE cliente_id = ?1 AND revocada_en IS NULL AND expira_en > ?2`)
    .bind(clienteId, ahora)
    .first<{ n: number }>()
  const invitaciones = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM invitaciones
        WHERE cliente_id = ?1 AND consumida_en IS NULL AND revocada_en IS NULL AND expira_en > ?2`,
    )
    .bind(clienteId, ahora)
    .first<{ n: number }>()
  return { sesiones: sesiones?.n ?? 0, invitaciones: invitaciones?.n ?? 0 }
}

// ── pantalla: clientes ──────────────────────────────────────────────────────

async function pantallaClientes(db: D1Database, mostrarQa: boolean, aviso: string | null): Promise<Response> {
  // El filtro va en el servidor: esconderlo con CSS dejaría el cliente técnico
  // dentro del HTML que se manda al navegador.
  const perfiles = filtrarClientesQa(await listarPerfiles(db), mostrarQa)

  const filas = await Promise.all(
    perfiles.map(async (perfil) => {
      const estado = evaluarEstadoProgramacion(await listarRutinas(db, perfil.id))
      // Sin cliente_id ni contadores de sesión: aquí sólo se decide a quién abrir.
      return `<a class="fila" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa' }))}">
        <span class="fila__cuerpo"><span class="fila__titulo">${escapar(perfil.nombre)}</span>
        <span class="fila__detalle">${escapar(resumenPrograma(estado))}</span></span>
        ${insignia(estado.ready)}<span class="fila__flecha" aria-hidden="true">›</span></a>`
    }),
  )

  const lista = filas.length
    ? filas.join('')
    : `<div class="tarjeta vacio"><h3>Todavía no hay clientes</h3>
       <p>Crea el primero para empezar a programarle sus días.</p></div>`

  return pagina(
    `${barra('Coach / Admin', 'Santiago Fitness Method')}
     <div class="cinta"></div>
     ${avisoDe(aviso)}
     <h2>Clientes</h2>
     ${lista}
     <a class="cta" href="${escapar(ruta({ nuevo: true }))}">+ Cliente</a>`,
  )
}

function pantallaNuevoCliente(error = ''): Response {
  return pagina(
    `${barra('Nuevo cliente', 'Clientes', ruta({}))}
     ${error ? `<div class="tarjeta tarjeta--aviso" role="alert">${escapar(error)}</div>` : ''}
     <form method="POST">
       <input type="hidden" name="accion" value="crear-cliente">
       <label class="campo"><span>Nombre</span>
         <input name="nombre" required autocomplete="off" autocapitalize="words"></label>
       <label class="campo"><span>Identificador</span>
         <input name="cliente_id" required pattern="[a-z0-9][a-z0-9_-]{1,40}"
           autocomplete="off" autocapitalize="none" spellcheck="false"
           aria-describedby="ayuda-id"></label>
       <p id="ayuda-id">Sólo minúsculas, números y guiones. No se puede cambiar después.</p>
       <button type="submit" class="cta">Crear cliente</button>
     </form>`,
    error ? 400 : 200,
  )
}

// ── pantalla: hub del cliente ───────────────────────────────────────────────

function navegacionCliente(clienteId: string, seccion: Seccion): string {
  const enlaces: readonly [Seccion, string][] = [
    ['programa', 'Programa'],
    ['perfil', 'Perfil'],
    ['acceso', 'Acceso'],
  ]
  return `<nav class="segmentado" aria-label="Secciones del cliente">${enlaces
    .map(
      ([id, etiqueta]) =>
        `<a href="${escapar(ruta({ cliente: clienteId, seccion: id }))}"${seccion === id ? ' aria-current="page"' : ''}>${etiqueta}</a>`,
    )
    .join('')}</nav>`
}

function seccionPrograma(perfil: PerfilCloud, rutinas: readonly RutinaCloud[], estado: EstadoProgramacion): string {
  const dias = rutinas
    .map((rutina) => {
      const previa = rutina.slots.slice(0, 3).map((slot) => nombreEjercicio(slot.ejercicioId)).join(', ')
      const diaEstado = estado.dias.find((item) => item.orden === rutina.orden)
      return `<a class="fila" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden }))}">
        <span class="fila__cuerpo"><span class="fila__titulo">${escapar(rutina.nombre)}</span>
        <span class="fila__detalle">${rutina.slots.length} ejercicios${previa ? ` · ${escapar(previa)}` : ''}</span></span>
        ${diaEstado && !diaEstado.completo ? '<span class="insignia insignia--incompleta">INCOMPLETE</span>' : ''}
        <span class="fila__flecha" aria-hidden="true">›</span></a>`
    })
    .join('')

  return `<h2>Programa</h2>
    <div class="rejilla-dias">${dias || '<p>No hay días configurados.</p>'}</div>`
}

function seccionPerfil(perfil: PerfilCloud, pendientes: readonly string[]): string {
  const alguno = (...campos: readonly string[]) => campos.some((campo) => pendientes.includes(campo))
  // Cada grupo avisa si CUALQUIERA de sus campos sigue sin confirmar: el resumen
  // enseña los tres datos juntos, así que marcarlo por campo suelto no serviría.
  const grupos: readonly [GrupoPerfil, string, string, boolean][] = [
    [
      'datos',
      'Datos personales',
      `${perfil.edad} años · ${perfil.estaturaCm} cm · ${perfil.pesoCorporalLb} lb · ${perfil.frecuenciaEntrenamiento} días/semana`,
      alguno('edad', 'estatura', 'peso'),
    ],
    ['objetivo', 'Objetivo', perfil.objetivo || 'Sin definir', alguno('objetivo')],
    ['limitaciones', 'Limitaciones', perfil.limitaciones || 'Ninguna registrada', false],
    ['notas', 'Notas del coach', perfil.notas || 'Sin notas', alguno('notas')],
  ]

  const filas = grupos
    .map(
      ([id, titulo, valor, pendiente]) => `<a class="fila" href="${escapar(ruta({ cliente: perfil.id, seccion: 'perfil', grupo: id }))}">
      <span class="fila__cuerpo"><span class="fila__titulo">${escapar(titulo)}${pendiente ? '<span class="pendiente">Sin confirmar</span>' : ''}</span>
      <span class="fila__detalle">${escapar(valor)}</span></span>
      <span class="fila__flecha" aria-hidden="true">›</span></a>`,
    )
    .join('')

  const avisoPendiente = pendientes.length
    ? `<div class="tarjeta tarjeta--aviso" role="status"><h3>Datos del perfil pendientes de confirmar</h3>
       <p>Vienen de la semilla inicial y no deben presentarse como datos confirmados del cliente.</p>
       <ul class="lista">${pendientes
         .map((campo) => `<li>${escapar(NOMBRE_CAMPO_PENDIENTE[campo] ?? campo)}: Pendiente de confirmar</li>`)
         .join('')}</ul></div>`
    : ''

  return `<h2>Perfil</h2>${avisoPendiente}${filas}`
}

const NOMBRE_CAMPO_PENDIENTE: Readonly<Record<string, string>> = {
  edad: 'Edad',
  estatura: 'Estatura',
  peso: 'Peso',
  objetivo: 'Objetivo',
  notas: 'Notas del coach',
}

function seccionAcceso(
  perfil: PerfilCloud,
  estado: EstadoProgramacion,
  conteo: { sesiones: number; invitaciones: number },
  enlaceNuevo: string,
): string {
  const situacion = conteo.sesiones
    ? `Con sesión activa${conteo.sesiones > 1 ? ` (${conteo.sesiones})` : ''}`
    : conteo.invitaciones
      ? 'Invitación pendiente de usar'
      : 'Sin acceso todavía'

  const problemas = [
    ...estado.problemasGenerales,
    ...estado.dias.filter((dia) => !dia.completo).map((dia) => dia.detalle),
  ]

  const generar = estado.ready
    ? `<form method="POST"><input type="hidden" name="accion" value="generar-enlace">
       <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
       <button type="submit" class="cta">Generar enlace de acceso</button></form>`
    : `<button type="button" class="cta" disabled aria-describedby="motivo-bloqueo">Generar enlace de acceso</button>
       <div class="tarjeta tarjeta--aviso" id="motivo-bloqueo" style="margin-top:12px">
       <h3>Programación incompleta</h3><p>El enlace se desbloquea cuando los cuatro días tengan de 5 a 8 ejercicios válidos.</p>
       <ul class="lista">${problemas.map((problema) => `<li>${escapar(problema)}</li>`).join('')}</ul></div>`

  const revocar = conteo.invitaciones
    ? `<form method="POST"><input type="hidden" name="accion" value="revocar-enlaces">
       <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
       <button type="submit" class="cta cta--peligro">Revocar enlaces pendientes</button></form>`
    : ''

  // Cuando está lista se enseña el reparto por días: es lo que explica de dónde
  // sale el READY y lo que el coach mira antes de mandar el enlace.
  const reparto = estado.ready
    ? `<ul class="lista">${estado.dias
        .map((dia) => `<li>${escapar(dia.nombre)}: ${dia.ejercicios} ejercicios</li>`)
        .join('')}</ul>`
    : ''

  return `<h2>Acceso</h2>
    <div class="tarjeta"><h3>${escapar(situacion)}</h3>
      <p>Programación: ${estado.ready ? 'lista' : 'incompleta'}.</p>${insignia(estado.ready)}${reparto}</div>
    ${enlaceNuevo}
    ${generar}
    <div class="subordinada">
      <h2>Vista previa</h2>
      <div class="tarjeta"><h3>Ver como ${escapar(perfil.nombre)}</h3>
        <p>Mira exactamente lo que verá este cliente.</p>
        <form method="POST"><input type="hidden" name="accion" value="previsualizar">
        <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
        <button type="submit" class="cta cta--suave">Ver como ${escapar(perfil.nombre)}</button></form></div>
      ${revocar}
    </div>`
}

async function pantallaHub(
  db: D1Database,
  perfil: PerfilCloud,
  seccion: Seccion,
  aviso: string | null,
  enlaceNuevo = '',
  estadoHttp = 200,
): Promise<Response> {
  const rutinas = await listarRutinas(db, perfil.id)
  const estado = evaluarEstadoProgramacion(rutinas)

  const cuerpo =
    seccion === 'perfil'
      ? seccionPerfil(perfil, camposPendientesPerfil(perfil))
      : seccion === 'acceso'
        ? seccionAcceso(perfil, estado, await contarAcceso(db, perfil.id), enlaceNuevo)
        : seccionPrograma(perfil, rutinas, estado)

  return pagina(
    `${barra(perfil.nombre, 'Cliente', ruta({}))}
     <div class="tarjeta" style="display:flex;align-items:center;gap:12px">
       <span style="flex:1">${escapar(resumenPrograma(estado))}</span>${insignia(estado.ready)}</div>
     ${navegacionCliente(perfil.id, seccion)}
     ${avisoDe(aviso)}
     ${cuerpo}`,
    estadoHttp,
  )
}

// ── pantalla: día ───────────────────────────────────────────────────────────

function pantallaDia(
  perfil: PerfilCloud,
  rutina: RutinaCloud,
  reordenando: boolean,
  aviso: string | null,
): Response {
  const volver = ruta({ cliente: perfil.id, seccion: 'programa' })

  const filas = rutina.slots
    .map((slot, indice) => {
      if (reordenando) {
        const mover = (direccion: 'arriba' | 'abajo', simbolo: string, desactivado: boolean) =>
          `<form method="POST" style="flex:none"><input type="hidden" name="accion" value="mover-slot">
           <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
           <input type="hidden" name="dia" value="${rutina.orden}">
           <input type="hidden" name="orden" value="${slot.orden}">
           <input type="hidden" name="direccion" value="${direccion}">
           <button type="submit" class="cta cta--suave" style="margin:0;min-width:var(--toque);padding:8px"
             aria-label="${direccion === 'arriba' ? 'Subir' : 'Bajar'} ${escapar(nombreEjercicio(slot.ejercicioId))}"
             ${desactivado ? 'disabled' : ''}>${simbolo}</button></form>`
        return `<div class="fila"><span class="fila__orden">${slot.orden}</span>
          <span class="fila__cuerpo"><span class="fila__titulo">${escapar(nombreEjercicio(slot.ejercicioId))}</span></span>
          <span style="display:flex;gap:6px">${mover('arriba', '↑', indice === 0)}${mover('abajo', '↓', indice === rutina.slots.length - 1)}</span></div>`
      }
      return `<a class="fila" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden, ejercicio: slot.orden }))}">
        <span class="fila__orden">${slot.orden}</span>
        <span class="fila__cuerpo"><span class="fila__titulo">${escapar(nombreEjercicio(slot.ejercicioId))}</span>
        <span class="fila__detalle">${escapar(resumenSlot(slot))}</span></span>
        <span class="fila__flecha" aria-hidden="true">›</span></a>`
    })
    .join('')

  const vacio = `<div class="tarjeta vacio"><h3>Día sin ejercicios</h3>
    <p>Añade entre 5 y 8 para que este día cuente como completo.</p></div>`

  const anadir =
    rutina.slots.length < MAX_EJERCICIOS
      ? `<form method="POST"><input type="hidden" name="accion" value="anadir-slot">
         <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
         <input type="hidden" name="dia" value="${rutina.orden}">
         <label class="campo"><span>Añadir ejercicio</span>
         <select name="ejercicio" required><option value="">Elegir…</option>
         ${CATALOGO_EJERCICIOS.map((ejercicio) => `<option value="${escapar(ejercicio.id)}">${escapar(ejercicio.nombre)}</option>`).join('')}
         </select></label>
         <button type="submit" class="cta">+ Añadir ejercicio</button></form>`
      : '<p>Máximo de 8 ejercicios alcanzado.</p>'

  const reordenar = rutina.slots.length > 1
    ? reordenando
      ? `<a class="cta cta--suave" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden }))}">Terminar de reordenar</a>`
      : `<a class="cta cta--suave" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden, modo: 'reordenar' }))}">Reordenar</a>`
    : ''

  return pagina(
    `${barra(rutina.nombre, perfil.nombre, volver)}
     ${avisoDe(aviso)}
     <h2>${rutina.slots.length} ejercicios</h2>
     ${filas || vacio}
     ${reordenando ? reordenar : `${anadir}${reordenar}`}`,
  )
}

// ── pantalla: ejercicio ─────────────────────────────────────────────────────

function pantallaEjercicio(
  perfil: PerfilCloud,
  rutina: RutinaCloud,
  slot: SlotCloud,
  confirmarBorrado: boolean,
): Response {
  const volver = ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden })

  if (confirmarBorrado) {
    return pagina(
      `${barra('Quitar ejercicio', rutina.nombre, ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden, ejercicio: slot.orden }))}
       <div class="tarjeta tarjeta--aviso"><h3>¿Quitar ${escapar(nombreEjercicio(slot.ejercicioId))}?</h3>
       <p>Se elimina de ${escapar(rutina.nombre)} y los siguientes ejercicios suben una posición. El historial ya registrado no se toca.</p></div>
       <form method="POST"><input type="hidden" name="accion" value="quitar-slot">
       <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
       <input type="hidden" name="dia" value="${rutina.orden}">
       <input type="hidden" name="orden" value="${slot.orden}">
       <button type="submit" class="cta cta--peligro">Sí, quitar</button></form>
       <a class="cta cta--suave" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden, ejercicio: slot.orden }))}">Cancelar</a>`,
    )
  }

  const opcionesEjercicio = (CATALOGO_EJERCICIOS.some((item) => item.id === slot.ejercicioId)
    ? CATALOGO_EJERCICIOS
    : [{ id: slot.ejercicioId, nombre: slot.ejercicioId }, ...CATALOGO_EJERCICIOS])
    .map((item) => `<option value="${escapar(item.id)}"${item.id === slot.ejercicioId ? ' selected' : ''}>${escapar(item.nombre)}</option>`)
    .join('')

  const opcionesEstimulo = (['fuerza', 'hipertrofia', 'resistencia'] as const)
    .map((id) => `<option value="${id}"${slot.estimulo === id ? ' selected' : ''}>${NOMBRE_ESTIMULO[id]}</option>`)
    .join('')

  const opcionesProgresion = ([['', 'Automática'], ...Object.entries(NOMBRE_PROGRESION)] as readonly [string, string][])
    .map(([id, etiqueta]) => `<option value="${id}"${(slot.progresionFijada ?? '') === id ? ' selected' : ''}>${escapar(etiqueta)}</option>`)
    .join('')

  return pagina(
    `${barra(`Ejercicio ${slot.orden}`, rutina.nombre, volver)}
     <form method="POST">
       <input type="hidden" name="accion" value="guardar-slot">
       <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
       <input type="hidden" name="dia" value="${rutina.orden}">
       <input type="hidden" name="orden" value="${slot.orden}">
       <label class="campo"><span>Ejercicio</span><select name="ejercicio">${opcionesEjercicio}</select></label>
       <label class="campo"><span>Series</span>
         <input type="number" inputmode="numeric" name="series" min="1" max="20" value="${slot.seriesObjetivo}"></label>
       <div class="pareja">
         <label class="campo"><span>Reps mínimas</span>
           <input type="number" inputmode="numeric" name="rep_min" min="1" max="100" value="${slot.repMin}"></label>
         <label class="campo"><span>Reps máximas</span>
           <input type="number" inputmode="numeric" name="rep_max" min="1" max="100" value="${slot.repMax}"></label>
       </div>
       <label class="campo"><span>Descanso (segundos)</span>
         <input type="number" inputmode="numeric" name="descanso" min="0" max="3600" step="15" value="${slot.descansoSegundos}"></label>
       <label class="campo"><span>Estímulo</span><select name="estimulo">${opcionesEstimulo}</select></label>
       <label class="campo"><span>Progresión</span><select name="progresion">${opcionesProgresion}</select></label>
       <button type="submit" class="cta">Guardar cambios</button>
     </form>
     <div class="subordinada">
       <a class="cta cta--peligro" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden, ejercicio: slot.orden, confirmar: 'quitar' }))}">Quitar del día</a>
     </div>`,
  )
}

// ── pantalla: grupo del perfil ──────────────────────────────────────────────

function pantallaGrupoPerfil(perfil: PerfilCloud, grupo: GrupoPerfil, pendientes: readonly string[]): Response {
  const volver = ruta({ cliente: perfil.id, seccion: 'perfil' })
  const marca = (campo: string) => (pendientes.includes(campo) ? '<span class="pendiente">Sin confirmar</span>' : '')

  const campos =
    grupo === 'datos'
      ? `<label class="campo"><span>Nombre</span><input name="nombre" value="${escapar(perfil.nombre)}" required></label>
         <label class="campo"><span>Sexo</span><select name="sexo">
           <option value="masculino"${perfil.sexo === 'masculino' ? ' selected' : ''}>Masculino</option>
           <option value="femenino"${perfil.sexo === 'femenino' ? ' selected' : ''}>Femenino</option></select></label>
         <div class="pareja">
           <label class="campo"><span>Edad ${marca('edad')}</span>
             <input type="number" inputmode="numeric" name="edad" min="1" max="120" value="${perfil.edad}"></label>
           <label class="campo"><span>Días / semana</span>
             <input type="number" inputmode="numeric" name="frecuencia" min="1" max="7" value="${perfil.frecuenciaEntrenamiento}"></label>
         </div>
         <div class="pareja">
           <label class="campo"><span>Estatura (cm) ${marca('estatura')}</span>
             <input type="number" inputmode="decimal" name="estatura_cm" min="50" max="250" step="0.01" value="${perfil.estaturaCm}"></label>
           <label class="campo"><span>Peso (lb) ${marca('peso')}</span>
             <input type="number" inputmode="decimal" name="peso_lb" min="0" max="1000" step="0.1" value="${perfil.pesoCorporalLb}"></label>
         </div>`
      : grupo === 'objetivo'
        ? `<label class="campo"><span>Objetivo ${marca('objetivo')}</span>
           <input name="objetivo" value="${escapar(perfil.objetivo)}"></label>`
        : grupo === 'limitaciones'
          ? `<label class="campo"><span>Limitaciones</span>
             <textarea name="limitaciones">${escapar(perfil.limitaciones)}</textarea></label>`
          : `<label class="campo"><span>Notas del coach ${marca('notas')}</span>
             <textarea name="notas">${escapar(perfil.notas)}</textarea></label>`

  const titulos: Readonly<Record<GrupoPerfil, string>> = {
    datos: 'Datos personales',
    objetivo: 'Objetivo',
    limitaciones: 'Limitaciones',
    notas: 'Notas del coach',
  }

  return pagina(
    `${barra(titulos[grupo], perfil.nombre, volver)}
     <form method="POST">
       <input type="hidden" name="accion" value="guardar-perfil">
       <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
       <input type="hidden" name="grupo" value="${grupo}">
       ${campos}
       <button type="submit" class="cta">Guardar cambios</button>
     </form>`,
  )
}

// ── API ─────────────────────────────────────────────────────────────────────

function json(body: unknown, status: number, extras: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extras },
  })
}

async function atenderApi(request: Request, db: D1Database, path: string, mostrarQa: boolean): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Método no permitido' }, 405, { Allow: 'GET' })
  if (path === '/admin/api/clientes') {
    return json({ clients: filtrarClientesQa(await listarPerfiles(db), mostrarQa) }, 200)
  }
  const id = decodeURIComponent(path.replace('/admin/api/clientes/', ''))
  if (!idSeguro(id)) return json({ error: 'Cliente no válido' }, 400)
  // Mismo 404 que un id inexistente: quien no debe verlo tampoco debe deducir
  // que existe.
  if (clienteQaBloqueado(id, mostrarQa)) return json({ error: 'Cliente no encontrado' }, 404)
  const perfil = await obtenerPerfil(db, id)
  if (!perfil) return json({ error: 'Cliente no encontrado' }, 404)
  return json({ profile: perfil, routines: await listarRutinas(db, id) }, 200)
}

// ── enrutado ────────────────────────────────────────────────────────────────

function redirigir(url: string, estado = 303): Response {
  return new Response(null, { status: estado, headers: { Location: url, 'Cache-Control': 'no-store' } })
}

/**
 * Petición mal formada: 400, no 404.
 *
 * Un id que no cumple el formato es un error de quien pide, no un recurso
 * ausente. Mezclarlos escondería el fallo real detrás de un "no existe".
 */
function peticionInvalida(mensaje: string): Response {
  return pagina(
    `${barra('Petición no válida', 'Coach / Admin', ruta({}))}
     <div class="tarjeta tarjeta--aviso" role="alert"><h3>${escapar(mensaje)}</h3></div>
     <a class="cta cta--suave" href="/admin/">Volver a clientes</a>`,
    400,
  )
}

function noEncontrado(mensaje = 'Cliente no encontrado'): Response {
  return pagina(
    `${barra(mensaje, 'Coach / Admin', ruta({}))}
     <div class="tarjeta vacio"><h3>${escapar(mensaje)}</h3>
     <p>No se sirve la aplicación del cliente bajo /admin.</p></div>
     <a class="cta cta--suave" href="/admin/">Volver a clientes</a>`,
    404,
  )
}

function seccionDe(valor: string | null): Seccion {
  return valor === 'perfil' || valor === 'acceso' ? valor : 'programa'
}

function grupoDe(valor: string | null): GrupoPerfil | null {
  return valor === 'datos' || valor === 'objetivo' || valor === 'limitaciones' || valor === 'notas' ? valor : null
}

async function atenderGet(url: URL, db: D1Database, mostrarQa: boolean): Promise<Response> {
  const aviso = url.searchParams.get('aviso')

  if (url.searchParams.get('nuevo') === '1') return pantallaNuevoCliente()

  const clienteId = url.searchParams.get('cliente')
  if (!clienteId) return pantallaClientes(db, mostrarQa, aviso)
  if (!idSeguro(clienteId) || clienteQaBloqueado(clienteId, mostrarQa)) return noEncontrado()

  const perfil = await obtenerPerfil(db, clienteId)
  if (!perfil) return noEncontrado()

  const seccion = seccionDe(url.searchParams.get('seccion'))

  if (seccion === 'perfil') {
    const grupo = grupoDe(url.searchParams.get('grupo'))
    if (grupo) return pantallaGrupoPerfil(perfil, grupo, camposPendientesPerfil(perfil))
    return pantallaHub(db, perfil, 'perfil', aviso)
  }

  if (seccion === 'programa' && url.searchParams.get('dia')) {
    // Sin recortar al rango: `dia=9` tiene que dar 404, no llevar en silencio
    // al día 4. Navegar a un sitio distinto del pedido rompe la vuelta atrás.
    const dia = Number(url.searchParams.get('dia'))
    if (!Number.isInteger(dia)) return noEncontrado('Día no encontrado')
    const rutina = await obtenerRutina(db, clienteId, dia)
    if (!rutina) return noEncontrado('Día no encontrado')

    const ordenEjercicio = url.searchParams.get('ejercicio')
    if (ordenEjercicio) {
      const slot = rutina.slots.find((item) => item.orden === Number(ordenEjercicio))
      if (!slot) return noEncontrado('Ejercicio no encontrado')
      return pantallaEjercicio(perfil, rutina, slot, url.searchParams.get('confirmar') === 'quitar')
    }

    return pantallaDia(perfil, rutina, url.searchParams.get('modo') === 'reordenar', aviso)
  }

  return pantallaHub(db, perfil, seccion, aviso)
}

export const onRequest: PagesFunction<Entorno> = async ({ request, env }) => {
  if (!request.headers.get(CABECERA_DE_ACCESS)) {
    return pagina(
      `${barra('No autorizado', 'Coach / Admin')}
       <div class="tarjeta vacio"><h3>No autorizado</h3>
       <p>Esta consola sólo se abre a través de Cloudflare Access.</p></div>`,
      403,
    )
  }

  await asegurarDatosIniciales(env.ACCESO)
  const url = new URL(request.url)
  const path = url.pathname
  const mostrarQa = qaHabilitado(env)

  if (request.method === 'GET') {
    if (path.startsWith('/admin/api/clientes')) return atenderApi(request, env.ACCESO, path, mostrarQa)
    if (path !== '/admin' && path !== '/admin/') return noEncontrado('Ruta admin no encontrada')
    return atenderGet(url, env.ACCESO, mostrarQa)
  }

  if (request.method !== 'POST') return new Response('Método no permitido', { status: 405 })

  const formulario = await request.formData()
  const accion = String(formulario.get('accion') ?? '')

  // `probar` y `previsualizar` sin cliente apuntan al cliente técnico, así que
  // el destino real se resuelve antes de mirar si está permitido. Sin esto, la
  // impersonación de QA seguiría abierta en producción por la puerta de atrás.
  const destino =
    accion === 'probar'
      ? CLIENTE_DE_PRUEBA
      : String(formulario.get('cliente_id') ?? '') || (accion === 'previsualizar' ? CLIENTE_DE_PRUEBA : '')

  if (clienteQaBloqueado(destino, mostrarQa)) return noEncontrado()

  try {
    if (accion === 'crear-cliente') {
      const id = String(formulario.get('cliente_id') ?? '').trim().toLowerCase()
      const nombre = String(formulario.get('nombre') ?? '').trim()
      if (!idSeguro(id) || !nombre) {
        return pantallaNuevoCliente('El nombre y el identificador son obligatorios, y el identificador sólo admite minúsculas, números y guiones.')
      }
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
      return redirigir(ruta({ cliente: id, seccion: 'programa', aviso: 'Cliente creado' }))
    }

    const clienteId = String(formulario.get('cliente_id') ?? '')

    // Compatibilidad con el botón de prueba de la primera consola: sigue
    // creando una sesión normal, pero siempre sobre el cliente QA.
    if (accion === 'probar') {
      const { cookie } = await crearSesion(env.ACCESO, CLIENTE_DE_PRUEBA, null)
      const cabeceras = new Headers({ Location: '/', 'Cache-Control': 'no-store' })
      cabeceras.append('Set-Cookie', crearCabeceraDeCookie(cookie, VIDA_DE_SESION))
      cabeceras.append('Set-Cookie', 'sfm_preview=1; Secure; SameSite=Lax; Path=/; Max-Age=604800')
      return new Response(null, { status: 302, headers: cabeceras })
    }

    if (!idSeguro(clienteId)) return peticionInvalida('Cliente no válido')

    if (accion === 'guardar-perfil') {
      const perfil = await obtenerPerfil(env.ACCESO, clienteId)
      if (!perfil) return noEncontrado()
      // Los formularios son por grupo, así que sólo llegan algunos campos. Cada
      // uno cae en su valor actual si no viene: con un merge ingenuo, guardar
      // el objetivo pondría la edad a cero y el sexo a masculino.
      await guardarPerfil(env.ACCESO, {
        ...perfil,
        nombre: texto(formulario.get('nombre'), perfil.nombre).trim() || perfil.nombre,
        sexo: formulario.get('sexo') === null
          ? perfil.sexo
          : String(formulario.get('sexo')) === 'femenino'
            ? 'femenino'
            : 'masculino',
        edad: entero(formulario.get('edad'), perfil.edad, 1, 120),
        estaturaCm: decimal(formulario.get('estatura_cm'), perfil.estaturaCm),
        pesoCorporalLb: decimal(formulario.get('peso_lb'), perfil.pesoCorporalLb),
        frecuenciaEntrenamiento: entero(formulario.get('frecuencia'), perfil.frecuenciaEntrenamiento, 1, 7),
        objetivo: texto(formulario.get('objetivo'), perfil.objetivo),
        limitaciones: texto(formulario.get('limitaciones'), perfil.limitaciones),
        notas: texto(formulario.get('notas'), perfil.notas),
      })
      return redirigir(ruta({ cliente: clienteId, seccion: 'perfil', aviso: 'Perfil guardado' }))
    }

    if (accion === 'guardar-slot') {
      const dia = entero(formulario.get('dia'), 1, 1, 4)
      const orden = entero(formulario.get('orden'), 1, 1, MAX_EJERCICIOS)
      const rutina = await obtenerRutina(env.ACCESO, clienteId, dia)
      if (!rutina) return noEncontrado('Día no encontrado')
      const ejercicioEntrada = String(formulario.get('ejercicio') ?? '')
      if (ejercicioEntrada && !CATALOGO_EJERCICIOS.some((item) => item.id === ejercicioEntrada)) {
        return redirigir(ruta({ cliente: clienteId, seccion: 'programa', dia, ejercicio: orden, aviso: 'Elige un ejercicio válido' }))
      }
      const slots = rutina.slots.map((slot) => {
        if (slot.orden !== orden) return slot
        const repMin = entero(formulario.get('rep_min'), slot.repMin, 1, 100)
        const repMax = entero(formulario.get('rep_max'), slot.repMax, 1, 100)
        return {
          ...slot,
          ejercicioId: ejercicioEntrada || slot.ejercicioId,
          estimulo: estimulo(formulario.get('estimulo')),
          seriesObjetivo: entero(formulario.get('series'), slot.seriesObjetivo, 1, 20),
          repMin: Math.min(repMin, repMax),
          repMax: Math.max(repMin, repMax),
          descansoSegundos: entero(formulario.get('descanso'), slot.descansoSegundos, 0, 3600),
          progresionFijada: progresion(formulario.get('progresion')),
        }
      })
      validarSlots(slots)
      await guardarRutina(env.ACCESO, { ...rutina, slots })
      // Vuelve al día, no a la ficha: el coach estaba editando ese día.
      return redirigir(ruta({ cliente: clienteId, seccion: 'programa', dia, aviso: 'Ejercicio guardado' }))
    }

    if (accion === 'anadir-slot') {
      const dia = entero(formulario.get('dia'), 1, 1, 4)
      const rutina = await obtenerRutina(env.ACCESO, clienteId, dia)
      if (!rutina) return noEncontrado('Día no encontrado')
      if (rutina.slots.length >= MAX_EJERCICIOS) {
        return redirigir(ruta({ cliente: clienteId, seccion: 'programa', dia, aviso: 'Máximo de 8 ejercicios' }))
      }
      const ejercicioId = String(formulario.get('ejercicio') ?? '')
      if (!CATALOGO_EJERCICIOS.some((item) => item.id === ejercicioId)) {
        return redirigir(ruta({ cliente: clienteId, seccion: 'programa', dia, aviso: 'Elige un ejercicio válido' }))
      }
      // La estructura §4 del método: el primero es fuerza, el quinto
      // resistencia, el resto hipertrofia. El coach puede cambiarlo después.
      const posicion = rutina.slots.length + 1
      const tipo: Estimulo = posicion === 1 ? 'fuerza' : posicion === 5 ? 'resistencia' : 'hipertrofia'
      const slots = [...rutina.slots, crearSlotCloud(posicion, ejercicioId, tipo)]
      validarSlots(slots)
      await guardarRutina(env.ACCESO, { ...rutina, slots, actualizadoEn: Math.floor(Date.now() / 1000) })
      return redirigir(ruta({ cliente: clienteId, seccion: 'programa', dia, aviso: 'Ejercicio añadido' }))
    }

    if (accion === 'quitar-slot') {
      const dia = entero(formulario.get('dia'), 1, 1, 4)
      const orden = entero(formulario.get('orden'), 1, 1, MAX_EJERCICIOS)
      const rutina = await obtenerRutina(env.ACCESO, clienteId, dia)
      if (!rutina) return noEncontrado('Día no encontrado')
      const slots = rutina.slots
        .filter((slot) => slot.orden !== orden)
        .map((slot, indice) => ({ ...slot, orden: indice + 1 }))
      validarSlots(slots)
      await guardarRutina(env.ACCESO, { ...rutina, slots })
      return redirigir(ruta({ cliente: clienteId, seccion: 'programa', dia, aviso: 'Ejercicio quitado' }))
    }

    if (accion === 'mover-slot') {
      const dia = entero(formulario.get('dia'), 1, 1, 4)
      const orden = entero(formulario.get('orden'), 1, 1, MAX_EJERCICIOS)
      const direccion = String(formulario.get('direccion') ?? '')
      const rutina = await obtenerRutina(env.ACCESO, clienteId, dia)
      if (!rutina) return noEncontrado('Día no encontrado')
      const indice = rutina.slots.findIndex((slot) => slot.orden === orden)
      const destinoIndice = direccion === 'arriba' ? indice - 1 : indice + 1
      if (indice >= 0 && destinoIndice >= 0 && destinoIndice < rutina.slots.length) {
        const copia = [...rutina.slots]
        const [movido] = copia.splice(indice, 1)
        copia.splice(destinoIndice, 0, movido)
        const slots = copia.map((slot, posicion) => ({ ...slot, orden: posicion + 1 }))
        validarSlots(slots)
        await guardarRutina(env.ACCESO, { ...rutina, slots })
      }
      return redirigir(ruta({ cliente: clienteId, seccion: 'programa', dia, modo: 'reordenar' }))
    }

    if (accion === 'generar-enlace') {
      const estado = evaluarEstadoProgramacion(await listarRutinas(env.ACCESO, clienteId))
      const perfil = await obtenerPerfil(env.ACCESO, clienteId)
      if (!perfil) return noEncontrado()
      if (!estado.ready) {
        // 409 y sin token: el gate de programación manda sobre la UI.
        return pantallaHub(
          env.ACCESO,
          perfil,
          'acceso',
          'No se generó el enlace: completa los cuatro días con 5–8 ejercicios válidos.',
          '',
          409,
        )
      }
      const { token, expiraEn } = await crearInvitacion(env.ACCESO, clienteId)
      const enlace = `${url.origin}/access?t=${token}`
      const caduca = new Date(expiraEn * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
      return pantallaHub(
        env.ACCESO,
        perfil,
        'acceso',
        null,
        `<div class="tarjeta tarjeta--ok"><h3>Enlace de un solo uso listo</h3>
         <p>Caduca el ${escapar(caduca)}. Cópialo ahora; después sólo queda su huella en D1.</p>
         <div class="enlace-generado">${escapar(enlace)}</div></div>`,
      )
    }

    if (accion === 'revocar-enlaces') {
      await env.ACCESO
        .prepare(
          `UPDATE invitaciones SET revocada_en = ?1
            WHERE cliente_id = ?2 AND consumida_en IS NULL AND revocada_en IS NULL`,
        )
        .bind(Math.floor(Date.now() / 1000), clienteId)
        .run()
      return redirigir(ruta({ cliente: clienteId, seccion: 'acceso', aviso: 'Invitaciones pendientes revocadas' }))
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
    return pagina(
      `${barra('No se guardó', 'Coach / Admin', ruta({}))}
       <div class="tarjeta tarjeta--aviso" role="alert"><h3>No se guardó</h3><p>${escapar(detalle)}</p></div>
       <a class="cta cta--suave" href="/admin/">Volver a clientes</a>`,
      400,
    )
  }

  return redirigir('/admin/')
}
