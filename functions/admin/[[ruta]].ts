/**
 * Consola del Coach/Admin, pensada para el móvil.
 *
 * `/admin/*` nunca cae en la SPA del participante. Normalmente Cloudflare
 * Access es la primera puerta y esta función exige además su cabecera. Hay una
 * excepción operativa, acotada al hostname canónico y a una fecha de caducidad,
 * para que el coach pueda trabajar sin OTP durante una ventana controlada.
 *
 * La organización es por pantallas, no por formularios apilados: cada una
 * responde a una sola pregunta y enseña resúmenes antes que campos. El detalle
 * aparece sólo cuando se pide.
 *
 *   /admin/                                        ¿A quién gestiono?
 *   /admin/?modo=editar                            Quitar clientes de la lista
 *   /admin/?cliente=X&seccion=programa             ¿Qué quiero gestionar?
 *   …&seccion=programa&dia=N                       ¿Qué día?
 *   …&seccion=programa&dia=N&modo=anadir            ¿Qué ejercicio añado?
 *   …&seccion=programa&dia=N&ejercicio=O           ¿Qué ejercicio?
 *   …&seccion=perfil[&grupo=G]                     ¿Qué datos del cliente?
 *   …&seccion=acceso                               ¿Cómo entra este cliente?
 *
 * El estado vive en la URL a propósito: el servidor sigue renderizando todo, el
 * botón «atrás» del navegador funciona solo y no hace falta JavaScript para
 * nada. Guardar redirige al mismo sitio desde el que se guardó, así que no se
 * pierde el contexto.
 */

