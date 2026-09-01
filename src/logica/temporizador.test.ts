import { describe, expect, it } from 'vitest'
import {
  avanzarDescanso,
  DESCANSO_INACTIVO,
  iniciarDescanso,
  PRORROGA_SEGUNDOS,
  prorrogarDescanso,
  segundosRestantes,
  type EstadoDescanso,
} from './temporizador'

/**
 * El contrato del cronómetro visible, sin React de por medio.
 *
 * Lo que se protege aquí es que el tiempo salga siempre de un instante final
 * absoluto: es lo único que impide que el cronómetro se quede corto cuando el
 * navegador frena los temporizadores en segundo plano.
 */

const AHORA = 1_800_000_000_000

describe('iniciar el descanso', () => {
  it('fija un instante final absoluto, no una cuenta atrás', () => {
    // Act
    const estado = iniciarDescanso('press-banca', 180, AHORA)

    // Assert
    expect(estado).toEqual({ estado: 'activo', terminaEn: AHORA + 180_000, ejercicioId: 'press-banca' })
  })

  it('no arranca con descanso de cero: el coach dijo que ahí no se descansa', () => {
    expect(iniciarDescanso('press-banca', 0, AHORA)).toEqual(DESCANSO_INACTIVO)
  })

  it('no arranca con valores imposibles', () => {
    expect(iniciarDescanso('press-banca', -30, AHORA)).toEqual(DESCANSO_INACTIVO)
    expect(iniciarDescanso('press-banca', Number.NaN, AHORA)).toEqual(DESCANSO_INACTIVO)
  })

  it('arrancar otra vez sustituye al anterior en vez de sumar uno nuevo', () => {
    // Arrange: un descanso ya corriendo
    const primero = iniciarDescanso('press-banca', 180, AHORA)

    // Act: se guarda otra serie 20 s después
    const segundo = iniciarDescanso('lat-pulldown', 120, AHORA + 20_000)

    // Assert: hay un único estado, el nuevo
    expect(primero.estado).toBe('activo')
    expect(segundo).toEqual({
      estado: 'activo',
      terminaEn: AHORA + 20_000 + 120_000,
      ejercicioId: 'lat-pulldown',
    })
  })
})

describe('tiempo restante', () => {
  it('se calcula desde el instante final, no desde los ticks recibidos', () => {
    // Arrange
    const estado = iniciarDescanso('press-banca', 180, AHORA)

    // Act + Assert: aunque no haya llegado ni un solo tick, el reloj es correcto
    expect(segundosRestantes(estado, AHORA)).toBe(180)
    expect(segundosRestantes(estado, AHORA + 60_000)).toBe(120)
  })

  it('sobrevive a que el navegador congele la pestaña', () => {
    // Arrange: 3 minutos de descanso
    const estado = iniciarDescanso('press-banca', 180, AHORA)

    // Act: el móvil se queda en el banco 2 minutos y medio sin ejecutar ticks
    const restantes = segundosRestantes(estado, AHORA + 150_000)

    // Assert: al volver marca 30 s, no 180 como haría un contador decremental
    expect(restantes).toBe(30)
  })

  it('nunca es negativo', () => {
    const estado = iniciarDescanso('press-banca', 60, AHORA)

    expect(segundosRestantes(estado, AHORA + 600_000)).toBe(0)
  })

  it('es cero cuando no hay descanso en marcha', () => {
    expect(segundosRestantes(DESCANSO_INACTIVO, AHORA)).toBe(0)
    expect(segundosRestantes({ estado: 'terminado', ejercicioId: 'x' }, AHORA)).toBe(0)
  })
})

describe('avanzar', () => {
  it('pasa a terminado justo cuando se agota', () => {
    // Arrange
    const estado = iniciarDescanso('press-banca', 60, AHORA)

    // Act + Assert
    expect(avanzarDescanso(estado, AHORA + 59_000).estado).toBe('activo')
    expect(avanzarDescanso(estado, AHORA + 60_000)).toEqual({
      estado: 'terminado',
      ejercicioId: 'press-banca',
    })
  })

  it('es idempotente: llamarlo de más no cambia nada', () => {
    const terminado: EstadoDescanso = { estado: 'terminado', ejercicioId: 'press-banca' }

    expect(avanzarDescanso(terminado, AHORA + 999_999)).toBe(terminado)
    expect(avanzarDescanso(DESCANSO_INACTIVO, AHORA)).toBe(DESCANSO_INACTIVO)
  })
})

describe('prorrogar', () => {
  it('empuja el instante final treinta segundos', () => {
    // Arrange
    const estado = iniciarDescanso('press-banca', 60, AHORA)

    // Act
    const prorrogado = prorrogarDescanso(estado, AHORA + 10_000)

    // Assert: se suma al final, no al tiempo que quedaba en pantalla
    expect(segundosRestantes(prorrogado, AHORA + 10_000)).toBe(50 + PRORROGA_SEGUNDOS)
  })

  it('desde terminado cuenta desde ahora, no revive un instante pasado', () => {
    // Arrange: se agotó hace un minuto
    const terminado: EstadoDescanso = { estado: 'terminado', ejercicioId: 'press-banca' }

    // Act
    const prorrogado = prorrogarDescanso(terminado, AHORA)

    // Assert
    expect(prorrogado).toEqual({
      estado: 'activo',
      terminaEn: AHORA + PRORROGA_SEGUNDOS * 1000,
      ejercicioId: 'press-banca',
    })
  })

  it('no despierta un cronómetro que nadie arrancó', () => {
    expect(prorrogarDescanso(DESCANSO_INACTIVO, AHORA)).toBe(DESCANSO_INACTIVO)
  })
})
