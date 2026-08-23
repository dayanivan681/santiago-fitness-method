import { describe, test, expect } from 'vitest'
import { aplicarSustituciones, idSustitucion } from './sustitucion'
import { crearSlot } from './plantilla'
import type { PlantillaDia, Sustitucion } from '../dominio/tipos'

const UPPER_A: PlantillaDia = {
  id: 'upper-a',
  nombre: 'Upper A',
  orden: 1,
  slots: [
    crearSlot(1, 'press-banca-15-smith', 'fuerza', 4),
    crearSlot(2, 'lat-pulldown', 'hipertrofia', 3),
  ],
}

const sustitucion = (parcial: Partial<Sustitucion> = {}): Sustitucion => ({
  id: idSustitucion('2026-08-22', 'upper-a', 1),
  fecha: '2026-08-22',
  plantillaDiaId: 'upper-a',
  orden: 1,
  ejercicioId: 'press-banca-barra',
  ...parcial,
})

describe('sustitución sólo por hoy', () => {
  test('cambia el ejercicio del día sin tocar la plantilla guardada', () => {
    // Arrange + Act
    const hoy = aplicarSustituciones(UPPER_A, [sustitucion()])

    // Assert: hoy se entrena la otra variante...
    expect(hoy.slots[0].ejercicioId).toBe('press-banca-barra')
    // ...y la plantilla original sigue intacta para mañana
    expect(UPPER_A.slots[0].ejercicioId).toBe('press-banca-15-smith')
  })

  test('conserva la estructura del slot (§23)', () => {
    const hoy = aplicarSustituciones(UPPER_A, [sustitucion()])

    expect(hoy.slots[0].estimulo).toBe(UPPER_A.slots[0].estimulo)
    expect(hoy.slots[0].seriesObjetivo).toBe(UPPER_A.slots[0].seriesObjetivo)
    expect(hoy.slots[0].repMin).toBe(UPPER_A.slots[0].repMin)
    expect(hoy.slots[0].repMax).toBe(UPPER_A.slots[0].repMax)
    expect(hoy.slots[0].descansoSegundos).toBe(UPPER_A.slots[0].descansoSegundos)
  })

  test('no toca las posiciones que nadie sustituyó', () => {
    const hoy = aplicarSustituciones(UPPER_A, [sustitucion()])

    expect(hoy.slots[1].ejercicioId).toBe('lat-pulldown')
  })

  test('ignora las sustituciones de otro día de la rotación', () => {
    // La misma posición 1, pero de Lower A: no puede colarse en Upper A.
    const ajena = sustitucion({ plantillaDiaId: 'lower-a', ejercicioId: 'sentadilla' })

    expect(aplicarSustituciones(UPPER_A, [ajena])).toEqual(UPPER_A)
  })

  test('sin sustituciones devuelve la plantilla tal cual', () => {
    expect(aplicarSustituciones(UPPER_A, [])).toBe(UPPER_A)
  })
})

describe('identidad de la sustitución', () => {
  test('una posición sólo puede tener una sustitución por día', () => {
    // Al cambiar dos veces de opinión, la segunda pisa a la primera en vez de
    // acumularse: el id no depende del ejercicio elegido.
    expect(idSustitucion('2026-08-22', 'upper-a', 1)).toBe(
      idSustitucion('2026-08-22', 'upper-a', 1),
    )
    expect(idSustitucion('2026-08-23', 'upper-a', 1)).not.toBe(
      idSustitucion('2026-08-22', 'upper-a', 1),
    )
  })
})
