import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BIBLIOTECA_INICIAL } from '../src/datos/semilla/biblioteca'
import { BIBLIOTECA_SANTIAGO } from './biblioteca-santiago'
import { EjercicioCoachNuevo, esIdDeEjercicioCoach } from './v2/biblioteca'

const CSV = 'docs/aportes-santiago/2026-09-28-mensaje-02/ejercicios.csv'

describe('Biblioteca Maestra de Santiago', () => {
  const importables = BIBLIOTECA_SANTIAGO.filter((f) => f.id)
  const yaExisten = BIBLIOTECA_SANTIAGO.filter((f) => f.yaExiste)
  const duplicados = BIBLIOTECA_SANTIAGO.filter((f) => f.duplicadoDe)

  it('cuadra con el CSV: cada fila se importa, ya existe o está repetida', () => {
    const filas = readFileSync(CSV, 'utf8').trim().split('\n').length - 1
    expect(filas).toBe(283)
    expect(BIBLIOTECA_SANTIAGO).toHaveLength(filas)
    expect(importables.length + yaExisten.length + duplicados.length).toBe(filas)
  })

  it('cada ficha importable es un ejercicio del coach válido, con id y referencia únicos', () => {
    for (const f of importables) {
      const { id: _id, ...datos } = f
      void _id
      const r = EjercicioCoachNuevo.safeParse(datos)
      expect(r.success ? '' : `${f.referenciaCatalogo}: ${JSON.stringify(r.error.issues)}`).toBe('')
      expect(esIdDeEjercicioCoach(f.id!)).toBe(true)
    }
    expect(new Set(BIBLIOTECA_SANTIAGO.map((f) => f.referenciaCatalogo)).size).toBe(283)
    expect(new Set(importables.map((f) => f.id)).size).toBe(importables.length)
    expect(new Set(importables.map((f) => f.nombre.toLowerCase())).size).toBe(importables.length)
  })

  it('conserva los nombres tal cual y no importa lo que ya está en la biblioteca fija', () => {
    expect(BIBLIOTECA_SANTIAGO[0]).toMatchObject({ referenciaCatalogo: 'M02-001', nombre: 'Bench Press con barra', equipo: 'barraLibre' })
    const fijas = new Set(BIBLIOTECA_INICIAL.map((e) => e.id))
    for (const f of yaExisten) expect(fijas.has(f.yaExiste!)).toBe(true)
    const nombresFijos = new Set(BIBLIOTECA_INICIAL.map((e) => e.nombre.toLowerCase()))
    for (const f of importables) expect(nombresFijos.has(f.nombre.toLowerCase())).toBe(false)
  })

  it('separa las máquinas de discos y de pila, y usa los patrones de la semilla', () => {
    const por = (nombre: string) => BIBLIOTECA_SANTIAGO.find((f) => f.nombre === nombre)!
    expect(por('Bench Press plate-loaded')).toMatchObject({ equipo: 'maquinaDiscos', movimiento: 'press-pecho' })
    expect(por('Chest Press selectorizado')).toMatchObject({ equipo: 'maquinaTradicional', tipoCarga: 'pesoMaquina' })
    expect(por('Hip Adduction Machine')).toMatchObject({ musculoPrimario: 'aductores' })
    expect(por('Plate Front Raise').equipo).not.toBe('maquinaDiscos')
    const patronesSemilla = new Set(BIBLIOTECA_INICIAL.map((e) => e.movimiento))
    for (const f of importables) expect(patronesSemilla.has(f.movimiento) || f.movimiento.startsWith('santiago-')).toBe(true)
  })
})
