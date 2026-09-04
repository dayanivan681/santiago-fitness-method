import { describe, expect, it } from 'vitest'
import { CLIENTE_DE_PRUEBA_ABIERTA, modoPruebaAbierta } from './modoPrueba'

/**
 * El interruptor de la prueba abierta.
 *
 * Lo que se protege es que falle cerrado: abrir la aplicación entera tiene que
 * exigir la palabra exacta, porque el coste de equivocarse es que quede abierta
 * sin que nadie se entere.
 */

describe('modo de prueba abierta', () => {
  it('se abre sólo con la palabra exacta', () => {
    expect(modoPruebaAbierta({ PUBLIC_TEST_MODE: 'true' })).toBe(true)
  })

  it.each(['false', 'TRUE', 'True', '1', 'yes', 'si', ' true', 'true ', ''])(
    'sigue cerrada con %o',
    (valor) => {
      expect(modoPruebaAbierta({ PUBLIC_TEST_MODE: valor })).toBe(false)
    },
  )

  it('sin variable, cerrada', () => {
    // Un despliegue que olvide la variable deja a todo el mundo fuera, nunca
    // a todo el mundo dentro.
    expect(modoPruebaAbierta({})).toBe(false)
  })

  it('la identidad de prueba es la de Santiago, no una inventada', () => {
    // Probar con otro cliente sería probar otra app: sus rutinas son las que
    // tienen que verse.
    expect(CLIENTE_DE_PRUEBA_ABIERTA).toBe('santiago')
  })
})
