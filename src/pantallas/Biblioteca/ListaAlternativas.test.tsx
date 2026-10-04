import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import { ListaAlternativas } from './ListaAlternativas'
import { PRESS_BANCA_15_SMITH } from '../../datos/semilla/biblioteca'
import type { Ejercicio, Equipo } from '../../dominio/tipos'

afterEach(cleanup)

const ejercicio = (id: string, nombre: string, equipo: Equipo): Ejercicio => ({
  ...PRESS_BANCA_15_SMITH,
  id,
  nombre,
  equipo,
  movimiento: 'press-hombro',
})

const EQUIPOS: readonly Equipo[] = ['mancuernas', 'smith', 'barraLibre', 'maquinaTradicional', 'cable']
const DIECISEIS = Array.from({ length: 16 }, (_, i) =>
  ejercicio(`a${i}`, `Press ${String(i).padStart(2, '0')}`, EQUIPOS[i % EQUIPOS.length]),
)
const ABIERTO = ejercicio('abierto', 'Selectorized Shoulder Press', 'maquinaTradicional')
const filas = () => screen.queryAllByRole('button').filter((b) => b.classList.contains('variante'))

test('con 16 alternativas enseña 3 filas, las del mismo equipo primero, y un botón para ver todas', () => {
  render(<ListaAlternativas ejercicio={ABIERTO} alternativas={DIECISEIS} onElegir={() => {}} />)

  expect(screen.getByText('Alternativas (16)')).toBeInTheDocument()
  expect(filas()).toHaveLength(3)
  expect(filas()[0]).toHaveAccessibleName('Press 03')
  expect(filas()[0]).toHaveAccessibleDescription(
    'Máquina de pila (selectorizada)',
  )
  expect(screen.getByRole('button', { name: 'Ver las 16 alternativas' })).toBeInTheDocument()
})

test('«Ver las 16 alternativas» despliega todas agrupadas por equipo y «Ver menos» las recoge', async () => {
  render(<ListaAlternativas ejercicio={ABIERTO} alternativas={DIECISEIS} onElegir={() => {}} />)

  await userEvent.click(screen.getByRole('button', { name: 'Ver las 16 alternativas' }))

  expect(filas()).toHaveLength(16)
  expect(screen.getByText('Máquina de pila (selectorizada) · 3')).toBeInTheDocument()
  expect(screen.getByText('Mancuernas · 4')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Ver menos' }))
  expect(filas()).toHaveLength(3)
})

test('tocar una fila elige esa alternativa', async () => {
  const onElegir = vi.fn()
  render(<ListaAlternativas ejercicio={ABIERTO} alternativas={DIECISEIS.slice(0, 2)} onElegir={onElegir} />)

  await userEvent.click(screen.getByRole('button', { name: 'Press 01' }))

  expect(onElegir).toHaveBeenCalledWith(DIECISEIS[1])
})

test('con 2 alternativas no hay botón de ver más', () => {
  render(<ListaAlternativas ejercicio={ABIERTO} alternativas={DIECISEIS.slice(0, 2)} onElegir={() => {}} />)

  expect(filas()).toHaveLength(2)
  expect(screen.queryByRole('button', { name: /Ver las/ })).toBeNull()
})

test('sin alternativas lo dice', () => {
  render(<ListaAlternativas ejercicio={ABIERTO} alternativas={[]} onElegir={() => {}} />)

  expect(screen.getByText('No hay otra variante de este movimiento.')).toBeInTheDocument()
})
