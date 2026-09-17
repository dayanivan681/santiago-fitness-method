import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Símbolos que iOS pinta como emoji si no se le dice lo contrario.
 *
 * En Chromium la flecha `↗` sale como glifo de texto; en Safari de iPhone salía
 * como un emoji azul, dentro de «Ver ejercicio ↗» y «Ya tengo acceso ↗». Un
 * cuadrado azul en una paleta de negro, blanco y rojo. Ninguna prueba lo vio
 * porque todas corren en Chromium, y se descubrió mirando el simulador.
 *
 * El remedio es el selector de variación U+FE0E, que fuerza presentación de
 * texto. Esta prueba existe para que el siguiente botón con flecha no lo repita.
 */

const VS15 = '︎'
/** Los que ya han dado problemas o los dan con la misma facilidad. */
const CONFLICTIVOS = ['↗', '↘', '↖', '↙', '⚠', '✔', '✖', '⏱', '▶']

function fuentes(directorio: string): string[] {
  return readdirSync(directorio).flatMap((entrada) => {
    const ruta = join(directorio, entrada)
    if (statSync(ruta).isDirectory()) return fuentes(ruta)
    if (!/\.(tsx?|css)$/.test(ruta) || /\.test\.tsx?$/.test(ruta)) return []
    return [ruta]
  })
}

describe('símbolos que iOS convierte en emoji', () => {
  it('todos llevan el selector que fuerza presentación de texto', () => {
    const desnudos: string[] = []
    for (const ruta of fuentes('src')) {
      const contenido = readFileSync(ruta, 'utf8')
      contenido.split('\n').forEach((linea, i) => {
        for (const simbolo of CONFLICTIVOS) {
          let desde = linea.indexOf(simbolo)
          while (desde !== -1) {
            if (linea[desde + 1] !== VS15) desnudos.push(`${ruta}:${i + 1} → ${simbolo}`)
            desde = linea.indexOf(simbolo, desde + 1)
          }
        }
      })
    }

    expect(desnudos).toEqual([])
  })
})
