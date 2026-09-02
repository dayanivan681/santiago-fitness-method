#!/usr/bin/env node
/**
 * Acuña un enlace de acceso contra la D1 LOCAL y lo imprime.
 *
 * El flujo de Maestro necesita entrar en la app, y las invitaciones son de un
 * solo uso: cada ejecución necesita la suya. Se usa `--local` a propósito, para
 * que probar no cree invitaciones en la base real.
 *
 * Igual que en producción, sólo el SHA-256 llega a la base; el token viaja en
 * el enlace y no se guarda en ningún sitio.
 *
 *   node pruebas-maestro/enlace-local.mjs [--cliente dayan-test] [--puerto 8788]
 */

import { execFileSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'

const argumento = (nombre, pordefecto) => {
  const i = process.argv.indexOf(`--${nombre}`)
  return i === -1 ? pordefecto : process.argv[i + 1]
}

const cliente = argumento('cliente', 'dayan-test')
const puerto = argumento('puerto', process.env.SFM_QA_PORT ?? '8788')
const token = randomBytes(32).toString('base64url')
const ahora = Math.floor(Date.now() / 1000)

execFileSync(
  'npx',
  [
    'wrangler', 'd1', 'execute', 'santiago-acceso', '--local',
    '--command',
    `INSERT INTO invitaciones (token_hash, cliente_id, creada_en, expira_en)
     VALUES ('${createHash('sha256').update(token).digest('hex')}', '${cliente}', ${ahora}, ${ahora + 3600})`,
  ],
  { stdio: ['ignore', 'ignore', 'inherit'] },
)

process.stdout.write(`http://localhost:${puerto}/access?t=${token}\n`)
