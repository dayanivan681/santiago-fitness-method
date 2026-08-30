import { describe, expect, it } from 'vitest'
import { resumen, tokenNuevo } from './cripto'
import {
  cabeceraDeCookieBorrada,
  crearCabeceraDeCookie,
  leerCookie,
  NOMBRE_DE_COOKIE,
  VIDA_DE_SESION,
} from './sesion'
import { VIDA_DE_INVITACION } from './invitacion'

/**
 * Pruebas de la parte pura de la autenticación. Lo que toca D1 se comprueba
 * contra la base real en los tests A–K, porque lo que hay que verificar allí es
 * precisamente que SQLite aplique la atomicidad — un doble falso no lo probaría.
 */

describe('tokens', () => {
  it('genera 256 bits en base64url, sin relleno ni caracteres a escapar', () => {
    // Arrange + Act
    const token = tokenNuevo()

    // Assert: 32 bytes en base64 son 43 caracteres sin el '='
    expect(token).toHaveLength(43)
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('no repite tokens', () => {
    // Arrange + Act
    const tokens = new Set(Array.from({ length: 500 }, () => tokenNuevo()))

    // Assert
    expect(tokens.size).toBe(500)
  })

  it('no deja rastro del nombre del cliente en el token', () => {
    // El enunciado lo pide explícitamente: nada predecible dentro.
    const token = tokenNuevo()

    expect(token.toLowerCase()).not.toContain('santiago')
    expect(token.toLowerCase()).not.toContain('coach')
  })
})

describe('resumen', () => {
  it('es estable para el mismo valor', async () => {
    // Sin esto, validar un token contra la base sería imposible.
    const token = tokenNuevo()

    expect(await resumen(token)).toBe(await resumen(token))
  })

  it('cambia por completo ante un valor distinto', async () => {
    const [uno, otro] = [await resumen('a'), await resumen('b')]

    expect(uno).not.toBe(otro)
    expect(uno).toHaveLength(64)
  })

  it('no permite reconstruir el token', async () => {
    // Es la razón de guardar el resumen y no el token: leer la base no da
    // credenciales utilizables.
    const token = tokenNuevo()

    expect(await resumen(token)).not.toContain(token)
  })
})

describe('cookie de sesión', () => {
  it('lleva los atributos que impiden leerla o reenviarla desde otro sitio', () => {
    // Act
    const cabecera = crearCabeceraDeCookie('valor-de-prueba', VIDA_DE_SESION)

    // Assert
    expect(cabecera).toContain('HttpOnly')
    expect(cabecera).toContain('Secure')
    expect(cabecera).toContain('SameSite=Lax')
    expect(cabecera).toContain('Path=/')
    expect(cabecera).toContain('Max-Age=604800')
  })

  it('caduca a los 7 días, igual que la invitación', () => {
    expect(VIDA_DE_SESION).toBe(7 * 24 * 60 * 60)
    expect(VIDA_DE_INVITACION).toBe(7 * 24 * 60 * 60)
  })

  it('la cabecera de borrado vence de inmediato', () => {
    expect(cabeceraDeCookieBorrada()).toContain('Max-Age=0')
  })

  it('encuentra la cookie aunque venga acompañada de otras', () => {
    // Arrange
    const peticion = new Request('https://ejemplo.test/', {
      headers: { Cookie: `otra=1; ${NOMBRE_DE_COOKIE}=elvalor; tercera=3` },
    })

    // Act + Assert
    expect(leerCookie(peticion)).toBe('elvalor')
  })

  it('no confunde una cookie cuyo nombre termina igual', () => {
    // `x_sfm_sesion` no es `sfm_sesion`: aceptarla sería un agujero.
    const peticion = new Request('https://ejemplo.test/', {
      headers: { Cookie: 'x_sfm_sesion=impostora' },
    })

    expect(leerCookie(peticion)).toBeNull()
  })

  it('devuelve null cuando no hay cookies', () => {
    expect(leerCookie(new Request('https://ejemplo.test/'))).toBeNull()
  })

  it('devuelve null cuando la cookie viene vacía', () => {
    const peticion = new Request('https://ejemplo.test/', {
      headers: { Cookie: `${NOMBRE_DE_COOKIE}=` },
    })

    expect(leerCookie(peticion)).toBeNull()
  })
})
