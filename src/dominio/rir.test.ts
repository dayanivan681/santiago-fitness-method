import { describe, test, expect } from 'vitest'
import { RIR_MAXIMO, formatearRir, siguienteRir } from './rir'

describe('RIR — escala 0–5+ del cliente (§14)', () => {
  test('del 0 al 4 se muestra tal cual', () => {
    for (let rir = 0; rir < RIR_MAXIMO; rir++) {
      expect(formatearRir(rir)).toBe(String(rir))
    }
  })

  test('el tope de la escala se muestra como "5+"', () => {
    // §14 dice explícitamente "escala 0–5+": el 5 no es un valor exacto, es
    // "cinco o más en reserva". Mostrar "5" a secas pierde ese matiz.
    expect(formatearRir(RIR_MAXIMO)).toBe('5+')
  })

  test('un valor guardado antes de que existiera el tope no rompe el formato', () => {
    // Series ya registradas podrían tener cualquier entero; no hay que fallar.
    expect(formatearRir(7)).toBe('7+')
  })
})

describe('ciclar el selector de RIR', () => {
  test('sube de uno en uno hasta el tope', () => {
    expect(siguienteRir(0)).toBe(1)
    expect(siguienteRir(4)).toBe(5)
  })

  test('del tope vuelve a cero, no sigue subiendo', () => {
    expect(siguienteRir(RIR_MAXIMO)).toBe(0)
  })
})
