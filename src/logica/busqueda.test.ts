import { describe, expect, it } from 'vitest'
import { normalizarBusqueda } from './busqueda'

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
