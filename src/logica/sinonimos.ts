/**
 * Sinónimos español ↔ inglés para el buscador de la biblioteca.
 *
 * La base trae los nombres en español («Elevación lateral con mancuernas») y la
 * biblioteca del coach los suyos en inglés («Dumbbell Lateral Raise»). Sin esto,
 * «lateral raise» no encontraba la ficha en español y «squat» no encontraba
 * «Sentadilla con barra» (QA del 20 de noviembre).
 *
 * Cada grupo reúne formas equivalentes, ya normalizadas (minúsculas y sin
 * tildes, como `normalizarBusqueda`). Las frases van antes que sus palabras
 * sueltas para que «peso muerto rumano» se lea entera.
 */
export const GRUPOS_DE_SINONIMOS: readonly (readonly string[])[] = [
  // Frases
  ['lateral raise', 'elevacion lateral', 'elevaciones laterales'],
  ['front raise', 'elevacion frontal', 'elevaciones frontales'],
  ['calf raise', 'elevacion de talones', 'elevacion de gemelos', 'gemelos', 'pantorrilla'],
  ['romanian deadlift', 'rdl', 'peso muerto rumano'],
  ['stiff leg deadlift', 'peso muerto piernas rigidas'],
  ['bench press', 'press de banca', 'press banca'],
  ['shoulder press', 'press de hombro', 'press militar'],
  ['overhead press', 'press militar', 'press sobre la cabeza'],
  ['military press', 'press militar'],
  ['chest press', 'press de pecho'],
  ['leg press', 'prensa de piernas', 'prensa'],
  ['leg extension', 'extension de cuadriceps', 'extension de piernas'],
  ['leg curl', 'curl femoral'],
  ['hamstring curl', 'curl femoral'],
  ['hip thrust', 'empuje de cadera', 'puente de gluteo'],
  ['glute bridge', 'puente de gluteo'],
  ['glute kickback', 'patada de gluteo'],
  ['hip abduction', 'abduccion de cadera'],
  ['hip adduction', 'aduccion de cadera'],
  ['pull up', 'pullup', 'pull-up', 'dominada', 'dominadas'],
  ['chin up', 'chinup', 'chin-up', 'dominada supina', 'dominadas supinas'],
  ['lat pulldown', 'jalon al pecho', 'jalon'],
  ['face pull', 'jalon a la cara'],
  ['bent over row', 'remo inclinado', 'remo con barra'],
  ['seated row', 'remo sentado'],
  ['hammer curl', 'curl martillo'],
  ['preacher curl', 'curl predicador', 'curl scott'],
  ['skull crusher', 'press frances', 'rompecraneos'],
  ['triceps pushdown', 'extension de triceps en polea'],
  ['rear delt', 'deltoides posterior'],
  ['single arm', 'one arm', 'una mano', 'un brazo', 'unilateral'],
  ['single leg', 'one leg', 'una pierna', 'unilateral'],
  ['close grip', 'agarre cerrado'],
  ['wide grip', 'agarre abierto', 'agarre ancho'],
  ['split squat', 'sentadilla bulgara', 'sentadilla dividida'],
  ['good morning', 'buenos dias'],
  // Movimientos
  ['squat', 'squats', 'sentadilla', 'sentadillas'],
  ['deadlift', 'deadlifts', 'peso muerto'],
  ['press', 'press'],
  ['row', 'rows', 'remo'],
  ['curl', 'curls', 'curl'],
  ['raise', 'raises', 'elevacion', 'elevaciones'],
  ['lunge', 'lunges', 'zancada', 'zancadas', 'estocada', 'estocadas'],
  ['thrust', 'empuje'],
  ['calf', 'calves', 'gemelo', 'gemelos', 'pantorrilla', 'pantorrillas'],
  ['pulldown', 'pulldowns', 'pull down', 'jalon', 'jalones'],
  ['pushdown', 'pushdowns', 'push down', 'extension de triceps'],
  ['extension', 'extensions', 'extension', 'extensiones'],
  ['fly', 'flye', 'flyes', 'flies', 'apertura', 'aperturas', 'pec deck'],
  ['dip', 'dips', 'fondo', 'fondos'],
  ['kickback', 'kickbacks', 'patada', 'patadas'],
  ['abduction', 'abduccion'],
  ['adduction', 'aduccion'],
  ['shrug', 'shrugs', 'encogimiento', 'encogimientos'],
  ['crunch', 'crunches', 'abdominal', 'abdominales'],
  ['bridge', 'puente'],
  ['step up', 'step-up', 'subida al cajon'],
  // Músculos
  ['chest', 'pecho', 'pectoral', 'pectorales'],
  ['back', 'espalda'],
  ['shoulder', 'shoulders', 'hombro', 'hombros', 'deltoides'],
  ['glute', 'glutes', 'gluteo', 'gluteos'],
  ['quad', 'quads', 'quadriceps', 'cuadriceps'],
  ['hamstring', 'hamstrings', 'femoral', 'femorales', 'isquio', 'isquiotibiales'],
  ['triceps', 'tricep', 'triceps'],
  ['biceps', 'bicep', 'biceps'],
  ['leg', 'legs', 'pierna', 'piernas'],
  ['arm', 'arms', 'brazo', 'brazos'],
  ['hip', 'hips', 'cadera', 'caderas'],
  ['abs', 'core', 'abdomen', 'abdominales'],
  // Equipo y posición
  ['dumbbell', 'dumbbells', 'db', 'mancuerna', 'mancuernas'],
  ['barbell', 'barbells', 'barra'],
  ['cable', 'cables', 'polea', 'poleas'],
  ['machine', 'machines', 'maquina', 'maquinas'],
  ['bench', 'banca', 'banco'],
  ['incline', 'inclined', 'inclinado', 'inclinada'],
  ['decline', 'declined', 'declinado', 'declinada'],
  ['flat', 'plano', 'plana'],
  ['seated', 'sentado', 'sentada'],
  ['standing', 'de pie'],
  ['lying', 'acostado', 'tumbado'],
  ['hammer', 'martillo'],
  ['overhead', 'sobre la cabeza', 'sobre cabeza'],
  ['neutral', 'neutro'],
  ['reverse', 'inverso', 'invertido'],
  ['front', 'frontal'],
  ['rear', 'posterior'],
  ['grip', 'agarre'],
  ['band', 'banda', 'elastico'],
  ['bodyweight', 'peso corporal'],
  ['romanian', 'rumano'],
  ['bulgarian', 'bulgara'],
]

