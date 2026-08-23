#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

let root
try {
  root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  }).trim()
} catch {
  console.error('handoff: ejecuta este comando dentro de un repositorio Git.')
  process.exit(1)
}

const argv = process.argv.slice(2)
const command = argv.shift() ?? 'help'
const options = parseOptions(argv)
const handoffRelative = 'docs/HANDOFF.md'
const handoffPath = path.join(root, handoffRelative)

if (!existsSync(handoffPath)) {
  fail(`No existe ${handoffRelative}. Ejecuta el protocolo desde la raíz del proyecto.`)
}

switch (command) {
  case 'status':
    status()
    break
  case 'sync':
    sync()
    break
  case 'claim':
    claim()
    break
  case 'publish':
    publish()
    break
  case 'help':
  case '--help':
  case '-h':
    help()
    break
  default:
    fail(`Comando desconocido: ${command}`)
}

function parseOptions(values) {
  const result = {}
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]
    if (!value.startsWith('--')) fail(`Opción inválida: ${value}`)
    const withoutPrefix = value.slice(2)
    const equals = withoutPrefix.indexOf('=')
    if (equals !== -1) {
      result[withoutPrefix.slice(0, equals)] = withoutPrefix.slice(equals + 1)
      continue
    }
    const next = values[index + 1]
    if (next && !next.startsWith('--')) {
      result[withoutPrefix] = next
      index += 1
    } else {
      result[withoutPrefix] = true
    }
  }
  return result
}

function git(args, extra = {}) {
  try {
    return execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: extra.stdio ?? 'pipe',
    })
  } catch (error) {
    const detail = error?.stderr?.toString().trim() || error?.message || 'error desconocido'
    fail(`Git falló con «git ${args.join(' ')}»: ${detail}`)
  }
}

function fail(message) {
  console.error(`handoff: ${message}`)
  process.exit(1)
}

function requireOption(name) {
  const value = options[name]
  if (!value || value === true) fail(`Falta --${name}.`)
  return String(value).trim()
}

function validateAgent(agent) {
  if (!/^[a-z0-9][a-z0-9._-]{1,31}$/i.test(agent)) {
    fail('El agente debe usar solo letras, números, punto, guion o guion bajo.')
  }
  return agent
}

function currentBranch() {
  return git(['branch', '--show-current']).trim()
}

function assertMain() {
  const branch = currentBranch()
  if (branch !== 'main') {
    fail(`La rama coordinada es main; estás en ${branch || '( detached HEAD )'}.`)
  }
}

function dirtyPaths() {
  const output = git(['status', '--porcelain=v1', '-z'])
  const entries = output.split('\0').filter(Boolean)
  return entries.map((entry) => entry.slice(3))
}

function clientChanges() {
  return dirtyPaths().filter((file) => file === 'docs/cliente' || file.startsWith('docs/cliente/'))
}

function assertNoClientChanges() {
  const files = clientChanges()
  if (files.length) {
    fail(`Se detectaron cambios dentro de docs/cliente: ${files.join(', ')}. Ese folder es solo lectura.`)
  }
}

function assertClean() {
  const files = dirtyPaths()
  if (files.length) {
    fail(`El árbol de trabajo no está limpio: ${files.join(', ')}. Revisa los cambios; no uses reset --hard ni git clean.`)
  }
}

function remoteCounts() {
  const values = git(['rev-list', '--left-right', '--count', 'main...origin/main'])
    .trim()
    .split(/\s+/)
    .map(Number)
  return { ahead: values[0] || 0, behind: values[1] || 0 }
}

function fetchAndFastForward() {
  git(['fetch', 'origin', 'main'], { stdio: 'inherit' })
  const counts = remoteCounts()
  if (counts.ahead > 0 && counts.behind > 0) {
    fail('main y origin/main divergen. Se requiere revisión manual; no haré merge automático.')
  }
  if (counts.ahead > 0) {
    fail(`Hay ${counts.ahead} commit(s) locales sin publicar. Revisa y publica manualmente.`)
  }
  if (counts.behind > 0) {
    git(['merge', '--ff-only', 'origin/main'], { stdio: 'inherit' })
  }
}

function readHandoff() {
  return readFileSync(handoffPath, 'utf8')
}

function state(content) {
  const owner = content.match(/^- \*\*Owner:\*\*\s*(.+)$/m)?.[1]?.trim() ?? 'unassigned'
  const statusValue = content.match(/^- \*\*Status:\*\*\s*(.+)$/m)?.[1]?.trim() ?? 'unknown'
  return { owner, status: statusValue }
}

