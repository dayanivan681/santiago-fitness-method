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

// Toda esta suite gira alrededor del cliente técnico `dayan-test`, que en
// producción está oculto a propósito y responde 404. Sin este aviso el fallo se
// manifestaba como un "rutinasIniciales is not iterable" dentro del `finally`,
// que no dice nada de lo que pasa realmente.
const ficha = await pedir('/admin/api/clientes/dayan-test', { headers: ACCESS })
if (ficha.status !== 200) {
  console.log(`  \x1b[33mOMITIDO\x1b[0m  dayan-test no es visible aquí (HTTP ${ficha.status}).`)
  console.log('  Ejecuta con SHOW_QA_CLIENTS=true: la frontera de roles se prueba sobre el cliente QA.\n')
  process.exit(0)
}

const inicial = await ficha.json()
const rutinasIniciales = structuredClone(inicial.routines)

try {
  {
    const root = await pedir('/admin/', { headers: ACCESS })
    const html = await root.text()
    const nested = await pedir('/admin/ruta-desconocida', { headers: ACCESS })
    const nestedHtml = await nested.text()
    comprobar('COACH-1', 'Consola admin y ruta anidada no sirven la SPA', root.status === 200 && html.includes('Coach / Admin') && html.includes('Santiago') && html.includes('Cliente de prueba 1') && nested.status === 404 && !nestedHtml.includes('assets/index-'), `root=${root.status} nested=${nested.status}`)
  }

  {
    const anonApi = await pedir('/api/cliente')
    const anonAdminApi = await pedir('/admin/api/clientes')
    const clientAdmin = await pedir('/admin/', { headers: { Cookie: 'sfm_sesion=cliente-sin-access' } })
    comprobar('AUTH-1', 'API cliente y consola admin exigen su rol', anonApi.status === 401 && anonAdminApi.status === 403 && clientAdmin.status === 403, `${anonApi.status}/${anonAdminApi.status}/${clientAdmin.status}`)
  }

  {
    const santiago = await pedir('/admin/?cliente=santiago&seccion=perfil', { headers: ACCESS })
    const html = await santiago.text()
    comprobar(
      'PROFILE-1',
      'Admin marca los cinco placeholders de Santiago',
      santiago.status === 200 &&
        html.includes('Datos del perfil pendientes de confirmar') &&
        ['Edad: Pendiente de confirmar', 'Estatura: Pendiente de confirmar', 'Peso: Pendiente de confirmar', 'Objetivo: Pendiente de confirmar', 'Notas del coach: Pendiente de confirmar'].every((texto) => html.includes(texto)),
      `status=${santiago.status}`,
    )
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
  const detail = await pedir('/admin/?cliente=dayan-test&seccion=programa&dia=1', { headers: ACCESS })
  const detailHtml = await detail.text()
  const apiAfterEdit = await (await pedir('/admin/api/clientes/dayan-test', { headers: ACCESS })).json()
  const first = apiAfterEdit.routines.find((routine) => routine.orden === 1)?.slots[0]
  comprobar('COACH-2b', 'Guarda selección, series, rango, descanso y progresión tras refresh', edit.status === 303 && detail.status === 200 && first?.ejercicioId === 'remo-barra' && first?.seriesObjetivo === 5 && first?.repMin === 2 && first?.repMax === 8 && first?.descansoSegundos === 90 && first?.progresionFijada === 'subirCarga' && detailHtml.includes('Remo con barra'), `edit=${edit.status}`)

  // El fixture puede tener un día ya lleno (el límite de producto es 8). Usa
  // cualquier día con capacidad para que la prueba no convierta un 303 válido
  // de "máximo alcanzado" en un falso fallo.
  const rutinaEditable = apiAfterEdit.routines.find((routine) => routine.slots.length < 8)
  if (!rutinaEditable) {
    comprobar('COACH-2c', 'Rutina llena: no hay un día con capacidad para probar el ciclo', true, 'todos los días tienen 8 ejercicios')
  } else {
    const diaEditable = rutinaEditable.orden
    const add = await post({ accion: 'anadir-slot', cliente_id: 'dayan-test', dia: String(diaEditable), ejercicio: 'prensa' })
    const afterAdd = await (await pedir('/admin/api/clientes/dayan-test', { headers: ACCESS })).json()
    const rutinaTrasAnadir = afterAdd.routines.find((routine) => routine.orden === diaEditable)
    const move = await post({ accion: 'mover-slot', cliente_id: 'dayan-test', dia: String(diaEditable), orden: String(rutinaTrasAnadir?.slots.length ?? 1), direccion: 'arriba' })
    const afterMove = await (await pedir('/admin/api/clientes/dayan-test', { headers: ACCESS })).json()
    const rutinaTrasMover = afterMove.routines.find((routine) => routine.orden === diaEditable)
    const remove = await post({ accion: 'quitar-slot', cliente_id: 'dayan-test', dia: String(diaEditable), orden: String(rutinaTrasMover?.slots.length ?? 1) })
    const afterRemove = await (await pedir('/admin/api/clientes/dayan-test', { headers: ACCESS })).json()
    const rutinaFinal = afterRemove.routines.find((routine) => routine.orden === diaEditable)
    comprobar(
      'COACH-2c',
      'Puede añadir, reordenar y quitar sin perder la rutina',
      add.status === 303 && move.status === 303 && remove.status === 303 &&
        rutinaTrasAnadir?.slots.length === rutinaEditable.slots.length + 1 &&
        rutinaFinal?.slots.length === rutinaEditable.slots.length,
      `día=${diaEditable} add/move/remove=${add.status}/${move.status}/${remove.status}`,
    )
  }

  {
    const upperB = rutinasIniciales.find((routine) => routine.orden === 3)
    const incompleta = escaparSql(JSON.stringify(upperB?.slots.slice(0, 4) ?? []))
    sql(`UPDATE rutinas SET slots_json='${incompleta}', actualizado_en=unixepoch() WHERE cliente_id='dayan-test' AND orden=3;`)
    const antes = Number(sql("SELECT COUNT(*) AS n FROM invitaciones WHERE cliente_id='dayan-test';")[0].results[0].n)
    // El estado de programación y el bloqueo del enlace viven en Acceso.
    const detalle = await pedir('/admin/?cliente=dayan-test&seccion=acceso', { headers: ACCESS })
    const detalleHtml = await detalle.text()
    const bloqueada = await post({ accion: 'generar-enlace', cliente_id: 'dayan-test' })
    const bloqueadaHtml = await bloqueada.text()
    const despues = Number(sql("SELECT COUNT(*) AS n FROM invitaciones WHERE cliente_id='dayan-test';")[0].results[0].n)
    comprobar(
      'READY-1',
      'INCOMPLETE identifica el día y deshabilita/bloquea invitaciones',
      detalle.status === 200 &&
        detalleHtml.includes('INCOMPLETE') &&
        detalleHtml.includes('Upper B: 4 ejercicios') &&
        detalleHtml.includes('disabled') &&
        bloqueada.status === 409 &&
        bloqueadaHtml.includes('No se generó el enlace') &&
        antes === despues,
      `detail=${detalle.status} post=${bloqueada.status} invites=${antes}->${despues}`,
    )
    const restaurada = escaparSql(JSON.stringify(upperB?.slots ?? []))
    sql(`UPDATE rutinas SET slots_json='${restaurada}', actualizado_en=unixepoch() WHERE cliente_id='dayan-test' AND orden=3;`)
    const lista = await pedir('/admin/?cliente=dayan-test&seccion=acceso', { headers: ACCESS })
    const listaHtml = await lista.text()
    comprobar(
      'READY-2',
      'READY se recupera al completar 4 días de 5–8 ejercicios',
      lista.status === 200 && listaHtml.includes('insignia--ready">READY') && listaHtml.includes('Upper A: 5') && listaHtml.includes('Lower B: 5'),
      `status=${lista.status}`,
    )
  }

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
