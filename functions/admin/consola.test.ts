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
  it('define el tamaño mínimo de toque en 44px y lo usa en la navegación', () => {
    expect(CSS).toContain('--toque:44px')
    // Las pestañas de sección llegaron a medir 40px; que salgan de la variable
    // impide que vuelva a pasar por un número suelto.
    expect(CSS).toMatch(/\.segmentado a\{[^}]*min-height:var\(--toque\)/)
  })

  it('respeta prefers-reduced-motion', () => {
    expect(CSS).toContain('prefers-reduced-motion')
  })
})
