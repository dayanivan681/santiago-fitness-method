import { describe, expect, it } from 'vitest'
import type { Equipo, Musculo } from '../../src/dominio/tipos'
import type { TipoCarga } from '../../src/dominio/carga'
import {
  EQUIPOS,
  EXPLICACION_MAX,
  EjercicioCoachCambio,
  EjercicioCoachNuevo,
  MUSCULOS,
  NOMBRE_MAX,
  TIPOS_DE_CARGA,
  esIdDeEjercicioCoach,
} from './biblioteca'
import { Plan, Slot } from './contratos'

// Falla en compilación si los enums compartidos se desvían de los del dominio.
const _equipos: readonly Equipo[] = EQUIPOS
const _musculos: readonly Musculo[] = MUSCULOS
const _cargas: readonly TipoCarga[] = TIPOS_DE_CARGA
const _completo: Equipo extends (typeof EQUIPOS)[number] ? true : never = true
const _completoM: Musculo extends (typeof MUSCULOS)[number] ? true : never = true
const _completoC: TipoCarga extends (typeof TIPOS_DE_CARGA)[number] ? true : never = true

const valido = {
  nombre: 'Jalón al pecho con agarre neutro',
  equipo: 'cable',
  movimiento: 'jalon-vertical',
  musculoPrimario: 'espalda',
  tipoCarga: 'pesoMaquina',
  incrementoMinimoLb: 5,
}

describe('EjercicioCoach', () => {
  it('aplica valores por defecto a los opcionales', () => {
    void [_equipos, _musculos, _cargas, _completo, _completoM, _completoC]
    expect(EjercicioCoachNuevo.parse(valido)).toMatchObject({
      referenciaCatalogo: null,
      musculosSecundarios: [],
      pesoBaseMaquinaLb: null,
      explicacionCorta: '',
    })
  })

  it('rechaza nombre vacío o largo y explicación larga', () => {
    expect(EjercicioCoachNuevo.safeParse({ ...valido, nombre: '  ' }).success).toBe(false)
    expect(EjercicioCoachNuevo.safeParse({ ...valido, nombre: 'a'.repeat(NOMBRE_MAX + 1) }).success).toBe(false)
    expect(EjercicioCoachNuevo.safeParse({ ...valido, nombre: 'a'.repeat(NOMBRE_MAX) }).success).toBe(true)
    expect(EjercicioCoachNuevo.safeParse({ ...valido, explicacionCorta: 'a'.repeat(EXPLICACION_MAX + 1) }).success).toBe(false)
  })

  it('rechaza enums desconocidos y referencias de catálogo mal formadas', () => {
    expect(EjercicioCoachNuevo.safeParse({ ...valido, equipo: 'kettlebell' }).success).toBe(false)
    expect(EjercicioCoachNuevo.safeParse({ ...valido, musculoPrimario: 'cuello' }).success).toBe(false)
    expect(EjercicioCoachNuevo.safeParse({ ...valido, tipoCarga: 'otro' }).success).toBe(false)
    expect(EjercicioCoachNuevo.safeParse({ ...valido, referenciaCatalogo: 'X1' }).success).toBe(false)
    expect(EjercicioCoachNuevo.safeParse({ ...valido, referenciaCatalogo: 'C042' }).success).toBe(true)
    expect(EjercicioCoachNuevo.safeParse({ ...valido, incrementoMinimoLb: 0 }).success).toBe(false)
  })

  it('el cambio es parcial, permite archivar y no toca la referencia del catálogo', () => {
    expect(EjercicioCoachCambio.parse({ activo: false })).toEqual({ activo: false })
    expect(EjercicioCoachCambio.parse({ referenciaCatalogo: 'C001', nombre: 'Nuevo' })).toEqual({ nombre: 'Nuevo' })
  })
})

describe('id de ejercicio del coach', () => {
  const uuid = '3f2b8c1e-9d4a-4b7e-8a51-0c6d2e9f1a77'
  it('acepta coach-ej-<uuid> y rechaza el resto', () => {
    expect(esIdDeEjercicioCoach(`coach-ej-${uuid}`)).toBe(true)
    expect(esIdDeEjercicioCoach('coach-ej-corto')).toBe(false)
    expect(esIdDeEjercicioCoach(`coach-ej-${uuid}x`)).toBe(false)
    expect(esIdDeEjercicioCoach('press-banca-barra')).toBe(false)
  })

  it('el contrato de plan lo acepta como ejercicioId y rechaza ids inventados', () => {
    const slot = { orden: 1, estimulo: 'fuerza', seriesObjetivo: 3, repMin: 6, repMax: 8, descansoSegundos: 120 }
    expect(Slot.safeParse({ ...slot, ejercicioId: `coach-ej-${uuid}` }).success).toBe(true)
    expect(Slot.safeParse({ ...slot, ejercicioId: 'inventado' }).success).toBe(false)
    expect(Plan).toBeDefined()
  })
})
