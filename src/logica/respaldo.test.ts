import { describe, test, expect } from 'vitest'
import {
  VERSION_RESPALDO,
  esRespaldoValido,
  formatearNombreDeArchivo,
} from './respaldo'

const respaldo = (parcial: Record<string, unknown> = {}) => ({
  version: VERSION_RESPALDO,
  exportadoEn: '2026-08-24T10:00:00.000Z',
  participante: { id: '001', nombre: 'Santiago' },
  plantillas: [],
  sesiones: [],
  series: [],
  progreso: [],
  sustituciones: [],
  ...parcial,
})

describe('validar un archivo de respaldo', () => {
  test('acepta uno completo', () => {
    expect(esRespaldoValido(respaldo())).toBe(true)
  })

  test('rechaza lo que no es un respaldo', () => {
    // Nunca se confía en un archivo que elige el usuario: puede ser cualquier
    // cosa, y restaurar basura encima de meses de entrenamiento no tiene vuelta.
    expect(esRespaldoValido(null)).toBe(false)
    expect(esRespaldoValido('texto')).toBe(false)
    expect(esRespaldoValido({})).toBe(false)
    expect(esRespaldoValido([1, 2, 3])).toBe(false)
  })

  test('rechaza uno de una versión que no sabe leer', () => {
    // Mejor negarse que importar a medias y dejar los datos inconsistentes.
    expect(esRespaldoValido(respaldo({ version: 999 }))).toBe(false)
  })

  test('rechaza uno sin participante', () => {
    expect(esRespaldoValido(respaldo({ participante: undefined }))).toBe(false)
  })

  test('rechaza uno donde las series no son una lista', () => {
    expect(esRespaldoValido(respaldo({ series: 'ninguna' }))).toBe(false)
  })

  test('admite que falten las fotos: son opcionales y pesan', () => {
    expect(esRespaldoValido(respaldo({ fotos: undefined }))).toBe(true)
  })
})

describe('nombre del archivo', () => {
  test('lleva el nombre del participante y la fecha, para no confundirlos', () => {
    expect(formatearNombreDeArchivo('Santiago', '2026-08-24')).toBe(
      'santiago-fitness-santiago-2026-08-24.json',
    )
  })

  test('un nombre con espacios o acentos sigue dando un archivo válido', () => {
    expect(formatearNombreDeArchivo('Ana María Pérez', '2026-08-24')).toBe(
      'santiago-fitness-ana-maria-perez-2026-08-24.json',
    )
  })

  test('un nombre vacío no deja el archivo sin identificar', () => {
    expect(formatearNombreDeArchivo('   ', '2026-08-24')).toBe(
      'santiago-fitness-participante-2026-08-24.json',
    )
  })
})
