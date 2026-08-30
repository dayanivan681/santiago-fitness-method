#!/usr/bin/env node
/**
 * Genera una invitación desde la terminal.
 *
 * Existe por dos razones: probar el sistema sin depender del navegador, y
 * tener una salida si la página del coach no está accesible. El token se
 * imprime una vez y sólo su SHA-256 llega a la base de datos.
 *
 *   node scripts/invitar.mjs --cliente santiago [--dias 7]
 */

import { execFileSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'

const BASE = 'santiago-acceso'
const SEGUNDOS_POR_DIA = 24 * 60 * 60

function argumento(nombre, pordefecto) {
  const indice = process.argv.indexOf(`--${nombre}`)
  return indice === -1 ? pordefecto : process.argv[indice + 1]
}

const clienteId = argumento('cliente', 'santiago')
const dias = Number(argumento('dias', '7'))
const origen = argumento('origen', 'https://santiago-fitness-method.pages.dev')

if (!Number.isFinite(dias)) {
  console.error('--dias debe ser un número')
  process.exit(1)
}

const token = randomBytes(32).toString('base64url')
const tokenHash = createHash('sha256').update(token).digest('hex')
const ahora = Math.floor(Date.now() / 1000)
const expiraEn = ahora + Math.round(dias * SEGUNDOS_POR_DIA)

execFileSync(
  'npx',
  [
    'wrangler', 'd1', 'execute', BASE, '--remote',
    '--command',
    `INSERT INTO invitaciones (token_hash, cliente_id, creada_en, expira_en)
     VALUES ('${tokenHash}', '${clienteId}', ${ahora}, ${expiraEn})`,
  ],
  { stdio: 'inherit' },
)

console.log('\nEnlace (se muestra una sola vez):\n')
console.log(`${origen}/access?t=${token}\n`)
console.log(`cliente=${clienteId}  caduca=${new Date(expiraEn * 1000).toISOString()}`)
