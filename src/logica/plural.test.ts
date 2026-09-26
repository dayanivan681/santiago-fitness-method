import { describe, expect, it } from 'vitest'
import { segunCantidad } from './plural'

describe('etiqueta de una cifra', () => {
  it('uno va en singular', () => {
    expect(segunCantidad(1, 'Serie registrada', 'Series registradas')).toBe('Serie registrada')
  })

  it('el cero va en plural, como se dice en español', () => {
    expect(segunCantidad(0, 'Serie registrada', 'Series registradas')).toBe('Series registradas')
  })

  it('dos o más van en plural', () => {
    expect(segunCantidad(2, 'Serie registrada', 'Series registradas')).toBe('Series registradas')
    expect(segunCantidad(16, 'Serie registrada', 'Series registradas')).toBe('Series registradas')
  })
})
