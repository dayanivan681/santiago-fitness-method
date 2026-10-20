import { describe, test, expect } from 'vitest'
import {
  crearSlot,
  reemplazarEjercicio,
  actualizarSlot,
  anadirSlot,
  rangoDeEjercicio,
  MAX_EJERCICIOS_POR_DIA,
} from './plantilla'
import { aplicarSustituciones } from './sustitucion'
import type { PlantillaDia } from '../dominio/tipos'

const UPPER_A: PlantillaDia = {
  id: 'upper-a',
  participanteId: '001',
  nombre: 'Upper A',
  orden: 1,
  slots: [
    crearSlot(1, 'press-banca-15-smith', 'fuerza', 4),
    crearSlot(2, 'press-inclinado-convergente', 'hipertrofia', 3),
    crearSlot(3, 'lat-pulldown-maquina', 'hipertrofia', 3),
  ],
}

const VACIA: PlantillaDia = { id: 'lower-a', participanteId: '001', nombre: 'Lower A', orden: 2, slots: [] }

describe('crearSlot (§4, §10–12)', () => {
  test('toma el rango y el descanso por defecto del estímulo', () => {
    const slot = crearSlot(1, 'sentadilla', 'fuerza', 4)

    expect(slot).toEqual({
      orden: 1,
      ejercicioId: 'sentadilla',
      estimulo: 'fuerza',
      seriesObjetivo: 4,
      repMin: 1,
      repMax: 5,
      descansoSegundos: 180,
    })
  })
})

describe('reemplazarEjercicio (§23)', () => {
  test('cambiar un ejercicio no destruye la estructura del entrenamiento', () => {
    // Arrange: el slot 2 es hipertrofia, 3 series, 6–15 reps
    const original = UPPER_A.slots[1]

    // Act
    const resultado = reemplazarEjercicio(UPPER_A, 2, 'press-inclinado-mancuernas')
    const nuevo = resultado.slots[1]

    // Assert: sólo cambia el ejercicio; todo lo demás se conserva
    expect(nuevo.ejercicioId).toBe('press-inclinado-mancuernas')
    expect(nuevo.orden).toBe(original.orden)
    expect(nuevo.estimulo).toBe(original.estimulo)
    expect(nuevo.seriesObjetivo).toBe(original.seriesObjetivo)
    expect(nuevo.repMin).toBe(original.repMin)
    expect(nuevo.repMax).toBe(original.repMax)
    expect(nuevo.descansoSegundos).toBe(original.descansoSegundos)
  })

  test('no toca los demás ejercicios del día', () => {
    const resultado = reemplazarEjercicio(UPPER_A, 2, 'otro-ejercicio')

    expect(resultado.slots[0]).toEqual(UPPER_A.slots[0])
    expect(resultado.slots[2]).toEqual(UPPER_A.slots[2])
  })

  test('no muta la plantilla original', () => {
    reemplazarEjercicio(UPPER_A, 2, 'otro-ejercicio')

    expect(UPPER_A.slots[1].ejercicioId).toBe('press-inclinado-convergente')
  })

  test('falla si la posición no existe', () => {
    expect(() => reemplazarEjercicio(UPPER_A, 9, 'x')).toThrow()
  })
})

describe('actualizarSlot (§23)', () => {
  test('cambia sólo lo que se le pasa', () => {
    // Act: el coach sube a 4 series y acorta el descanso
    const resultado = actualizarSlot(UPPER_A, 3, { seriesObjetivo: 4, descansoSegundos: 90 })
    const slot = resultado.slots[2]

    // Assert
    expect(slot.seriesObjetivo).toBe(4)
    expect(slot.descansoSegundos).toBe(90)
    expect(slot.ejercicioId).toBe('lat-pulldown-maquina')
    expect(slot.repMin).toBe(6)
    expect(slot.repMax).toBe(15)
  })

  test('permite ajustar el rango de repeticiones', () => {
    const resultado = actualizarSlot(UPPER_A, 1, { repMin: 3, repMax: 6 })

    expect(resultado.slots[0].repMin).toBe(3)
    expect(resultado.slots[0].repMax).toBe(6)
  })

  test('no deja cambiar el orden por accidente', () => {
    const resultado = actualizarSlot(UPPER_A, 1, { seriesObjetivo: 5 })

    expect(resultado.slots[0].orden).toBe(1)
  })
})

