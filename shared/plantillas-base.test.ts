import { describe, expect, it } from 'vitest'
import { IDS_DE_EJERCICIOS } from './ejercicios-base'
import { PLANTILLAS_5_DIAS, PLANTILLAS_BASE } from './plantillas-base'
import { Plan } from './v2/contratos'
import { planBase } from '../src/producto/servicio'

describe('plantilla de 5 días Lower/Upper', () => {
  it('usa sólo ejercicios del catálogo fijo, en orden 1–5 y patrón L-U-L-U-L', () => {
    expect(PLANTILLAS_5_DIAS.map((d) => d.orden)).toEqual([1, 2, 3, 4, 5])
    expect(PLANTILLAS_5_DIAS.map((d) => d.nombre)).toEqual(['Lower A', 'Upper A', 'Lower B', 'Upper B', 'Lower C'])
    for (const d of PLANTILLAS_5_DIAS) {
      expect(d.slots.length).toBeGreaterThanOrEqual(5)
      expect(d.slots.length).toBeLessThanOrEqual(8)
      expect(d.slots.map((s) => s.orden)).toEqual(d.slots.map((_, i) => i + 1))
      for (const s of d.slots) expect(IDS_DE_EJERCICIOS.has(s.ejercicioId), s.ejercicioId).toBe(true)
    }
  })

  it('planBase respeta la frecuencia: 5 días con 5, los 4 de siempre con cualquier otra', () => {
    const cinco = planBase('ana', 5)
    expect(cinco.dias.map((d) => d.nombre)).toEqual(['Lower A', 'Upper A', 'Lower B', 'Upper B', 'Lower C'])
    const r = Plan.safeParse({ ...cinco, estado: 'publicado', revisado: true })
    expect(r.success ? '' : JSON.stringify(r.error.issues)).toBe('')
    for (const n of [undefined, 1, 3, 4, 6, 7])
      expect(planBase('ana', n).dias.map((d) => d.nombre)).toEqual(PLANTILLAS_BASE.map((d) => d.nombre))
  })
})
