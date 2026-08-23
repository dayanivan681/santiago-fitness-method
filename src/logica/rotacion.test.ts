import { describe, test, expect } from 'vitest'
import { diaSugerido } from './rotacion'
import type { PlantillaDia, Sesion } from '../dominio/tipos'

const plantilla = (id: string, nombre: string, orden: number): PlantillaDia => ({
  id,
  nombre,
  orden,
  slots: [],
})

// §28: la estructura actual de 4 días, en su orden de rotación
const PLANTILLAS = [
  plantilla('upper-a', 'Upper A', 1),
  plantilla('lower-a', 'Lower A', 2),
  plantilla('upper-b', 'Upper B', 3),
  plantilla('lower-b', 'Lower B', 4),
]

const sesion = (plantillaDiaId: string, fecha: string): Sesion => ({
  id: `${plantillaDiaId}-${fecha}`,
  participanteId: '001',
  plantillaDiaId,
  fecha,
})

describe('diaSugerido (§28)', () => {
  test('arranca por el primer día cuando no hay sesiones', () => {
    expect(diaSugerido(PLANTILLAS, [])?.nombre).toBe('Upper A')
  })

  test('propone el día siguiente al de la última sesión', () => {
    const sesiones = [sesion('upper-a', '2026-08-17')]

    expect(diaSugerido(PLANTILLAS, sesiones)?.nombre).toBe('Lower A')
  })

  test('cierra el ciclo volviendo al primer día', () => {
    const sesiones = [sesion('lower-b', '2026-08-17')]

    expect(diaSugerido(PLANTILLAS, sesiones)?.nombre).toBe('Upper A')
  })

  test('se guía por la sesión más reciente, no por el orden de llegada', () => {
    // Arrange: la lista no viene ordenada por fecha
    const sesiones = [sesion('upper-b', '2026-08-17'), sesion('upper-a', '2026-08-10')]

    // Act
    const dia = diaSugerido(PLANTILLAS, sesiones)

    // Assert
    expect(dia?.nombre).toBe('Lower B')
  })

  test('vuelve al primer día si la última sesión usó una plantilla que ya no existe', () => {
    const sesiones = [sesion('plantilla-borrada', '2026-08-17')]

    expect(diaSugerido(PLANTILLAS, sesiones)?.nombre).toBe('Upper A')
  })

  test('devuelve undefined si no hay plantillas', () => {
    expect(diaSugerido([], [])).toBeUndefined()
  })
})