import { estadoAccesoCoachTemporal } from '../lib/accesoCoachTemporal'
import { crearInvitacion } from '../lib/invitacion'
import { crearCabeceraDeCookie, crearSesion, VIDA_DE_SESION } from '../lib/sesion'
import { clienteQaBloqueado, filtrarClientesQa, qaHabilitado } from '../lib/qa'
import {
  archivarCliente,
  asegurarDatosIniciales,
  CATALOGO_EJERCICIOS,
  camposPendientesPerfil,
  crearPerfil,
  crearSlotCloud,
  estadoDelIdentificador,
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
  /** ISO-8601; excepción sólo para el hostname canónico y hasta ese instante. */
  readonly COACH_ACCESS_TEMPORARY_UNTIL?: string
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

function normalizarBusqueda(valor: string): string {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es')
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
  q?: string
  hoja?: string
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
  if (params.q) busqueda.set('q', params.q)
  if (params.hoja) busqueda.set('hoja', params.hoja)
  const cadena = busqueda.toString()
  return cadena ? `/admin/?${cadena}` : '/admin/'
}

type NombreIcono =
  | 'volver' | 'chevron' | 'buscar' | 'sumar' | 'menu' | 'arriba' | 'abajo'

/** Iconos SVG propios: consistentes, accesibles por su etiqueta contenedora y sin fuentes propietarias. */
function icono(nombre: NombreIcono): string {
  const trazos: Readonly<Record<NombreIcono, string>> = {
    volver: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    buscar: '<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>',
    sumar: '<path d="M12 5v14M5 12h14"/>',
    menu: '<circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    arriba: '<path d="m6 15 6-6 6 6"/>',
    abajo: '<path d="m6 9 6 6 6-6"/>',
  }
  return `<svg class="icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${trazos[nombre]}</svg>`
}

// ── plantilla ───────────────────────────────────────────────────────────────

function pagina(cuerpo: string, estado = 200): Response {
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0b0c0d">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230b0c0d'/%3E%3Cpath d='M8 16h16M16 8v16' stroke='%23e5352b' stroke-width='3'/%3E%3C/svg%3E">
<title>Coach/Admin · Santiago Fitness Method</title>
<style>
 /* ── Sistema visual de la consola ──────────────────────────────────────────
    Una sola capa, no una base más parches. La versión anterior tenía la hoja
    original y un bloque M1 encima sobrescribiéndola, y esa pelea era parte de
    por qué el resultado se leía como una web adaptada.

    Tres reglas sostienen todo lo demás:
      · La profundidad viene de la jerarquía, no de bordes ni sombras. Un grupo
        se distingue por su superficie, y dentro sólo hay separadores finos.
      · El contenido manda: nada de contenedor dentro de contenedor.
      · Cada cosa tocable reacciona al dedo en el acto. */
 *{box-sizing:border-box}
 :root{
   --fondo:#0a0b0c;          /* pantalla */
   --grupo:#161819;          /* sección agrupada sobre la pantalla */
   --grupo-toque:#1e2124;    /* la misma, pulsada */
   --hoja:#1c1f22;           /* hoja inferior */
   --texto:#f4f4f2;
   --tenue:#a0a2a6;
   --apagado:#6e7075;
   --separador:rgba(255,255,255,.07);
   --borde:rgba(255,255,255,.09);
   --borde-fuerte:rgba(255,255,255,.16);
   --rojo:#ff453a;           /* acción y destructivo */
   --verde:#4ce07b;
   --toque:44px;
   --margen:16px;            /* margen de contenido */
   --radio:14px;
   --s1:4px;--s2:8px;--s3:12px;--s4:16px;--s5:24px;--s6:32px;
   --lado-izq:env(safe-area-inset-left,0px);--lado-der:env(safe-area-inset-right,0px);
   --arriba:env(safe-area-inset-top,0px);--abajo:env(safe-area-inset-bottom,0px);
   --entra:200ms;
   color-scheme:dark}
 html{background:var(--fondo)}
 /* Sin overflow-x:hidden a propósito: recortar en silencio convierte un
    desbordamiento en algo invisible. Si vuelve a pasar, se verá. */
 body{margin:0;min-height:100dvh;background:var(--fondo);color:var(--texto);
   font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',system-ui,sans-serif;
   font-size:16px;line-height:1.45;-webkit-font-smoothing:antialiased;
   -webkit-tap-highlight-color:transparent}
 a,button,label,summary{touch-action:manipulation}
 :focus-visible{outline:2px solid var(--rojo);outline-offset:2px;border-radius:6px}

 /* ── Continuidad entre pantallas ──────────────────────────────────────────
    La consola es SSR: cada toque es una carga de documento. Sin esto, la
    sensación es exactamente la que había que eliminar —el reemplazo brusco de
    página—, así que la transición no es decoración: es el punto. Donde el
    navegador no la soporta, el contenido entra con una animación equivalente y
    el resultado sigue siendo continuo. */
 @view-transition{navigation:auto}
 ::view-transition-old(root){animation:salir 90ms ease both}
 ::view-transition-new(root){animation:entrar var(--entra) cubic-bezier(.32,.72,0,1) both}
 @keyframes entrar{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
 @keyframes salir{to{opacity:0}}
 /* Modo de relleno backwards, no both: con both el elemento conserva al
    terminar la transformación del último fotograma —aunque sea la identidad— y
    eso basta para que se convierta en el bloque contenedor de sus descendientes
    posicionados como fixed. La hoja inferior se anclaba al marco en vez de a la
    ventana y salía recortada arriba. */
 .marco{animation:entrar var(--entra) cubic-bezier(.32,.72,0,1) backwards}
 /* La barra no se desliza con el contenido: es el marco fijo del que cuelga
    la jerarquía, y moverla delataría que la página entera se reemplazó. */
 .barra{view-transition-name:barra}

 /* ── Marco ────────────────────────────────────────────────────────────────
    A pantalla completa en el móvil. El margen lo pone cada elemento, no un
    contenedor centrado: una lista debe poder llegar al borde. */
 .marco{padding:0 0 calc(var(--s6) + var(--abajo))}
 .icono{display:block;width:22px;height:22px;fill:none;stroke:currentColor;
   stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}

 /* ── Barra contextual ─────────────────────────────────────────────────────
    Compacta y sin marca: el nombre del producto no hace falta en cada
    pantalla, y repetirlo era lo que la hacía parecer un sitio web. */
 .barra{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:var(--s2);
   min-height:calc(50px + var(--arriba));
   padding:var(--arriba) calc(var(--s2) + var(--lado-der)) 0 calc(var(--s2) + var(--lado-izq));
   background:color-mix(in srgb,var(--fondo) 82%,transparent);
   -webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}
 .barra--linea{box-shadow:0 1px 0 var(--separador)}
 .barra__titulo{flex:1;min-width:0;margin:0;font-size:17px;font-weight:650;
   letter-spacing:-.01em;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .barra__lado{display:flex;align-items:center;flex:none;min-width:var(--toque);min-height:var(--toque)}
 .barra__lado--der{justify-content:flex-end}
 .atras,.barra__accion{display:inline-flex;align-items:center;justify-content:center;gap:2px;
   min-width:var(--toque);min-height:var(--toque);padding:0 var(--s2);margin:0;
   background:none;border:0;font:inherit;font-size:16px;color:var(--rojo);
   text-decoration:none;cursor:pointer;white-space:nowrap}
 .atras{gap:1px;padding-left:0;font-size:17px}
 .atras .icono{width:24px;height:24px;stroke-width:2.2}
 .atras span{max-width:11ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .barra__accion--firme{font-weight:680}
 .barra__accion[disabled]{color:var(--apagado);cursor:not-allowed}
 .atras:active,.barra__accion:active:not([disabled]){opacity:.45}

 /* Título grande de pantalla raíz: la jerarquía se lee antes de tocar nada. */
 .titulo{margin:var(--s1) var(--margen) var(--s4);font-size:32px;font-weight:730;
   letter-spacing:-.025em;line-height:1.1}

 /* ── Objeto abierto ───────────────────────────────────────────────────────
    La cabecera de un detalle: nombre y sus datos, sin tarjeta alrededor. */
 .objeto{margin:var(--s1) var(--margen) var(--s5)}
 .objeto__titulo{margin:0;font-size:30px;font-weight:730;letter-spacing:-.025em;line-height:1.12}
 .objeto__detalle{display:flex;align-items:center;gap:var(--s2);flex-wrap:wrap;
   margin:var(--s2) 0 0;color:var(--tenue);font-size:15px}

 /* ── Sección agrupada ─────────────────────────────────────────────────────
    El contenedor único. No se anida: dentro sólo van filas. */
 .grupo{margin:0 var(--margen) var(--s5);background:var(--grupo);
   border-radius:var(--radio);overflow:hidden}
 /* Variante a sangre para listas largas, que ganan al llegar al borde. */
 .grupo--pleno{margin-left:0;margin-right:0;border-radius:0}
 .grupo__titulo{margin:0 calc(var(--margen) + var(--s3)) var(--s2);color:var(--apagado);
   font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase}
 .grupo__pie{margin:calc(-1 * var(--s4)) calc(var(--margen) + var(--s3)) var(--s5);
   color:var(--apagado);font-size:13px;line-height:1.4}

 /* ── Fila ─────────────────────────────────────────────────────────────────
    El elemento que más se repite. Toda la fila es el objetivo del dedo; si
    lleva un botón dentro, el dedo tiene dos destinos a diez píxeles. */
 .fila{position:relative;display:flex;align-items:center;gap:var(--s3);width:100%;
   min-height:58px;padding:var(--s3) var(--s4);background:transparent;border:0;
   color:inherit;font:inherit;text-align:left;text-decoration:none;cursor:pointer;
   transition:background-color 120ms ease}
 .fila::after{content:'';position:absolute;left:var(--s4);right:0;bottom:0;height:1px;
   background:var(--separador)}
 .grupo>.fila:last-child::after,.grupo>form:last-child .fila::after{display:none}
 .fila:active{background:var(--grupo-toque)}
 .fila__cuerpo{flex:1;min-width:0}
 .fila__titulo{display:block;font-size:16px;font-weight:550;letter-spacing:-.01em;line-height:1.3}
 .fila__detalle{display:block;margin-top:2px;color:var(--tenue);font-size:14px;
   overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .fila__valor{flex:none;color:var(--tenue);font-size:16px;font-variant-numeric:tabular-nums}
 .fila__orden{display:flex;align-items:center;justify-content:center;flex:none;
   width:26px;color:var(--apagado);font-size:14px;font-variant-numeric:tabular-nums}
 .fila__flecha{display:flex;align-items:center;flex:none;color:var(--apagado)}
 .fila__flecha .icono{width:18px;height:18px;stroke-width:2.2}
 /* Fila que ejecuta en vez de navegar: se distingue por el color, no por ser
    un botón con borde dentro de la lista. */
 .fila--accion .fila__titulo{color:var(--rojo);font-weight:600}
 .fila--peligro .fila__titulo{color:var(--rojo)}
 .fila--centro{justify-content:center}
 .fila--centro .fila__titulo{flex:none}

 /* ── Píldoras de estado ───────────────────────────────────────────────────*/
 .insignia{display:inline-flex;align-items:center;flex:none;padding:3px 9px;border-radius:999px;
   font-size:11px;font-weight:700;letter-spacing:.06em}
 .insignia--ready{background:rgba(76,224,123,.14);color:#7ce6a0}
 .insignia--incompleta{background:rgba(255,69,58,.15);color:#ff9b93}
 .punto{display:inline-block;flex:none;width:7px;height:7px;border-radius:50%;background:var(--rojo)}
 .pendiente{display:inline-flex;align-items:center;flex:none;margin-left:var(--s2);
   padding:2px 7px;border-radius:999px;background:rgba(255,69,58,.15);color:#ff9b93;
   font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}

 /* ── Búsqueda ─────────────────────────────────────────────────────────────
    Un solo campo. El botón de lupa aparte era un formulario de web: aquí se
    busca con Intro, y el submit existe pero no se ve. */
 .busqueda{position:relative;margin:0 var(--margen) var(--s4)}
 .busqueda .icono{position:absolute;left:11px;top:50%;width:19px;height:19px;
   transform:translateY(-50%);color:var(--apagado);pointer-events:none}
 .busqueda input{width:100%;min-height:40px;padding:9px var(--s3) 9px 38px;
   background:var(--grupo);border:0;border-radius:11px;color:var(--texto);font:inherit;font-size:16px}
 .busqueda input::placeholder{color:var(--apagado)}
 .busqueda input::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none}
 .visualmente-oculto{position:absolute;width:1px;height:1px;margin:-1px;padding:0;
   overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}

 /* ── Campos dentro de una fila ────────────────────────────────────────────
    Un parámetro numérico no necesita una etiqueta encima y un input de ancho
    completo debajo. El nombre a la izquierda y el valor editable a la derecha
    ocupa una línea y se lee como un ajuste, no como un formulario. */
 .fila--campo{cursor:default}
 .fila--campo:active{background:transparent}
 .fila__etiqueta{flex:1;min-width:0;font-size:16px;font-weight:550;letter-spacing:-.01em}
 /* El área que responde al dedo es la del propio input, no la de la fila que
    lo contiene: se ve compacto, pero mide los 44px completos. */
 .fila__entrada{flex:none;width:104px;min-height:var(--toque);padding:0 var(--s2);
   background:transparent;border:0;border-radius:8px;color:var(--texto);
   font:inherit;font-size:16px;text-align:right;font-variant-numeric:tabular-nums}
 .fila__entrada:focus{background:var(--grupo-toque);outline:none}
 .fila__entrada--ancha{width:150px}
 .fila__rango{display:flex;align-items:center;gap:2px;flex:none;color:var(--apagado)}
 .fila__rango .fila__entrada{width:58px}
 .fila__unidad{padding-left:1px;color:var(--apagado);font-size:15px}
 select.fila__entrada{width:auto;max-width:60%;min-height:var(--toque);padding-right:var(--s5);color:var(--tenue);
   -webkit-appearance:none;appearance:none;text-align:right;text-align-last:right;
   background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236e7075' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 6 6 6-6 6'/%3E%3C/svg%3E");
   background-repeat:no-repeat;background-position:right 4px center;background-size:16px}
 /* Campo de texto libre a lo ancho: sólo donde el contenido es un párrafo. */
 .campo{display:block;margin:0 var(--margen) var(--s4)}
 .campo>span{display:block;margin:0 0 var(--s2);color:var(--apagado);
   font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase}
 .campo input,.campo select,.campo textarea{width:100%;min-height:48px;padding:12px var(--s3);
   background:var(--grupo);border:0;border-radius:11px;color:var(--texto);font:inherit;font-size:16px}
 .campo textarea{min-height:112px;resize:vertical;line-height:1.45}
 .campo input::placeholder,.campo textarea::placeholder{color:var(--apagado)}
 .ayuda{margin:calc(-1 * var(--s3)) var(--margen) var(--s4);color:var(--apagado);font-size:13px}

 /* ── Acción principal ─────────────────────────────────────────────────────
    Una por pantalla, y sólo cuando no cabe como fila. */
 .cta,button.cta{display:flex;align-items:center;justify-content:center;gap:var(--s2);
   width:calc(100% - 2 * var(--margen));min-height:50px;margin:var(--s4) var(--margen);
   padding:var(--s3) var(--s4);background:var(--texto);color:var(--fondo);
   border:0;border-radius:13px;font:inherit;font-size:16px;font-weight:640;
   letter-spacing:-.01em;text-decoration:none;cursor:pointer;
   transition:opacity 120ms ease,transform 120ms ease}
 .cta--suave,button.cta--suave{background:var(--grupo);color:var(--texto)}
 .cta--peligro,button.cta--peligro{background:var(--grupo);color:var(--rojo)}
 .cta:active:not(:disabled){opacity:.7;transform:scale(.99)}
 .cta:disabled{opacity:.4;cursor:not-allowed}

 /* ── Aviso ────────────────────────────────────────────────────────────────
    Una línea, no una tarjeta con viñetas repitiendo lo que ya dice la lista. */
 .aviso{display:flex;align-items:center;gap:var(--s2);margin:0 var(--margen) var(--s4);
   padding:var(--s3) var(--s4);background:var(--grupo);border-radius:12px;
   color:var(--tenue);font-size:15px;line-height:1.35}
 .aviso--ok{color:#7ce6a0}
 .aviso--alerta{color:#ff9b93}
 .vacio{margin:var(--s6) var(--margen);color:var(--apagado);font-size:15px;text-align:center}
 .vacio strong{display:block;margin-bottom:var(--s1);color:var(--tenue);font-size:17px;font-weight:600}
 .enlace-generado{margin:0 var(--margen) var(--s4);padding:var(--s3) var(--s4);
   background:var(--grupo);border-radius:12px;color:#ffd9d6;word-break:break-all;
   font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.5}

 /* ── Hoja inferior ────────────────────────────────────────────────────────
    Es una ruta del servidor, no un truco de CSS: se abre con un enlace, se
    cierra con «atrás» del navegador y funciona sin JavaScript. Por eso puede
    animarse con confianza — no hay estado que se pueda quedar a medias. */
 .hoja{position:fixed;inset:0;z-index:40;display:flex;flex-direction:column;
   justify-content:flex-end}
 .hoja__fondo{position:absolute;inset:0;background:rgba(0,0,0,.5);
   animation:fondo-entra 240ms ease both}
 .hoja__panel{position:relative;max-height:86dvh;overflow-y:auto;
   padding:var(--s2) 0 calc(var(--s3) + var(--abajo));background:var(--hoja);
   border-radius:20px 20px 0 0;animation:hoja-entra 240ms cubic-bezier(.32,.72,0,1) both}
 .hoja__tirador{width:36px;height:5px;margin:var(--s1) auto var(--s3);border-radius:3px;
   background:rgba(255,255,255,.22)}
 .hoja__titulo{margin:0 var(--s5) var(--s2);color:var(--apagado);font-size:14px;text-align:center}
 .hoja .grupo{margin:var(--s3) var(--s3) var(--s2)}
 .hoja .fila{min-height:56px}
 @keyframes hoja-entra{from{transform:translateY(100%)}to{transform:none}}
 @keyframes fondo-entra{from{opacity:0}to{opacity:1}}
 /* Con la hoja abierta el fondo no debe poder desplazarse detrás. */
 body:has(.hoja){overflow:hidden}

 /* ── Modo tarea a pantalla completa ───────────────────────────────────────
    Editar no es navegar a otra página: es entrar en un modo con dos salidas
    explícitas, Cancelar y Guardar, siempre en la barra. */
 .tarea{display:flex;flex-direction:column;min-height:100dvh}
 .tarea .barra__titulo{font-size:16px}

 /* ── Reordenar ────────────────────────────────────────────────────────────*/
 .mover{display:flex;align-items:center;gap:var(--s1);flex:none}
 .boton-icono{display:inline-flex;align-items:center;justify-content:center;flex:none;
   width:var(--toque);height:var(--toque);padding:0;margin:0;background:transparent;
   border:0;border-radius:11px;color:var(--texto);font:inherit;cursor:pointer;
   text-decoration:none;transition:background-color 120ms ease}
 .boton-icono:active:not([disabled]){background:var(--grupo-toque)}
 .boton-icono[disabled]{color:var(--apagado);cursor:not-allowed}
 .boton-icono--peligro{color:var(--rojo)}

 /* ── Escritorio ───────────────────────────────────────────────────────────
    Mejora, no punto de partida: la composición se diseñó a 390 y aquí sólo se
    le pone un ancho cómodo. */
 @media(min-width:760px){
   .marco{max-width:760px;margin:0 auto;padding-bottom:var(--s6)}
   :root{--margen:24px}
   .grupo--pleno{margin-left:var(--margen);margin-right:var(--margen);border-radius:var(--radio)}
   .cta{max-width:340px}
   .hoja__panel{max-width:520px;margin:0 auto var(--s5);border-radius:20px;
     animation-name:entrar}
   .hoja{justify-content:center}
   .rejilla-dias{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
   .rejilla-dias>*{min-width:0}
   .rejilla-dias>.fila:nth-last-child(2)::after{display:none}
 }
 @media(max-width:340px){
   :root{--margen:12px}
   .titulo,.objeto__titulo{font-size:27px}
   .fila__entrada{width:88px}
   .fila__rango .fila__entrada{width:50px}
 }

 /* ── Movimiento reducido ──────────────────────────────────────────────────
    Se apaga el movimiento, no la respuesta al toque: el estado pulsado es
    información, no adorno. */
 @media(prefers-reduced-motion:reduce){
   @view-transition{navigation:none}
   *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;
     transition-duration:.01ms!important}
   .cta:active:not(:disabled){transform:none}
 }
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
/**
 * Barra contextual.
 *
 * Sin marca y sin miga de pan: el nombre del producto no aporta nada una vez
 * dentro, y repetirlo en cada pantalla era de las cosas que más delataban una
 * web. Queda el título de dónde estás y, a los lados, sólo lo que se puede
 * hacer aquí.
 *
 * `atras` apunta siempre al nivel de arriba, así que el camino de vuelta es el
 * mismo se haya llegado como se haya llegado.
 */
type Barra = {
  /**
   * Título centrado. Se omite cuando la pantalla ya lleva un título grande
   * debajo: leerlo dos veces en la misma pantalla es de sitio web, no de app.
   */
  titulo?: string
  /** Nivel superior. */
  atras?: string
  /** Nombre del nivel superior, junto a la flecha. Dice de dónde se viene. */
  atrasEtiqueta?: string
  /** Sustituye la flecha. Para un modo tarea, donde la salida es «Cancelar». */
  izquierda?: string
  /** Acción de la derecha: la principal de la pantalla, o nada. */
  derecha?: string
}

function barra({ titulo, atras, atrasEtiqueta, izquierda, derecha }: Barra): string {
  const volver = atras
    ? `<a class="atras" href="${escapar(atras)}"${atrasEtiqueta ? '' : ' aria-label="Volver"'}>${icono('volver')}${
        atrasEtiqueta ? `<span>${escapar(atrasEtiqueta)}</span>` : ''
      }</a>`
    : ''
  return `<header class="barra">
    <div class="barra__lado">${izquierda ?? volver}</div>
    ${titulo ? `<h1 class="barra__titulo">${escapar(titulo)}</h1>` : '<span class="barra__titulo"></span>'}
    <div class="barra__lado barra__lado--der">${derecha ?? ''}</div></header>`
}

function flecha(): string {
  return `<span class="fila__flecha" aria-hidden="true">${icono('chevron')}</span>`
}

/** Sección agrupada: el único contenedor del sistema, y no se anida. */
function grupo(contenido: string, opciones: { titulo?: string; pie?: string; pleno?: boolean } = {}): string {
  const encabezado = opciones.titulo ? `<h2 class="grupo__titulo">${escapar(opciones.titulo)}</h2>` : ''
  const pie = opciones.pie ? `<p class="grupo__pie">${escapar(opciones.pie)}</p>` : ''
  return `${encabezado}<div class="grupo${opciones.pleno ? ' grupo--pleno' : ''}">${contenido}</div>${pie}`
}

/**
 * Búsqueda.
 *
 * Un solo campo, sin botón de lupa al lado: ese par campo+botón es un
 * formulario de sitio web. Se busca con Intro, y el submit sigue existiendo
 * —oculto— para que funcione sin JavaScript y con teclado.
 */
function formularioBusqueda(valor: string, ocultos: Readonly<Record<string, string>>, etiqueta: string): string {
  const campos = Object.entries(ocultos)
    .map(([nombre, contenido]) => `<input type="hidden" name="${escapar(nombre)}" value="${escapar(contenido)}">`)
    .join('')
  return `<form class="busqueda" method="GET" action="/admin/" role="search">
    ${campos}${icono('buscar')}
    <input type="search" name="q" value="${escapar(valor)}" placeholder="${escapar(etiqueta)}"
      autocomplete="off" enterkeyhint="search" aria-label="${escapar(etiqueta)}">
    <button type="submit" class="visualmente-oculto">Buscar</button></form>`
}

function avisoDe(mensaje: string | null): string {
  if (!mensaje) return ''
  return `<p class="aviso aviso--ok" role="status">${escapar(mensaje)}</p>`
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

async function pantallaClientes(
  db: D1Database,
  mostrarQa: boolean,
  aviso: string | null,
  editando: boolean,
  consulta: string,
): Promise<Response> {
  return pagina(await cuerpoClientes(db, mostrarQa, aviso, editando, consulta))
}

/**
 * El cuerpo de la lista, aparte de la respuesta.
 *
 * Lo reutiliza la confirmación de baja para pintar la lista detrás de su hoja:
 * sin eso, confirmar sacaría al coach de la pantalla que está editando y el
 * gesto volvería a sentirse como cambiar de página.
 */
async function cuerpoClientes(
  db: D1Database,
  mostrarQa: boolean,
  aviso: string | null,
  editando: boolean,
  consulta: string,
): Promise<string> {
  // El filtro va en el servidor: esconderlo con CSS dejaría el cliente técnico
  // dentro del HTML que se manda al navegador.
  const visibles = filtrarClientesQa(await listarPerfiles(db), mostrarQa)
  const termino = normalizarBusqueda(consulta)
  const perfiles = termino
    ? visibles.filter((perfil) => normalizarBusqueda(perfil.nombre).includes(termino))
    : visibles

  const filas = await Promise.all(
    perfiles.map(async (perfil) => {
      const estado = evaluarEstadoProgramacion(await listarRutinas(db, perfil.id))

      // En modo edición la fila deja de ser un enlace. Si siguiera siéndolo,
      // el dedo tendría dos destinos a la vez —abrir y eliminar— pegados en la
      // misma línea, que es como se borra un cliente sin querer.
      if (editando) {
        return `<a class="fila fila--peligro" href="${escapar(ruta({ cliente: perfil.id, confirmar: 'eliminar' }))}">
          <span class="boton-icono boton-icono--peligro" aria-hidden="true">−</span>
          <span class="fila__cuerpo"><span class="fila__titulo">${escapar(perfil.nombre)}</span>
          <span class="fila__detalle">${escapar(resumenPrograma(estado))}</span></span>
          <span class="visualmente-oculto">Eliminar ${escapar(perfil.nombre)}</span></a>`
      }

      // Un punto en vez de una píldora INCOMPLETE: en una lista lo que importa
      // es cuál necesita atención, no leer su estado en mayúsculas.
      const pendiente = estado.ready
        ? ''
        : '<span class="punto" role="img" aria-label="Programación incompleta"></span>'

      // Sin cliente_id ni contadores de sesión: aquí sólo se decide a quién abrir.
      return `<a class="fila" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa' }))}">
        <span class="fila__cuerpo"><span class="fila__titulo">${escapar(perfil.nombre)}</span>
        <span class="fila__detalle">${escapar(resumenPrograma(estado))}</span></span>
        ${pendiente}${flecha()}</a>`
    }),
  )

  const lista = filas.length
    ? grupo(filas.join(''), { pleno: true })
    : consulta
      ? '<p class="vacio"><strong>Sin resultados</strong>No hay ningún cliente con ese nombre.</p>'
      : '<p class="vacio"><strong>Todavía no hay clientes</strong>Crea el primero para empezar a programarle sus días.</p>'

  // Una sola acción a la derecha, y cambia con el modo. Antes había tres
  // afordances para dos acciones: el «+» de la barra, «Editar lista» y
  // «+ Añadir cliente» al pie.
  const derecha = editando
    ? `<a class="barra__accion barra__accion--firme" href="${escapar(ruta({}))}">Listo</a>`
    : `<a class="barra__accion" href="${escapar(ruta({ nuevo: true }))}" aria-label="Crear cliente">${icono('sumar')}</a>`

  const izquierda =
    editando || !visibles.length
      ? ''
      : `<a class="barra__accion" href="${escapar(ruta({ modo: 'editar' }))}">Editar</a>`

  return `${barra({ izquierda, derecha })}
     <h2 class="titulo">Clientes</h2>
     ${avisoDe(aviso)}
     ${editando ? '' : formularioBusqueda(consulta, {}, 'Buscar')}
     ${lista}`
}

/**
 * Hoja inferior.
 *
 * Es una ruta del servidor, no un truco de CSS ni un diálogo con JavaScript:
 * se abre con un enlace y se cierra con «atrás» del navegador, que es como se
 * cierra una hoja en una app. Al ser estado en la URL no puede quedarse a
 * medias, y por eso se puede animar con confianza.
 */
function hoja({ volver, titulo, contenido }: { volver: string; titulo?: string; contenido: string }): string {
  return `<div class="hoja" role="dialog" aria-modal="true">
    <a class="hoja__fondo" href="${escapar(volver)}" aria-label="Cerrar"></a>
    <div class="hoja__panel">
      <div class="hoja__tirador" aria-hidden="true"></div>
      ${titulo ? `<p class="hoja__titulo">${escapar(titulo)}</p>` : ''}
      ${grupo(contenido)}
      ${grupo(`<a class="fila fila--centro" href="${escapar(volver)}"><span class="fila__titulo">Cancelar</span></a>`)}
    </div></div>`
}

/**
 * Confirmación de la baja.
 *
 * Pantalla propia y no un `confirm()`: la consola no lleva JavaScript, y aquí
 * hay sitio para decir de verdad qué se pierde y qué no. Se enseña lo que se
 * corta —el acceso— junto a lo que se conserva —la programación—, porque las
 * dos mitades cambian la decisión.
 */
async function pantallaEliminarCliente(
  db: D1Database,
  perfil: PerfilCloud,
  mostrarQa: boolean,
): Promise<Response> {
  const conteo = await contarAcceso(db, perfil.id)
  const estado = evaluarEstadoProgramacion(await listarRutinas(db, perfil.id))

  const acceso = conteo.sesiones
    ? conteo.sesiones > 1
      ? `Pierde las ${conteo.sesiones} sesiones que tiene abiertas.`
      : 'Pierde la sesión con la que entra ahora mismo.'
    : conteo.invitaciones
      ? 'Su invitación pendiente deja de servir.'
      : 'No tiene ningún acceso abierto.'

  const volver = ruta({ modo: 'editar' })

  // Una decisión destructiva se pregunta encima de la lista que se está
  // editando, no llevándose al coach a otra pantalla. La lista sigue detrás.
  return pagina(
    `${await cuerpoClientes(db, mostrarQa, null, true, '')}
     ${hoja({
       volver,
       titulo: `Desaparece de la lista y se le corta el acceso. ${acceso} Su programación (${resumenPrograma(estado)}) se conserva.`,
       contenido: `<form method="POST"><input type="hidden" name="accion" value="eliminar-cliente">
         <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
         <button type="submit" class="fila fila--centro fila--peligro">
         <span class="fila__titulo">Eliminar a ${escapar(perfil.nombre)}</span></button></form>`,
     })}`,
  )
}

function pantallaNuevoCliente(error = ''): Response {
  return pagina(
    `<form method="POST" class="tarea">
       <input type="hidden" name="accion" value="crear-cliente">
       ${barra({
         titulo: 'Nuevo cliente',
         izquierda: `<a class="barra__accion" href="${escapar(ruta({}))}">Cancelar</a>`,
         derecha: '<button type="submit" class="barra__accion barra__accion--firme">Crear</button>',
       })}
       ${error ? `<p class="aviso aviso--alerta" role="alert">${escapar(error)}</p>` : ''}
       ${grupo(
         `<label class="fila fila--campo"><span class="fila__etiqueta">Nombre</span>
            <input class="fila__entrada fila__entrada--ancha" name="nombre" required
              autocomplete="name" autocapitalize="words" enterkeyhint="next" placeholder="Nombre"></label>
          <label class="fila fila--campo"><span class="fila__etiqueta">Identificador</span>
            <input class="fila__entrada fila__entrada--ancha" name="cliente_id" required
              pattern="[a-z0-9][a-z0-9_-]{1,40}" autocomplete="off" autocapitalize="none"
              spellcheck="false" enterkeyhint="done" placeholder="nombre-corto"></label>`,
         { pie: 'El identificador sólo admite minúsculas, números y guiones, y no se puede cambiar después.' },
       )}
     </form>`,
    error ? 400 : 200,
  )
}

// ── pantalla: hub del cliente ───────────────────────────────────────────────

/**
 * Resumen del perfil para la fila que lleva a él.
 *
 * Antes el detalle repetía las cuatro filas del perfil y además una tarjeta de
 * alerta con la misma lista de campos pendientes. Aquí cabe en una línea.
 */
function resumenPerfil(perfil: PerfilCloud): string {
  return `${perfil.edad} años · ${perfil.estaturaCm} cm · ${perfil.pesoCorporalLb} lb`
}

function situacionDeAcceso(conteo: { sesiones: number; invitaciones: number }): string {
  if (conteo.sesiones) return `Con sesión activa${conteo.sesiones > 1 ? ` (${conteo.sesiones})` : ''}`
  return conteo.invitaciones ? 'Invitación pendiente de usar' : 'Sin acceso todavía'
}

/**
 * El cliente abierto.
 *
 * Una sola pantalla de objeto: nombre, sus días, y dos filas para lo demás.
 * Antes esto eran tres pestañas en una barra inferior —dentro del detalle,
 * mientras la raíz no tenía ninguna—, que invertía la jerarquía: la navegación
 * global vivía dos niveles adentro.
 *
 * Las acciones secundarias no se enseñan: viven en la hoja del botón «···».
 * Un panel de coach con Generar, Revocar, Probar y Eliminar a la vista es lo
 * que hace que una pantalla se lea como un panel de control web.
 */
function seccionPrograma(
  perfil: PerfilCloud,
  rutinas: readonly RutinaCloud[],
  estado: EstadoProgramacion,
  conteo: { sesiones: number; invitaciones: number },
  pendientes: readonly string[],
): string {
  const dias = rutinas
    .map((rutina) => {
      const diaEstado = estado.dias.find((item) => item.orden === rutina.orden)
      const incompleto = diaEstado && !diaEstado.completo
      return `<a class="fila" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden }))}">
        <span class="fila__cuerpo"><span class="fila__titulo">${escapar(rutina.nombre)}</span>
        <span class="fila__detalle">${rutina.slots.length} ejercicios</span></span>
        ${incompleto ? '<span class="punto" role="img" aria-label="Día incompleto"></span>' : ''}
        ${flecha()}</a>`
    })
    .join('')

  const programa = dias
    ? grupo(`<div class="rejilla-dias">${dias}</div>`, { titulo: 'Programa' })
    : grupo('<p class="fila fila--centro"><span class="fila__titulo">No hay días configurados</span></p>', {
        titulo: 'Programa',
      })

  const cliente = grupo(
    `<a class="fila" href="${escapar(ruta({ cliente: perfil.id, seccion: 'perfil' }))}">
       <span class="fila__cuerpo"><span class="fila__titulo">Perfil${pendientes.length ? '<span class="pendiente">Sin confirmar</span>' : ''}</span>
       <span class="fila__detalle">${escapar(resumenPerfil(perfil))}</span></span>${flecha()}</a>
     <a class="fila" href="${escapar(ruta({ cliente: perfil.id, seccion: 'acceso' }))}">
       <span class="fila__cuerpo"><span class="fila__titulo">Acceso</span>
       <span class="fila__detalle">${escapar(situacionDeAcceso(conteo))}</span></span>${flecha()}</a>`,
    { titulo: 'Cliente' },
  )

  // La única acción visible del detalle. Es la que el coach usa a diario y la
  // que convierte esta pantalla en algo más que una ficha.
  const probar = `<form method="POST"><input type="hidden" name="accion" value="previsualizar">
    <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
    <button type="submit" class="cta cta--suave">Probar como ${escapar(perfil.nombre)}</button></form>`

  return `${programa}${cliente}${probar}`
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
      ${flecha()}</a>`,
    )
    .join('')

  // El pie dice lo mismo que antes ocupaba una tarjeta de alerta con una lista
  // de viñetas que repetía las etiquetas «Sin confirmar» de cada fila.
  const pie = pendientes.length
    ? 'Los datos marcados vienen de la semilla inicial y no deben presentarse como confirmados.'
    : undefined

  return grupo(filas, { pie })
}

function seccionAcceso(
  perfil: PerfilCloud,
  estado: EstadoProgramacion,
  conteo: { sesiones: number; invitaciones: number },
  enlaceNuevo: string,
): string {
  const problemas = [
    ...estado.problemasGenerales,
    ...estado.dias.filter((dia) => !dia.completo).map((dia) => dia.detalle),
  ]

  const estadoFilas = `<div class="fila fila--campo"><span class="fila__etiqueta">Situación</span>
      <span class="fila__valor">${escapar(situacionDeAcceso(conteo))}</span></div>
    <div class="fila fila--campo"><span class="fila__etiqueta">Programación</span>
      <span class="fila__valor">${estado.ready ? 'Lista' : 'Incompleta'}</span></div>`

  // El motivo del bloqueo se dice donde está el bloqueo, en el pie del grupo,
  // en vez de en una tarjeta de alerta aparte con su propia lista.
  const generar = estado.ready
    ? `<form method="POST"><input type="hidden" name="accion" value="generar-enlace">
       <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
       <button type="submit" class="cta">Generar enlace de acceso</button></form>`
    : `<button type="button" class="cta" disabled aria-describedby="motivo-bloqueo">Generar enlace de acceso</button>
       <p class="grupo__pie" id="motivo-bloqueo">El enlace se desbloquea cuando los cuatro días tengan de 5 a 8
       ejercicios válidos. ${escapar(problemas.join('. '))}</p>`

  return `${grupo(estadoFilas, { pie: estado.ready ? undefined : 'Programación incompleta.' })}
    ${enlaceNuevo}${generar}`
}

/**
 * Acciones secundarias del cliente, en una hoja.
 *
 * Reunirlas aquí es lo que permite que el detalle tenga una sola acción
 * visible. Las destructivas van al final y en rojo, no mezcladas entre las
 * demás.
 */
function hojaDeCliente(perfil: PerfilCloud, conteo: { sesiones: number; invitaciones: number }, volver: string): string {
  const revocar = conteo.invitaciones
    ? `<form method="POST"><input type="hidden" name="accion" value="revocar-enlaces">
       <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
       <button type="submit" class="fila fila--peligro"><span class="fila__cuerpo">
       <span class="fila__titulo">Revocar enlaces pendientes</span></span></button></form>`
    : ''

  return hoja({
    volver,
    titulo: perfil.nombre,
    contenido: `<a class="fila" href="${escapar(ruta({ cliente: perfil.id, seccion: 'perfil' }))}">
        <span class="fila__cuerpo"><span class="fila__titulo">Editar perfil</span></span></a>
      <a class="fila" href="${escapar(ruta({ cliente: perfil.id, seccion: 'acceso' }))}">
        <span class="fila__cuerpo"><span class="fila__titulo">Gestionar acceso</span></span></a>
      ${revocar}
      <a class="fila fila--peligro" href="${escapar(ruta({ cliente: perfil.id, confirmar: 'eliminar' }))}">
        <span class="fila__cuerpo"><span class="fila__titulo">Eliminar cliente</span></span></a>`,
  })
}

async function pantallaHub(
  db: D1Database,
  perfil: PerfilCloud,
  seccion: Seccion,
  aviso: string | null,
  enlaceNuevo = '',
  estadoHttp = 200,
  hojaAbierta = false,
): Promise<Response> {
  const rutinas = await listarRutinas(db, perfil.id)
  const estado = evaluarEstadoProgramacion(rutinas)
  const conteo = await contarAcceso(db, perfil.id)
  const pendientes = camposPendientesPerfil(perfil)

  const raiz = seccion === 'programa'
  const titulos: Readonly<Record<Seccion, string>> = {
    programa: perfil.nombre,
    perfil: 'Perfil',
    acceso: 'Acceso',
  }

  const cuerpo =
    seccion === 'perfil'
      ? seccionPerfil(perfil, pendientes)
      : seccion === 'acceso'
        ? seccionAcceso(perfil, estado, conteo, enlaceNuevo)
        : seccionPrograma(perfil, rutinas, estado, conteo, pendientes)

  const volverDeLaHoja = ruta({ cliente: perfil.id, seccion: 'programa' })
  const derecha = raiz
    ? `<a class="barra__accion" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa', hoja: 'acciones' }))}"
        aria-label="Más acciones">${icono('menu')}</a>`
    : ''

  // La cabecera grande sólo va en la raíz del objeto. En una subpantalla el
  // nombre ya lo lleva la barra, y repetirlo era la tercera vez que aparecía.
  const encabezado = raiz
    ? `<div class="objeto"><h2 class="objeto__titulo">${escapar(perfil.nombre)}</h2>
       <p class="objeto__detalle">${escapar(resumenPrograma(estado))}${insignia(estado.ready)}</p></div>`
    : ''

  return pagina(
    `${barra({
       titulo: raiz ? undefined : titulos[seccion],
       atras: raiz ? ruta({}) : ruta({ cliente: perfil.id, seccion: 'programa' }),
       atrasEtiqueta: raiz ? 'Clientes' : perfil.nombre,
       derecha,
     })}
     ${encabezado}
     ${avisoDe(aviso)}
     ${cuerpo}
     ${hojaAbierta ? hojaDeCliente(perfil, conteo, volverDeLaHoja) : ''}`,
    estadoHttp,
  )
}

// ── pantalla: día ───────────────────────────────────────────────────────────

/**
 * Biblioteca de ejercicios.
 *
 * La misma pantalla sirve para añadir uno al día y para cambiar el de un slot
 * existente: es la misma pregunta —¿cuál de los 33?— y merece la misma lista
 * buscable. La alternativa era un `<select>` con 33 opciones en el editor.
 */
function pantallaBiblioteca(
  perfil: PerfilCloud,
  rutina: RutinaCloud,
  consulta: string,
  cambiar?: SlotCloud,
): Response {
  const volver = cambiar
    ? ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden, ejercicio: cambiar.orden })
    : ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden })
  const termino = normalizarBusqueda(consulta)
  const resultados = termino
    ? CATALOGO_EJERCICIOS.filter((ejercicio) => normalizarBusqueda(ejercicio.nombre).includes(termino))
    : CATALOGO_EJERCICIOS

  // La fila entera es el botón. Antes llevaba un «+» circular a la derecha, así
  // que tocar el nombre no hacía nada: dos objetivos compitiendo en la misma
  // línea, y el de verdad era el pequeño.
  const filas = resultados
    .map(
      (ejercicio) => `<form method="POST">
        <input type="hidden" name="accion" value="${cambiar ? 'cambiar-ejercicio' : 'anadir-slot'}">
        <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
        <input type="hidden" name="dia" value="${rutina.orden}">
        ${cambiar ? `<input type="hidden" name="orden" value="${cambiar.orden}">` : ''}
        <input type="hidden" name="ejercicio" value="${escapar(ejercicio.id)}">
        <button type="submit" class="fila"${cambiar && cambiar.ejercicioId === ejercicio.id ? ' aria-current="true"' : ''}>
          <span class="fila__cuerpo"><span class="fila__titulo">${escapar(ejercicio.nombre)}</span></span>
          <span class="fila__flecha" aria-hidden="true">${cambiar && cambiar.ejercicioId === ejercicio.id ? '✓' : icono('sumar')}</span>
        </button></form>`,
    )
    .join('')

  const contenido = filas
    ? grupo(filas, { pleno: true })
    : '<p class="vacio"><strong>Sin resultados</strong>Prueba con otro nombre de ejercicio.</p>'

  return pagina(
    `${barra({ titulo: cambiar ? 'Cambiar ejercicio' : 'Añadir ejercicio', atras: volver })}
     ${formularioBusqueda(consulta, {
       cliente: perfil.id,
       seccion: 'programa',
       dia: String(rutina.orden),
       ...(cambiar ? { ejercicio: String(cambiar.orden), modo: 'cambiar' } : { modo: 'anadir' }),
     }, 'Buscar ejercicios')}
     ${contenido}`,
  )
}

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
          `<form method="POST"><input type="hidden" name="accion" value="mover-slot">
           <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
           <input type="hidden" name="dia" value="${rutina.orden}">
           <input type="hidden" name="orden" value="${slot.orden}">
           <input type="hidden" name="direccion" value="${direccion}">
           <button type="submit" class="boton-icono"
             aria-label="${direccion === 'arriba' ? 'Subir' : 'Bajar'} ${escapar(nombreEjercicio(slot.ejercicioId))}"
             ${desactivado ? 'disabled' : ''}>${simbolo}</button></form>`
        return `<div class="fila"><span class="fila__orden">${slot.orden}</span>
          <span class="fila__cuerpo"><span class="fila__titulo">${escapar(nombreEjercicio(slot.ejercicioId))}</span></span>
          <span class="mover">${mover('arriba', icono('arriba'), indice === 0)}${mover('abajo', icono('abajo'), indice === rutina.slots.length - 1)}</span></div>`
      }
      return `<a class="fila" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden, ejercicio: slot.orden }))}">
        <span class="fila__orden">${slot.orden}</span>
        <span class="fila__cuerpo"><span class="fila__titulo">${escapar(nombreEjercicio(slot.ejercicioId))}</span>
        <span class="fila__detalle">${escapar(resumenSlot(slot))}</span></span>
        ${flecha()}</a>`
    })
    .join('')

  const vacio = '<p class="vacio"><strong>Día sin ejercicios</strong>Añade entre 5 y 8 para que este día cuente como completo.</p>'

  // «Añadir» es la última fila de la lista, no un botón flotando debajo: es
  // donde termina de leerse el día y donde el pulgar ya está.
  const anadir =
    rutina.slots.length < MAX_EJERCICIOS
      ? `<a class="fila fila--accion" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden, modo: 'anadir' }))}">
         <span class="fila__orden" aria-hidden="true">${icono('sumar')}</span>
         <span class="fila__cuerpo"><span class="fila__titulo">Añadir ejercicio</span></span></a>`
      : ''

  // Reordenar es un modo, y su interruptor vive en la barra. Como botón fijo
  // al pie competía a diario con la acción que de verdad se usa.
  const derecha = rutina.slots.length > 1
    ? reordenando
      ? `<a class="barra__accion barra__accion--firme" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden }))}">Listo</a>`
      : `<a class="barra__accion" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden, modo: 'reordenar' }))}">Reordenar</a>`
    : ''

  const pie = rutina.slots.length >= MAX_EJERCICIOS ? 'Máximo de 8 ejercicios alcanzado.' : undefined

  return pagina(
    `${barra({ atras: volver, atrasEtiqueta: perfil.nombre, derecha })}
     ${avisoDe(aviso)}
     <div class="objeto"><h2 class="objeto__titulo">${escapar(rutina.nombre)}</h2>
       <p class="objeto__detalle">${rutina.slots.length} ejercicios</p></div>
     ${filas ? grupo(`${filas}${reordenando ? '' : anadir}`, { pleno: true, pie }) : vacio}
     ${filas ? '' : anadir}`,
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
  const aqui = ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden, ejercicio: slot.orden })

  if (confirmarBorrado) {
    return pagina(
      `${cuerpoEjercicio(perfil, rutina, slot, volver)}
       ${hoja({
         volver: aqui,
         titulo: `Se quita de ${rutina.nombre} y los siguientes suben una posición. El historial ya registrado no se toca.`,
         contenido: `<form method="POST"><input type="hidden" name="accion" value="quitar-slot">
           <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
           <input type="hidden" name="dia" value="${rutina.orden}">
           <input type="hidden" name="orden" value="${slot.orden}">
           <button type="submit" class="fila fila--centro fila--peligro">
           <span class="fila__titulo">Quitar ${escapar(nombreEjercicio(slot.ejercicioId))}</span></button></form>`,
       })}`,
    )
  }

  return pagina(cuerpoEjercicio(perfil, rutina, slot, volver))
}

