import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Reglas de maquetación de la consola del coach.
 *
 * Node no calcula layout, así que la comprobación geométrica —comparar el borde
 * derecho de cada tarjeta con el del marco— se hace en el navegador durante el
 * QA visual. Lo que se fija aquí son las causas: las reglas concretas cuya
 * ausencia produjo el desbordamiento, para que no vuelvan a perderse en una
 * edición futura.
 *
 * El fallo original: `grid-template-columns: 1fr 1fr` tiene un mínimo implícito
 * de `auto`, así que el nombre de los ejercicios —una línea sin cortar— fijaba
 * un ancho mínimo mayor que la columna. La rejilla necesitaba 1002 px dentro de
 * un marco de 820 y la segunda columna terminaba fuera del viewport.
 */
const CONSOLA = readFileSync(resolve(process.cwd(), 'functions/admin/[[ruta]].ts'), 'utf8')

/** Sólo el bloque `<style>`, para no confundir CSS con TypeScript. */
const CSS = CONSOLA.slice(CONSOLA.indexOf('<style>'), CONSOLA.indexOf('</style>'))

describe('rejilla de días en desktop', () => {
  it('usa minmax(0,1fr), que sí permite encoger las columnas', () => {
    expect(CSS).toContain('grid-template-columns:repeat(2,minmax(0,1fr))')
  })

  it('no deja ninguna rejilla con el 1fr desnudo que causó el desborde', () => {
    // `1fr 1fr` y `repeat(n,1fr)` sin minmax son exactamente el patrón roto.
    const sospechosas = [...CSS.matchAll(/grid-template-columns:([^;}]+)/g)]
      .map((coincidencia) => coincidencia[1].trim())
      // `\bfr\b` no vale: entre el dígito y la f no hay frontera de palabra y
      // la prueba pasaba con el CSS roto delante.
      .filter((valor) => /\d\s*fr\b/.test(valor) && !valor.includes('minmax(0'))

    expect(sospechosas).toEqual([])
  })

  it('permite encoger a los hijos de la rejilla', () => {
    // Sin `min-width:0` un hijo flex/grid tampoco baja de su contenido mínimo,
    // así que el minmax por sí solo no bastaría.
    expect(CSS).toMatch(/\.rejilla-dias>\*\{[^}]*min-width:0/)
  })
})

describe('el desbordamiento no se tapa', () => {
  it('no hay overflow-x:hidden en la raíz', () => {
    // Recortar en silencio convierte un fallo de maquetación en algo invisible:
    // fue lo que escondió este mismo problema hasta el QA de desktop.
    expect(CSS).not.toMatch(/html\s*,\s*body\{[^}]*overflow-x:hidden/)
  })

  it('el texto largo se corta con puntos suspensivos, no empujando el ancho', () => {
    expect(CSS).toMatch(/\.fila__detalle\{[^}]*text-overflow:ellipsis/)
    expect(CSS).toMatch(/\.fila__cuerpo\{[^}]*min-width:0/)
  })
})

describe('ergonomía táctil', () => {
  it('define el tamaño mínimo de toque en 44px y la navegación supera ese mínimo', () => {
    expect(CSS).toContain('--toque:44px')
    expect(CSS).toMatch(/\.nav-cliente a\{[^}]*min-height:52px/)
  })

  it('respeta prefers-reduced-motion', () => {
    expect(CSS).toContain('prefers-reduced-motion')
  })

  it('usa una fuente de sistema y navegación inferior sólo para el cliente abierto', () => {
    expect(CSS).toContain('font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif')
    expect(CSS).toMatch(/\.nav-cliente\{[^}]*position:fixed/)
    expect(CSS).toMatch(/\.nav-cliente a\{[^}]*min-height:52px/)
    expect(CONSOLA).toContain("['programa', 'Programa', 'programa']")
    expect(CONSOLA).toContain("['perfil', 'Perfil', 'perfil']")
    expect(CONSOLA).toContain("['acceso', 'Acceso', 'acceso']")
  })

  it('mantiene las acciones de formulario al alcance del pulgar', () => {
    expect(CSS).toMatch(/\.acciones-formulario\{[^}]*position:sticky/)
    expect(CSS).toMatch(/\.acciones-formulario\{[^}]*bottom:0/)
    expect(CONSOLA).toContain('<div class="acciones-formulario">')
  })
})

describe('biblioteca móvil existente', () => {
  it('reemplaza el select largo de añadir por una pantalla buscable del catálogo actual', () => {
    const dia = CONSOLA.slice(CONSOLA.indexOf('function pantallaDia('), CONSOLA.indexOf('// ── pantalla: ejercicio'))
    const biblioteca = CONSOLA.slice(CONSOLA.indexOf('function pantallaBiblioteca('), CONSOLA.indexOf('function pantallaDia('))

    expect(dia).toContain("modo: 'anadir'")
    expect(dia).not.toContain('<select name="ejercicio" required>')
    expect(biblioteca).toContain("CATALOGO_EJERCICIOS.filter")
    expect(biblioteca).toContain("'Buscar ejercicios'")
    expect(biblioteca).toContain('value="anadir-slot"')
  })
})

/**
 * Quitar un cliente de la lista.
 *
 * El riesgo de esta pantalla no es que no funcione, es que funcione de más: un
 * dedo en un móvil sobre una lista donde abrir y eliminar están a diez píxeles.
 * Lo que se fija aquí son las tres decisiones que lo evitan.
 */
describe('eliminar cliente', () => {
  it('el botón de quitar ocupa los 44px de toque completos', () => {
    // El aspa mide 15px. Sin tamaño propio, el área tocable sería la del glifo.
    expect(CSS).toMatch(/\.quitar\{[^}]*width:var\(--toque\)/)
    expect(CSS).toMatch(/\.quitar\{[^}]*height:var\(--toque\)/)
  })

  it('el aspa no sale subrayada', () => {
    // Es un <a>, así que hereda el subrayado del navegador: sin esto el glifo
    // aparece tachado por una raya que parece parte del icono.
    expect(CSS).toMatch(/\.quitar\{[^}]*text-decoration:none/)
  })

  it('la fila en modo edición deja de ser un enlace', () => {
    // Con la fila enlazada, el dedo tendría dos destinos pegados en la misma
    // línea: abrir el cliente y borrarlo.
    const modoEdicion = CONSOLA.slice(
      CONSOLA.indexOf('if (editando) {'),
      CONSOLA.indexOf('aria-label="Eliminar'),
    )
    expect(modoEdicion).toContain('<div class="fila">')
    expect(modoEdicion).not.toContain('<a class="fila"')
  })

  it('la baja sólo ocurre por POST, nunca siguiendo un enlace', () => {
    // Un GET destructivo lo dispara cualquier precarga del navegador. El aspa
    // lleva a preguntar; sólo el formulario de la confirmación escribe.
    expect(CONSOLA).toMatch(
      /<form method="POST"><input type="hidden" name="accion" value="eliminar-cliente">/,
    )
    expect(CONSOLA).not.toMatch(/<a[^>]*accion=eliminar/)
  })

  it('el aspa lleva a la pantalla de confirmación, no a la acción', () => {
    expect(CONSOLA).toMatch(/<a class="quitar" href="\$\{escapar\(ruta\(\{ cliente: perfil\.id, confirmar: 'eliminar' \}\)\)\}"/)
  })
})
