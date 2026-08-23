import { describe, test, expect } from 'vitest'
import { aCentimetros, aPiesYPulgadas, formatearEstatura } from './estatura'

describe('aPiesYPulgadas', () => {
  test('convierte 175 cm a 5 pies 9 pulgadas', () => {
    expect(aPiesYPulgadas(175)).toEqual({ pies: 5, pulgadas: 9 })
  })

  test('lleva las 12 pulgadas al pie siguiente', () => {
    // 183 cm son 72 pulgadas exactas: 6′ 0″, no 5′ 12″
    expect(aPiesYPulgadas(183)).toEqual({ pies: 6, pulgadas: 0 })
  })

  test('redondea a la pulgada más cercana', () => {
    expect(aPiesYPulgadas(170)).toEqual({ pies: 5, pulgadas: 7 })
  })
})

describe('aCentimetros', () => {
  test('convierte 5 pies 9 pulgadas a centímetros', () => {
    expect(aCentimetros({ pies: 5, pulgadas: 9 })).toBe(175)
  })

  test('ida y vuelta no arrastra el valor', () => {
    // Editar la estatura varias veces sin tocarla no debe moverla.
    let cm = 175
    for (let i = 0; i < 5; i += 1) {
      cm = aCentimetros(aPiesYPulgadas(cm))
    }

    expect(cm).toBe(175)
  })
})

describe('formatearEstatura', () => {
  test('usa prima y doble prima, como el diseño', () => {
    expect(formatearEstatura(175)).toBe('5′ 9″')
  })
})
