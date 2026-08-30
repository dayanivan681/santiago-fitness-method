#!/usr/bin/env node
/**
 * Tests A–K del acceso por enlace privado, contra el runtime real de Pages.
 *
 * No usa mocks: levanta las invitaciones en la misma D1 que lee el middleware,
 * porque lo que hay que demostrar es que SQLite aplica la atomicidad del uso
 * único. Un doble de prueba no probaría nada de eso.
 */

import { execFileSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8788'
const DB = 'santiago-acceso'
const MODO = process.env.D1_MODO ?? '--local'
const DIA = 24 * 60 * 60

const resultados = []

function sql(comando) {
  return execFileSync(
    'npx',
    ['wrangler', 'd1', 'execute', DB, MODO, '--json', '--command', comando],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
  )
}

function ahora() {
  return Math.floor(Date.now() / 1000)
}

/** Inserta una invitación directamente y devuelve el token en claro. */
function sembrarInvitacion({ cliente = 'santiago', creadaHace = 0, vigencia = 7 * DIA } = {}) {
  const token = randomBytes(32).toString('base64url')
  const hash = createHash('sha256').update(token).digest('hex')
  const creada = ahora() - creadaHace
  sql(`INSERT INTO invitaciones (token_hash, cliente_id, creada_en, expira_en)
       VALUES ('${hash}', '${cliente}', ${creada}, ${creada + vigencia})`)
  return { token, hash }
}

async function pedir(ruta, opciones = {}) {
  return fetch(`${BASE_URL}${ruta}`, { redirect: 'manual', ...opciones })
}

/** POST del formulario de /access. Devuelve la cookie de sesión si entró. */
async function entrarCon(token) {
  const respuesta = await pedir('/access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ t: token }),
  })
  const cookie = (respuesta.headers.get('set-cookie') ?? '').split(';')[0]
  return { respuesta, cookie: cookie.startsWith('sfm_sesion=') ? cookie : null }
}

function comprobar(id, titulo, condicion, detalle) {
  resultados.push({ id, titulo, ok: condicion, detalle })
  const marca = condicion ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'
  console.log(`  ${marca}  ${id} · ${titulo}`)
  if (!condicion) console.log(`        ${detalle}`)
}

console.log(`\nPruebas de acceso contra ${BASE_URL}  (D1 ${MODO})\n`)

// ---- A · sin sesión, URL normal -------------------------------------------
{
  const r = await pedir('/')
  const cuerpo = await r.text()
  comprobar(
    'A', 'Sin sesión → "Acceso requerido", no la app',
    r.status === 401 && !cuerpo.includes('assets/index-') && cuerpo.includes('Acceso requerido'),
    `status=${r.status} sirvió-app=${cuerpo.includes('assets/index-')}`,
  )
}

// ---- B · enlace válido sin usar -------------------------------------------
let cookieBuena = null
{
  const { token } = sembrarInvitacion()

  const previa = await pedir(`/access?t=${token}`)
  const html = await previa.text()
  comprobar(
    'B1', 'GET del enlace NO consume, muestra botón Entrar',
    previa.status === 200 && html.includes('form method="POST"'),
    `status=${previa.status}`,
  )

  const { respuesta, cookie } = await entrarCon(token)
  cookieBuena = cookie
  comprobar(
    'B2', 'POST Entrar → sesión y redirección a /',
    respuesta.status === 302 && respuesta.headers.get('location') === '/' && !!cookie,
    `status=${respuesta.status} location=${respuesta.headers.get('location')} cookie=${!!cookie}`,
  )

  const cabecera = respuesta.headers.get('set-cookie') ?? ''
  comprobar(
    'B3', 'Cookie HttpOnly, Secure, SameSite=Lax, Path=/, 7 días',
    ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/', 'Max-Age=604800'].every((a) => cabecera.includes(a)),
    cabecera,
  )
}

// ---- C · reutilizar el mismo enlace ---------------------------------------
{
  const { token } = sembrarInvitacion()
  await entrarCon(token)
  const segundo = await entrarCon(token)
  const texto = await segundo.respuesta.text()
  comprobar(
    'C', 'Enlace reutilizado → "Enlace no válido" (un solo uso)',
    segundo.respuesta.status === 401 && !segundo.cookie && texto.includes('Enlace no válido'),
    `status=${segundo.respuesta.status} cookie=${!!segundo.cookie}`,
  )
}

// ---- C2 · dos usos simultáneos --------------------------------------------
{
  const { token } = sembrarInvitacion()
  const intentos = await Promise.all([entrarCon(token), entrarCon(token), entrarCon(token)])
  const exitos = intentos.filter((i) => i.cookie).length
  comprobar(
    'C2', 'Tres POST simultáneos → sólo uno entra',
    exitos === 1,
    `entraron ${exitos} de 3`,
  )
}

// ---- D · token inventado ---------------------------------------------------
{
  const { respuesta, cookie } = await entrarCon(randomBytes(32).toString('base64url'))
  comprobar('D', 'Token inválido → rechazado', respuesta.status === 401 && !cookie, `status=${respuesta.status}`)
}

