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
  // El servidor local corta alguna conexión bajo ráfagas; reintentar evita
  // fallos que no son del código bajo prueba.
  for (let intento = 0; ; intento += 1) {
    try {
      return await fetch(`${BASE_URL}${ruta}`, { redirect: 'manual', ...opciones })
    } catch (error) {
      if (intento >= 3) throw error
      await new Promise((seguir) => setTimeout(seguir, 250))
    }
  }
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
    'C', 'Enlace reutilizado → "Este enlace ya fue utilizado" (un solo uso)',
    segundo.respuesta.status === 401 && !segundo.cookie && texto.includes('Este enlace ya fue utilizado'),
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


// ═══ P2 · el GET valida sin consumir ════════════════════════════════════════

function contarSesiones() {
  const salida = sql(`SELECT COUNT(*) AS n FROM sesiones`)
  return Number(JSON.parse(salida)[0].results[0].n)
}

function estadoEnBase(hash) {
  const f = JSON.parse(sql(
    `SELECT consumida_en, revocada_en FROM invitaciones WHERE token_hash = '${hash}'`,
  ))[0].results[0]
  return f ?? null
}

async function verGet(token) {
  const r = await pedir(`/access?t=${token}`)
  return { status: r.status, html: await r.text() }
}

// ---- P2-1 · GET de invitación válida ---------------------------------------
{
  const { token, hash } = sembrarInvitacion()
  const sesionesAntes = contarSesiones()

  const { status, html } = await verGet(token)

  comprobar(
    'P2-1', 'GET válido → "Tu acceso está listo" con botón, sin consumir',
    status === 200 &&
      html.includes('Tu acceso está listo') &&
      html.includes('>Entrar<') &&
      estadoEnBase(hash).consumida_en === null &&
      contarSesiones() === sesionesAntes,
    `status=${status} consumida=${estadoEnBase(hash).consumida_en}`,
  )
}

// ---- P2-2 · varios GET seguidos --------------------------------------------
{
  const { token, hash } = sembrarInvitacion()
  const sesionesAntes = contarSesiones()

  for (let i = 0; i < 3; i += 1) await verGet(token)

  comprobar(
    'P2-2', 'Varios GET → sigue sin consumir y sin sesiones',
    estadoEnBase(hash).consumida_en === null && contarSesiones() === sesionesAntes,
    `consumida=${estadoEnBase(hash).consumida_en}`,
  )
}

// ---- P2-3 · GET de invitación ya usada -------------------------------------
{
  const { token } = sembrarInvitacion()
  await entrarCon(token)

  const { html } = await verGet(token)

  comprobar(
    'P2-3', 'GET de invitación usada → "Este enlace ya fue utilizado", sin botón',
    html.includes('Este enlace ya fue utilizado') && !html.includes('>Entrar<'),
    'no coincide el texto',
  )
}

// ---- P2-4 · GET de invitación expirada -------------------------------------
{
  const { token } = sembrarInvitacion({ creadaHace: 8 * DIA, vigencia: 7 * DIA })

  const { html } = await verGet(token)

  comprobar(
    'P2-4', 'GET de invitación expirada → "Este enlace ha expirado", sin botón',
    html.includes('Este enlace ha expirado') && !html.includes('>Entrar<'),
    'no coincide el texto',
  )
}

// ---- P2-5 · GET de invitación revocada -------------------------------------
{
  const { token, hash } = sembrarInvitacion()
  sql(`UPDATE invitaciones SET revocada_en = ${ahora()} WHERE token_hash = '${hash}'`)

  const { html } = await verGet(token)

  comprobar(
    'P2-5', 'GET de invitación revocada → "Este enlace ya no está activo", sin botón',
    html.includes('Este enlace ya no está activo') && !html.includes('>Entrar<'),
    'no coincide el texto',
  )
}

// ---- P2-6 · GET de token inexistente ---------------------------------------
{
  const { html } = await verGet(randomBytes(32).toString('base64url'))

  comprobar(
    'P2-6', 'GET de token inventado → "Enlace no válido", sin filtrar detalles',
    html.includes('Enlace no válido') &&
      !html.includes('>Entrar<') &&
      !/D1|SQL|middleware|token_hash|cliente_id|stack/i.test(html),
    'filtra información técnica o texto incorrecto',
  )
}

// ---- P2-7 · carrera: GET válido, otro consume, POST original ---------------
{
  const { token } = sembrarInvitacion()

  const previo = await verGet(token)          // pestaña A ve "válido"
  const primero = await entrarCon(token)      // pestaña B lo consume
  const tarde = await entrarCon(token)        // pestaña A envía su POST

  comprobar(
    'P2-7', 'GET válido + consumo ajeno → el POST original se rechaza igual',
    previo.html.includes('>Entrar<') && !!primero.cookie && !tarde.cookie && tarde.respuesta.status === 401,
    `primero=${!!primero.cookie} tarde=${!!tarde.cookie}`,
  )
}

