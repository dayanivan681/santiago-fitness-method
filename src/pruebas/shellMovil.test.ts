import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * El contrato del armazón móvil (Fase 2).
 *
 * Son ficheros estáticos y una hoja de estilos: no hay componente que montar,
 * así que se leen y se comprueban aquí. Lo que se protege es que nadie deshaga
 * sin querer lo que hace que la app instalada se comporte como una app —y, en
 * el caso del zoom, que nadie lo "arregle" quitándole el zoom a quien lo
 * necesita para leer.
 */

const raiz = resolve(__dirname, '../..')
const leer = (ruta: string) => readFileSync(resolve(raiz, ruta), 'utf8')

const manifest = JSON.parse(leer('public/manifest.webmanifest'))
const indexHtml = leer('index.html')
const css = leer('src/index.css')
const sw = leer('public/sw.js')

describe('manifest instalable', () => {
  it('declara identidad y alcance estables', () => {
    expect(manifest.id).toBe('/')
    expect(manifest.scope).toBe('/')
    expect(manifest.start_url).toBe('/')
  })

  it('abre sin la barra del navegador', () => {
    expect(manifest.display).toBe('standalone')
  })

  it('conserva nombre, idioma y colores del método', () => {
    expect(manifest.name).toBe('Santiago Fitness Method')
    expect(manifest.short_name).toBe('Santiago FM')
    expect(manifest.lang).toBe('es')
    expect(manifest.background_color).toBe('#0b0c0d')
    expect(manifest.theme_color).toBe('#0b0c0d')
  })

  it('trae los iconos que pide la instalación, uno de ellos enmascarable', () => {
    const tamanos = manifest.icons.map((icono: { sizes: string }) => icono.sizes)
    expect(tamanos).toContain('192x192')
    expect(tamanos).toContain('512x512')
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true)
  })
})

describe('cabecera del documento', () => {
  it('iOS y el resto abren en modo aplicación', () => {
    expect(indexHtml).toContain('name="apple-mobile-web-app-capable" content="yes"')
    expect(indexHtml).toContain('name="mobile-web-app-capable" content="yes"')
  })

  it('conserva título, barra de estado y color de tema', () => {
    expect(indexHtml).toContain('name="apple-mobile-web-app-title" content="Santiago FM"')
    expect(indexHtml).toContain('name="apple-mobile-web-app-status-bar-style"')
    expect(indexHtml).toContain('name="theme-color" content="#0b0c0d"')
  })

  it('dibuja bajo el notch', () => {
    expect(indexHtml).toContain('viewport-fit=cover')
  })

  it('NO bloquea el zoom: parecer una app no puede costar la accesibilidad', () => {
    expect(indexHtml).not.toMatch(/user-scalable\s*=\s*no/)
    expect(indexHtml).not.toMatch(/maximum-scale\s*=\s*1/)
  })
})

describe('áreas seguras', () => {
  it('la pila inferior se deriva de una sola medida, no de números sueltos', () => {
    expect(css).toContain('--fondo-seguro: env(safe-area-inset-bottom, 0px)')
    expect(css).toContain('--sobre-pestanas: calc(var(--alto-pestanas) + var(--fondo-seguro))')
    expect(css).toContain(
      '--sobre-barra-sesion: calc(var(--sobre-pestanas) + var(--alto-barra-sesion))',
    )
  })

  it('la barra de sesión ya no se ancla por encima del indicador de inicio a ojo', () => {
    // Regresión: `bottom: 73px` la metía debajo de las pestañas en un iPhone
    // con indicador de inicio, porque 73 no incluye el área segura.
    expect(css).not.toMatch(/bottom:\s*73px/)
    expect(css).toContain('bottom: var(--sobre-pestanas)')
  })

  it('el cronómetro respeta los lados, no sólo el fondo', () => {
    expect(css).toContain('left: calc(14px + var(--lado-seguro-izq))')
    expect(css).toContain('right: calc(14px + var(--lado-seguro-der))')
  })

  it('reserva sitio al enfocar un campo, para que no lo tape lo que flota abajo', () => {
    expect(css).toContain('scroll-padding-bottom: calc(var(--sobre-barra-sesion) + 24px)')
  })
})

