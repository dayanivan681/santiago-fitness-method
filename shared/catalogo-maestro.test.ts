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
  texto = texto.replace(/^\uFEFF/, '')
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
  const catalogo3a = leerCsv(
    readFileSync(resolve(process.cwd(), 'docs/BIBLIOTECA-FASE-3A-CATALOGO.csv'), 'utf8'),
  )
  const encabezados3a = catalogo3a[0]
  const valor3a = (fila: string[], nombre: string) => fila[encabezados3a.indexOf(nombre)]

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

  it('conserva la metadata y procedencia del CSV de Phase 3A', () => {
    for (const identidad of CATALOGO_MAESTRO_SEGURO) {
      const fila = catalogo3a
        .slice(1)
        .find((candidata) => valor3a(candidata, 'canonical_ref') === identidad.referenciaCanonica)
      expect(fila).toBeDefined()
      if (!fila) continue

      expect(identidad.nombre).toBe(
        valor3a(fila, 'canonical_name_es') || valor3a(fila, 'canonical_label_source'),
      )
      expect(identidad.gruposMusculares).toEqual(JSON.parse(valor3a(fila, 'muscle_groups')))
      expect(identidad.equipos).toEqual(JSON.parse(valor3a(fila, 'equipment')))
      expect(identidad.accesorios).toEqual(JSON.parse(valor3a(fila, 'equipment_accessories')))
      expect(identidad.patrones).toEqual(JSON.parse(valor3a(fila, 'pattern')))
      expect(identidad.entradasFuente).toEqual(JSON.parse(valor3a(fila, 'source_entries')))
      expect(identidad.paginasFuente).toEqual(JSON.parse(valor3a(fila, 'source_pages')))

      const nombreEs = valor3a(fila, 'canonical_name_es')
      const nombreEn = valor3a(fila, 'possible_name_en')
      if (nombreEs) expect(identidad.nombreEs).toBe(nombreEs)
      else expect(identidad.nombreEs).toBeUndefined()
      if (nombreEn) expect(identidad.nombreEn).toBe(nombreEn)
      else expect(identidad.nombreEn).toBeUndefined()

      const lateralidad = valor3a(fila, 'laterality')
      if (lateralidad) expect(identidad.lateralidad).toBe(lateralidad)
      else expect(identidad.lateralidad).toBeUndefined()

      const compuesto = valor3a(fila, 'compound_isolation')
      if (compuesto) expect(identidad.compuestoAislamiento).toBe(compuesto)
      else expect(identidad.compuestoAislamiento).toBeUndefined()
    }
  })

  it('no convierte aliases pendientes en una fusión silenciosa', () => {
    // Un alias adicional necesita la decisión del coach: no basta con que la
    // etiqueta aparezca junto a otra en una celda del PDF.
    expect(CATALOGO_MAESTRO_SEGURO.every((identidad) => identidad.aliases.length === 0)).toBe(true)

    for (const fila of catalogo3a.slice(1)) {
      const aliases = JSON.parse(valor3a(fila, 'aliases') || '[]') as string[]
      const etiqueta = valor3a(fila, 'canonical_label_source')
      const aliasesAdicionales = aliases.filter((alias) => alias !== etiqueta)
      if (aliasesAdicionales.length === 0) continue

      const filaManifest = filas.find(
        (candidata) => valor(candidata, 'canonical_ref') === valor3a(fila, 'canonical_ref'),
      )
      expect(valor(filaManifest ?? [], 'classification')).not.toBe('SAFE_TO_IMPORT')
      expect(valor(filaManifest ?? [], 'catalog_id')).toBe('')
    }
  })
})
