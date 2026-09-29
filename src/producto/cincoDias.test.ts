import { describe, expect, it } from 'vitest'
import { Plan } from '../../shared/v2/contratos'
import { pasarACincoDias, puedePasarACincoDias } from './cincoDias'
import { planBase } from './servicio'

describe('pasar un programa de 4 días al split de 5', () => {
  const cuatro = { ...planBase('angel'), estado: 'publicado' as const, revisado: true }

  it('conserva ids, nombres y ejercicios, reordena L-U-L-U y añade Lower C', () => {
    const cinco = pasarACincoDias(cuatro, 'angel', 'dia-nuevo')
    expect(cinco.dias.map((d) => d.nombre)).toEqual(['Lower A', 'Upper A', 'Lower B', 'Upper B', 'Lower C'])
    expect(cinco.dias.map((d) => d.orden)).toEqual([1, 2, 3, 4, 5])
    for (const previo of cuatro.dias) {
      const ahora = cinco.dias.find((d) => d.id === previo.id)!
      expect(ahora.slots).toEqual(previo.slots)
      expect(ahora.nombre).toBe(previo.nombre)
    }
    expect(cinco.dias[4]).toMatchObject({ id: 'dia-nuevo', participanteId: 'angel', nombre: 'Lower C' })
    expect(cinco.revisado).toBe(false)
    expect(cuatro.dias.map((d) => d.nombre)).toEqual(['Upper A', 'Lower A', 'Upper B', 'Lower B'])
    const r = Plan.safeParse({ ...cinco, revisado: true })
    expect(r.success ? '' : JSON.stringify(r.error.issues)).toBe('')
  })

  it('sólo se ofrece con 4 días, 2 Lower y 2 Upper', () => {
    expect(puedePasarACincoDias(cuatro)).toBe(true)
    expect(puedePasarACincoDias(planBase('angel', 5))).toBe(false)
    expect(puedePasarACincoDias({ ...cuatro, dias: cuatro.dias.map((d, i) => (i === 0 ? { ...d, nombre: 'Pecho' } : d)) })).toBe(false)
    const intacto = { ...cuatro, dias: cuatro.dias.slice(0, 3) }
    expect(pasarACincoDias(intacto, 'angel')).toBe(intacto)
  })
})