describe('anadirSlot (§4, §28)', () => {
  test('el primer ejercicio de un día vacío es de fuerza', () => {
    // §4: la posición 1 es fuerza
    const resultado = anadirSlot(VACIA, 'sentadilla')

    expect(resultado.slots).toHaveLength(1)
    expect(resultado.slots[0].orden).toBe(1)
    expect(resultado.slots[0].estimulo).toBe('fuerza')
  })

  test('las posiciones 2, 3 y 4 son de hipertrofia y la 5 de resistencia', () => {
    // Arrange + Act: se llena un día desde cero
    const lleno = ['a', 'b', 'c', 'd', 'e'].reduce(
      (plantilla, id) => anadirSlot(plantilla, id),
      VACIA,
    )

    // Assert: §4
    expect(lleno.slots.map((s) => s.estimulo)).toEqual([
      'fuerza',
      'hipertrofia',
      'hipertrofia',
      'hipertrofia',
      'resistencia',
    ])
  })

  test('admite una sesión de 8 ejercicios, no sólo de 5', () => {
    // El cliente pide sesiones de 5 a 8 sin tocar código: la estructura de §4
    // orienta las cinco primeras posiciones, no limita el día.
    // Arrange + Act
    const ocho = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].reduce(
      (plantilla, id) => anadirSlot(plantilla, id),
      VACIA,
    )

    // Assert
    expect(ocho.slots).toHaveLength(8)
    expect(ocho.slots.map((s) => s.orden)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  test('las posiciones más allá de la estructura entran como hipertrofia', () => {
    const ocho = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].reduce(
      (plantilla, id) => anadirSlot(plantilla, id),
      VACIA,
    )

    expect(ocho.slots.slice(5).map((s) => s.estimulo)).toEqual([
      'hipertrofia',
      'hipertrofia',
      'hipertrofia',
    ])
  })

  test('el día crece de 5 a 8 ejercicios, uno a la vez, sin tocar código', () => {
    // El cliente pide sesiones de 5 a 8: se comprueba cada tamaño intermedio,
    // no sólo el punto de partida y el tope.
    let plantilla = VACIA
    for (const [ejercicioId, tamano] of [
      ['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 5], ['f', 6], ['g', 7], ['h', 8],
    ] as const) {
      plantilla = anadirSlot(plantilla, ejercicioId)
      expect(plantilla.slots, `con ${tamano} ejercicios`).toHaveLength(tamano)
    }
  })

  test('no deja pasar de 8 ejercicios', () => {
    const lleno = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].reduce(
      (plantilla, id) => anadirSlot(plantilla, id),
      VACIA,
    )

    expect(lleno.slots).toHaveLength(MAX_EJERCICIOS_POR_DIA)
    expect(() => anadirSlot(lleno, 'i')).toThrow()
  })
})

describe('rangoDeEjercicio (§18)', () => {
  test('toma el rango con el que se está entrenando el ejercicio', () => {
    // El slot 1 es de fuerza: 1–5
    expect(rangoDeEjercicio([UPPER_A], 'press-banca-15-smith')).toEqual({ min: 1, max: 5 })
  })

  test('distingue el rango de cada posición', () => {
    expect(rangoDeEjercicio([UPPER_A], 'lat-pulldown-maquina')).toEqual({ min: 6, max: 15 })
  })

  test('recurre a hipertrofia si el coach ya sustituyó el ejercicio (§23)', () => {
    // Un ejercicio con historial puede haber salido de todas las plantillas.
    expect(rangoDeEjercicio([UPPER_A], 'ejercicio-retirado')).toEqual({ min: 6, max: 15 })
  })
})

test('el peso sugerido no se traslada al cambiar de ejercicio', () => {
  const plan = actualizarSlot(UPPER_A, 1, { pesoSugeridoLb: 42.5 })
  expect(actualizarSlot(plan, 1, { repMin: 3 }).slots[0].pesoSugeridoLb).toBe(42.5)
  expect(reemplazarEjercicio(plan, 1, 'otra-maquina').slots[0].pesoSugeridoLb).toBeUndefined()
  expect(plan.slots[0].pesoSugeridoLb).toBe(42.5)
})

test('la variante temporal no usa el peso sugerido de la original y volver lo recupera', () => {
  const plan = actualizarSlot(UPPER_A, 1, { pesoSugeridoLb: 42.5 })
  const temporal = aplicarSustituciones(plan, [{ id: 'cambio', participanteId: '001', fecha: '2026-09-15', plantillaDiaId: plan.id, orden: 1, ejercicioId: 'otra-maquina' }])
  expect(temporal.slots[0].pesoSugeridoLb).toBeUndefined()
  expect(aplicarSustituciones(plan, []).slots[0].pesoSugeridoLb).toBe(42.5)
})