describe('áreas táctiles', () => {
  const minimoDe = (selector: string, propiedad: 'min-height' | 'min-width' | 'height' | 'width') => {
    const bloque = new RegExp(`${selector.replace(/[.\\-]/g, '\\$&')}\\s*\\{[^}]*\\}`).exec(css)?.[0]
    const valor = bloque && new RegExp(`${propiedad}:\\s*(\\d+)px`).exec(bloque)?.[1]
    return valor ? Number(valor) : null
  }

  it.each([
    ['.filtro', 'min-height'],
    ['.boton-guardar', 'min-height'],
    ['.descanso__boton', 'min-height'],
    ['.dia', 'min-height'],
  ] as const)('%s llega a 44 px', (selector, propiedad) => {
    expect(minimoDe(selector, propiedad)).toBeGreaterThanOrEqual(44)
  })

  it('los steppers miden 44 de verdad, sin pseudo-elementos que se pisen', () => {
    expect(minimoDe('.paso__boton', 'width')).toBe(44)
    expect(minimoDe('.paso__boton', 'height')).toBe(44)
  })

  it('los enlaces pequeños amplían el área y la ponen por encima', () => {
    const bloque = /\.enlace\s*\{[^}]*\}/.exec(css)?.[0] ?? ''
    expect(bloque).toContain('padding: 16px 2px')
    // Sin elevarlo, los bloques siguientes se comían el área desbordada.
    expect(bloque).toContain('z-index: 1')
  })

  it('cerrar una hoja se toca con el pulgar', () => {
    const bloque = /\.hoja__cerrar\s*\{[^}]*\}/.exec(css)?.[0] ?? ''
    expect(bloque).toContain('min-width: 44px')
    expect(bloque).toContain('padding: 16px 4px')
  })
})

describe('movimiento y toque', () => {
  it('el movimiento reducido quita movimiento, no información', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    // El aviso del cronómetro deja de parpadear pero pasa a rojo.
    expect(css).toMatch(/prefers-reduced-motion[\s\S]{0,400}color: var\(--rojo\)/)
  })

  it('la pestaña confirma el toque', () => {
    expect(css).toContain('.pestanas__boton:active .pestanas__icono')
  })

  it('no hay selección de texto ni menú contextual en los controles', () => {
    expect(css).toContain('-webkit-tap-highlight-color: transparent')
    expect(css).toContain('touch-action: manipulation')
  })

  it('la hoja no arrastra la página de detrás al llegar al final', () => {
    expect(css).toMatch(/\.hoja__panel\s*\{[^}]*overscroll-behavior: contain/)
  })
})

describe('el service worker sigue siendo sólo limpieza', () => {
  it('no intercepta peticiones', () => {
    expect(sw).not.toContain("addEventListener('fetch'")
  })

  it('no guarda nada en caché', () => {
    expect(sw).not.toMatch(/caches\.open|cache\.put|cache\.addAll/)
  })

  it('borra lo que dejó la versión anterior y se desregistra', () => {
    expect(sw).toContain('caches.delete')
    expect(sw).toContain('registration.unregister()')
  })
})

describe("barras traslúcidas", () => {
  it("el prefijo va antes que el estándar, o el minificador se queda sólo con el prefijo", () => {
    // Pasó de verdad: con \`backdrop-filter\` declarado primero, el build dejaba
    // sólo \`-webkit-backdrop-filter\` y la barra de pestañas perdía el
    // desenfoque; el contenido se leía a través de ella al desplazarse.
    const bloques = [...css.matchAll(/\{[^}]*backdrop-filter[^}]*\}/g)].map((m) => m[0])
    expect(bloques.length).toBeGreaterThan(0)
    for (const bloque of bloques) {
      const webkit = bloque.indexOf("-webkit-backdrop-filter")
      const estandar = bloque.search(/[;{\s]backdrop-filter/)
      expect(webkit).toBeGreaterThanOrEqual(0)
      expect(estandar).toBeGreaterThan(webkit)
    }
  })
})
