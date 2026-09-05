import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Reglas de composición de la consola del coach.
 *
 * Node no calcula layout, así que lo geométrico —bordes, desbordes, altura real
 * de un control— se comprueba en el navegador durante el QA visual. Lo que se
 * fija aquí son las causas: las decisiones concretas cuya pérdida devolvería la
 * consola a leerse como una web adaptada, y los fallos que ya ocurrieron una vez.
 */
const CONSOLA = readFileSync(resolve(process.cwd(), 'functions/admin/[[ruta]].ts'), 'utf8')

/** Sólo el bloque `<style>`, para no confundir CSS con TypeScript. */
const CSS = CONSOLA.slice(CONSOLA.indexOf('<style>'), CONSOLA.indexOf('</style>'))

describe('el marco no se desborda', () => {
  it('usa minmax(0,1fr), que sí permite encoger las columnas', () => {
    expect(CSS).toContain('grid-template-columns:repeat(2,minmax(0,1fr))')
  })

  it('no deja ninguna rejilla con el 1fr desnudo que causó el desborde', () => {
    // `1fr 1fr` y `repeat(n,1fr)` sin minmax son exactamente el patrón roto: el
    // mínimo implícito de 1fr es auto, así que un nombre largo fija un ancho
    // mayor que la columna y la rejilla se sale del marco.
    const sospechosas = [...CSS.matchAll(/grid-template-columns:([^;}]+)/g)]
      .map((coincidencia) => coincidencia[1].trim())
      // `\bfr\b` no vale: entre el dígito y la f no hay frontera de palabra.
      .filter((valor) => /\d\s*fr\b/.test(valor) && !valor.includes('minmax(0'))

    expect(sospechosas).toEqual([])
  })

  it('no tapa el desbordamiento en la raíz', () => {
    // Recortar en silencio convierte un fallo de maquetación en algo invisible.
    expect(CSS).not.toMatch(/html\s*,\s*body\{[^}]*overflow-x:hidden/)
  })

  it('el texto largo se corta con puntos suspensivos, no empujando el ancho', () => {
    expect(CSS).toMatch(/\.fila__detalle\{[^}]*text-overflow:ellipsis/)
    expect(CSS).toMatch(/\.fila__cuerpo\{[^}]*min-width:0/)
  })
})

describe('ergonomía táctil', () => {
  it('define el tamaño mínimo de toque en 44px', () => {
    expect(CSS).toContain('--toque:44px')
  })

  it('los campos en fila conservan los 44px, aunque se vean compactos', () => {
    // Se ven como una línea de ajustes, de 36px de alto aparente. El área que
    // responde al dedo es la del input, así que tiene que medirse aparte: con
    // 36px reales la compacidad se pagaría con accesibilidad.
    expect(CSS).toMatch(/\.fila__entrada\{[^}]*min-height:var\(--toque\)/)
    expect(CSS).toMatch(/select\.fila__entrada\{[^}]*min-height:var\(--toque\)/)
  })

  it('la barra y sus acciones no bajan del mínimo', () => {
    expect(CSS).toMatch(/\.barra__lado\{[^}]*min-width:var\(--toque\)/)
    expect(CSS).toMatch(/\.atras,\.barra__accion\{[^}]*min-height:var\(--toque\)/)
  })

  it('cada fila responde al toque, no sólo al puntero', () => {
    // Sin estado pulsado inmediato, tocar una fila se siente como pulsar un
    // enlace de una web. `:hover` no existe en un móvil.
    expect(CSS).toMatch(/\.fila:active\{background:var\(--grupo-toque\)/)
    expect(CSS).toMatch(/\.cta:active/)
  })
})

describe('continuidad entre pantallas', () => {
  it('declara transiciones de navegación entre documentos', () => {
    // La consola es SSR: sin esto cada toque es un reemplazo brusco de página,
    // que es justo la sensación que había que quitar.
    expect(CSS).toContain('@view-transition{navigation:auto}')
  })

  it('apaga el movimiento cuando el sistema lo pide, incluida la navegación', () => {
    const reducido = CSS.slice(CSS.lastIndexOf('@media(prefers-reduced-motion:reduce)'))
    expect(reducido).toContain('@view-transition{navigation:none}')
    expect(reducido).toContain('animation-duration:.01ms!important')
  })

  it('el marco no conserva transformación al terminar de entrar', () => {
    // Con `both`, el elemento mantiene la transformación del último fotograma
    // aunque sea la identidad, y eso lo convierte en bloque contenedor de sus
    // descendientes `position:fixed`: la hoja inferior se anclaba al marco en
    // vez de a la ventana y salía recortada arriba.
    expect(CSS).toMatch(/\.marco\{animation:entrar[^}]*backwards\}/)
    expect(CSS).not.toMatch(/\.marco\{animation:entrar[^}]*\bboth\b/)
  })
})