// ---- P2-8 · bot de previsualización: 10 GET --------------------------------
{
  const { token, hash } = sembrarInvitacion()
  const sesionesAntes = contarSesiones()

  for (let i = 0; i < 10; i += 1) await verGet(token)

  const sigueUsable = await entrarCon(token)

  comprobar(
    'P2-8', 'Diez GET de un bot → la invitación sigue usable y sin sesiones',
    estadoEnBase(hash).consumida_en !== null &&
      contarSesiones() === sesionesAntes + 1 &&
      !!sigueUsable.cookie,
    `entró después de los GET: ${!!sigueUsable.cookie}`,
  )
}

// ---- P2-9 · flujo normal GET → POST ----------------------------------------
{
  const { token } = sembrarInvitacion()
  const sesionesAntes = contarSesiones()

  await verGet(token)
  const { cookie } = await entrarCon(token)

  comprobar(
    'P2-9', 'GET y luego POST → exactamente una sesión',
    !!cookie && contarSesiones() === sesionesAntes + 1,
    `sesiones nuevas=${contarSesiones() - sesionesAntes}`,
  )
}

// ---- P2-10 · GET inmediatamente después del POST ---------------------------
{
  const { token } = sembrarInvitacion()
  await entrarCon(token)

  const { html } = await verGet(token)

  comprobar(
    'P2-10', 'GET justo tras usarlo → "Este enlace ya fue utilizado"',
    html.includes('Este enlace ya fue utilizado') && !html.includes('>Entrar<'),
    'no coincide el texto',
  )
}


// ═══ P1 · el service worker de migración debe ser alcanzable ════════════════

