import { describe, test, expect } from 'vitest'
import {
  aCargaTotalLb,
  aPesoRegistradoLb,
  incrementoTotalLb,
  incrementoRegistradoLb,
  type PerfilCarga,
} from './carga'

const perfil = (parcial: Partial<PerfilCarga>): PerfilCarga => ({
  tipoCarga: 'total',
  incrementoMinimoLb: 2.5,
  ...parcial,
})

describe('aCargaTotalLb (§17)', () => {
  test('deja igual el peso cuando la carga ya es total', () => {
    expect(aCargaTotalLb(100, perfil({ tipoCarga: 'total' }))).toBe(100)
  })

  test('duplica el peso cuando se carga por lado', () => {
    // Arrange: 45 lb en cada lado de una convergente
    const convergente = perfil({ tipoCarga: 'porLado' })

    // Act
    const total = aCargaTotalLb(45, convergente)

    // Assert
    expect(total).toBe(90)
  })

  test('suma el peso propio de la máquina cuando se registran discos añadidos', () => {
    const plateLoaded = perfil({ tipoCarga: 'discosAnadidos', pesoBaseMaquinaLb: 35 })

    expect(aCargaTotalLb(50, plateLoaded)).toBe(85)
  })

  test('suma la barra a los discos por lado en un Smith', () => {
    // Arrange: 45 lb por lado sobre una barra de Smith de 25 lb
    const smith = perfil({ tipoCarga: 'porLado', pesoBaseMaquinaLb: 25 })

    // Act
    const total = aCargaTotalLb(45, smith)

    // Assert: 45 + 45 + 25, no 90 — si no, el historial del Smith no cuadra
    expect(total).toBe(115)
  })

  test('trata el número del stack como carga total', () => {
    expect(aCargaTotalLb(120, perfil({ tipoCarga: 'pesoMaquina' }))).toBe(120)
  })
})

describe('aPesoRegistradoLb (§17)', () => {
  test('es la inversa exacta de aCargaTotalLb en los cuatro tipos', () => {
    const perfiles: PerfilCarga[] = [
      perfil({ tipoCarga: 'total' }),
      perfil({ tipoCarga: 'porLado' }),
      perfil({ tipoCarga: 'porLado', pesoBaseMaquinaLb: 25 }),
      perfil({ tipoCarga: 'discosAnadidos', pesoBaseMaquinaLb: 35 }),
      perfil({ tipoCarga: 'pesoMaquina' }),
    ]

    for (const p of perfiles) {
      expect(aPesoRegistradoLb(aCargaTotalLb(90, p), p)).toBe(90)
    }
  })
})

describe('incrementoTotalLb (§13)', () => {
  test('usa el ideal de 2.5 lb cuando el equipo lo permite exactamente', () => {
    expect(incrementoTotalLb(perfil({ incrementoMinimoLb: 2.5 }))).toBe(2.5)
  })

  test('alcanza el ideal combinando pasos finos', () => {
    // Discos de 1.25 lb por lado = 2.5 lb totales en dos pasos
    expect(incrementoTotalLb(perfil({ incrementoMinimoLb: 1.25 }))).toBe(2.5)
  })

  test('usa el mínimo de la máquina cuando no puede bajar a 2.5 lb', () => {
    // Stack que sólo salta de 10 en 10
    expect(incrementoTotalLb(perfil({ incrementoMinimoLb: 10 }))).toBe(10)
  })

  test('prefiere el incremento pequeño cuando el ideal no es múltiplo del paso', () => {
    // §13 pide "preferencia por incrementos pequeños": con pasos de 1 lb
    // se queda en 2 lb en vez de pasarse a 3 lb.
    expect(incrementoTotalLb(perfil({ incrementoMinimoLb: 1 }))).toBe(2)
  })

  test('rechaza un incremento mínimo inválido', () => {
    expect(() => incrementoTotalLb(perfil({ incrementoMinimoLb: 0 }))).toThrow()
  })
})

describe('incrementoRegistradoLb (§13 + §17)', () => {
  test('reparte los +2.5 lb totales en +1.25 lb por lado', () => {
    // Arrange: plate-loaded donde se pueden añadir 1.25 lb a cada lado
    const porLado = perfil({ tipoCarga: 'porLado', incrementoMinimoLb: 2.5 })

    // Act
    const porSerie = incrementoRegistradoLb(porLado)

    // Assert: el participante añade 1.25 lb a cada lado, no 2.5
    expect(porSerie).toBe(1.25)
    expect(incrementoTotalLb(porLado)).toBe(2.5)
  })

  test('no reparte el incremento cuando la carga es total', () => {
    expect(incrementoRegistradoLb(perfil({ tipoCarga: 'total' }))).toBe(2.5)
  })

  test('reparte también el mínimo de la máquina cuando es mayor que el ideal', () => {
    // Mancuernas que saltan de 5 en 5 por mano = 10 lb totales
    const mancuernas = perfil({ tipoCarga: 'porLado', incrementoMinimoLb: 10 })

    expect(incrementoRegistradoLb(mancuernas)).toBe(5)
  })
})
