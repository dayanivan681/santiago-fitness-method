/**
 * Suscripciones con Stripe.
 *
 * Falla cerrado: sin las dos claves no hay cobro, y una clave real (`sk_live_`)
 * se rechaza mientras el dueño no apruebe expresamente el modo real con
 * STRIPE_MODO_REAL=true. En producción, además, hace falta STRIPE_HABILITADO,
 * igual que Google, para poder probar primero en preview.
 *
 * El webhook no se fía del contenido del evento: vuelve a leer la suscripción
 * en Stripe y guarda esa copia. Así el orden de llegada y los reintentos no
 * pueden dejar un estado viejo.
 */
import Stripe from 'stripe'
import { estadoDeAcceso, filaDesdeStripe, type FilaSuscripcion, type SuscripcionStripe } from './suscripcion'

export type EntornoStripe = {
  SFM_ENV?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_HABILITADO?: string
  STRIPE_MODO_REAL?: string
}

export class ErrorSuscripcion extends Error {
  readonly status: number
  constructor(mensaje: string, status = 400) {
    super(mensaje)
    this.status = status
  }
}

const PREFIJOS_DE_PRUEBA = ['sk_test_', 'rk_test_']

/** Suscripciones que ya no cobran: se puede empezar una nueva. */
const TERMINADAS = new Set(['canceled', 'incomplete', 'incomplete_expired'])

export function stripeConfigurado(env: EntornoStripe): boolean {
  const clave = env.STRIPE_SECRET_KEY ?? ''
  if (!clave || !env.STRIPE_WEBHOOK_SECRET) return false
  const esPrueba = PREFIJOS_DE_PRUEBA.some((p) => clave.startsWith(p))
  if (!esPrueba && env.STRIPE_MODO_REAL !== 'true') return false
  if (env.SFM_ENV === 'production' && env.STRIPE_HABILITADO !== 'true') return false
  return true
}

/** `fetch` inyectable para probar sin red. */
export function crearStripe(env: EntornoStripe, fetchImpl?: typeof fetch): Stripe {
  if (!stripeConfigurado(env)) throw new ErrorSuscripcion('Los pagos no están disponibles todavía.', 503)
  return new Stripe(env.STRIPE_SECRET_KEY!, {
    httpClient: Stripe.createFetchHttpClient(fetchImpl),
    maxNetworkRetries: 1,
  })
}

const COLUMNAS = 'precio_id, stripe_customer_id, stripe_subscription_id, estado, periodo_fin, cancelar_al_final, pausada, exento'

export async function leerSuscripcion(db: D1Database, clienteId: string): Promise<FilaSuscripcion | null> {
  return db.prepare(`SELECT ${COLUMNAS} FROM suscripciones WHERE cliente_id=?`).bind(clienteId).first<FilaSuscripcion>()
}

function ahoraEnSegundos(): number {
  return Math.floor(Date.now() / 1000)
}

/** Guarda lo que dice Stripe sin tocar `exento`, que es decisión del coach. */
async function guardarDesdeStripe(db: D1Database, clienteId: string, sub: SuscripcionStripe): Promise<void> {
  const f = filaDesdeStripe(sub)
  await db.prepare(
    `INSERT INTO suscripciones (cliente_id, precio_id, stripe_customer_id, stripe_subscription_id, estado, periodo_fin, cancelar_al_final, pausada, actualizado_en)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
     ON CONFLICT(cliente_id) DO UPDATE SET precio_id=excluded.precio_id, stripe_customer_id=excluded.stripe_customer_id,
       stripe_subscription_id=excluded.stripe_subscription_id, estado=excluded.estado, periodo_fin=excluded.periodo_fin,
       cancelar_al_final=excluded.cancelar_al_final, pausada=excluded.pausada, actualizado_en=excluded.actualizado_en`,
  ).bind(clienteId, f.precio_id, f.stripe_customer_id, f.stripe_subscription_id, f.estado, f.periodo_fin,
    f.cancelar_al_final, f.pausada, ahoraEnSegundos()).run()
}

async function asegurarFila(db: D1Database, clienteId: string): Promise<void> {
  await db.prepare('INSERT OR IGNORE INTO suscripciones (cliente_id, actualizado_en) VALUES (?, ?)')
    .bind(clienteId, ahoraEnSegundos()).run()
}

export type Precio = { id: string; nombre: string; importe: number | null; moneda: string; intervalo: string }

