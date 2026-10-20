import { describe, test, expect } from 'vitest'
import { sesionesDeSemana } from './semana'
import type { Sesion } from '../dominio/tipos'

function sesion(fecha: string, completada = true): Sesion {
  return { id: fecha, fecha, participanteId: 'persona', plantillaDiaId: 'dia',
    ...(completada ? { completadaEn: `${fecha}T23:00:00Z` } : {}) }
}

describe('sesiones de la semana local', () => {
  test('incluye lunes y domingo; excluye abiertas, semana anterior y fechas futuras', () => {
    const sesiones = [sesion('2026-10-11'), sesion('2026-10-12'), sesion('2026-10-18'),
      sesion('2026-10-15', false), sesion('2026-10-19')]
    expect(sesionesDeSemana(sesiones, new Date(2026, 9, 18, 23, 59))).toBe(2)
    expect(sesionesDeSemana(sesiones, new Date(2026, 9, 19, 0, 1))).toBe(1)
  })
  test('cruza mes y año sin usar la fecha UTC del instante', () => {
    expect(sesionesDeSemana([sesion('2025-12-28'), sesion('2025-12-29'), sesion('2026-01-01')], new Date(2026, 0, 1, 23, 59))).toBe(2)
    expect(sesionesDeSemana([], new Date(2026, 0, 1))).toBe(0)
  })
})
