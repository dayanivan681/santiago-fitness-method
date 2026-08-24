import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * El sistema de movimiento, comprobado sobre la hoja de estilos.
 *
 * No se puede medir una animación en jsdom, pero sí se puede exigir que las
 * reglas estén: que los tiempos salgan de una tabla común en vez de números
 * sueltos, y sobre todo que `prefers-reduced-motion` las anule. Quien lo activa
 * suele hacerlo por mareo o migraña, y esto se usa mirándolo de reojo entre
 * series.
 */
const CSS = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')

describe('tiempos de movimiento centralizados', () => {
  test('existen como tabla única, no repartidos por el archivo', () => {
    for (const token of [
      '--mov-toque',
      '--mov-confirmar',
      '--mov-desplegar',
      '--mov-hoja',
      '--mov-progreso',
      '--mov-curva',
    ]) {
      expect(CSS, `falta ${token}`).toContain(`${token}:`)
    }
  })

  test('ninguno pasa de 250 ms: no puede retrasar el siguiente toque', () => {
    const tiempos = [...CSS.matchAll(/--mov-[a-z]+:\s*(\d+)ms/g)].map((m) => Number(m[1]))

    expect(tiempos.length).toBeGreaterThan(0)
    expect(Math.max(...tiempos)).toBeLessThanOrEqual(250)
  })
})

describe('movimiento reducido', () => {
  test('la hoja de estilos lo respeta', () => {
    expect(CSS).toContain('@media (prefers-reduced-motion: reduce)')
  })

  test('anula animaciones y transiciones de todo', () => {
    const bloque = CSS.slice(CSS.indexOf('@media (prefers-reduced-motion: reduce)'))

    expect(bloque).toContain('animation-duration: 0.01ms !important')
    expect(bloque).toContain('animation-iteration-count: 1 !important')
    expect(bloque).toContain('transition-duration: 0.01ms !important')
  })

  test('el aviso del cronómetro sobrevive sin movimiento', () => {
    // Se quitan las animaciones, no la información: sin pulso, el aviso tiene
    // que seguir leyéndose por color.
    const bloque = CSS.slice(CSS.indexOf('@media (prefers-reduced-motion: reduce)'))

    expect(bloque).toContain('.descanso--acabando .descanso__rotulo')
    expect(bloque).toMatch(/color:\s*var\(--rojo\)/)
  })
})

describe('nada parpadea para siempre', () => {
  test('la única animación infinita es el aviso del cronómetro', () => {
    // Una animación infinita decorativa cansa y deja de significar nada.
    const infinitas = [...CSS.matchAll(/animation:[^;]*infinite[^;]*;/g)].map((m) => m[0])

    expect(infinitas).toHaveLength(1)
    expect(infinitas[0]).toContain('latido')
  })

  test('y sólo se aplica cuando el descanso está acabando', () => {
    expect(CSS).toContain('.descanso--acabando .descanso__rotulo {')
  })
})
