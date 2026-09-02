/**
 * Modelo aritmético de lo que vive pegado al fondo de la pantalla.
 *
 * jsdom no maqueta, así que una prueba de interfaz no puede medir un solape
 * real. Lo que sí se puede es leer la hoja de estilos y **calcular** dónde queda
 * cada pieza: las cuatro medidas que importan —pestañas, barra de sesión,
 * cronómetro y la reserva del contenido— salen todas de los mismos tokens.
 *
 * Con eso, el invariante de QA-MOB-01 se comprueba con números en vez de con
 * coincidencias de texto: el hueco reservado al final del contenido tiene que
 * llegar, como poco, hasta el borde superior del cronómetro. Si no llega, queda
 * una franja de contenido —la última serie guardada y su "Editar"— que ningún
 * desplazamiento puede liberar, y el toque se lo lleva la barra.
 */

/** Sólo sumas: si aparece otro operador, el evaluador se planta en vez de mentir. */
function sumar(expresion: string, valores: Record<string, number>): number {
  const sinCalc = expresion.replace(/calc\(/g, '(')

  const resuelta = sinCalc.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g, (_, nombre, respaldo) => {
    if (nombre in valores) return `${valores[nombre]}px`
    if (respaldo !== undefined) return respaldo.trim()
    throw new Error(`Token sin valor: ${nombre}`)
  })

  const limpia = resuelta.replace(/[()]/g, ' ').trim()
  if (/[*/-]/.test(limpia)) {
    throw new Error(`La expresión usa operadores que este modelo no cubre: ${expresion}`)
  }

  return limpia
    .split('+')
    .map((termino) => {
      const numero = Number(termino.trim().replace(/px$/, ''))
      if (!Number.isFinite(numero)) throw new Error(`Término no numérico: "${termino}" en ${expresion}`)
      return numero
    })
    .reduce((total, n) => total + n, 0)
}

const bloque = (css: string, selector: string): string => {
  const escapado = selector.replace(/[.\-*+?^${}()|[\]\\]/g, '\\$&')
  const encontrado = new RegExp(`${escapado}\\s*\\{[^}]*\\}`).exec(css)
  if (!encontrado) throw new Error(`No existe la regla ${selector}`)
  return encontrado[0]
}

/** Separa los componentes de un shorthand respetando los paréntesis. */
function partirValores(valor: string): string[] {
  const partes: string[] = []
  let actual = ""
  let profundidad = 0

  for (const caracter of valor) {
    if (caracter === "(") profundidad += 1
    if (caracter === ")") profundidad -= 1
    if (profundidad === 0 && /\s/.test(caracter)) {
      if (actual.trim()) partes.push(actual.trim())
      actual = ""
      continue
    }
    actual += caracter
  }
  if (actual.trim()) partes.push(actual.trim())
  return partes
}

const declaracion = (cuerpo: string, propiedad: string): string => {
  const encontrada = new RegExp(`(?:^|[;{])\\s*${propiedad}:\\s*([^;]+)`, 'm').exec(cuerpo)
  if (!encontrada) throw new Error(`Falta "${propiedad}" en ${cuerpo.slice(0, 40)}…`)
  return encontrada[1].trim()
}

export interface Escenario {
  /** Alto del viewport en px (874 en un iPhone 16 Pro, 667 en un SE). */
  readonly alto: number
  /** `env(safe-area-inset-bottom)`: 34 con indicador de inicio, 0 sin él. */
  readonly areaSegura: number
  /** Alto medido del cronómetro; cambia entre "Descanso" y "Descanso terminado". */
  readonly altoCronometro: number
  /** Con sesión abierta aparece además la barra de progreso. */
  readonly conBarraDeSesion: boolean
}

export interface Medidas {
  /** Borde superior del cronómetro, en coordenadas de viewport. */
  readonly cronometroTop: number
  /** Hasta dónde puede llegar el contenido antes de que empiece la reserva. */
  readonly limiteDelContenido: number
  /** Borde superior de la barra de pestañas. */
  readonly pestanasTop: number
  /** Borde superior de la barra de sesión, si la hay. */
  readonly barraTop: number | null
}

/** Calcula la pila a partir de la hoja de estilos real. */
export function medirPilaInferior(css: string, escenario: Escenario): Medidas {
  const raiz = bloque(css, ':root')
  const tokens: Record<string, number> = {
    '--fondo-seguro': escenario.areaSegura,
    '--lado-seguro-izq': 0,
    '--lado-seguro-der': 0,
    '--alto-cronometro': escenario.altoCronometro,
    '--alto-pestanas': sumar(declaracion(raiz, '--alto-pestanas'), {}),
    '--alto-barra-sesion': sumar(declaracion(raiz, '--alto-barra-sesion'), {}),
  }
  tokens['--sobre-pestanas'] = sumar(declaracion(raiz, '--sobre-pestanas'), tokens)
  tokens['--sobre-barra-sesion'] = sumar(declaracion(raiz, '--sobre-barra-sesion'), tokens)

  const reglaDelCronometro = escenario.conBarraDeSesion ? '.descanso' : '.descanso--sin-barra'
  const apoyo = sumar(declaracion(bloque(css, reglaDelCronometro), 'bottom'), tokens)

  const reglaDelContenido = escenario.conBarraDeSesion ? '.contenido--con-barra' : '.contenido'
  const cuerpo = bloque(css, reglaDelContenido)
  const reserva = sumar(
    escenario.conBarraDeSesion
      ? declaracion(cuerpo, 'padding-bottom')
      : partirValores(declaracion(cuerpo, 'padding'))[2],
    tokens,
  )

  return {
    cronometroTop: escenario.alto - apoyo - escenario.altoCronometro,
    limiteDelContenido: escenario.alto - reserva,
    pestanasTop: escenario.alto - tokens['--sobre-pestanas'],
    barraTop: escenario.conBarraDeSesion ? escenario.alto - tokens['--sobre-barra-sesion'] : null,
  }
}
