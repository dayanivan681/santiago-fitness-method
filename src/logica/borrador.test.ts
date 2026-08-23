import { describe, test, expect } from 'vitest'
import { idBorrador, type ClaveDeBorrador } from './borrador'

const clave = (parcial: Partial<ClaveDeBorrador> = {}): ClaveDeBorrador => ({
  participanteId: '001',
  fecha: '2026-08-23',
  plantillaDiaId: 'upper-a',
  orden: 1,
  numeroSerie: 2,
  ...parcial,
})

describe('identidad del borrador', () => {
  test('la misma serie da siempre la misma clave', () => {
    // Es lo que permite recuperar lo tecleado tras recargar.
    expect(idBorrador(clave())).toBe(idBorrador(clave()))
  })

  test('cada parte cambia la clave', () => {
    // Si alguna no entrara, dos huecos distintos compartirían borrador.
    const base = idBorrador(clave())

    expect(idBorrador(clave({ participanteId: '002' }))).not.toBe(base)
    expect(idBorrador(clave({ fecha: '2026-08-24' }))).not.toBe(base)
    expect(idBorrador(clave({ plantillaDiaId: 'lower-a' }))).not.toBe(base)
    expect(idBorrador(clave({ orden: 2 }))).not.toBe(base)
    expect(idBorrador(clave({ numeroSerie: 3 }))).not.toBe(base)
  })
})
