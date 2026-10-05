import { describe, expect, it } from 'vitest'
import { coincide, normalizarBusqueda } from './busqueda'
import { PRESS_BANCA_15_SMITH } from '../datos/semilla/biblioteca'
import type { Ejercicio } from '../dominio/tipos'

describe('normalizarBusqueda', () => {
  it('encuentra una palabra con tilde escribiéndola sin ella', () => {
    // En un teclado de móvil casi nadie escribe la tilde, y sin esto
    // «elevacion» no encontraría «Elevación lateral».
    expect(normalizarBusqueda('Elevación')).toBe(normalizarBusqueda('elevacion'))
    expect(normalizarBusqueda('Aducción de cadera')).toContain('aduccion')
  })

  it('ignora mayúsculas y espacios de los extremos', () => {
    expect(normalizarBusqueda('  SMITH  ')).toBe('smith')
  })

  it('conserva los espacios interiores, que separan palabras', () => {
    expect(normalizarBusqueda('Press de banca')).toBe('press de banca')
  })

  it('deja pasar el texto vacío sin inventar nada', () => {
    expect(normalizarBusqueda('')).toBe('')
  })
})

describe('coincide: busca también por músculo y equipo', () => {
  // Muchos nombres de la Biblioteca Maestra están en inglés: quien escribe en
  // español tiene que encontrarlos igual.
  const hombro: Ejercicio = {
    ...PRESS_BANCA_15_SMITH,
    nombre: 'Selectorized Shoulder Press',
    musculoPrimario: 'deltoideAnterior',
    equipo: 'maquinaTradicional',
  }
  const cable: Ejercicio = { ...hombro, nombre: 'Cable Machine Shoulder Press', equipo: 'cable' }
  const hack: Ejercicio = { ...PRESS_BANCA_15_SMITH, nombre: 'Hack squat', musculoPrimario: 'cuadriceps' }

  it('«hombro» encuentra un press de hombro con nombre en inglés', () => {
    expect(coincide(hombro, normalizarBusqueda('hombro'))).toBe(true)
  })

  it('«polea» encuentra los ejercicios de cable', () => {
    expect(coincide(cable, normalizarBusqueda('polea'))).toBe(true)
    expect(coincide(hombro, normalizarBusqueda('polea'))).toBe(false)
  })

  it('el nombre sigue mandando: «hack» encuentra el hack squat', () => {
    expect(coincide(hack, normalizarBusqueda('hack'))).toBe(true)
    expect(coincide(hombro, normalizarBusqueda('hack'))).toBe(false)
  })

  it('sin acentos: «cuadriceps» encuentra Cuádriceps', () => {
    expect(coincide(hack, normalizarBusqueda('cuadriceps'))).toBe(true)
  })
})
