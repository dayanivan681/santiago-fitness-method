import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { HojaVariantes } from './HojaVariantes'
import { ALTA_POR_DEFECTO, crearParticipante } from '../../logica/participante'
import { PRESS_BANCA_15_SMITH } from '../../datos/semilla/biblioteca'
import type { Repositorio } from '../../datos/repositorio'
import type { Ejercicio, Equipo } from '../../dominio/tipos'

afterEach(cleanup)

const ejercicio = (id: string, nombre: string, equipo: Equipo): Ejercicio => ({
  ...PRESS_BANCA_15_SMITH,
  id,
  nombre,
  equipo,
  movimiento: 'press-hombro',
})

const VARIANTES = [
  ejercicio('mancuerna-b', 'Seated Dumbbell Press', 'mancuernas'),
  ejercicio('smith', 'Smith Shoulder Press', 'smith'),
  ejercicio('mancuerna-a', 'Arnold Press', 'mancuernas'),
  ejercicio('hoy', 'Selectorized Shoulder Press', 'maquinaTradicional'),
  ejercicio('plantilla', 'Converging Shoulder Press', 'convergente'),
  ejercicio('push', 'Push Press', 'barraLibre'),
]

// El historial se lee con consultas en vivo de Dexie; aquí sólo importa el orden.
vi.mock('../../aplicacion/useEjerciciosEntrenados', () => ({
  useEjerciciosEntrenados: () => new Set(['push']),
}))
vi.mock('../../aplicacion/useReferenciasDeVariantes', () => ({
  useReferenciasDeVariantes: () => new Map(),
}))
const repositorio = {} as Repositorio

test('arriba la de hoy y la de la plantilla, luego las ya entrenadas y el resto agrupado por equipo', () => {
  render(
    <HojaVariantes
      variantes={VARIANTES}
      actualId="hoy"
      asignadaId="plantilla"
      rango={{ min: 6, max: 10 }}
      participante={crearParticipante(ALTA_POR_DEFECTO)}
      repositorio={repositorio}
      onElegir={() => {}}
      onCerrar={() => {}}
    />,
  )

  expect(screen.getByText('Ya entrenadas · 1')).toBeInTheDocument()
  const orden = [...document.querySelectorAll('.variante__nombre, .alternativas__grupo')].map(
    (e) => e.textContent,
  )
  expect(orden).toEqual([
    'Selectorized Shoulder Press',
    'Converging Shoulder Press',
    'Ya entrenadas · 1',
    'Push Press',
    'Mancuernas · 2',
    'Arnold Press',
    'Seated Dumbbell Press',
    'Máquina Smith · 1',
    'Smith Shoulder Press',
  ])
})