/**
 * Editor de un ejercicio, en modo tarea.
 *
 * Era el sitio donde más se notaba la web: un `<select>` de 33 opciones y seis
 * pares etiqueta-encima-input-debajo, con Cancelar y Guardar al final del
 * scroll. Ahora la pantalla es un modo con dos salidas explícitas en la barra,
 * y cada parámetro ocupa una línea con su valor a la derecha, que es como se
 * lee un ajuste y no como se rellena un formulario.
 *
 * La elección del ejercicio deja de ser un desplegable: es una fila que abre
 * la misma biblioteca buscable que ya se usa para añadir. Treinta y tres
 * opciones en un `<select>` de móvil no se pueden ni leer.
 */
function cuerpoEjercicio(
  perfil: PerfilCloud,
  rutina: RutinaCloud,
  slot: SlotCloud,
  volver: string,
): string {
  const opcionesEstimulo = (['fuerza', 'hipertrofia', 'resistencia'] as const)
    .map((id) => `<option value="${id}"${slot.estimulo === id ? ' selected' : ''}>${NOMBRE_ESTIMULO[id]}</option>`)
    .join('')

  const opcionesProgresion = ([['', 'Automática'], ...Object.entries(NOMBRE_PROGRESION)] as readonly [string, string][])
    .map(([id, etiqueta]) => `<option value="${id}"${(slot.progresionFijada ?? '') === id ? ' selected' : ''}>${escapar(etiqueta)}</option>`)
    .join('')

  const prescripcion = `
    <div class="fila fila--campo"><span class="fila__etiqueta">Series</span>
      <input class="fila__entrada" type="number" inputmode="numeric" enterkeyhint="next"
        name="series" min="1" max="20" value="${slot.seriesObjetivo}" aria-label="Series"></div>
    <div class="fila fila--campo"><span class="fila__etiqueta">Repeticiones</span>
      <span class="fila__rango">
        <input class="fila__entrada" type="number" inputmode="numeric" enterkeyhint="next"
          name="rep_min" min="1" max="100" value="${slot.repMin}" aria-label="Repeticiones mínimas">–
        <input class="fila__entrada" type="number" inputmode="numeric" enterkeyhint="next"
          name="rep_max" min="1" max="100" value="${slot.repMax}" aria-label="Repeticiones máximas"></span></div>
    <div class="fila fila--campo"><span class="fila__etiqueta">Descanso</span>
      <span class="fila__rango">
        <input class="fila__entrada" type="number" inputmode="numeric" enterkeyhint="next"
          name="descanso" min="0" max="3600" step="15" value="${slot.descansoSegundos}"
          aria-label="Descanso en segundos"><span class="fila__unidad">s</span></span></div>`

  const ajustes = `
    <label class="fila fila--campo"><span class="fila__etiqueta">Estímulo</span>
      <select class="fila__entrada" name="estimulo">${opcionesEstimulo}</select></label>
    <label class="fila fila--campo"><span class="fila__etiqueta">Progresión</span>
      <select class="fila__entrada" name="progresion">${opcionesProgresion}</select></label>`

  return `<form method="POST" class="tarea">
      <input type="hidden" name="accion" value="guardar-slot">
      <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
      <input type="hidden" name="dia" value="${rutina.orden}">
      <input type="hidden" name="orden" value="${slot.orden}">
      <input type="hidden" name="ejercicio" value="${escapar(slot.ejercicioId)}">
      ${barra({
        titulo: `Ejercicio ${slot.orden}`,
        izquierda: `<a class="barra__accion" href="${escapar(volver)}">Cancelar</a>`,
        derecha: '<button type="submit" class="barra__accion barra__accion--firme">Guardar</button>',
      })}
      ${grupo(
        `<a class="fila" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden, ejercicio: slot.orden, modo: 'cambiar' }))}">
           <span class="fila__cuerpo"><span class="fila__titulo">${escapar(nombreEjercicio(slot.ejercicioId))}</span>
           <span class="fila__detalle">Cambiar ejercicio</span></span>${flecha()}</a>`,
      )}
      ${grupo(prescripcion, { titulo: 'Prescripción' })}
      ${grupo(ajustes)}
      ${grupo(
        `<a class="fila fila--centro fila--peligro" href="${escapar(ruta({ cliente: perfil.id, seccion: 'programa', dia: rutina.orden, ejercicio: slot.orden, confirmar: 'quitar' }))}">
           <span class="fila__titulo">Quitar del día</span></a>`,
      )}
    </form>`
}

