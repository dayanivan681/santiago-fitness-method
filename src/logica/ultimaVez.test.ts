import { describe, expect, it } from 'vitest'
import { resumirUltimaVez } from './ultimaVez'
import type { PerfilCarga } from '../dominio/carga'
import type { SerieComparable } from '../dominio/tipos'

/**
 * El resumen de "Última vez".
 *
 * Lo que se protege es que la línea diga lo que de verdad pasó: antes se
 * enseñaba sólo la primera serie de la última sesión, que en un ejercicio de
 * cuatro es justo la menos representativa.
 */

const BARRA: PerfilCarga = { tipoCarga: 'total', incrementoMinimoLb: 5 }
const POR_LADO: PerfilCarga = { tipoCarga: 'porLado', incrementoMinimoLb: 2.5 }

const serie = (cargaTotalLb: number, reps: number): SerieComparable => ({
  cargaTotalLb,
  reps,
  rir: 2,
  tecnica: 'buena',
})

describe('resumir la última vez', () => {
  it('sin historial no inventa nada', () => {
    expect(resumirUltimaVez([], BARRA)).toBeNull()
  })

  it('una sola serie se dice tal cual', () => {
    expect(resumirUltimaVez([serie(135, 10)], BARRA)).toBe('135 lb × 10')
  })

  it('varias series idénticas se agrupan', () => {
    // Arrange
    const series = [serie(135, 10), serie(135, 10), serie(135, 10)]

    // Act + Assert: "3 ×" dice más que repetir la misma cifra tres veces.
    expect(resumirUltimaVez(series, BARRA)).toBe('3 × 135 lb × 10')
  })

  it('mismo peso con repeticiones que caen: se listan las reps', () => {
    // Es el caso corriente al fallar en las últimas series, y el que más
    // información da de un vistazo.
    const series = [serie(135, 10), serie(135, 10), serie(135, 8)]

    expect(resumirUltimaVez(series, BARRA)).toBe('135 lb × 10, 10, 8')
  })

  it('pesos distintos: cada serie con el suyo y la unidad una sola vez', () => {
    const series = [serie(135, 10), serie(140, 8), serie(140, 6)]

    expect(resumirUltimaVez(series, BARRA)).toBe('135 × 10 · 140 × 8 · 140 × 6 lb')
  })

  it('respeta la carga por lado, que es lo que el participante pone en la barra', () => {
    // 270 totales son 135 por lado: enseñar 270 sería decirle que cargue el
    // doble.
    expect(resumirUltimaVez([serie(270, 10)], POR_LADO)).toBe('135 lb/lado × 10')
  })

  it('no arrastra decimales de coma flotante', () => {
    expect(resumirUltimaVez([serie(85, 5)], POR_LADO)).toBe('42.5 lb/lado × 5')
  })
})