// ---- E · enlace caducado ---------------------------------------------------
{
  const { token } = sembrarInvitacion({ creadaHace: 8 * DIA, vigencia: 7 * DIA })
  const { respuesta, cookie } = await entrarCon(token)
  comprobar('E', 'Enlace caducado → rechazado', respuesta.status === 401 && !cookie, `status=${respuesta.status}`)
}

// ---- F · sesión válida -----------------------------------------------------
{
  const r = await pedir('/', { headers: { Cookie: cookieBuena } })
  const cuerpo = await r.text()
  comprobar(
    'F', 'Sesión válida → la app se sirve',
    r.status === 200 && cuerpo.includes('assets/index-'),
    `status=${r.status}`,
  )
}

// ---- G · recarga -----------------------------------------------------------
{
  const una = await pedir('/', { headers: { Cookie: cookieBuena } })
  const dos = await pedir('/', { headers: { Cookie: cookieBuena } })
  comprobar('G', 'Recarga → sigue autenticado', una.status === 200 && dos.status === 200, `${una.status}/${dos.status}`)
}

// ---- H · navegador nuevo ---------------------------------------------------
{
  const r = await pedir('/')
  comprobar('H', 'Navegador sin cookie → inaccesible', r.status === 401, `status=${r.status}`)
}

// ---- I · sesión de más de 7 días -------------------------------------------
{
  const { token } = sembrarInvitacion()
  const { cookie } = await entrarCon(token)
  const id = createHash('sha256').update(cookie.split('=')[1]).digest('hex')
  sql(`UPDATE sesiones SET expira_en = ${ahora() - 60} WHERE id = '${id}'`)
  const r = await pedir('/', { headers: { Cookie: cookie } })
  comprobar('I', 'Sesión de más de 7 días → inaccesible', r.status === 401, `status=${r.status}`)
}

// ---- J · cerrar sesión -----------------------------------------------------
{
  const { token } = sembrarInvitacion()
  const { cookie } = await entrarCon(token)

  const salida = await pedir('/salir', { headers: { Cookie: cookie } })
  const cabecera = salida.headers.get('set-cookie') ?? ''
  const despues = await pedir('/', { headers: { Cookie: cookie } })

  comprobar(
    'J', 'Logout → cookie borrada Y sesión revocada en servidor',
    salida.status === 200 && cabecera.includes('Max-Age=0') && despues.status === 401,
    `salir=${salida.status} borra=${cabecera.includes('Max-Age=0')} reutilizada=${despues.status}`,
  )
}

// ---- K · sesión revocada ---------------------------------------------------
{
  const { token } = sembrarInvitacion()
  const { cookie } = await entrarCon(token)
  const id = createHash('sha256').update(cookie.split('=')[1]).digest('hex')

  const antes = await pedir('/', { headers: { Cookie: cookie } })
  sql(`UPDATE sesiones SET revocada_en = ${ahora()} WHERE id = '${id}'`)
  const despues = await pedir('/', { headers: { Cookie: cookie } })

  comprobar(
    'K', 'Sesión revocada → inaccesible aunque la cookie siga vigente',
    antes.status === 200 && despues.status === 401,
    `antes=${antes.status} después=${despues.status}`,
  )
}

// ---- Bypass · ficheros estáticos -------------------------------------------
{
  const indice = await pedir('/', { headers: { Cookie: cookieBuena } })
  const html = await indice.text()
  const js = html.match(/\/assets\/index-[\w-]+\.js/)?.[0]
  const css = html.match(/\/assets\/index-[\w-]+\.css/)?.[0]

  const sinCookie = await Promise.all(
    [js, css, '/manifest.webmanifest', '/ejercicios/sentadilla-barra.jpg'].map((r) => pedir(r)),
  )

  comprobar(
    'BYPASS-1', 'Ficheros estáticos también exigen sesión',
    sinCookie.every((r) => r.status === 401),
    sinCookie.map((r) => r.status).join(','),
  )
}

// ---- Bypass · el middleware no se salta con métodos raros ------------------
{
  const cabeza = await pedir('/', { method: 'HEAD' })
  const raro = await pedir('/index.html')
  comprobar(
    'BYPASS-2', 'HEAD y /index.html directo tampoco pasan',
    cabeza.status === 401 && raro.status === 401,
    `HEAD=${cabeza.status} index.html=${raro.status}`,
  )
}

// ---- Sin diagnósticos temporales -------------------------------------------
{
  const diag = await pedir('/diagnostico')
  const cabeceras = await pedir('/')
  const sfm = [...cabeceras.headers.keys()].filter((c) => c.toLowerCase().startsWith('x-sfm'))

  comprobar(
    'LIMPIO', 'Ni /diagnostico ni cabeceras X-SFM en producción',
    diag.status === 401 && sfm.length === 0,
    `diagnostico=${diag.status} cabeceras=${sfm.join(',') || 'ninguna'}`,
  )
}

const fallos = resultados.filter((r) => !r.ok)
console.log(`\n${resultados.length - fallos.length}/${resultados.length} correctas\n`)
process.exit(fallos.length === 0 ? 0 : 1)