export async function listarPrecios(stripe: Stripe): Promise<Precio[]> {
  const { data } = await stripe.prices.list({ active: true, type: 'recurring', limit: 20, expand: ['data.product'] })
  return data.map((p) => ({
    id: p.id,
    nombre: typeof p.product === 'object' && p.product && 'name' in p.product ? p.product.name : p.nickname ?? p.id,
    importe: p.unit_amount,
    moneda: p.currency,
    intervalo: p.recurring?.interval ?? 'month',
  }))
}

/** El coach elige el precio. Se valida en Stripe para no guardar un id inventado. */
export async function asignarPrecio(db: D1Database, stripe: Stripe, clienteId: string, precioId: string): Promise<void> {
  const precio = await stripe.prices.retrieve(precioId).catch(() => null)
  if (!precio?.active || precio.type !== 'recurring') throw new ErrorSuscripcion('Ese precio no existe o no es mensual/recurrente.')
  await asegurarFila(db, clienteId)
  await db.prepare('UPDATE suscripciones SET precio_id=?, actualizado_en=? WHERE cliente_id=?')
    .bind(precioId, ahoraEnSegundos(), clienteId).run()
}

export async function marcarExento(db: D1Database, clienteId: string, exento: boolean): Promise<void> {
  await asegurarFila(db, clienteId)
  await db.prepare('UPDATE suscripciones SET exento=?, actualizado_en=? WHERE cliente_id=?')
    .bind(exento ? 1 : 0, ahoraEnSegundos(), clienteId).run()
}

/**
 * Enlace de pago de Stripe Checkout para el precio que eligió el coach.
 * Lo usan el propio cliente y el coach (para mandárselo). Nunca crea una
 * segunda suscripción si ya hay una que se puede mantener.
 */
export async function crearPago(db: D1Database, stripe: Stripe, clienteId: string, origen: string): Promise<string> {
  const fila = await leerSuscripcion(db, clienteId)
  if (!fila?.precio_id) throw new ErrorSuscripcion('El coach todavía no ha elegido el plan de este cliente.', 409)
  if (fila.stripe_subscription_id && fila.estado && !TERMINADAS.has(fila.estado)) {
    throw new ErrorSuscripcion('Ya hay una suscripción en curso. Gestiónala desde «Gestionar pago».', 409)
  }
  const cuenta = await db.prepare('SELECT email FROM cuentas WHERE cliente_id=?').bind(clienteId).first<{ email: string }>()
  const sesion = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: fila.precio_id, quantity: 1 }],
    client_reference_id: clienteId,
    subscription_data: { metadata: { cliente_id: clienteId } },
    ...(fila.stripe_customer_id
      ? { customer: fila.stripe_customer_id }
      : cuenta ? { customer_email: cuenta.email } : {}),
    success_url: `${origen}/?suscripcion=ok`,
    cancel_url: `${origen}/?suscripcion=cancelada`,
  })
  if (!sesion.url) throw new ErrorSuscripcion('Stripe no devolvió el enlace de pago.', 502)
  return sesion.url
}

/** Portal de Stripe: tarjeta, facturas y cancelación, sin datos de tarjeta aquí. */
export async function crearPortal(db: D1Database, stripe: Stripe, clienteId: string, origen: string): Promise<string> {
  const fila = await leerSuscripcion(db, clienteId)
  if (!fila?.stripe_customer_id) throw new ErrorSuscripcion('Todavía no hay pagos que gestionar.', 409)
  const portal = await stripe.billingPortal.sessions.create({ customer: fila.stripe_customer_id, return_url: `${origen}/` })
  return portal.url
}

export type AccionDelCoach = 'pausar' | 'reanudar' | 'cancelar' | 'mantener'

const CAMBIOS: Record<AccionDelCoach, Stripe.SubscriptionUpdateParams> = {
  pausar: { pause_collection: { behavior: 'void' } },
  reanudar: { pause_collection: '' },
  cancelar: { cancel_at_period_end: true },
  mantener: { cancel_at_period_end: false },
}

export async function accionDelCoach(db: D1Database, stripe: Stripe, clienteId: string, accion: AccionDelCoach): Promise<void> {
  const fila = await leerSuscripcion(db, clienteId)
  if (!fila?.stripe_subscription_id) throw new ErrorSuscripcion('Este cliente no tiene una suscripción en Stripe.', 409)
  const sub = await stripe.subscriptions.update(fila.stripe_subscription_id, CAMBIOS[accion])
  await guardarDesdeStripe(db, clienteId, sub as unknown as SuscripcionStripe)
}

