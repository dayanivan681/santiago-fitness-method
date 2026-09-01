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
import { clienteQaBloqueado, esClienteQa, filtrarClientesQa, qaHabilitado } from './qa'

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


/**
 * Separación del cliente técnico de QA (issue #3).
 *
 * Lo que hay que fijar aquí es la política, no la consulta: que la bandera sea
 * explícita, que falle ocultando, y que la misma regla valga para listar y para
 * operar. Las superficies se comprueban en scripts/pruebas-qa.mjs.
 */
describe('clientes de QA', () => {
  it('reconoce el id reservado y sólo ese', () => {
    expect(esClienteQa('dayan-test')).toBe(true)
    expect(esClienteQa('santiago')).toBe(false)
    expect(esClienteQa('dayan-test-2')).toBe(false)
  })

  it('sólo se habilita con la cadena exacta "true"', () => {
    expect(qaHabilitado({ SHOW_QA_CLIENTS: 'true' })).toBe(true)
    expect(qaHabilitado({ SHOW_QA_CLIENTS: 'false' })).toBe(false)
    expect(qaHabilitado({ SHOW_QA_CLIENTS: 'TRUE' })).toBe(false)
    expect(qaHabilitado({ SHOW_QA_CLIENTS: '1' })).toBe(false)
  })

  it('falla ocultando cuando falta la variable', () => {
    // Un despliegue mal configurado debe comportarse como producción: enseñar
    // QA al coach como si fuera un cliente real es el error caro.
    expect(qaHabilitado({})).toBe(false)
  })

  it('filtra la lista en producción y la deja intacta en preview', () => {
    // Arrange
    const clientes = [{ id: 'santiago' }, { id: 'dayan-test' }]

    // Act + Assert
    expect(filtrarClientesQa(clientes, false).map((c) => c.id)).toEqual(['santiago'])
    expect(filtrarClientesQa(clientes, true).map((c) => c.id)).toEqual(['santiago', 'dayan-test'])
  })

  it('bloquea operar sobre QA sólo cuando está oculto', () => {
    expect(clienteQaBloqueado('dayan-test', false)).toBe(true)
    expect(clienteQaBloqueado('dayan-test', true)).toBe(false)
    expect(clienteQaBloqueado('santiago', false)).toBe(false)
  })

  it('no bloquea un cliente sin id, que no es de QA', () => {
    // `previsualizar` sin cliente resuelve a QA antes de llegar aquí; una cadena
    // vacía por su cuenta no debe rechazarse.
    expect(clienteQaBloqueado('', false)).toBe(false)
  })
})

describe('nombre visible del cliente de QA (Fase 1D)', () => {
  it('el id técnico sigue siendo dayan-test', () => {
    // Renombrar el id rompería el filtro de producción y las suites, que
    // buscan siempre por identidad técnica y nunca por lo que se lee.
    expect(esClienteQa('dayan-test')).toBe(true)
    expect(esClienteQa('Cliente de prueba 1')).toBe(false)
  })

  it('el filtro no depende del nombre visible', () => {
    // Arrange: el mismo cliente con el nombre nuevo y con el antiguo
    const conNombreNuevo = [{ id: 'dayan-test', nombre: 'Cliente de prueba 1' }]
    const conNombreViejo = [{ id: 'dayan-test', nombre: 'QA Role Split' }]

    // Act + Assert: se oculta por id, se llame como se llame
    expect(filtrarClientesQa(conNombreNuevo, false)).toEqual([])
    expect(filtrarClientesQa(conNombreViejo, false)).toEqual([])
  })

  it('ivanprueba no es de QA y no se toca', () => {
    // No está clasificado como técnico: en producción sigue siendo un cliente
    // normal y visible.
    expect(esClienteQa('ivanprueba')).toBe(false)
    expect(filtrarClientesQa([{ id: 'ivanprueba' }], false)).toEqual([{ id: 'ivanprueba' }])
  })
})
