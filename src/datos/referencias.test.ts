import { describe, test, expect } from 'vitest'
import { derivarReferencias, type SerieConFecha } from './referencias'
import { RANGO_POR_ESTIMULO } from '../dominio/estimulo'
import { siguienteObjetivo } from '../logica/sugerencia'
import type { PerfilCarga } from '../dominio/carga'

const HIPERTROFIA = RANGO_POR_ESTIMULO.hipertrofia

const total: PerfilCarga = { tipoCarga: 'total', incrementoMinimoLb: 2.5 }
const porLado: PerfilCarga = { tipoCarga: 'porLado', incrementoMinimoLb: 2.5 }

const serie = (
  fecha: string,
  numeroSerie: number,
  pesoRegistradoLb: number,
  repsRealizadas: number,
  rir = 2,
): SerieConFecha => ({
  id: `${fecha}-${numeroSerie}`,
  sesionId: fecha,
  ejercicioId: 'press-inclinado-smith',
  numeroSerie,
  pesoRegistradoLb,
  repsRealizadas,
  rir,
  fecha,
})

describe('derivarReferencias — sin historial', () => {
  test('devuelve referencias vacías la primera vez', () => {
    const referencias = derivarReferencias('press-inclinado-smith', [], total, HIPERTROFIA)

    expect(referencias).toEqual({
      ejercicioId: 'press-inclinado-smith',
      ultimaSesion: [],
    })
  })
})

describe('derivarReferencias — última sesión (§7)', () => {
  test('devuelve las series de la fecha más reciente, en orden', () => {
    // Arrange: dos sesiones, la segunda es la más reciente
    const historial = [
      serie('2026-08-10', 1, 100, 10),
      serie('2026-08-17', 2, 105, 9),
      serie('2026-08-17', 1, 105, 11),
    ]

    // Act
    const referencias = derivarReferencias('press-inclinado-smith', historial, total, HIPERTROFIA)

    // Assert
    expect(referencias.fechaUltimaSesion).toBe('2026-08-17')
    expect(referencias.ultimaSesion).toEqual([
      { cargaTotalLb: 105, reps: 11, rir: 2, tecnica: 'buena' },
      { cargaTotalLb: 105, reps: 9, rir: 2, tecnica: 'buena' },
    ])
  })

  test('normaliza a carga total según el tipo de carga (§17)', () => {
    // Arrange: 45 lb por lado son 90 lb totales
    const historial = [serie('2026-08-17', 1, 45, 10)]

    // Act
    const referencias = derivarReferencias('press-inclinado-smith', historial, porLado, HIPERTROFIA)

    // Assert
    expect(referencias.ultimaSesion[0].cargaTotalLb).toBe(90)
  })
})

describe('derivarReferencias — mejor referencia (§9)', () => {
  test('un día malo se guarda pero no borra la mejor referencia', () => {
    // Arrange: la sesión buena fue el día 10, la mala el día 17
    const historial = [
      serie('2026-08-10', 1, 100, 15),
      serie('2026-08-17', 1, 80, 8), // día malo, más reciente
    ]

    // Act
    const referencias = derivarReferencias('press-inclinado-smith', historial, total, HIPERTROFIA)

    // Assert: son dos datos diferentes y conviven
    expect(referencias.ultimaSesion).toEqual([{ cargaTotalLb: 80, reps: 8, rir: 2, tecnica: 'buena' }])
    expect(referencias.mejor).toEqual({ cargaTotalLb: 100, reps: 15, rir: 2, tecnica: 'buena' })
  })

  test('la mejor referencia se calcula sobre todo el historial, no sobre la última sesión', () => {
    // Arrange: tres sesiones donde la mejor está en el medio
    const historial = [
      serie('2026-08-03', 1, 95, 12),
      serie('2026-08-10', 1, 110, 12),
      serie('2026-08-17', 1, 100, 10),
    ]

    // Act
    const referencias = derivarReferencias('press-inclinado-smith', historial, total, HIPERTROFIA)

    // Assert
    expect(referencias.mejor).toEqual({ cargaTotalLb: 110, reps: 12, rir: 2, tecnica: 'buena' })
  })

  test('una sesión mejor sí actualiza la mejor referencia', () => {
    const historial = [serie('2026-08-10', 1, 100, 12), serie('2026-08-17', 1, 105, 12)]

    const referencias = derivarReferencias('press-inclinado-smith', historial, total, HIPERTROFIA)

    expect(referencias.mejor).toEqual({ cargaTotalLb: 105, reps: 12, rir: 2, tecnica: 'buena' })
  })
})

describe('el calentamiento no es referencia de nada (§7, §9)', () => {
  test('la última sesión ignora las series de aproximación', () => {
    // Arrange: la serie 1 fue calentamiento con poco peso
    const historial = [
      { ...serie('2026-08-17', 1, 20, 12), esCalentamiento: true },
      serie('2026-08-17', 2, 100, 10),
    ]

    // Act
    const referencias = derivarReferencias('press-inclinado-smith', historial, total, HIPERTROFIA)

    // Assert: si contara, "la última vez" mostraría la aproximación
    expect(referencias.ultimaSesion).toEqual([
      { cargaTotalLb: 100, reps: 10, rir: 2, tecnica: 'buena' },
    ])
  })

  test('un calentamiento con muchas reps no se convierte en la mejor marca', () => {
    const historial = [
      { ...serie('2026-08-10', 1, 20, 30), esCalentamiento: true },
      serie('2026-08-17', 1, 100, 10),
    ]

    const referencias = derivarReferencias('press-inclinado-smith', historial, total, HIPERTROFIA)

    expect(referencias.mejor).toEqual({
      cargaTotalLb: 100,
      reps: 10,
      rir: 2,
      tecnica: 'buena',
    })
  })
})

describe('el calentamiento tampoco mueve la recomendación', () => {
  test('una serie floja marcada como calentamiento no manda a "revisar / reducir"', () => {
    // Sin el filtro, un calentamiento de 2 reps quedaría por debajo del mínimo
    // del rango y la app diría que la carga fue excesiva, justo al revés.
    // Arrange
    const historial = [
      { ...serie('2026-08-17', 1, 20, 2), esCalentamiento: true },
      serie('2026-08-17', 2, 100, 12),
      serie('2026-08-17', 3, 100, 11),
    ]

    // Act
    const referencias = derivarReferencias('press-inclinado-smith', historial, total, HIPERTROFIA)
    const sugerencia = siguienteObjetivo(referencias.ultimaSesion, {
      rango: HIPERTROFIA,
      perfil: total,
      estimulo: 'hipertrofia',
      seriesObjetivo: 2,
    })

    // Assert
    expect(sugerencia).toEqual({ tipo: 'subirReps', repsObjetivo: 13 })
  })

  test('un calentamiento no completa las series que exige dominar la carga', () => {
    // Tres series en el tope, pero una era de aproximación: sólo cuentan dos,
    // así que con un plan de tres no hay subida.
    const historial = [
      { ...serie('2026-08-17', 1, 100, 15, 1), esCalentamiento: true },
      serie('2026-08-17', 2, 100, 15, 1),
      serie('2026-08-17', 3, 100, 15, 1),
    ]

    const referencias = derivarReferencias('press-inclinado-smith', historial, total, HIPERTROFIA)

    expect(
      siguienteObjetivo(referencias.ultimaSesion, {
        rango: HIPERTROFIA,
        perfil: total,
        estimulo: 'hipertrofia',
        seriesObjetivo: 3,
      }).tipo,
    ).toBe('mantener')
  })
})