export type ResumenSuscripcion = {
  clienteId: string
  precioId: string | null
  estadoStripe: string | null
  periodoFin: number | null
  cancelarAlFinal: boolean
  exento: boolean
  acceso: ReturnType<typeof estadoDeAcceso>
}

export function resumir(clienteId: string, fila: FilaSuscripcion | null, ahora = ahoraEnSegundos()): ResumenSuscripcion {
  return {
    clienteId,
    precioId: fila?.precio_id ?? null,
    estadoStripe: fila?.estado ?? null,
    periodoFin: fila?.periodo_fin ?? null,
    cancelarAlFinal: !!fila?.cancelar_al_final,
    exento: !!fila?.exento,
    acceso: estadoDeAcceso(fila, ahora),
  }
}

export async function suscripcionesDeClientes(db: D1Database): Promise<ResumenSuscripcion[]> {
  const { results } = await db.prepare(
    `SELECT c.id AS cliente_id, ${COLUMNAS.split(', ').map((col) => `s.${col}`).join(', ')}
     FROM clientes c LEFT JOIN suscripciones s ON s.cliente_id=c.id WHERE c.activo=1`,
  ).all<FilaSuscripcion & { cliente_id: string; exento: number | null }>()
  return results.map((r) => resumir(r.cliente_id, r.exento === null ? null : r))
}

/** Busca a qué cliente pertenece una suscripción: metadata, y si falta, la tabla. */
async function clienteDeSuscripcion(db: D1Database, sub: Stripe.Subscription): Promise<string | null> {
  const porMetadata = sub.metadata?.cliente_id
  if (porMetadata) return porMetadata
  const fila = await db.prepare('SELECT cliente_id FROM suscripciones WHERE stripe_subscription_id=?').bind(sub.id).first<{ cliente_id: string }>()
  return fila?.cliente_id ?? null
}

async function clienteExiste(db: D1Database, clienteId: string): Promise<boolean> {
  return !!(await db.prepare('SELECT id FROM clientes WHERE id=?').bind(clienteId).first())
}

async function refrescar(db: D1Database, stripe: Stripe, subscriptionId: string, clientePropuesto: string | null): Promise<void> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId)
  const clienteId = clientePropuesto ?? await clienteDeSuscripcion(db, sub)
  if (!clienteId || !(await clienteExiste(db, clienteId))) return
  // Una suscripción ya ligada a otro cliente no se reasigna por un evento.
  const ligada = await db.prepare('SELECT cliente_id FROM suscripciones WHERE stripe_subscription_id=?').bind(sub.id).first<{ cliente_id: string }>()
  if (ligada && ligada.cliente_id !== clienteId) return
  await guardarDesdeStripe(db, clienteId, sub as unknown as SuscripcionStripe)
}

const EVENTOS_DE_SUSCRIPCION = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
])

/**
 * Webhook firmado de Stripe. Devuelve el código HTTP: 400 si la firma no vale
 * (Stripe no reintenta), 500 si falla el proceso (Stripe reintenta), 200 si se
 * guardó o si el evento ya se había procesado.
 */
export async function procesarWebhook(request: Request, db: D1Database, stripe: Stripe, secreto: string): Promise<number> {
  const firma = request.headers.get('stripe-signature')
  if (!firma) return 400
  const cuerpo = await request.text()
  let evento: Stripe.Event
  try {
    evento = await stripe.webhooks.constructEventAsync(cuerpo, firma, secreto, undefined, Stripe.createSubtleCryptoProvider())
  } catch {
    return 400
  }
  if (await db.prepare('SELECT id FROM eventos_stripe WHERE id=?').bind(evento.id).first()) return 200

  if (evento.type === 'checkout.session.completed') {
    const sesion = evento.data.object
    const sub = typeof sesion.subscription === 'string' ? sesion.subscription : sesion.subscription?.id
    if (sesion.mode === 'subscription' && sub) await refrescar(db, stripe, sub, sesion.client_reference_id ?? null)
  } else if (EVENTOS_DE_SUSCRIPCION.has(evento.type)) {
    const sub = evento.data.object as Stripe.Subscription
    await refrescar(db, stripe, sub.id, null)
  }
  await db.prepare('INSERT OR IGNORE INTO eventos_stripe (id, tipo, recibido_en) VALUES (?, ?, ?)')
    .bind(evento.id, evento.type, ahoraEnSegundos()).run()
  return 200
}