// ---- P1-1 · /sw.js accesible sin sesión ------------------------------------
{
  const r = await pedir('/sw.js')
  const cuerpo = await r.text()

  comprobar(
    'P1-1', '/sw.js se sirve sin sesión, como JavaScript',
    r.status === 200 && (r.headers.get('content-type') ?? '').includes('javascript'),
    `status=${r.status} tipo=${r.headers.get('content-type')}`,
  )

  comprobar(
    'P1-2', '/sw.js no se puede servir de una copia guardada',
    ['no-store', 'no-cache', 'must-revalidate'].every((d) =>
      (r.headers.get('cache-control') ?? '').includes(d),
    ),
    r.headers.get('cache-control'),
  )

  comprobar(
    'P1-3', '/sw.js sólo migra: sin fetch, sin precarga, sin datos',
    !/addEventListener\(\s*['"]fetch/.test(cuerpo) &&
      !/precache|workbox|__WB_MANIFEST/i.test(cuerpo) &&
      !/sfm_sesion|token|cookie|secret|password|D1|invitacion/i.test(cuerpo) &&
      /skipWaiting/.test(cuerpo) &&
      /unregister/.test(cuerpo) &&
      /caches\.delete/.test(cuerpo),
    'el contenido no cumple lo esperado',
  )
}

// ---- P1-4 · la excepción es SÓLO /sw.js ------------------------------------
{
  // `/salir` no entra: es una página del middleware, no de la aplicación, y ya
  // era pública antes de este cambio. Se comprueba aparte, más abajo.
  const rutas = ['/', '/index.html', '/manifest.webmanifest', '/sw.js.map', '/swjs', '/sw.js/x']
  const indice = await pedir('/sw.js')            // sólo para descubrir los bundles
  const conSesion = await pedir('/', { headers: { Cookie: cookieBuena } })
  const html = await conSesion.text()
  const js = html.match(/\/assets\/index-[\w-]+\.js/)?.[0]
  const css = html.match(/\/assets\/index-[\w-]+\.css/)?.[0]

  const todas = [...rutas, js, css, '/ejercicios/sentadilla-barra.jpg'].filter(Boolean)
  const estados = await Promise.all(todas.map(async (r) => [r, (await pedir(r)).status]))
  const publicas = estados.filter(([ruta, estado]) => estado === 200 && ruta !== '/sw.js')

  comprobar(
    'P1-4', 'Ninguna otra ruta de la aplicación se volvió pública',
    indice.status === 200 && publicas.length === 0,
    `públicas de más: ${publicas.map(([r, e]) => r + '=' + e).join(', ')}`,
  )

  // `/salir` responde 200 sin sesión desde siempre: enseña "Sesión cerrada" y
  // borra la cookie. No sirve aplicación ni filtra nada, pero conviene fijarlo
  // para que nadie lo convierta en una vía de entrada por descuido.
  const salir = await pedir('/salir')
  const textoSalir = await salir.text()

  comprobar(
    'P1-5', '/salir sigue siendo sólo la página de cierre, sin aplicación',
    salir.status === 200 &&
      textoSalir.includes('Sesión cerrada') &&
      !textoSalir.includes('assets/index-'),
    `status=${salir.status}`,
  )
}


// ═══ Admin · pantalla propia y "Probar como cliente" ════════════════════════
//
// La cabecera de Access se puede falsificar aquí porque en local no hay Access
// delante. En producción Cloudflare elimina las cabeceras `Cf-Access-*` que
// mande un cliente, así que sólo puede llegar de Access. La comprobación del
// código es una defensa secundaria, no la puerta.

const COMO_COACH = { 'Cf-Access-Jwt-Assertion': 'simulado' }

// ---- ADMIN-1 · /admin ya no sirve la aplicación del cliente ----------------
{
  const rutas = ['/admin', '/admin/', '/admin/invitar', '/admin/lo-que-sea']
  const respuestas = await Promise.all(
    rutas.map(async (r) => {
      const x = await pedir(r, { headers: COMO_COACH })
      return { r, estado: x.status, html: await x.text() }
    }),
  )

  comprobar(
    'ADMIN-1', 'Ninguna ruta de /admin sirve la SPA del cliente',
    respuestas[0].estado === 200 && respuestas[1].estado === 200 &&
      respuestas[0].html.includes('Coach / Admin') &&
      respuestas[1].html.includes('Coach / Admin') &&
      respuestas.slice(2).every((x) => x.estado === 404) &&
      respuestas.every((x) => !x.html.includes('assets/index-')),
    respuestas.map((x) => `${x.r}=${x.estado}`).join(', '),
  )
}

// ---- ADMIN-2 · sin Access, cerrado -----------------------------------------
{
  const r = await pedir('/admin/')
  const html = await r.text()

  comprobar(
    'ADMIN-2', 'Sin la cabecera de Access → 403 y sin aplicación',
    r.status === 403 && !html.includes('assets/index-') && html.includes('No autorizado'),
    `status=${r.status}`,
  )
}

// ---- ADMIN-2b · prefijos parecidos no abren la consola ---------------------
{
  const rutas = ['/consola/', '/administrator/', '/adminish/']
  const respuestas = await Promise.all(
    rutas.map(async (r) => {
      const x = await pedir(r, { headers: COMO_COACH })
      return { r, estado: x.status, html: await x.text() }
    }),
  )

  comprobar(
    'ADMIN-2b', 'Prefijos alternativos no sirven la consola ni la SPA',
    respuestas.every((x) => x.estado === 401 && !x.html.includes('Coach / Admin') && !x.html.includes('assets/index-')),
    respuestas.map((x) => `${x.r}=${x.estado}`).join(', '),
  )
}

// ---- ADMIN-3 · Probar como cliente crea una sesión normal ------------------
//
// "Probar como cliente" abre una sesión sobre el cliente QA, y el cliente QA no
// existe cuando SHOW_QA_CLIENTS está apagado: en producción devuelve 404 a
// propósito. Antes eso no se distinguía de un fallo y, peor, ADMIN-4 encadenaba
// con una cookie vacía y reventaba el proceso con un "Invalid URL" que no
// explicaba nada. Se dice y se omite, igual que hace la suite de la consola.
const QA_VISIBLE =
  (await pedir("/admin/api/clientes/dayan-test", { headers: COMO_COACH })).status === 200

if (!QA_VISIBLE) {
  console.log("  \x1b[33mOMITIDO\x1b[0m  ADMIN-3 a ADMIN-5 necesitan el cliente QA (SHOW_QA_CLIENTS=true).")
} else {
  const antes = contarSesiones()
  const r = await pedir('/admin/', {
    method: 'POST',
    headers: { ...COMO_COACH, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ accion: 'probar' }),
  })
  const cabecera = r.headers.get('set-cookie') ?? ''
  const cookie = cabecera.split(';')[0]

  comprobar(
    'ADMIN-3', 'Probar como cliente → 302 a / con la cookie de siempre',
    r.status === 302 &&
      r.headers.get('location') === '/' &&
      cookie.startsWith('sfm_sesion=') &&
      ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/', 'Max-Age=604800'].every((a) => cabecera.includes(a)) &&
      contarSesiones() === antes + 1,
    `status=${r.status} sesiones=+${contarSesiones() - antes}`,
  )

  // ---- ADMIN-4 · con esa sesión carga TODO, imágenes incluidas -------------
  const html = await (await pedir('/', { headers: { Cookie: cookie } })).text()
  const js = html.match(/\/assets\/index-[\w-]+\.js/)?.[0]
  const css = html.match(/\/assets\/index-[\w-]+\.css/)?.[0]
  const rutas = [js, css, '/manifest.webmanifest', '/ejercicios/sentadilla-barra.jpg']

  const conSesion = await Promise.all(rutas.map((r) => pedir(r, { headers: { Cookie: cookie } })))
  const sinSesion = await Promise.all(rutas.map((r) => pedir(r)))

  comprobar(
    'ADMIN-4', 'Con la sesión del coach cargan JS, CSS, manifest e imágenes',
    conSesion.every((x) => x.status === 200),
    conSesion.map((x) => x.status).join(','),
  )

  comprobar(
    'ADMIN-5', 'Anónimo sigue recibiendo 401 en todas ellas, imágenes incluidas',
    sinSesion.every((x) => x.status === 401),
    sinSesion.map((x) => x.status).join(','),
  )
}

const fallos = resultados.filter((r) => !r.ok)
console.log(`\n${resultados.length - fallos.length}/${resultados.length} correctas\n`)
process.exit(fallos.length === 0 ? 0 : 1)