// ── pantalla: grupo del perfil ──────────────────────────────────────────────

/**
 * Un grupo del perfil, en modo tarea.
 *
 * Los números en fila con su valor a la derecha; sólo el texto libre —objetivo,
 * limitaciones, notas— conserva el campo ancho, porque ahí el contenido es un
 * párrafo y comprimirlo a una línea empeoraría el trabajo real.
 */
function pantallaGrupoPerfil(perfil: PerfilCloud, grupo: GrupoPerfil, pendientes: readonly string[]): Response {
  const volver = ruta({ cliente: perfil.id, seccion: 'perfil' })
  const pendiente = (campo: string) => (pendientes.includes(campo) ? '<span class="pendiente">Sin confirmar</span>' : '')

  const numero = (nombre: string, etiqueta: string, valor: number, extra: string, campo = '') =>
    `<div class="fila fila--campo"><span class="fila__etiqueta">${escapar(etiqueta)}${campo ? pendiente(campo) : ''}</span>
      <input class="fila__entrada" type="number" name="${nombre}" value="${valor}" ${extra}
        aria-label="${escapar(etiqueta)}"></div>`

  const campos =
    grupo === 'datos'
      ? grupoDeCampos(`
          <label class="fila fila--campo"><span class="fila__etiqueta">Nombre</span>
            <input class="fila__entrada fila__entrada--ancha" name="nombre" value="${escapar(perfil.nombre)}"
              required autocomplete="name" enterkeyhint="next"></label>
          <label class="fila fila--campo"><span class="fila__etiqueta">Sexo</span>
            <select class="fila__entrada" name="sexo">
              <option value="masculino"${perfil.sexo === 'masculino' ? ' selected' : ''}>Masculino</option>
              <option value="femenino"${perfil.sexo === 'femenino' ? ' selected' : ''}>Femenino</option></select></label>
          ${numero('edad', 'Edad', perfil.edad, 'inputmode="numeric" min="1" max="120"', 'edad')}
          ${numero('estatura_cm', 'Estatura (cm)', perfil.estaturaCm, 'inputmode="decimal" min="50" max="250" step="0.01"', 'estatura')}
          ${numero('peso_lb', 'Peso (lb)', perfil.pesoCorporalLb, 'inputmode="decimal" min="0" max="1000" step="0.1"', 'peso')}
          ${numero('frecuencia', 'Días por semana', perfil.frecuenciaEntrenamiento, 'inputmode="numeric" min="1" max="7"')}`)
      : grupo === 'objetivo'
        ? grupoDeCampos(`<label class="fila fila--campo"><span class="fila__etiqueta">Objetivo${pendiente('objetivo')}</span>
            <input class="fila__entrada fila__entrada--ancha" name="objetivo" value="${escapar(perfil.objetivo)}"></label>`)
        : grupo === 'limitaciones'
          ? `<label class="campo"><span>Limitaciones</span>
             <textarea name="limitaciones" autocomplete="off" placeholder="Ninguna registrada">${escapar(perfil.limitaciones)}</textarea></label>`
          : `<label class="campo"><span>Notas del coach${pendiente('notas')}</span>
             <textarea name="notas" autocomplete="off" placeholder="Sin notas">${escapar(perfil.notas)}</textarea></label>`

  const titulos: Readonly<Record<GrupoPerfil, string>> = {
    datos: 'Datos personales',
    objetivo: 'Objetivo',
    limitaciones: 'Limitaciones',
    notas: 'Notas del coach',
  }

  return pagina(
    `<form method="POST" class="tarea">
       <input type="hidden" name="accion" value="guardar-perfil">
       <input type="hidden" name="cliente_id" value="${escapar(perfil.id)}">
       <input type="hidden" name="grupo" value="${grupo}">
       ${barra({
         titulo: titulos[grupo],
         izquierda: `<a class="barra__accion" href="${escapar(volver)}">Cancelar</a>`,
         derecha: '<button type="submit" class="barra__accion barra__accion--firme">Guardar</button>',
       })}
       ${campos}
     </form>`,
  )
}