function updateState(content, owner, statusValue) {
  return content
    .replace(/^- \*\*Owner:\*\*.*$/m, `- **Owner:** ${owner}`)
    .replace(/^- \*\*Status:\*\*.*$/m, `- **Status:** ${statusValue}`)
    .replace(/^- \*\*Última sincronización:\*\*.*$/m, `- **Última sincronización:** ${new Date().toISOString()}`)
}

function appendEntry(content, title, fields) {
  const lines = [`### ${new Date().toISOString()} | ${title}`]
  for (const [label, value] of fields) {
    lines.push(`- **${label}:** ${String(value).trim() || 'ninguno'}`)
  }
  const entry = `${lines.join('\n')}\n`
  const marker = '<!-- HANDOFF-ENTRIES -->'
  if (!content.includes(marker)) fail(`Falta el marcador ${marker} en ${handoffRelative}.`)
  return content.replace(marker, `${marker}\n\n${entry}`)
}

function writeHandoff(content) {
  writeFileSync(handoffPath, content, 'utf8')
}

function commitAndPush(message) {
  git(['add', '-A'])
  assertNoClientChanges()
  git(['commit', '-m', message], { stdio: 'inherit' })
  git(['push', 'origin', 'main'], { stdio: 'inherit' })
  console.log(`Publicado: ${git(['log', '-1', '--oneline']).trim()}`)
}

function status() {
  assertMain()
  const handoff = state(readHandoff())
  const files = dirtyPaths()
  console.log(`owner=${handoff.owner}`)
  console.log(`status=${handoff.status}`)
  console.log(`branch=${currentBranch()}`)
  console.log(`worktree=${files.length ? `dirty (${files.join(', ')})` : 'clean'}`)
  if (files.length) assertNoClientChanges()
}

function sync() {
  assertMain()
  assertNoClientChanges()
  assertClean()
  fetchAndFastForward()
  const handoff = state(readHandoff())
  console.log(`Sincronizado con origin/main. owner=${handoff.owner}; status=${handoff.status}`)
}

function claim() {
  assertMain()
  assertClean()
  assertNoClientChanges()
  fetchAndFastForward()
  const agent = validateAgent(requireOption('agent'))
  const task = requireOption('task')
  const current = state(readHandoff())
  if (current.owner !== 'none' && current.owner !== 'unassigned') {
    fail(`El turno ya está reclamado por ${current.owner} (${current.status}).`)
  }
  let content = updateState(readHandoff(), agent, 'active')
  content = appendEntry(content, `${agent} | CLAIM`, [
    ['Estado', 'active'],
    ['Tarea', task],
    ['Cambios', 'Pendientes.'],
    ['Verificación', 'Árbol limpio y origin/main sincronizado antes de reclamar.'],
    ['Siguiente', 'Implementar la tarea y ejecutar las comprobaciones del contrato.'],
  ])
  writeHandoff(content)
  commitAndPush(`chore(handoff): claim ${agent}`)
}

function publish() {
  assertMain()
  assertNoClientChanges()
  const agent = validateAgent(requireOption('agent'))
  const statusValue = requireOption('status')
  if (!['complete', 'blocked'].includes(statusValue)) {
    fail('--status debe ser complete o blocked.')
  }
  const current = state(readHandoff())
  if (current.owner !== agent) {
    fail(`El handoff pertenece a ${current.owner}; ${agent} no puede publicarlo.`)
  }
  git(['fetch', 'origin', 'main'], { stdio: 'inherit' })
  const counts = remoteCounts()
  if (counts.behind > 0) {
    fail('Hay commits nuevos en origin/main. Guarda tu trabajo, sincroniza y revisa antes de continuar.')
  }
  const summary = requireOption('summary')
  const checks = options.checks ? String(options.checks) : 'No especificadas.'
  const next = options.next ? String(options.next) : 'Ninguno.'
  let content = updateState(readHandoff(), 'unassigned', statusValue)
  content = appendEntry(content, `${agent} | PUBLISH`, [
    ['Estado', statusValue],
    ['Tarea', options.task ? String(options.task) : 'Turno reclamado anteriormente.'],
    ['Cambios', summary],
    ['Verificación', checks],
    ['Siguiente', next],
  ])
  writeHandoff(content)
  const message = options.commit ? String(options.commit) : `chore(handoff): publish ${agent}`
  commitAndPush(message)
}

function help() {
  console.log(`Uso:
  npm run handoff:status
  npm run handoff:sync
  npm run handoff:claim -- --agent <codex|claude-code> --task "..."
  npm run handoff:publish -- --agent <agente> --status <complete|blocked> --summary "..." --checks "..." --next "..."

sync solo hace fast-forward desde origin/main con el árbol limpio.
claim y publish actualizan docs/HANDOFF.md, hacen commit y hacen push.
`)
}
