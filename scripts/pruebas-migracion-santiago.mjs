#!/usr/bin/env node
/**
 * Prueba de integración de 0004 contra el runtime D1 local de Wrangler.
 * Demuestra dos propiedades que un test de texto no puede probar:
 * 1) cuatro filas vacías reciben cinco slots;
 * 2) una fila ya personalizada sobrevive a reaplicar la migración.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DB = 'santiago-acceso'
const persistencia = mkdtempSync(join(tmpdir(), 'sfm-migracion-santiago-'))

function wrangler(argumentos) {
  const salida = execFileSync(
    'npx',
    ['wrangler', 'd1', 'execute', DB, '--local', '--persist-to', persistencia, '--json', ...argumentos],
    { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  )
  return JSON.parse(salida)
}

function aplicar(nombre) {
  wrangler(['--file', resolve(RAIZ, 'migrations', nombre)])
}

function consultar(sql) {
  return wrangler(['--command', sql])[0]?.results ?? []
}

function exigir(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje)
  console.log(`  PASS  ${mensaje}`)
}

try {
  aplicar('0001_acceso.sql')
  aplicar('0002_role_split.sql')

  const antes = consultar(
    "SELECT COUNT(*) AS filas, SUM(json_array_length(slots_json)) AS slots FROM rutinas WHERE cliente_id='santiago'",
  )[0]
  exigir(Number(antes?.filas) === 4 && Number(antes?.slots) === 0, 'baseline: 4 días vacíos')

  aplicar('0004_seed_santiago_routines.sql')
  const despues = consultar(
    "SELECT orden, json_array_length(slots_json) AS slots FROM rutinas WHERE cliente_id='santiago' ORDER BY orden",
  )
  exigir(
    despues.length === 4 && despues.every((fila) => Number(fila.slots) === 5),
    'primera aplicación: 4 días con 5 ejercicios',
  )

  const personalizado = JSON.stringify([
    {
      orden: 1,
      ejercicioId: 'press-banca-barra',
      estimulo: 'fuerza',
      seriesObjetivo: 6,
      repMin: 2,
      repMax: 4,
      descansoSegundos: 210,
    },
  ]).replaceAll("'", "''")
  consultar(
    `UPDATE rutinas SET slots_json='${personalizado}' WHERE cliente_id='santiago' AND orden=1`,
  )

  aplicar('0004_seed_santiago_routines.sql')
  aplicar('0004_seed_santiago_routines.sql')
  const reaplicada = consultar(
    "SELECT orden, json_array_length(slots_json) AS slots, json_extract(slots_json, '$[0].ejercicioId') AS primero FROM rutinas WHERE cliente_id='santiago' ORDER BY orden",
  )
  exigir(
    Number(reaplicada[0]?.slots) === 1 && reaplicada[0]?.primero === 'press-banca-barra',
    'reaplicación: la rutina personalizada no se sobrescribe',
  )
  exigir(
    reaplicada.slice(1).every((fila) => Number(fila.slots) === 5),
    'reaplicación: los otros tres días permanecen completos',
  )

  console.log('\n4/4 checks de migración correctos\n')
} finally {
  rmSync(persistencia, { recursive: true, force: true })
}
