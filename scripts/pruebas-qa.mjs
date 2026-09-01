#!/usr/bin/env node
/**
 * Separación del cliente técnico de QA (issue #3).
 *
 * El mismo guion se ejecuta dos veces contra el mismo servidor con distinta
 * configuración, porque lo que hay que demostrar es precisamente que la
 * diferencia la marca la bandera y no el código:
 *
 *   QA_ESPERADO=true   → preview/desarrollo: dayan-test visible y operable
 *   QA_ESPERADO=false  → producción: dayan-test invisible e inoperable
 *
 * Santiago tiene que comportarse igual en los dos.
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8788'
const QA_VISIBLE = process.env.QA_ESPERADO === 'true'
const COACH = { 'Cf-Access-Jwt-Assertion': 'simulado' }
const QA = 'dayan-test'
// El id es la identidad; el nombre sólo se usa para comprobar lo que se lee.
const NOMBRE_QA = 'Cliente de prueba 1'

const resultados = []

function comprobar(id, titulo, condicion, detalle) {
  resultados.push({ id, ok: condicion })
  const marca = condicion ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'
  console.log(`  ${marca}  ${id} · ${titulo}`)
  if (!condicion) console.log(`        ${detalle}`)
}

async function pedir(ruta, opciones = {}) {
  for (let intento = 0; ; intento += 1) {
    try {
      return await fetch(`${BASE_URL}${ruta}`, { redirect: 'manual', ...opciones })
    } catch (error) {
      if (intento >= 3) throw error
      await new Promise((seguir) => setTimeout(seguir, 250))
    }
  }
}

async function comoCoach(ruta, opciones = {}) {
  return pedir(ruta, { ...opciones, headers: { ...COACH, ...(opciones.headers ?? {}) } })
}

async function postAdmin(campos) {
  return comoCoach('/admin/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(campos),
  })
}

console.log(`\nSeparación de QA · ${BASE_URL} · esperando dayan-test ${QA_VISIBLE ? 'VISIBLE' : 'OCULTO'}\n`)

// ---- Lista del panel --------------------------------------------------------
{
  const html = await (await comoCoach('/admin/')).text()
  const apareceQa = html.includes(QA)
  const apareceSantiago = html.includes('santiago')

  comprobar(
    'QA-1', `La lista del coach ${QA_VISIBLE ? 'incluye' : 'excluye'} dayan-test`,
    apareceQa === QA_VISIBLE,
    `aparece=${apareceQa}`,
  )

  comprobar(
    'QA-2', 'Santiago siempre está en la lista',
    apareceSantiago,
    'no aparece santiago',
  )
}

// ---- API de clientes --------------------------------------------------------
{
  const datos = await (await comoCoach('/admin/api/clientes')).json()
  const ids = (datos.clients ?? []).map((c) => c.id)

  comprobar(
    'QA-3', `La API ${QA_VISIBLE ? 'incluye' : 'excluye'} dayan-test`,
    ids.includes(QA) === QA_VISIBLE,
    `ids=${ids.join(',')}`,
  )

  comprobar(
    'QA-4', 'La API siempre incluye a Santiago',
    ids.includes('santiago'),
    `ids=${ids.join(',')}`,
  )
}

// ---- Detalle directo --------------------------------------------------------
{
  const api = await comoCoach(`/admin/api/clientes/${QA}`)
  const html = await comoCoach(`/admin/?cliente=${QA}`)
  const cuerpo = await html.text()

  comprobar(
    'QA-5', `Detalle por API de dayan-test → ${QA_VISIBLE ? '200' : '404'}`,
    api.status === (QA_VISIBLE ? 200 : 404),
    `status=${api.status}`,
  )

  comprobar(
    'QA-6', `Navegación directa a ?cliente=dayan-test → ${QA_VISIBLE ? 'ficha' : '404 sin datos'}`,
    QA_VISIBLE
      ? html.status === 200 && cuerpo.includes(QA)
      : html.status === 404 && !cuerpo.includes(NOMBRE_QA),
    `status=${html.status}`,
  )

  const santiago = await comoCoach('/admin/api/clientes/santiago')
  comprobar('QA-7', 'Santiago sigue accesible por API en ambos modos', santiago.status === 200, `status=${santiago.status}`)
}

// ---- Mutaciones POST --------------------------------------------------------
{
  const anadir = await postAdmin({
    accion: 'anadir-slot',
    cliente_id: QA,
    dia: '2',
    ejercicio: 'sentadilla-barra',
  })

  comprobar(
    'QA-8', `POST sobre dayan-test → ${QA_VISIBLE ? 'permitido' : 'rechazado con 404'}`,
    QA_VISIBLE ? anadir.status !== 404 : anadir.status === 404,
    `status=${anadir.status}`,
  )

  // Deshacer si el entorno lo permitió, para no dejar rastro entre ejecuciones.
  if (QA_VISIBLE && anadir.status !== 404) {
    const detalle = await (await comoCoach(`/admin/api/clientes/${QA}`)).json()
    const dia2 = (detalle.routines ?? []).find((r) => r.orden === 2)
    if (dia2?.slots?.length) {
      await postAdmin({ accion: 'quitar-slot', cliente_id: QA, dia: '2', orden: String(dia2.slots.length) })
    }
  }
}

// ---- Impersonación ----------------------------------------------------------
{
  const probar = await postAdmin({ accion: 'probar' })
  const previa = await postAdmin({ accion: 'previsualizar', cliente_id: QA })
  const previaSinCliente = await postAdmin({ accion: 'previsualizar', cliente_id: '' })

  comprobar(
    'QA-9', `Impersonar QA ("probar") → ${QA_VISIBLE ? 'crea sesión' : 'rechazado con 404'}`,
    QA_VISIBLE ? probar.status === 302 : probar.status === 404,
    `status=${probar.status}`,
  )

  comprobar(
    'QA-10', `Previsualizar como dayan-test → ${QA_VISIBLE ? 'crea sesión' : 'rechazado con 404'}`,
    QA_VISIBLE ? previa.status === 303 : previa.status === 404,
    `status=${previa.status}`,
  )

  // Sin cliente, la acción cae en el cliente técnico. En producción tiene que
  // pararla la guardia de QA (404), no la validación de id: si el orden fuera
  // el contrario, un id vacío abriría sesión de QA por descuido.
  comprobar(
    'QA-13', `Previsualizar sin cliente → ${QA_VISIBLE ? '400 por id vacío' : '404 por guardia de QA'}`,
    previaSinCliente.status === (QA_VISIBLE ? 400 : 404),
    `status=${previaSinCliente.status}`,
  )

  const santiago = await postAdmin({ accion: 'previsualizar', cliente_id: 'santiago' })
  comprobar(
    'QA-11', 'Previsualizar como Santiago funciona en ambos modos',
    santiago.status === 303,
    `status=${santiago.status}`,
  )
}

// ---- La app del participante no sabe nada de QA ni de admin ----------------
{
  const santiago = await postAdmin({ accion: 'previsualizar', cliente_id: 'santiago' })
  const cookie = (santiago.headers.get('set-cookie') ?? '').split(';')[0]
  const app = await pedir('/', { headers: { Cookie: cookie } })
  const html = await app.text()

  comprobar(
    'QA-12', 'La app del participante no menciona QA ni la consola de admin',
    app.status === 200 &&
      !html.includes(QA) &&
      !html.includes(NOMBRE_QA) &&
      !html.includes('/admin'),
    `status=${app.status}`,
  )
}

const fallos = resultados.filter((r) => !r.ok)
console.log(`\n${resultados.length - fallos.length}/${resultados.length} correctas\n`)
process.exit(fallos.length === 0 ? 0 : 1)
