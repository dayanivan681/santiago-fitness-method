import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Nombre visible del cliente de QA (Fase 1D).
 *
 * Se comprueba sobre el fuente porque la semilla usa `ON CONFLICT DO NOTHING`:
 * nunca pisa una fila existente, así que el cambio afecta a instalaciones
 * nuevas y la migración se encarga de las que ya existen. Ambas piezas tienen
 * que decir lo mismo o los entornos divergen.
 */
const ROLES = readFileSync(resolve(process.cwd(), 'functions/lib/roles.ts'), 'utf8')
const MIGRACION = readFileSync(
  resolve(process.cwd(), 'migrations/0005_qa_display_name.sql'),
  'utf8',
)

describe('semilla y migración del cliente de QA', () => {
  it('la semilla crea el cliente técnico con el nombre nuevo', () => {
    expect(ROLES).toContain("id: 'dayan-test'")
    expect(ROLES).toContain("nombre: 'Cliente de prueba 1'")
  })

  it('la jerga interna ya no aparece en la semilla', () => {
    expect(ROLES).not.toContain('QA Role Split')
  })

  it('la migración es idempotente y sólo toca esa fila', () => {
    expect(MIGRACION).toContain("WHERE id = 'dayan-test'")
    // Condicionada al nombre antiguo: repetirla no hace nada, y si el coach ya
    // lo renombró a mano se respeta.
    expect(MIGRACION).toContain("AND nombre = 'QA Role Split'")
    expect(MIGRACION).toContain("SET nombre = 'Cliente de prueba 1'")
  })

  it('la migración no toca ivanprueba ni a Santiago', () => {
    expect(MIGRACION).not.toContain('ivanprueba')
    expect(MIGRACION).not.toContain('santiago')
  })

  it('no se reescribe una migración ya aplicada', () => {
    // 0003 sembró el fixture de QA y está aplicada en producción: reescribirla
    // dejaría los entornos en estados distintos según cuándo se migraron.
    const anterior = readFileSync(
      resolve(process.cwd(), 'migrations/0003_seed_qa_role_split.sql'),
      'utf8',
    )
    expect(anterior).not.toContain('Cliente de prueba 1')
  })
})
