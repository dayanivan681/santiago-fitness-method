import { describe, expect, it } from 'vitest'
import { DIAS_DE_GRACIA, estadoDeAcceso, filaDesdeStripe, type FilaSuscripcion } from './suscripcion'

const DIA = 24 * 60 * 60
const ahora = 1_800_000_000

function fila(cambios: Partial<FilaSuscripcion>): FilaSuscripcion {
  return {
    precio_id: 'price_mensual',
    stripe_customer_id: 'cus_1',
    stripe_subscription_id: 'sub_1',
    estado: 'active',
    periodo_fin: ahora + 10 * DIA,
    cancelar_al_final: 0,
    pausada: 0,
    exento: 0,
    ...cambios,
  }
}

describe('estadoDeAcceso', () => {
  it('sin fila o sin suscripción no puede entrenar', () => {
    expect(estadoDeAcceso(null, ahora)).toEqual({ estado: 'sin_suscripcion', puedeEntrenar: false })
    expect(estadoDeAcceso(fila({ stripe_subscription_id: null, estado: null, periodo_fin: null }), ahora))
      .toEqual({ estado: 'sin_suscripcion', puedeEntrenar: false })
  })

  it('exento siempre entrena, pague o no', () => {
    expect(estadoDeAcceso(fila({ exento: 1, estado: 'canceled' }), ahora)).toEqual({ estado: 'exenta', puedeEntrenar: true })
    expect(estadoDeAcceso(fila({ exento: 1, stripe_subscription_id: null, estado: null }), ahora).puedeEntrenar).toBe(true)
  })

  it('activa y en periodo entrena; cancelada al final sigue activa hasta el fin', () => {
    expect(estadoDeAcceso(fila({}), ahora)).toEqual({ estado: 'activa', puedeEntrenar: true })
    expect(estadoDeAcceso(fila({ estado: 'trialing' }), ahora).estado).toBe('activa')
    expect(estadoDeAcceso(fila({ cancelar_al_final: 1 }), ahora)).toEqual({ estado: 'activa', puedeEntrenar: true })
  })

  it('cobro fallido: gracia de 7 días desde el fin del periodo y después vencida', () => {
    const fin = ahora - 2 * DIA
    expect(estadoDeAcceso(fila({ estado: 'past_due', periodo_fin: fin }), ahora))
      .toEqual({ estado: 'gracia', puedeEntrenar: true, graciaHasta: fin + DIAS_DE_GRACIA * DIA })
    expect(estadoDeAcceso(fila({ estado: 'past_due', periodo_fin: ahora - 8 * DIA }), ahora))
      .toEqual({ estado: 'vencida', puedeEntrenar: false })
    expect(estadoDeAcceso(fila({ estado: 'unpaid', periodo_fin: ahora - 8 * DIA }), ahora).estado).toBe('vencida')
  })

  it('activa pero con el periodo ya pasado (webhook perdido) también usa la gracia', () => {
    expect(estadoDeAcceso(fila({ periodo_fin: ahora - DIA }), ahora).estado).toBe('gracia')
    expect(estadoDeAcceso(fila({ periodo_fin: ahora - 30 * DIA }), ahora).estado).toBe('vencida')
  })

  it('cancelada o expirada queda vencida; pausada por el coach no entrena', () => {
    expect(estadoDeAcceso(fila({ estado: 'canceled', periodo_fin: ahora - DIA }), ahora).estado).toBe('vencida')
    expect(estadoDeAcceso(fila({ estado: 'incomplete_expired' }), ahora).estado).toBe('sin_suscripcion')
    expect(estadoDeAcceso(fila({ pausada: 1 }), ahora)).toEqual({ estado: 'pausada', puedeEntrenar: false })
    expect(estadoDeAcceso(fila({ estado: 'paused' }), ahora).estado).toBe('pausada')
  })

  it('un pago inicial incompleto no da acceso', () => {
    expect(estadoDeAcceso(fila({ estado: 'incomplete' }), ahora)).toEqual({ estado: 'sin_suscripcion', puedeEntrenar: false })
  })
})

describe('filaDesdeStripe', () => {
  it('toma el fin del periodo del primer item y la pausa de pause_collection', () => {
    const sub = {
      id: 'sub_9', status: 'active', customer: 'cus_9', cancel_at_period_end: true,
      pause_collection: { behavior: 'void' },
      items: { data: [{ current_period_end: ahora + DIA, price: { id: 'price_9' } }] },
    }
    expect(filaDesdeStripe(sub)).toEqual({
      stripe_subscription_id: 'sub_9', stripe_customer_id: 'cus_9', estado: 'active',
      periodo_fin: ahora + DIA, cancelar_al_final: 1, pausada: 1, precio_id: 'price_9',
    })
  })

  it('acepta el customer expandido como objeto', () => {
    const sub = { id: 'sub_2', status: 'past_due', customer: { id: 'cus_2' }, cancel_at_period_end: false,
      pause_collection: null, items: { data: [{ current_period_end: ahora, price: { id: 'price_2' } }] } }
    expect(filaDesdeStripe(sub).stripe_customer_id).toBe('cus_2')
    expect(filaDesdeStripe(sub).pausada).toBe(0)
  })
})
