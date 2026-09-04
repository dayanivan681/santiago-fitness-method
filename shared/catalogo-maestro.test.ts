import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EJERCICIOS_BASE } from './ejercicios-base'
import {
  CATALOGO_MAESTRO_SEGURO,
  CATALOGO_MAESTRO_VERSION,
  IDS_CATALOGO_MAESTRO_SEGURO,
  identidadCatalogoDe,
} from './catalogo-maestro'

/** CSV pequeño, sin dependencia adicional, para auditar el manifest generado. */
function leerCsv(texto: string): string[][] {
  const filas: string[][] = []
  let fila: string[] = []
  let celda = ''
  let entreComillas = false
  for (let indice = 0; indice < texto.length; indice += 1) {
    const caracter = texto[indice]
    if (caracter === '"') {
      if (entreComillas && texto[indice + 1] === '"') {
        celda += '"'
        indice += 1
      } else entreComillas = !entreComillas
    } else if (caracter === ',' && !entreComillas) {
      fila.push(celda)
      celda = ''
    } else if ((caracter === '\n' || caracter === '\r') && !entreComillas) {
      if (caracter === '\r' && texto[indice + 1] === '\n') indice += 1
      fila.push(celda)
      if (fila.some((valor) => valor !== '')) filas.push(fila)
      fila = []
      celda = ''
    } else celda += caracter
  }
  if (celda || fila.length > 0) {
    fila.push(celda)
    filas.push(fila)
  }
  return filas
}

describe('fundación de la Biblioteca Maestra (§3B.1)', () => {
  const manifest = leerCsv(
    readFileSync(resolve(process.cwd(), 'docs/BIBLIOTECA-FASE-3B1-MANIFEST.csv'), 'utf8'),
  )
  const encabezados = manifest[0]
  const posicion = (nombre: string) => encabezados.indexOf(nombre)
  const valor = (fila: string[], nombre: string) => fila[posicion(nombre)]
  const filas = manifest.slice(1)

  it('mantiene una versión y un ID determinístico por identidad segura', () => {
    expect(CATALOGO_MAESTRO_VERSION).toBe('phase3b1-pdf-2a482961')
    expect(CATALOGO_MAESTRO_SEGURO).toHaveLength(123)
    expect(new Set(CATALOGO_MAESTRO_SEGURO.map((identidad) => identidad.id)).size).toBe(123)
    for (const identidad of CATALOGO_MAESTRO_SEGURO) {
      expect(identidad.id).toBe(`sfm-catalog-${identidad.referenciaCanonica.toLowerCase()}`)
      expect(identidadCatalogoDe(identidad.id)).toEqual(identidad)
      expect(identidad.entradasFuente.length).toBeGreaterThan(0)
      expect(identidad.paginasFuente.length).toBeGreaterThan(0)
    }
  })

  it('coincide exactamente con las filas SAFE_TO_IMPORT del manifest', () => {
    const importadas = filas.filter((fila) => valor(fila, 'classification') === 'SAFE_TO_IMPORT')
    expect(importadas).toHaveLength(123)
    expect(importadas.map((fila) => valor(fila, 'catalog_id')).sort()).toEqual(
      CATALOGO_MAESTRO_SEGURO.map((identidad) => identidad.id).sort(),
    )
    for (const fila of importadas) {
      expect(valor(fila, 'imported_to_catalog')).toBe('true')
      expect(valor(fila, 'active_in_runtime_exercises')).toBe('false')
      expect(valor(fila, 'decision_ids')).toBe('[]')
      expect(valor(fila, 'existing_ids_verified')).toBe('[]')
      expect(valor(fila, 'existing_ids_candidate_only')).toBe('[]')
    }
  })

  it('mantiene fuera las decisiones pendientes y las demás exclusiones', () => {
    expect(filas).toHaveLength(293)
    expect(filas.filter((fila) => valor(fila, 'classification') === 'EXCLUDED_PENDING_COACH_DECISION')).toHaveLength(102)
    expect(filas.filter((fila) => valor(fila, 'classification') === 'EXCLUDED_OTHER_REASON')).toHaveLength(68)
    for (const fila of filas.filter((item) => valor(item, 'classification') !== 'SAFE_TO_IMPORT')) {
      expect(valor(fila, 'catalog_id')).toBe('')
      expect(valor(fila, 'imported_to_catalog')).toBe('false')
      expect(valor(fila, 'active_in_runtime_exercises')).toBe('false')
      expect(valor(fila, 'exclusion_reason')).not.toBe('')
    }
  })

  it('no reutiliza ninguno de los 33 IDs operativos', () => {
    const existentes = new Set(EJERCICIOS_BASE.map((ejercicio) => ejercicio.id))
    expect([...IDS_CATALOGO_MAESTRO_SEGURO].some((id) => existentes.has(id))).toBe(false)
  })
})
