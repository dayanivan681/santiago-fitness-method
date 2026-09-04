#!/usr/bin/env node
/**
 * Arquitectura de información de la consola del coach (issue #4).
 *
 * Lo que se comprueba aquí no es el aspecto sino la estructura: que cada
 * pantalla responda a una sola pregunta, que el detalle no aparezca antes de
 * pedirlo, que guardar devuelva al sitio desde el que se guardó y que la vuelta
 * atrás sea siempre el nivel de arriba.
 *
 * Las medidas de toque y desborde se comprueban en el navegador, no aquí.
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8788'
const COACH = { 'Cf-Access-Jwt-Assertion': 'simulado' }
const CLIENTE = process.env.CLIENTE_UI ?? 'dayan-test'

const resultados = []

function comprobar(id, titulo, condicion, detalle) {
  resultados.push({ id, ok: condicion })
  console.log(`  ${condicion ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${id} · ${titulo}`)
  if (!condicion) console.log(`        ${detalle}`)
}

async function pedir(ruta, opciones = {}) {
  for (let intento = 0; ; intento += 1) {
    try {
      return await fetch(`${BASE_URL}${ruta}`, {
        redirect: 'manual',
        ...opciones,
        headers: { ...COACH, ...(opciones.headers ?? {}) },
      })
    } catch (error) {
      if (intento >= 3) throw error
      await new Promise((seguir) => setTimeout(seguir, 250))
    }
  }
}

async function html(ruta) {
  const respuesta = await pedir(ruta)
  return { status: respuesta.status, cuerpo: await respuesta.text() }
}

async function post(campos) {
  return pedir('/admin/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(campos),
  })
}

const base = `/admin/?cliente=${CLIENTE}`
console.log(`\nArquitectura de la consola · ${BASE_URL} · cliente ${CLIENTE}\n`)

// El cliente puede no ser visible en este entorno: `dayan-test` está oculto en
// producción a propósito. Se dice y se sale, en vez de encadenar fallos que
// parecerían del producto.
const ficha = await pedir(`/admin/api/clientes/${CLIENTE}`)
if (ficha.status !== 200) {
  console.log(`  \x1b[33mOMITIDO\x1b[0m  ${CLIENTE} no es visible aquí (HTTP ${ficha.status}).`)
  console.log(`  Ejecuta con SHOW_QA_CLIENTS=true, o pasa CLIENTE_UI=<cliente real>.\n`)
  process.exit(0)
}

// Las comprobaciones de ejercicio necesitan un día con contenido. Si el cliente
// está vacío se dice y se omiten, en vez de romper con un error de tipos que no
// explica nada.
const primerDia = (await ficha.json()).routines?.find((rutina) => rutina.orden === 1)
const HAY_EJERCICIOS = (primerDia?.slots?.length ?? 0) > 0
if (!HAY_EJERCICIOS) {
  console.log(`  \x1b[33mAVISO\x1b[0m  ${CLIENTE} no tiene ejercicios en el día 1: se omiten UI-4 a UI-8.\n`)
}

// ---- UI-1 · la lista sólo decide a quién abrir -----------------------------
{
  const { status, cuerpo } = await html('/admin/')

  comprobar(
    'UI-1', 'La lista de clientes no enseña ids ni contadores técnicos',
    status === 200 &&
      !cuerpo.includes('cliente_id:') &&
      !cuerpo.includes('Sesiones activas') &&
      !cuerpo.includes('Invitaciones pendientes') &&
      cuerpo.includes('+ Cliente'),
    `status=${status}`,
  )
}

// ---- UI-2 · el hub abre en Programa y no enseña formularios ---------------
{
  const { status, cuerpo } = await html(`${base}&seccion=programa`)

  comprobar(
    'UI-2', 'El hub abre en Programa, con días y sin campos de ejercicio',
    status === 200 &&
      cuerpo.includes('aria-current="page"') &&
      cuerpo.includes('Upper A') &&
      !cuerpo.includes('name="series"') &&
      !cuerpo.includes('name="descanso"'),
    `status=${status}`,
  )
}

// ---- UI-3 · el día lista ejercicios, no formularios ----------------------
if (HAY_EJERCICIOS) {
  const { status, cuerpo } = await html(`${base}&seccion=programa&dia=1`)

  comprobar(
    'UI-3', 'El día resume la prescripción sin abrir sus campos',
    status === 200 &&
      /\d+ series · \d+–\d+ reps · \d+:\d\d/.test(cuerpo) &&
      !cuerpo.includes('name="series"') &&
      cuerpo.includes('+ Añadir ejercicio'),
    `status=${status}`,
  )
}

// ---- UI-4 · el ejercicio sí abre sus campos -------------------------------
if (HAY_EJERCICIOS) {
  const { status, cuerpo } = await html(`${base}&seccion=programa&dia=1&ejercicio=1`)

  comprobar(
    'UI-4', 'El ejercicio abre los seis campos del coach',
    status === 200 &&
      ['ejercicio', 'series', 'rep_min', 'rep_max', 'descanso', 'estimulo', 'progresion'].every((campo) =>
        cuerpo.includes(`name="${campo}"`),
      ),
    `status=${status}`,
  )
}

// ---- UI-5 · la vuelta atrás sube un nivel, siempre ------------------------
{
  const niveles = [
    [`${base}&seccion=programa`, '/admin/'],
    [`${base}&seccion=programa&dia=1`, `cliente=${CLIENTE}&seccion=programa"`],
    ...(HAY_EJERCICIOS ? [[`${base}&seccion=programa&dia=1&ejercicio=1`, `dia=1"`]] : []),
    [`${base}&seccion=perfil&grupo=datos`, `seccion=perfil"`],
  ]
  const revisados = await Promise.all(
    niveles.map(async ([ruta, esperado]) => {
      const { cuerpo } = await html(ruta)
      // El href viene escapado en el HTML; se compara la URL real.
      const atras = (cuerpo.match(/class="atras" href="([^"]+)"/)?.[1] ?? '').replace(/&amp;/g, '&')
      return { ruta, atras, ok: atras.includes(esperado.replace(/"$/, '')) }
    }),
  )

  comprobar(
    'UI-5', 'Ejercicio → Día → Programa → Clientes: cada atrás sube un nivel',
    revisados.every((r) => r.ok),
    revisados.filter((r) => !r.ok).map((r) => `${r.ruta} → ${r.atras}`).join(' | '),
  )
}

// ---- UI-6 · destructivo detrás de confirmación ----------------------------
if (HAY_EJERCICIOS) {
  const editor = await html(`${base}&seccion=programa&dia=1&ejercicio=1`)
  const confirmacion = await html(`${base}&seccion=programa&dia=1&ejercicio=1&confirmar=quitar`)

  comprobar(
    'UI-6', 'Quitar no dispara desde la lista: pide confirmación aparte',
    // En el día no hay ningún formulario de borrado.
    !(await html(`${base}&seccion=programa&dia=1`)).cuerpo.includes('value="quitar-slot"') &&
      // En el editor el borrado es un enlace, no un submit inmediato.
      !editor.cuerpo.includes('value="quitar-slot"') &&
      editor.cuerpo.includes('confirmar=quitar') &&
      // Y sólo la pantalla de confirmación lleva el POST.
      confirmacion.cuerpo.includes('value="quitar-slot"') &&
      confirmacion.cuerpo.includes('Sí, quitar'),
    'el borrado no está detrás de confirmación',
  )
}

// ---- UI-7 · reordenar es un modo, no botones permanentes ------------------
if (HAY_EJERCICIOS) {
  const normal = await html(`${base}&seccion=programa&dia=1`)
  const modo = await html(`${base}&seccion=programa&dia=1&modo=reordenar`)

  comprobar(
    'UI-7', 'Las flechas de orden sólo existen en modo reordenar',
    !normal.cuerpo.includes('value="mover-slot"') &&
      normal.cuerpo.includes('Reordenar') &&
      modo.cuerpo.includes('value="mover-slot"'),
    'el modo reordenar no aísla las flechas',
  )
}

// ---- UI-8 · guardar un ejercicio devuelve a su día ------------------------
if (HAY_EJERCICIOS) {
  const antes = await (await pedir(`/admin/api/clientes/${CLIENTE}`)).json()
  const slot = antes.routines.find((r) => r.orden === 1)?.slots[0]
  const guardado = await post({
    accion: 'guardar-slot',
    cliente_id: CLIENTE,
    dia: '1',
    orden: '1',
    ejercicio: slot.ejercicioId,
    series: String(slot.seriesObjetivo),
    rep_min: String(slot.repMin),
    rep_max: String(slot.repMax),
    descanso: String(slot.descansoSegundos),
    estimulo: slot.estimulo,
    progresion: slot.progresionFijada ?? '',
  })
  const destino = guardado.headers.get('location') ?? ''

  comprobar(
    'UI-8', 'Guardar un ejercicio vuelve a su día, no a la ficha',
    guardado.status === 303 && destino.includes('dia=1') && !destino.includes('ejercicio='),
    `status=${guardado.status} destino=${destino}`,
  )
}

// ---- UI-9 · guardar un grupo del perfil devuelve a Perfil -----------------
{
  const perfil = (await (await pedir(`/admin/api/clientes/${CLIENTE}`)).json()).profile
  const guardado = await post({
    accion: 'guardar-perfil',
    cliente_id: CLIENTE,
    grupo: 'objetivo',
    objetivo: perfil.objetivo,
  })
  const destino = guardado.headers.get('location') ?? ''
  const despues = (await (await pedir(`/admin/api/clientes/${CLIENTE}`)).json()).profile

  comprobar(
    'UI-9', 'Guardar un grupo vuelve a Perfil y no pisa los demás campos',
    guardado.status === 303 &&
      destino.includes('seccion=perfil') &&
      despues.edad === perfil.edad &&
      despues.sexo === perfil.sexo &&
      despues.pesoCorporalLb === perfil.pesoCorporalLb &&
      despues.notas === perfil.notas,
    `destino=${destino} edad=${perfil.edad}->${despues.edad} sexo=${perfil.sexo}->${despues.sexo}`,
  )
}

// ---- UI-10 · el gate de programación sigue mandando ----------------------
//
// El gate sólo se puede probar sobre un cliente INCOMPLETE, y ninguno lo está
// de forma permanente: Santiago tiene sus cuatro días completos. Antes esta
// prueba daba por hecho que le faltaban, y además pulsaba "generar-enlace"
// sobre él, que hoy le crearía una invitación real.
//
// Así que el estado incompleto se fabrica aquí y se deshace al salir: se quita
// el último ejercicio del día 1 del cliente de pruebas, se comprueba el gate y
// se devuelve el ejercicio con sus valores exactos. La restauración se verifica;
// si no cuadra, la prueba falla en vez de dejar el cliente a medias.
{
  const dia = 1
  const antes = (await (await pedir(`/admin/api/clientes/${CLIENTE}`)).json())
    .routines?.find((rutina) => rutina.orden === dia)
  const original = antes?.slots?.at(-1)

  if (!original) {
    comprobar('UI-10', 'Con la programación incompleta el enlace sigue bloqueado', false,
      `no hay ejercicios en el día ${dia} de ${CLIENTE} para fabricar el estado incompleto`)
  } else {
    let acceso = { status: 0, cuerpo: '' }
    let intento = { status: 0 }
    try {
      await post({ accion: 'quitar-slot', cliente_id: CLIENTE, dia: String(dia), orden: String(original.orden) })
      acceso = await html(`/admin/?cliente=${CLIENTE}&seccion=acceso`)
      intento = await post({ accion: 'generar-enlace', cliente_id: CLIENTE })
    } finally {
      // Se devuelve al final de la lista, que es de donde se quitó, y con los
      // mismos números: añadir sólo repone el ejercicio con valores por defecto.
      await post({ accion: 'anadir-slot', cliente_id: CLIENTE, dia: String(dia), ejercicio: original.ejercicioId })
      await post({
        accion: 'guardar-slot', cliente_id: CLIENTE, dia: String(dia), orden: String(original.orden),
        ejercicio: original.ejercicioId, estimulo: original.estimulo,
        series: String(original.seriesObjetivo), rep_min: String(original.repMin), rep_max: String(original.repMax),
        descanso: String(original.descansoSegundos), progresion: original.progresionFijada ?? '',
      })
    }

    const despues = (await (await pedir(`/admin/api/clientes/${CLIENTE}`)).json())
      .routines?.find((rutina) => rutina.orden === dia)
    const restaurado = JSON.stringify(despues?.slots ?? []) === JSON.stringify(antes.slots)

    comprobar(
      'UI-10', 'Con la programación incompleta el enlace sigue bloqueado',
      acceso.cuerpo.includes('disabled') &&
        acceso.cuerpo.includes('INCOMPLETE') &&
        intento.status === 409 &&
        restaurado,
      `acceso=${acceso.status} generar=${intento.status} restaurado=${restaurado}`,
    )
  }
}

// ---- UI-11 · estados de vacío y de error ---------------------------------
{
  const inexistente = await html('/admin/?cliente=noexiste')
  const diaMalo = await html(`${base}&seccion=programa&dia=9`)
  const anidada = await html('/admin/lo-que-sea')

  comprobar(
    'UI-11', 'Cliente, día y ruta inexistentes dan 404 propio, sin SPA',
    inexistente.status === 404 &&
      diaMalo.status === 404 &&
      anidada.status === 404 &&
      ![inexistente, diaMalo, anidada].some((r) => r.cuerpo.includes('assets/index-')),
    `${inexistente.status}/${diaMalo.status}/${anidada.status}`,
  )
}

// ---- UI-12 · quitar un cliente es un modo, y pregunta antes --------------
//
// Se hace sobre un cliente de usar y tirar: la baja corta accesos, y probarla
// sobre alguien real dejaría a esa persona fuera de la app.
const DESECHABLE = `qa-baja-${Date.now()}`
{
  await post({ accion: 'crear-cliente', cliente_id: DESECHABLE, nombre: 'QA Baja' })

  const normal = await html('/admin/')
  const editando = await html('/admin/?modo=editar')
  const confirmacion = await html(`/admin/?cliente=${DESECHABLE}&confirmar=eliminar`)

  comprobar(
    'UI-12', 'El aspa aparece sólo en modo edición y lleva a confirmar, no a borrar',
    normal.cuerpo.includes('QA Baja') &&
      !normal.cuerpo.includes('class="quitar"') &&
      editando.cuerpo.includes('class="quitar"') &&
      editando.cuerpo.includes(`confirmar=eliminar`) &&
      confirmacion.status === 200 &&
      confirmacion.cuerpo.includes('¿Eliminar') &&
      confirmacion.cuerpo.includes('eliminar-cliente'),
    `lista=${normal.status} editar=${editando.status} confirmar=${confirmacion.status}`,
  )
}

// ---- UI-13 · la baja saca de la lista y corta el acceso -------------------
{
  // Sesión viva antes de la baja: es lo que tiene que dejar de valer.
  const previa = await post({ accion: 'previsualizar', cliente_id: DESECHABLE })
  const cookie = (previa.headers.getSetCookie?.() ?? [])
    .map((valor) => valor.split(';')[0])
    .find((valor) => valor.startsWith('sfm_sesion='))

  const baja = await post({ accion: 'eliminar-cliente', cliente_id: DESECHABLE })

  const lista = await html('/admin/')
  const ficha = await html(`/admin/?cliente=${DESECHABLE}`)
  const api = await pedir(`/admin/api/clientes/${DESECHABLE}`)

  comprobar(
    'UI-13', 'Al eliminar, el cliente sale de la lista y su ficha deja de existir',
    baja.status === 303 &&
      !lista.cuerpo.includes('QA Baja') &&
      ficha.status === 404 &&
      api.status === 404,
    `baja=${baja.status} ficha=${ficha.status} api=${api.status}`,
  )

  // La cookie sólo se puede juzgar con la puerta puesta. Con PUBLIC_TEST_MODE
  // encendido la app abre igual, así que afirmar aquí sería un falso verde.
  const puerta = await fetch(`${BASE_URL}/`, { redirect: 'manual' })
  if (puerta.status === 200) {
    console.log('  \x1b[33mOMITIDO\x1b[0m  UI-14 necesita la app cerrada (PUBLIC_TEST_MODE=false).')
  } else {
    const conCookie = await fetch(`${BASE_URL}/`, {
      redirect: 'manual',
      headers: { Cookie: cookie ?? '' },
    })
    comprobar(
      'UI-14', 'La sesión que tenía el cliente eliminado deja de abrir la app',
      Boolean(cookie) && conCookie.status === 401,
      `cookie=${Boolean(cookie)} con-cookie=${conCookie.status}`,
    )
  }
}

const fallos = resultados.filter((r) => !r.ok)
console.log(`\n${resultados.length - fallos.length}/${resultados.length} correctas\n`)
process.exit(fallos.length === 0 ? 0 : 1)
