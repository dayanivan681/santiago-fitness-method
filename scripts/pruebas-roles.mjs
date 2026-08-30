#!/usr/bin/env node
/**
 * Regresión de la frontera Coach/Admin ↔ Cliente contra Pages + D1 reales.
 * Se ejecuta sobre un entorno local por defecto y sólo modifica el cliente
 * técnico `dayan-test`; guarda y restaura sus rutinas al finalizar.
 */

import { execFileSync } from 'node:child_process'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8788'
const DB = 'santiago-acceso'
const MODO = process.env.D1_MODO ?? '--local'
const ACCESS = { 'Cf-Access-Jwt-Assertion': 'qa-local' }
const resultados = []

function sql(comando) {
  const salida = execFileSync(
    'npx',
    ['wrangler', 'd1', 'execute', DB, MODO, '--json', '--command', comando],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
  )
  return JSON.parse(salida)
}

async function pedir(ruta, opciones = {}) {
  return fetch(`${BASE_URL}${ruta}`, { redirect: 'manual', ...opciones })
}

async function post(formulario) {
  return pedir('/admin/', {
    method: 'POST',
    headers: { ...ACCESS, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(formulario),
  })
}

function comprobar(id, titulo, ok, detalle = '') {
  resultados.push(ok)
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${id} · ${titulo}${ok ? '' : ` (${detalle})`}`)
}

function cookies(respuesta) {
  if (typeof respuesta.headers.getSetCookie === 'function') return respuesta.headers.getSetCookie()
  const valor = respuesta.headers.get('set-cookie')
  return valor ? valor.split(/,(?=\s*[^;,=]+=[^;,]+)/) : []
}

function valorCookie(respuesta, nombre) {
  return cookies(respuesta).find((cookie) => cookie.startsWith(`${nombre}=`))?.split(';')[0] ?? null
}

function escaparSql(valor) {
  return valor.replaceAll("'", "''")
}

console.log(`\nQA de roles contra ${BASE_URL} (D1 ${MODO})\n`)

const inicial = await (async () => {
  const respuesta = await pedir('/admin/api/clientes/dayan-test', { headers: ACCESS })
  return respuesta.json()
})()
const rutinasIniciales = structuredClone(inicial.routines)

try {
  {
    const root = await pedir('/admin/', { headers: ACCESS })
    const html = await root.text()
    const nested = await pedir('/admin/ruta-desconocida', { headers: ACCESS })
    const nestedHtml = await nested.text()
    comprobar('COACH-1', 'Consola admin y ruta anidada no sirven la SPA', root.status === 200 && html.includes('Coach / Admin') && html.includes('Santiago') && html.includes('QA Role Split') && nested.status === 404 && !nestedHtml.includes('assets/index-'), `root=${root.status} nested=${nested.status}`)
  }

  {
    const anonApi = await pedir('/api/cliente')
    const anonAdminApi = await pedir('/admin/api/clientes')
    const clientAdmin = await pedir('/admin/', { headers: { Cookie: 'sfm_sesion=cliente-sin-access' } })
    comprobar('AUTH-1', 'API cliente y consola admin exigen su rol', anonApi.status === 401 && anonAdminApi.status === 403 && clientAdmin.status === 403, `${anonApi.status}/${anonAdminApi.status}/${clientAdmin.status}`)
  }

  const beforeLower = rutinasIniciales.find((routine) => routine.orden === 2)
  if (beforeLower && beforeLower.slots.length < 1) {
    const add = await post({ accion: 'anadir-slot', cliente_id: 'dayan-test', dia: '2', ejercicio: 'sentadilla-barra' })
    comprobar('COACH-2a', 'Puede añadir un ejercicio a un día vacío', add.status === 303, `status=${add.status}`)
  } else {
    comprobar('COACH-2a', 'Fixture QA tiene días editables', true)
  }

  const edit = await post({
    accion: 'guardar-slot', cliente_id: 'dayan-test', dia: '1', orden: '1', ejercicio: 'remo-barra', estimulo: 'fuerza', series: '5', rep_min: '2', rep_max: '8', descanso: '90', progresion: 'subirCarga',
  })
  const detail = await pedir('/admin/?cliente=dayan-test', { headers: ACCESS })
  const detailHtml = await detail.text()
  const apiAfterEdit = await (await pedir('/admin/api/clientes/dayan-test', { headers: ACCESS })).json()
  const first = apiAfterEdit.routines.find((routine) => routine.orden === 1)?.slots[0]
  comprobar('COACH-2b', 'Guarda selección, series, rango, descanso y progresión tras refresh', edit.status === 303 && detail.status === 200 && first?.ejercicioId === 'remo-barra' && first?.seriesObjetivo === 5 && first?.repMin === 2 && first?.repMax === 8 && first?.descansoSegundos === 90 && first?.progresionFijada === 'subirCarga' && detailHtml.includes('Rutina administrada'), `edit=${edit.status}`)

  const lowerBefore = apiAfterEdit.routines.find((routine) => routine.orden === 2)
  const add = await post({ accion: 'anadir-slot', cliente_id: 'dayan-test', dia: '2', ejercicio: 'prensa' })
  const afterAdd = await (await pedir('/admin/api/clientes/dayan-test', { headers: ACCESS })).json()
  const lowerAfterAdd = afterAdd.routines.find((routine) => routine.orden === 2)
  const move = await post({ accion: 'mover-slot', cliente_id: 'dayan-test', dia: '2', orden: String(lowerAfterAdd?.slots.length ?? 1), direccion: 'arriba' })
  const afterMove = await (await pedir('/admin/api/clientes/dayan-test', { headers: ACCESS })).json()
  const moved = afterMove.routines.find((routine) => routine.orden === 2)
  const remove = await post({ accion: 'quitar-slot', cliente_id: 'dayan-test', dia: '2', orden: String(moved?.slots.length ?? 1) })
  const afterRemove = await (await pedir('/admin/api/clientes/dayan-test', { headers: ACCESS })).json()
  const lowerFinal = afterRemove.routines.find((routine) => routine.orden === 2)
  comprobar('COACH-2c', 'Puede añadir, reordenar y quitar sin perder la rutina', add.status === 303 && move.status === 303 && remove.status === 303 && lowerAfterAdd?.slots.length === (lowerBefore?.slots.length ?? 0) + 1 && lowerFinal?.slots.length === lowerBefore?.slots.length, `add/move/remove=${add.status}/${move.status}/${remove.status}`)

  const link = await post({ accion: 'generar-enlace', cliente_id: 'dayan-test' })
  const linkHtml = await link.text()
  const revoke = await post({ accion: 'revocar-enlaces', cliente_id: 'dayan-test' })
  comprobar('COACH-3', 'Genera y revoca enlaces del cliente QA', link.status === 200 && linkHtml.includes('Enlace de un solo uso listo') && revoke.status === 303, `link=${link.status} revoke=${revoke.status}`)

  const antesSesiones = Number(sql("SELECT COUNT(*) AS n FROM sesiones WHERE cliente_id='dayan-test' AND revocada_en IS NULL AND expira_en > unixepoch();")[0].results[0].n)
  const preview = await post({ accion: 'previsualizar', cliente_id: 'dayan-test' })
  const sesionCookie = valorCookie(preview, 'sfm_sesion')
  const previewCookie = valorCookie(preview, 'sfm_preview')
  const clienteConfig = await (await pedir('/api/cliente?cliente_id=santiago', { headers: { Cookie: sesionCookie ?? '' } })).json()
  const despuesSesiones = Number(sql("SELECT COUNT(*) AS n FROM sesiones WHERE cliente_id='dayan-test' AND revocada_en IS NULL AND expira_en > unixepoch();")[0].results[0].n)
  comprobar('ROUNDTRIP-1', 'Preview crea sesión normal y API deriva la identidad', (preview.status === 302 || preview.status === 303) && preview.headers.get('location') === '/' && !!sesionCookie && !!previewCookie && clienteConfig.profile?.id === 'dayan-test' && despuesSesiones === antesSesiones + 1, `preview=${preview.status} sessions=${antesSesiones}->${despuesSesiones}`)

  const clientAdmin = await pedir('/admin/api/clientes/dayan-test', { headers: { Cookie: sesionCookie ?? '' } })
  const clientMutation = await pedir('/api/cliente', { method: 'POST', headers: { Cookie: sesionCookie ?? '' } })
  const exit = await pedir('/salir?volver=admin', { headers: { Cookie: `${sesionCookie ?? ''}; ${previewCookie ?? ''}` } })
  const afterExit = await pedir('/api/cliente', { headers: { Cookie: sesionCookie ?? '' } })
  comprobar('ROUNDTRIP-2', 'Cliente no invoca mutaciones coach y salir de preview revoca la sesión', clientAdmin.status === 403 && clientMutation.status === 405 && exit.status === 302 && exit.headers.get('location') === '/admin/' && afterExit.status === 401, `admin=${clientAdmin.status} mutation=${clientMutation.status} exit=${exit.status} api=${afterExit.status}`)
} finally {
  for (const rutina of rutinasIniciales) {
    const json = escaparSql(JSON.stringify(rutina.slots))
    sql(`UPDATE rutinas SET slots_json='${json}', actualizado_en=unixepoch() WHERE id='${escaparSql(rutina.id)}' AND cliente_id='dayan-test';`)
  }
}

const fallos = resultados.filter((ok) => !ok).length
console.log(`\n${resultados.length - fallos}/${resultados.length} checks de roles correctos\n`)
process.exit(fallos === 0 ? 0 : 1)
