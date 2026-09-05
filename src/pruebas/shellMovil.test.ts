import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { medirPilaInferior } from './pilaInferior'

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
const app = leer('src/App.tsx')
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
    ['.progreso-sesion__terminar', 'min-height'],
  ] as const)('%s llega a 44 px', (selector, propiedad) => {
    expect(minimoDe(selector, propiedad)).toBeGreaterThanOrEqual(44)
  })

  it('los steppers miden 44 de verdad, sin pseudo-elementos que se pisen', () => {
    expect(minimoDe('.paso__boton', 'width')).toBe(44)
    expect(minimoDe('.paso__boton', 'height')).toBe(44)
  })

  it('los steppers tienen una affordance visual delimitada', () => {
    const bloque = /\.paso__boton\s*\{[^}]*\}/.exec(css)?.[0] ?? ''
    expect(bloque).toContain('border: 1px solid')
    expect(bloque).toContain('border-radius: 9px')
    expect(bloque).toContain('background: var(--relleno)')
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

describe('vista previa del coach', () => {
  it('mantiene un regreso explícito al Admin desde cualquier sección', () => {
    expect(app).toContain('Vista previa del cliente')
    expect(app).toContain('Volver al Coach')
    expect(app).toContain('href="/salir?volver=admin"')
    expect(css).toMatch(/\.vista-previa\s*\{[^}]*position:\s*fixed/)
  })

  it('respeta el notch y ofrece 44 px reales de toque', () => {
    expect(css).toMatch(/\.vista-previa\s*\{[^}]*safe-area-inset-top/)
    expect(css).toMatch(/\.vista-previa a\s*\{[^}]*min-height:\s*44px/)
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

/**
 * QA-MOB-01 y QA-MOB-02 — geometría de lo que flota abajo y de las marcas.
 *
 * Estas son las mitades que viven en la hoja de estilos. La otra mitad de
 * QA-MOB-01 —que el cronómetro publique su altura— está en Descanso.test.tsx.
 */
describe("el contenido reserva sitio para el cronómetro (QA-MOB-01)", () => {
  /*
   * Se calcula la geometría en vez de buscar texto en el CSS.
   *
   * El invariante: el hueco reservado al final del contenido tiene que llegar,
   * como poco, al borde superior del cronómetro. Si se queda corto, la última
   * serie guardada y su "Editar" caen debajo de la barra y el toque se lo lleva
   * ella —que es literalmente lo que reportó QA-MOB-01, con "Editar" bien
   * visible pero sordo al dedo.
   *
   * Los dos tamaños son los del contrato: iPhone 16 Pro con indicador de inicio
   * e iPhone SE sin él.
   */
  const DISPOSITIVOS = [
    { nombre: "iPhone 16 Pro", alto: 874, areaSegura: 34 },
    { nombre: "iPhone SE", alto: 667, areaSegura: 0 },
  ] as const

  /* 66 es el alto medido de la barra; 90 cubre el rótulo envuelto a 320 px. */
  const ALTURAS_DEL_CRONOMETRO = [66, 90] as const

  describe.each(DISPOSITIVOS)("$nombre", ({ alto, areaSegura }) => {
    it.each(ALTURAS_DEL_CRONOMETRO)(
      "con la barra de sesión y un cronómetro de %ipx, la reserva llega al cronómetro",
      (altoCronometro) => {
        const m = medirPilaInferior(css, { alto, areaSegura, altoCronometro, conBarraDeSesion: true })

        expect(m.limiteDelContenido).toBeLessThanOrEqual(m.cronometroTop)
      },
    )

    it.each(ALTURAS_DEL_CRONOMETRO)(
      "sin barra de sesión y un cronómetro de %ipx, la reserva también llega",
      (altoCronometro) => {
        const m = medirPilaInferior(css, { alto, areaSegura, altoCronometro, conBarraDeSesion: false })

        expect(m.limiteDelContenido).toBeLessThanOrEqual(m.cronometroTop)
      },
    )

    it("las tres capas fijas se apilan sin pisarse", () => {
      const m = medirPilaInferior(css, { alto, areaSegura, altoCronometro: 66, conBarraDeSesion: true })

      // De abajo arriba: pestañas, barra de sesión, cronómetro.
      expect(m.barraTop).toBeLessThan(m.pestanasTop)
      expect(m.cronometroTop + 66).toBeLessThanOrEqual(m.barraTop!)
    })

    it("nada se dibuja por debajo del indicador de inicio", () => {
      const m = medirPilaInferior(css, { alto, areaSegura, altoCronometro: 66, conBarraDeSesion: true })

      expect(m.pestanasTop).toBeLessThanOrEqual(alto - areaSegura)
    })
  })

  it("sin descanso en marcha la reserva se encoge, sin dejar hueco muerto", () => {
    const conCrono = medirPilaInferior(css, { alto: 874, areaSegura: 34, altoCronometro: 66, conBarraDeSesion: true })
    const sinCrono = medirPilaInferior(css, { alto: 874, areaSegura: 34, altoCronometro: 0, conBarraDeSesion: true })

    expect(sinCrono.limiteDelContenido - conCrono.limiteDelContenido).toBe(66)
  })

  it("la reserva sigue derivándose de los tokens, no de números sueltos", () => {
    // 73, 81, 134 y 184 eran las sumas escritas a mano que se descuadraban en
    // cuanto se tocaba cualquiera de las tres capas.
    const reglas = [".contenido", ".contenido--con-barra", ".descanso", ".descanso--sin-barra", ".progreso-sesion"]
    for (const regla of reglas) {
      const cuerpo = new RegExp(regla.replace(/[.-]/g, "\\$&") + "\\s*\\{[^}]*\\}").exec(css)?.[0] ?? ""
      expect(cuerpo).not.toMatch(/(?:bottom|padding[^:]*):[^;]*\b(?:73|81|134|184)px/)
    }
  })
})

describe("área táctil de Técnica y Calentamiento (QA-MOB-02)", () => {
  const bloqueMarca = /\.marca\s*\{[^}]*\}/.exec(css)?.[0] ?? ""
  // El relleno que manda es el de --tocable, que pisa al de .marca.
  const bloqueTocable = /\.marca--tocable\s*\{[^}]*\}/.exec(css)?.[0] ?? ""
  const pseudo = /\.marca--tocable::after\s*\{[^}]*\}/.exec(css)?.[0] ?? ""
  // `inset: -11px 0 -2px 0`: los ceros van sin unidad, de ahí el px opcional.
  const inset = /inset:\s*(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+(-?\d+)(?:px)?/.exec(pseudo)
  /** 2 x relleno vertical + la caja de la línea de 9.5px, que mide 14. */
  const ALTO_DE_LINEA = 14
  const altoVisible = Number(/padding:\s*(\d+)px/.exec(bloqueTocable)?.[1] ?? 0) * 2 + ALTO_DE_LINEA

  it("la píldora sigue siendo compacta y con el mismo tamaño de letra", () => {
    // Compacto es parte del diseño: lo que crece es la zona sensible, no el
    // dibujo ni la letra.
    expect(bloqueMarca).toContain("font-size: 9.5px")
    expect(altoVisible).toBeLessThan(44)
  })

  it("la zona sensible llega a 44 px de alto con holgura", () => {
    expect(inset).not.toBeNull()
    const [, arriba, , abajo] = inset!.map(Number)
    expect(altoVisible - arriba - abajo).toBeGreaterThanOrEqual(44)
  })

  it("crece hacia arriba, que es donde hay sitio, y no se mete en los steppers", () => {
    // Por debajo sólo hay 3 px hasta los ± de peso. El -6px simétrico anterior
    // se metía 3 px dentro de ellos: la marca les robaba el borde y ella misma
    // se quedaba justo por debajo de 44 medida de verdad.
    const [, arriba, , abajo] = inset!.map(Number)
    expect(-abajo).toBeLessThanOrEqual(3)
    expect(-arriba).toBeGreaterThan(-abajo)
  })

  it("la zona ampliada queda por encima de lo que se pinte después", () => {
    expect(pseudo).toContain("z-index: 1")
  })
})

describe("la fila de campos no aplasta sus propios controles", () => {
  const bloqueCampo = /\.campo\s*\{[^}]*\}/.exec(css)?.[0] ?? ""
  const bloqueFila = /\.serie__campos\s*\{[^}]*\}/.exec(css)?.[0] ?? ""

  it("un campo no encoge por debajo de su contenido", () => {
    // Con \`min-width: 0\` el flex repartía por proporción y dejaba la columna
    // más estrecha que sus dos steppers de 44 px: se salían del campo y el "+"
    // de reps caía encima del valor de RIR. En un iPhone SE eran 6 pares de
    // controles pisándose.
    expect(bloqueCampo).toContain("min-width: min-content")
    expect(bloqueCampo).not.toMatch(/min-width:\s*0\s*;/)
  })

  it("la fila envuelve cuando los tres campos no caben", () => {
    expect(bloqueFila).toContain("flex-wrap: wrap")
  })
})
