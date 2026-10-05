import { describe, expect, test } from 'vitest'
import {
  SIN_FILTROS,
  agruparPorMusculo,
  cuantosFiltros,
  visiblesDeBiblioteca,
} from './filtrosBiblioteca'
import { PRESS_BANCA_15_SMITH } from '../datos/semilla/biblioteca'
import type { Ejercicio, Equipo, Musculo } from '../dominio/tipos'

const ejercicio = (id: string, nombre: string, musculoPrimario: Musculo, equipo: Equipo): Ejercicio => ({
  ...PRESS_BANCA_15_SMITH,
  id,
  nombre,
  musculoPrimario,
  equipo,
})

const LISTA = [
  ejercicio('a', 'Selectorized Shoulder Press', 'deltoideAnterior', 'maquinaTradicional'),
  ejercicio('b', 'Cable Fly', 'pecho', 'cable'),
  ejercicio('c', 'Chest Press selectorizado', 'pecho', 'maquinaTradicional'),
  ejercicio('d', 'Bench Press con barra', 'pecho', 'barraLibre'),
  ejercicio('e', 'Mi remo', 'espalda', 'cable'),
]

describe('filtros de la biblioteca', () => {
  test('músculo y equipo se suman', () => {
    const visibles = visiblesDeBiblioteca(LISTA, '', { ...SIN_FILTROS, musculo: 'pecho', equipo: 'maquinaTradicional' })
    expect(visibles.map((e) => e.id)).toEqual(['c'])
  })

  test('«Solo mis ejercicios» deja los propios', () => {
    const visibles = visiblesDeBiblioteca(LISTA, '', { ...SIN_FILTROS, soloMios: true }, (e) => e.id === 'e')
    expect(visibles.map((e) => e.id)).toEqual(['e'])
  })

  test('buscar manda sobre los filtros y encuentra por músculo o equipo', () => {
    const visibles = visiblesDeBiblioteca(LISTA, 'polea', { ...SIN_FILTROS, musculo: 'deltoideAnterior' })
    expect(visibles.map((e) => e.nombre)).toEqual(['Cable Fly', 'Mi remo'])
  })

  test('cuenta los filtros puestos', () => {
    expect(cuantosFiltros(SIN_FILTROS)).toBe(0)
    expect(cuantosFiltros({ musculo: 'pecho', equipo: 'cable', soloMios: true })).toBe(3)
  })
})

describe('agrupación por músculo', () => {
  test('grupos por nombre del músculo y, dentro, por nombre del ejercicio', () => {
    const grupos = agruparPorMusculo(visiblesDeBiblioteca(LISTA, '', SIN_FILTROS))

    expect(grupos.map(([m]) => m)).toEqual(['espalda', 'deltoideAnterior', 'pecho'])
    expect(grupos[2][1].map((e) => e.nombre)).toEqual([
      'Bench Press con barra',
      'Cable Fly',
      'Chest Press selectorizado',
    ])
  })
})
