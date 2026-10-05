import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Composición de la app del participante (M2).
 *
 * Node no calcula layout, así que lo geométrico se comprueba en el navegador
 * durante el QA visual. Aquí se fijan las causas: las decisiones concretas cuya
 * pérdida devolvería la app a leerse como una web bien adaptada.
 *
 * Estas pruebas leen los ficheros como texto, igual que `shellMovil.test.ts`.
 */
const raiz = (ruta: string) => readFileSync(resolve(process.cwd(), ruta), 'utf8')

const CSS = raiz('src/index.css')
const APP = raiz('src/producto/Cliente.tsx')
const HOY = raiz('src/pantallas/EntrenamientoHoy/EntrenamientoHoy.tsx')
const ENTRENO = raiz('src/pantallas/EntrenamientoHoy/Entrenamiento.tsx')
// La lista vive en `ListaBiblioteca`, compartida por el cliente y el coach.
const BIBLIOTECA = raiz('src/pantallas/Biblioteca/ListaBiblioteca.tsx')

describe('entrenar es un modo, no la pantalla de inicio', () => {
  it('Hoy no importa la fila de serie: no puede registrar nada', () => {
    // Es la garantía estructural de que Hoy quedó como resumen. Si alguien
    // vuelve a meter series aquí, esto lo dice antes que el QA visual.
    expect(HOY).not.toContain('FilaSerie')
    expect(HOY).not.toContain('CuerpoEjercicio')
  })

  it('Hoy ofrece comenzar y continuar, y el modo sabe volver', () => {
    expect(HOY).toContain('Comenzar entrenamiento')
    expect(HOY).toContain('Continuar')
    expect(ENTRENO).toContain('Volver al resumen del día')
  })

  it('App decide entre resumen y entrenamiento dentro de la misma pestaña', () => {
    expect(APP).toMatch(/<Route\s+path="entrenar"/)
    expect(APP).toContain('memoriaDia={dia}')
    expect(APP).toContain('memoriaAbierta={ejercicio}')
  })

  it('la barra de pestañas no se esconde al entrenar', () => {
    // Ocultarla parecía «reducir distracción», pero salir a la Biblioteca
    // mientras corre el descanso es un flujo real y una regresión cubierta por
    // `pruebas-maestro/qa-movil.yaml`.
    const nav = APP.slice(APP.indexOf('<nav'))
    expect(nav).toContain('Navegación del cliente')
    expect(nav).toContain('NavLink')
    expect(APP).not.toContain('!entrenando &&')
  })
})

describe('superficies: pantalla → sección → filas', () => {
  it('existe una única capa de agrupación, sin anidar', () => {
    expect(CSS).toMatch(/^\.grupo \{/m)
    expect(CSS).toMatch(/^\.fila \{/m)
  })

  it('las listas largas llegan al borde de la pantalla', () => {
    // `.contenido` mete 14px por los lados; una lista que se queda dentro se
    // lee como una caja centrada, que es lenguaje de escritorio.
    expect(CSS).toMatch(/\.grupo--pleno \{[^}]*margin-left: var\(--sangra-izq\)/)
    expect(BIBLIOTECA).toContain('grupo grupo--pleno')
  })

  it('cada fila reacciona al toque, no sólo al puntero', () => {
    // En un móvil no hay `:hover`. Sin estado pulsado, tocar una fila se siente
    // como pulsar un enlace de una web.
    expect(CSS).toMatch(/button\.fila:active,\s*\na\.fila:active \{[^}]*background: var\(--grupo-toque\)/)
  })
})

describe('la biblioteca escala', () => {
  it('busca con un solo campo, sin botón de lupa al lado', () => {
    // El par campo + botón es un formulario de sitio web. Filtra al escribir.
    expect(BIBLIOTECA).toContain('aria-label="Buscar ejercicio"')
    expect(BIBLIOTECA).toContain('normalizarBusqueda')
    expect(BIBLIOTECA).not.toContain('type="submit"')
  })

  it('es una lista de filas, no una rejilla de tarjetas con foto', () => {
    // Con los 293 de la Fase 3B, una rejilla de tarjetas son ~150 filas de
    // scroll con imágenes pesadas. La miniatura se conserva en cada fila.
    expect(BIBLIOTECA).not.toContain('className="rejilla"')
    expect(BIBLIOTECA).not.toContain('className="ficha"')
    expect(BIBLIOTECA).toContain('fila__miniatura')
  })

  it('filtrar sin resultados lo dice, en vez de dejar la pantalla en blanco', () => {
    expect(BIBLIOTECA).toContain('No hay ejercicios con “${busqueda.trim()}”.')
    expect(BIBLIOTECA).toContain('No hay ejercicios con estos filtros.')
  })
})

describe('el teclado encadena el registro', () => {
  const FILA = raiz('src/pantallas/EntrenamientoHoy/FilaSerie.tsx')

  it('la tecla de retorno dice lo que hace en cada campo', () => {
    expect(FILA).toContain('enterKeyHint="next"')
    expect(FILA).toContain('enterKeyHint="done"')
  })

  it('los campos numéricos piden el teclado que corresponde', () => {
    // Decimal para el peso —2.5 lb por lado— y numérico para las reps.
    expect(FILA).toContain('inputMode="decimal"')
    expect(FILA).toContain('inputMode="numeric"')
  })

  it('el campo que se teclea no baja de 16px, o iOS hace zoom al enfocarlo', () => {
    expect(CSS).toMatch(/\.valor--edicion \{[^}]*font-size: 16px/)
  })
})