/** Envuelve campos en un grupo. Aparte de `grupo()` porque aquí no hay título. */
function grupoDeCampos(contenido: string): string {
  return `<div class="grupo">${contenido}</div>`
}

// ── API ─────────────────────────────────────────────────────────────────────

function json(body: unknown, status: number, extras: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extras },
  })
}

async function atenderApi(
  request: Request,
  db: D1Database,
  path: string,
  mostrarQa: boolean,
): Promise<Response> {
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
    `${barra({ titulo: 'Petición no válida', atras: ruta({}) })}
     <p class="aviso aviso--alerta" role="alert">${escapar(mensaje)}</p>
     <a class="cta cta--suave" href="${escapar(ruta({}))}">Volver a clientes</a>`,
    400,
  )
}

function noEncontrado(mensaje = 'Cliente no encontrado'): Response {
  return pagina(
    `${barra({ titulo: 'No encontrado', atras: ruta({}) })}
     <p class="vacio"><strong>${escapar(mensaje)}</strong>Aquí sólo vive la consola del coach.</p>
     <a class="cta cta--suave" href="${escapar(ruta({}))}">Volver a clientes</a>`,
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
  if (!clienteId) {
    return pantallaClientes(
      db,
      mostrarQa,
      aviso,
      url.searchParams.get('modo') === 'editar',
      url.searchParams.get('q') ?? '',
    )
  }
  if (!idSeguro(clienteId) || clienteQaBloqueado(clienteId, mostrarQa)) return noEncontrado()

  const perfil = await obtenerPerfil(db, clienteId)
  if (!perfil) return noEncontrado()

  // La baja se confirma antes de cualquier escritura: este GET sólo pregunta.
  if (url.searchParams.get('confirmar') === 'eliminar') {
    return pantallaEliminarCliente(db, perfil, mostrarQa)
  }

  const seccion = seccionDe(url.searchParams.get('seccion'))

  if (seccion === 'perfil') {
    const grupo = grupoDe(url.searchParams.get('grupo'))
    if (grupo) return pantallaGrupoPerfil(perfil, grupo, camposPendientesPerfil(perfil))
    return pantallaHub(db, perfil, 'perfil', aviso)
  }

  // La hoja de acciones es una ruta, no un estado del navegador: se abre con un
  // enlace y «atrás» la cierra, que es como se cierra una hoja en una app.
  const hojaAbierta = url.searchParams.get('hoja') === 'acciones'

  if (seccion === 'programa' && url.searchParams.get('dia')) {
    // Sin recortar al rango: `dia=9` tiene que dar 404, no llevar en silencio
    // al día 4. Navegar a un sitio distinto del pedido rompe la vuelta atrás.
    const dia = Number(url.searchParams.get('dia'))
    if (!Number.isInteger(dia)) return noEncontrado('Día no encontrado')
    const rutina = await obtenerRutina(db, clienteId, dia)
    if (!rutina) return noEncontrado('Día no encontrado')

    if (url.searchParams.get('modo') === 'anadir') {
      if (rutina.slots.length >= MAX_EJERCICIOS) {
        return redirigir(ruta({ cliente: clienteId, seccion: 'programa', dia, aviso: 'Máximo de 8 ejercicios' }))
      }
      return pantallaBiblioteca(perfil, rutina, url.searchParams.get('q') ?? '')
    }

    const ordenEjercicio = url.searchParams.get('ejercicio')
    if (ordenEjercicio) {
      const slot = rutina.slots.find((item) => item.orden === Number(ordenEjercicio))
      if (!slot) return noEncontrado('Ejercicio no encontrado')
      // Cambiar el ejercicio de un slot abre la misma biblioteca buscable que
      // se usa para añadir: es la misma pregunta y merece la misma pantalla.
      if (url.searchParams.get('modo') === 'cambiar') {
        return pantallaBiblioteca(perfil, rutina, url.searchParams.get('q') ?? '', slot)
      }
      return pantallaEjercicio(perfil, rutina, slot, url.searchParams.get('confirmar') === 'quitar')
    }

    return pantallaDia(perfil, rutina, url.searchParams.get('modo') === 'reordenar', aviso)
  }

  return pantallaHub(db, perfil, seccion, aviso, '', 200, hojaAbierta)
}

export const onRequest: PagesFunction<Entorno> = async ({ request, env }) => {
  const accesoTemporal = estadoAccesoCoachTemporal(request, env)
  const tieneAccess = Boolean(request.headers.get(CABECERA_DE_ACCESS))

  // La excepción temporal ignora Access sólo mientras está activa. Si ya
  // venció, se cierra incluso ante una cabecera falsificada; para volver al
  // flujo normal hay que retirar la variable y reactivar la aplicación de
  // Cloudflare Access.
  if (accesoTemporal === 'caducado' || (accesoTemporal !== 'activo' && !tieneAccess)) {
    return pagina(
      `${barra({ titulo: 'No autorizado' })}
       <p class="vacio"><strong>No autorizado</strong>Esta consola sólo se abre a través de Cloudflare Access.</p>`,
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
      // Sin esto, reutilizar un identificador termina en el error de constraint
      // de SQLite delante del coach, que no dice cuál de los dos casos es.
      const ocupado = await estadoDelIdentificador(env.ACCESO, id)
      if (ocupado === 'activo') {
        return pantallaNuevoCliente(`Ya hay un cliente con el identificador «${id}». Elige otro.`)
      }
      if (ocupado === 'archivado') {
        return pantallaNuevoCliente(
          `El identificador «${id}» es de un cliente eliminado y su programación sigue guardada. Elige otro para no mezclarlas.`,
        )
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

    // Cambiar el ejercicio de un slot sin tocar su prescripción. Es la
    // escritura que respalda la biblioteca en modo «cambiar»: sustituye al
    // <select> de 33 opciones que llevaba el editor.
    if (accion === 'cambiar-ejercicio') {
      const dia = entero(formulario.get('dia'), 1, 1, 4)
      const orden = entero(formulario.get('orden'), 1, 1, MAX_EJERCICIOS)
      const rutina = await obtenerRutina(env.ACCESO, clienteId, dia)
      if (!rutina) return noEncontrado('Día no encontrado')
      const ejercicioId = String(formulario.get('ejercicio') ?? '')
      if (!CATALOGO_EJERCICIOS.some((item) => item.id === ejercicioId)) {
        return redirigir(ruta({ cliente: clienteId, seccion: 'programa', dia, ejercicio: orden, aviso: 'Elige un ejercicio válido' }))
      }
      const slots = rutina.slots.map((slot) => (slot.orden === orden ? { ...slot, ejercicioId } : slot))
      validarSlots(slots)
      await guardarRutina(env.ACCESO, { ...rutina, slots, actualizadoEn: Math.floor(Date.now() / 1000) })
      // Vuelve al editor, no al día: el coach vino de ahí y sigue editando.
      return redirigir(ruta({ cliente: clienteId, seccion: 'programa', dia, ejercicio: orden }))
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
        `<p class="aviso aviso--ok">Enlace de un solo uso. Caduca el ${escapar(caduca)};
         cópialo ahora, porque después sólo queda su huella en D1.</p>
         <div class="enlace-generado">${escapar(enlace)}</div>`,
      )
    }

    if (accion === 'eliminar-cliente') {
      const perfil = await obtenerPerfil(env.ACCESO, clienteId)
      if (!perfil) return noEncontrado()
      await archivarCliente(env.ACCESO, clienteId)
      // Se vuelve a la lista normal, no al modo edición: la tarea terminó.
      return redirigir(ruta({ aviso: `${perfil.nombre} ya no está en la lista` }))
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
      `${barra({ titulo: 'No se guardó', atras: ruta({}) })}
       <p class="aviso aviso--alerta" role="alert">${escapar(detalle)}</p>
       <a class="cta cta--suave" href="/admin/">Volver a clientes</a>`,
      400,
    )
  }

  return redirigir('/admin/')
}
