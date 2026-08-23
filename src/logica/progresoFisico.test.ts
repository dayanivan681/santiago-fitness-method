import { describe, test, expect } from 'vitest'
import { MEDIDAS, hayAlgoQueGuardar, ordenarProgreso, variacion } from './progresoFisico'
import type { RegistroDeProgreso } from '../dominio/tipos'

const registro = (fecha: string, cintura?: number): RegistroDeProgreso => ({
  id: fecha,
  participanteId: '001',
  fecha,
  medidas: cintura === undefined ? {} : { cinturaPulgadas: cintura },
  tieneFoto: false,
})

describe('ordenar el progreso', () => {
  test('lo más reciente va primero', () => {
    // Es lo que se mira: cómo estoy ahora respecto a antes.
    const ordenados = ordenarProgreso([
      registro('2026-01-10'),
      registro('2026-03-10'),
      registro('2026-02-10'),
    ])

    expect(ordenados.map((r) => r.fecha)).toEqual(['2026-03-10', '2026-02-10', '2026-01-10'])
  })

  test('no muta la lista original', () => {
    const original = [registro('2026-01-10'), registro('2026-03-10')]

    ordenarProgreso(original)

    expect(original[0].fecha).toBe('2026-01-10')
  })
})

describe('variación respecto a la medida anterior', () => {
  test('resta la anterior, con signo', () => {
    // Arrange: la cintura baja de 34 a 32
    const actual = { cinturaPulgadas: 32 }
    const anterior = { cinturaPulgadas: 34 }

    // Act + Assert: el signo se muestra tal cual; si bajar es bueno lo decide
    // el coach según el objetivo, no la app.
    expect(variacion(actual, anterior, 'cinturaPulgadas')).toBe(-2)
  })

  test('sin medida anterior no hay variación que enseñar', () => {
    expect(variacion({ cinturaPulgadas: 32 }, undefined, 'cinturaPulgadas')).toBeUndefined()
    expect(variacion({ cinturaPulgadas: 32 }, {}, 'cinturaPulgadas')).toBeUndefined()
  })

  test('si hoy no se midió eso, tampoco', () => {
    // Apuntar sólo el peso un día no puede inventar una variación de cintura.
    expect(variacion({}, { cinturaPulgadas: 34 }, 'cinturaPulgadas')).toBeUndefined()
  })

  test('redondea a una décima igual hacia arriba que hacia abajo', () => {
    // 1.75 es exacto en binario, así que este caso sí fija el redondeo del
    // medio: la misma diferencia no puede mostrarse distinta según el signo.
    const bajar = variacion({ cinturaPulgadas: 32.25 }, { cinturaPulgadas: 34 }, 'cinturaPulgadas')
    const subir = variacion({ cinturaPulgadas: 34 }, { cinturaPulgadas: 32.25 }, 'cinturaPulgadas')

    expect(bajar).toBe(-1.8)
    expect(subir).toBe(1.8)
  })
})

describe('qué merece guardarse', () => {
  test('un registro vacío no se guarda', () => {
    // Una fila con la fecha y nada más no dice nada.
    expect(hayAlgoQueGuardar({}, false)).toBe(false)
  })

  test('basta una medida', () => {
    expect(hayAlgoQueGuardar({ pesoCorporalLb: 180 }, false)).toBe(true)
  })

  test('basta una foto', () => {
    expect(hayAlgoQueGuardar({}, true)).toBe(true)
  })
})

describe('las medidas que se piden', () => {
  test('todas tienen etiqueta y unidad', () => {
    for (const medida of MEDIDAS) {
      expect(medida.etiqueta, medida.clave).not.toBe('')
      expect(medida.unidad, medida.clave).not.toBe('')
    }
  })
})
