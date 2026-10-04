import { describe, expect, test } from 'vitest'
import { agruparPorEquipo, ordenarAlternativas } from './alternativas'
import { PRESS_BANCA_15_SMITH } from '../datos/semilla/biblioteca'
import type { Ejercicio, Equipo } from '../dominio/tipos'

const ejercicio = (id: string, nombre: string, equipo: Equipo): Ejercicio => ({
  ...PRESS_BANCA_15_SMITH,
  id,
  nombre,
  equipo,
  movimiento: 'press-hombro',
})

// Las 16 alternativas de press de hombro que deja la Biblioteca Maestra.
const ALTERNATIVAS: readonly Ejercicio[] = [
  ejercicio('a1', 'Seated Dumbbell Press', 'mancuernas'),
  ejercicio('a2', 'Arnold Press', 'mancuernas'),
  ejercicio('a3', 'Standing Dumbbell Press', 'mancuernas'),
  ejercicio('a4', 'Smith Machine Shoulder Press', 'smith'),
  ejercicio('a5', 'Smith Machine Behind-the-Neck Press', 'smith'),
  ejercicio('a6', 'Overhead Barbell Press', 'barraLibre'),
  ejercicio('a7', 'Push Press', 'barraLibre'),
  ejercicio('a8', 'Machine Shoulder Press (pin)', 'maquinaTradicional'),
  ejercicio('a9', 'Converging Shoulder Press', 'convergente'),
  ejercicio('a10', 'Hammer Strength Shoulder Press', 'maquinaDiscos'),
  ejercicio('a11', 'Cable Shoulder Press', 'cable'),
  ejercicio('a12', 'Landmine Press', 'barraLibre'),
  ejercicio('a13', 'Pike Push-up', 'pesoCorporal'),
  ejercicio('a14', 'Single-arm Cable Press', 'cable'),
  ejercicio('a15', 'Plate-loaded Overhead Press', 'maquinaDiscos'),
  ejercicio('a16', 'Assisted Shoulder Press', 'maquinaTradicional'),
]
const ABIERTO = ejercicio('abierto', 'Selectorized Shoulder Press', 'maquinaTradicional')

describe('orden de las alternativas', () => {
  test('primero las del mismo equipo que el ejercicio abierto, luego el resto por nombre', () => {
    const orden = ordenarAlternativas(ABIERTO, ALTERNATIVAS).map((e) => e.nombre)

    expect(orden.slice(0, 2)).toEqual(['Assisted Shoulder Press', 'Machine Shoulder Press (pin)'])
    expect(orden.slice(2, 5)).toEqual(['Arnold Press', 'Cable Shoulder Press', 'Converging Shoulder Press'])
    expect(orden).toHaveLength(16)
  })

  test('con historial, las ya entrenadas van delante de todo', () => {
    const orden = ordenarAlternativas(ABIERTO, ALTERNATIVAS, new Set(['a7', 'a2']))

    expect(orden.slice(0, 3).map((e) => e.nombre)).toEqual([
      'Arnold Press',
      'Push Press',
      'Assisted Shoulder Press',
    ])
  })

  test('no modifica la lista recibida', () => {
    const copia = [...ALTERNATIVAS]
    ordenarAlternativas(ABIERTO, ALTERNATIVAS)
    expect(ALTERNATIVAS).toEqual(copia)
  })
})

describe('agrupación por equipo', () => {
  test('respeta el orden de aparición y no repite equipos', () => {
    const grupos = agruparPorEquipo(ordenarAlternativas(ABIERTO, ALTERNATIVAS))
    const equipos = grupos.map(([equipo]) => equipo)

    expect(equipos[0]).toBe('maquinaTradicional')
    expect(new Set(equipos).size).toBe(equipos.length)
    expect(grupos.flatMap(([, suyos]) => suyos)).toHaveLength(16)
    expect(grupos.find(([e]) => e === 'mancuernas')?.[1].map((e) => e.nombre)).toEqual([
      'Arnold Press',
      'Seated Dumbbell Press',
      'Standing Dumbbell Press',
    ])
  })

  test('sin alternativas no hay grupos', () => {
    expect(agruparPorEquipo([])).toEqual([])
  })
})