describe('composición de app, no de página', () => {
  it('no queda ningún contenedor de tarjeta que se pueda anidar', () => {
    // `.tarjeta` era el contenedor que producía tarjeta dentro de tarjeta. El
    // sistema tiene un único contenedor, `.grupo`, y dentro sólo van filas.
    expect(CSS).not.toMatch(/\.tarjeta\{/)
    expect(CONSOLA).not.toContain('class="tarjeta')
  })

  it('el contenido no vive dentro de una caja centrada en el móvil', () => {
    // El ancho máximo sólo aparece a partir de 760px. En el móvil la lista
    // llega al borde; un contenedor centrado se lee como un sitio de escritorio.
    const movil = CSS.slice(0, CSS.indexOf('@media(min-width:760px)'))
    expect(movil).not.toMatch(/\.marco\{[^}]*max-width/)
    expect(CSS.slice(CSS.indexOf('@media(min-width:760px)'))).toMatch(/\.marco\{[^}]*max-width/)
  })

  it('la barra no repite la marca en cada pantalla', () => {
    // «Santiago Fitness Method» y «Coach / Admin» sobre cada título eran una
    // miga de pan: dicen dónde está el sitio, no qué es esta pantalla.
    expect(CONSOLA).not.toContain("barra__contexto")
    expect(CONSOLA).not.toMatch(/barra\(\{[^}]*'Coach \/ Admin'/)
  })

  it('la pantalla con título grande no repite ese título en la barra', () => {
    // `barra({ titulo })` es opcional justamente para esto.
    expect(CONSOLA).toMatch(/titulo\?: string/)
    expect(CONSOLA).toContain('barra({ izquierda, derecha })')
  })
})

describe('la fila es el objetivo del dedo', () => {
  it('la biblioteca añade tocando la fila entera, no un botón dentro', () => {
    const biblioteca = CONSOLA.slice(
      CONSOLA.indexOf('function pantallaBiblioteca('),
      CONSOLA.indexOf('function pantallaDia('),
    )
    // El `+` es una pista visual dentro del botón, no un segundo destino.
    expect(biblioteca).toContain('<button type="submit" class="fila"')
    expect(biblioteca).not.toContain('class="fila fila--seleccion"')
  })

  it('el catálogo se elige en una pantalla buscable, nunca en un desplegable', () => {
    // 33 opciones en un `<select>` de móvil no se pueden leer. El editor tenía
    // uno; ahora abre la misma biblioteca que se usa para añadir.
    expect(CONSOLA).not.toContain('<select name="ejercicio"')
    expect(CONSOLA).toContain("'Buscar ejercicios'")
    expect(CONSOLA).toContain("'cambiar-ejercicio' : 'anadir-slot'")
  })
})

describe('editar es un modo, no un formulario', () => {
  it('el editor de ejercicio sale y guarda desde la barra', () => {
    const editor = CONSOLA.slice(
      CONSOLA.indexOf('function cuerpoEjercicio('),
      CONSOLA.indexOf('// ── pantalla: grupo del perfil'),
    )
    expect(editor).toContain('class="tarea"')
    expect(editor).toContain('izquierda:')
    expect(editor).toContain('barra__accion--firme">Guardar</button>')
    // Las acciones ya no viven al final del scroll dentro del formulario.
    expect(CONSOLA).not.toContain('class="acciones-formulario"')
  })

  it('los parámetros numéricos ocupan una fila, no un bloque etiqueta+input', () => {
    const editor = CONSOLA.slice(
      CONSOLA.indexOf('function cuerpoEjercicio('),
      CONSOLA.indexOf('// ── pantalla: grupo del perfil'),
    )
    expect(editor).toContain('class="fila fila--campo"')
    expect(editor).not.toContain('class="campo"')
  })
})

describe('acciones secundarias en una hoja', () => {
  it('la hoja es una ruta, no un div que se enseña con CSS', () => {
    // Al ser estado en la URL, «atrás» la cierra y no puede quedarse a medias.
    // Eso es lo que permite animarla sin arriesgar un estado inconsistente.
    expect(CONSOLA).toContain("url.searchParams.get('hoja') === 'acciones'")
    expect(CSS).not.toMatch(/\.hoja\{[^}]*display:none/)
    expect(CSS).toMatch(/\.hoja__panel\{[^}]*animation:hoja-entra/)
  })

  it('el detalle del cliente deja de llevar navegación inferior', () => {
    // La barra de pestañas vivía dentro del detalle mientras la raíz no tenía
    // ninguna: la navegación global colgaba dos niveles adentro.
    expect(CSS).not.toContain('.nav-cliente')
    expect(CONSOLA).not.toContain('navegacionCliente')
  })

  it('las acciones destructivas del cliente están en la hoja, no en la pantalla', () => {
    const detalle = CONSOLA.slice(
      CONSOLA.indexOf('function seccionPrograma('),
      CONSOLA.indexOf('function seccionPerfil('),
    )
    expect(detalle).not.toContain('eliminar')
    expect(detalle).not.toContain('revocar-enlaces')
    expect(CONSOLA).toMatch(/function hojaDeCliente\(/)
  })
})

/**
 * Quitar un cliente de la lista.
 *
 * El riesgo de esta pantalla no es que no funcione, es que funcione de más: un
 * dedo en un móvil sobre una lista donde abrir y eliminar están a diez píxeles.
 */
describe('eliminar cliente', () => {
  it('la fila en modo edición tiene un solo destino', () => {
    const modoEdicion = CONSOLA.slice(
      CONSOLA.indexOf('if (editando) {'),
      CONSOLA.indexOf('// Un punto en vez de una píldora'),
    )
    // Toda la fila lleva a confirmar. Antes era una fila muerta con un aspa
    // pequeña al lado: el único destino real medía 44px de 390.
    expect(modoEdicion).toContain("confirmar: 'eliminar'")
    expect(modoEdicion.match(/href=/g) ?? []).toHaveLength(1)
  })

  it('la baja sólo ocurre por POST, nunca siguiendo un enlace', () => {
    // Un GET destructivo lo dispara cualquier precarga del navegador.
    expect(CONSOLA).toMatch(
      /<form method="POST"><input type="hidden" name="accion" value="eliminar-cliente">/,
    )
    expect(CONSOLA).not.toMatch(/<a[^>]*accion=eliminar/)
  })

  it('la confirmación se pregunta sobre la lista que se está editando', () => {
    // Llevarse al coach a otra pantalla para confirmar volvía a sentirse como
    // cambiar de página.
    const confirmacion = CONSOLA.slice(
      CONSOLA.indexOf('async function pantallaEliminarCliente('),
      CONSOLA.indexOf('function pantallaNuevoCliente('),
    )
    expect(confirmacion).toContain('cuerpoClientes(db, mostrarQa, null, true, ')
    expect(confirmacion).toContain('hoja({')
  })
})