/** Palabras que no aportan al buscar varias: «curl de bíceps» = «curl bíceps». */
const PALABRAS_VACIAS = new Set(['de', 'del', 'con', 'en', 'la', 'el', 'los', 'las', 'a', 'al', 'y', 'with', 'the', 'and', 'on'])

const INDICE: ReadonlyMap<string, readonly string[]> = (() => {
  const indice = new Map<string, string[]>()
  for (const grupo of GRUPOS_DE_SINONIMOS) {
    for (const forma of grupo) {
      const previo = indice.get(forma) ?? []
      indice.set(forma, [...new Set([...previo, ...grupo])])
    }
  }
  return indice
})()

/** Una parte de lo buscado: lo que se tecleó y sus equivalentes. */
export interface Concepto {
  readonly tecleado: string
  readonly equivalentes: readonly string[]
}

/**
 * Parte un término ya normalizado en conceptos. Se prueba primero la frase más
 * larga (hasta cuatro palabras) para no romper «peso muerto rumano».
 */
export function conceptosDeBusqueda(termino: string): Concepto[] {
  const palabras = termino.split(/\s+/).filter(Boolean)
  const conceptos: Concepto[] = []
  let i = 0
  while (i < palabras.length) {
    let leido = false
    for (let n = Math.min(4, palabras.length - i); n >= 1; n--) {
      const frase = palabras.slice(i, i + n).join(' ')
      const grupo = INDICE.get(frase)
      if (grupo) {
        conceptos.push({ tecleado: frase, equivalentes: grupo })
        i += n
        leido = true
        break
      }
    }
    if (leido) continue
    const palabra = palabras[i]
    i += 1
    if (palabras.length > 1 && PALABRAS_VACIAS.has(palabra)) continue
    conceptos.push({ tecleado: palabra, equivalentes: [] })
  }
  return conceptos
}

/**
 * ¿El texto (ya normalizado) contiene el concepto?
 *
 * Lo tecleado vale en cualquier parte, como siempre («elev» encuentra
 * «Elevación»). Un equivalente tiene que empezar palabra, para que «row» no
 * aparezca dentro de otra.
 */
export function contieneConcepto(texto: string, concepto: Concepto): boolean {
  if (texto.includes(concepto.tecleado)) return true
  return concepto.equivalentes.some((forma) => inicioDePalabra(forma).test(texto))
}

const PATRONES = new Map<string, RegExp>()
function inicioDePalabra(forma: string): RegExp {
  let patron = PATRONES.get(forma)
  if (!patron) {
    patron = new RegExp(`(^|[^a-z0-9])${escapar(forma)}`)
    PATRONES.set(forma, patron)
  }
  return patron
}

function escapar(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
