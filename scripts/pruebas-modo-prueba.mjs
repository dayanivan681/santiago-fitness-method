#!/usr/bin/env node
/**
 * El modo de prueba abierta, contra el servidor de verdad.
 *
 * Se ejecuta dos veces, una por estado del interruptor, porque lo que hay que
 * demostrar no es sólo que abre: es que **vuelve a cerrar**. Un bypass del que
 * no puedes salir no es temporal, es una puerta nueva.
 *
 *   PUBLIC_TEST_MODE=true  node scripts/pruebas-modo-prueba.mjs
 *   PUBLIC_TEST_MODE=false node scripts/pruebas-modo-prueba.mjs
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8788'
const ABIERTO = (process.env.PUBLIC_TEST_MODE ?? 'false') === 'true'
const resultados = []

function comprobar(id, titulo, condicion, detalle) {
  resultados.push({ id, ok: condicion })
  console.log(`  ${condicion ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${id} · ${titulo}`)
  if (!condicion) console.log(`        ${detalle}`)
}

async function pedir(ruta, opciones = {}) {
  return fetch(`${BASE_URL}${ruta}`, { redirect: 'manual', ...opciones })
}

console.log(`\nModo de prueba abierta · ${BASE_URL} · PUBLIC_TEST_MODE=${ABIERTO}\n`)

// ---- La app del cliente ------------------------------------------------------
{
  const raiz = await pedir('/')
  const cuerpo = await raiz.text()
  comprobar(
    'TM-1',
    ABIERTO ? 'La app abre sin sesión' : 'Sin sesión sigue pidiendo acceso',
    ABIERTO
      ? raiz.status === 200 && !cuerpo.includes('Acceso requerido')
      : raiz.status === 401 && cuerpo.includes('Acceso requerido'),
    `status=${raiz.status}`,
  )
}

// ---- La configuración del cliente -------------------------------------------
{
  const api = await pedir('/api/cliente')
  const datos = api.status === 200 ? await api.json() : null
  comprobar(
    'TM-2',
    ABIERTO ? 'La API resuelve la identidad en el servidor' : 'La API sigue exigiendo sesión',
    ABIERTO ? api.status === 200 && datos?.profile?.id === 'santiago' : api.status === 401,
    `status=${api.status} id=${datos?.profile?.id}`,
  )
}

// ---- La identidad no se puede pedir desde el navegador -----------------------
{
  const intruso = await pedir('/api/cliente?cliente_id=ivanprueba')
  const datos = intruso.status === 200 ? await intruso.json() : null
  comprobar(
    'TM-3',
    'El navegador no puede elegir de quién son los datos',
    ABIERTO ? datos?.profile?.id === 'santiago' : intruso.status === 401,
    `id devuelto=${datos?.profile?.id}`,
  )
}

// ---- La consola del coach ----------------------------------------------------
{
  const consola = await pedir('/admin/')
  const cuerpo = await consola.text()
  comprobar(
    'TM-4',
    ABIERTO ? 'La consola abre sin la cabecera de Access' : 'La consola sigue exigiendo Access',
    ABIERTO
      ? consola.status === 200 && cuerpo.includes('Coach / Admin')
      : consola.status === 403 && cuerpo.includes('No autorizado'),
    `status=${consola.status}`,
  )
}

// ---- Probar como cliente y volver -------------------------------------------
{
  const preview = await pedir('/admin/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ accion: 'previsualizar', cliente_id: 'santiago' }),
  })
  const cabecera = preview.headers.get('set-cookie') ?? ''
  const cookie = cabecera.split(';')[0]
  comprobar(
    'TM-5',
    ABIERTO ? '"Probar como cliente" crea sesión y lleva a la app' : 'Sin Access no se previsualiza',
    ABIERTO
      ? (preview.status === 302 || preview.status === 303) &&
        preview.headers.get('location') === '/' &&
        cabecera.includes('sfm_sesion')
      : preview.status === 403,
    `status=${preview.status} location=${preview.headers.get('location')}`,
  )

  if (ABIERTO) {
    const volver = await pedir('/salir?volver=admin', {
      headers: { Cookie: `${cookie}; sfm_preview=1` },
    })
    comprobar(
      'TM-6',
      'Salir de la vista previa devuelve a la consola',
      volver.status === 302 && volver.headers.get('location') === '/admin/',
      `status=${volver.status} location=${volver.headers.get('location')}`,
    )

    // Y tras salir, la app sigue abierta: es lo que se espera en prueba.
    const despues = await pedir('/')
    comprobar(
      'TM-7',
      'Cerrar sesión no deja al cliente fuera durante la prueba',
      despues.status === 200,
      `status=${despues.status}`,
    )
  }
}

// ---- El enlace privado no se ha roto -----------------------------------------
{
  const invalido = await pedir('/access?t=token-que-no-existe')
  comprobar(
    'TM-8',
    'El enlace privado sigue vivo y sigue rechazando lo que no vale',
    invalido.status === 401,
    `status=${invalido.status}`,
  )
}

const fallos = resultados.filter((r) => !r.ok)
console.log(`\n${resultados.length - fallos.length}/${resultados.length} correctas\n`)
process.exit(fallos.length === 0 ? 0 : 1)
