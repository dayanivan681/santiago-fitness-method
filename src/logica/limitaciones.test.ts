import { describe, test, expect } from 'vitest'
import {
  alternativasEquivalentes,
  debeEvitarse,
  dejarDeEvitar,
  evitar,
} from './limitaciones'
import type { Ejercicio, Participante } from '../dominio/tipos'

const ejercicio = (id: string, movimiento: string): Ejercicio => ({
  id,
  nombre: id,
  equipo: 'barraLibre',
  movimiento,
  imagen: '',
  explicacionCorta: '',
  musculoPrimario: 'deltoideAnterior',
  musculosSecundarios: [],
  tipoCarga: 'total',
  incrementoMinimoLb: 5,
})

const BIBLIOTECA = [
  ejercicio('press-militar-barra', 'pressVertical'),
  ejercicio('press-hombro-mancuernas', 'pressVertical'),
  ejercicio('press-hombro-maquina', 'pressVertical'),
  ejercicio('sentadilla', 'sentadilla'),
]

const participante = (evitados: readonly string[] = []): Participante => ({
  id: '001',
  nombre: 'Participante 001',
  sexo: 'masculino',
  edad: 30,
  estaturaCm: 175,
  pesoCorporalLb: 175,
  objetivo: 'Ganar fuerza',
  frecuenciaEntrenamiento: 4,
  limitaciones: 'Hombro derecho',
  ejerciciosEvitados: evitados,
})

describe('una limitación no es sólo texto (punto G)', () => {
  test('reconoce el ejercicio que el perfil dice evitar', () => {
    expect(debeEvitarse('press-militar-barra', participante(['press-militar-barra']))).toBe(
      true,
    )
  })

  test('un perfil sin limitaciones no prohíbe nada', () => {
    // Los participantes sembrados antes de que existiera el campo no lo tienen.
    const sinCampo = { ...participante(), ejerciciosEvitados: undefined }

    expect(debeEvitarse('press-militar-barra', sinCampo)).toBe(false)
  })
})

describe('alternativas equivalentes', () => {
  test('propone las del mismo movimiento', () => {
    const evitado = BIBLIOTECA[0]

    const alternativas = alternativasEquivalentes(
      evitado,
      BIBLIOTECA,
      participante(['press-militar-barra']),
    )

    expect(alternativas.map((e) => e.id)).toEqual([
      'press-hombro-mancuernas',
      'press-hombro-maquina',
    ])
  })

  test('no propone otra que el perfil también prohíbe', () => {
    // Sugerir un ejercicio prohibido sería peor que no sugerir nada.
    const alternativas = alternativasEquivalentes(
      BIBLIOTECA[0],
      BIBLIOTECA,
      participante(['press-militar-barra', 'press-hombro-mancuernas']),
    )

    expect(alternativas.map((e) => e.id)).toEqual(['press-hombro-maquina'])
  })

  test('no mezcla movimientos distintos', () => {
    const alternativas = alternativasEquivalentes(BIBLIOTECA[3], BIBLIOTECA, participante())

    expect(alternativas).toHaveLength(0)
  })
})

describe('mantener la lista', () => {
  test('evitar devuelve un perfil nuevo, sin tocar el anterior', () => {
    // Arrange
    const antes = participante()

    // Act
    const despues = evitar(antes, 'press-militar-barra')

    // Assert
    expect(despues.ejerciciosEvitados).toEqual(['press-militar-barra'])
    expect(antes.ejerciciosEvitados).toEqual([])
  })

  test('no duplica el mismo ejercicio', () => {
    const perfil = evitar(participante(['press-militar-barra']), 'press-militar-barra')

    expect(perfil.ejerciciosEvitados).toEqual(['press-militar-barra'])
  })

  test('dejar de evitar lo quita de la lista', () => {
    const perfil = dejarDeEvitar(
      participante(['press-militar-barra', 'sentadilla']),
      'press-militar-barra',
    )

    expect(perfil.ejerciciosEvitados).toEqual(['sentadilla'])
  })
})
