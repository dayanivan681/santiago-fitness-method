/**
 * Fuente canónica del catálogo de ejercicios: id y nombre.
 *
 * Este módulo no depende ni de React ni de Cloudflare, igual que
 * `plantillas-base.ts`: lo consumen la biblioteca local (Dexie) y la frontera
 * cloud (D1). Antes cada lado tenía su propia copia de los 33 pares id/nombre,
 * sincronizadas sólo por disciplina, y el modo de fallo era feo: un id que
 * existiera en un lado y no en el otro deja el día del participante INCOMPLETE
 * para siempre y bloquea la generación de enlaces, sin decir cuál lo causa.
 *
 * **El `id` es la identidad y no se toca nunca.** Es lo que referencian los
 * slots guardados en D1 y las series del historial en IndexedDB. El `nombre` es
 * presentación y puede cambiar sin consecuencias.
 *
 * Nomenclatura: la de la Biblioteca Maestra del cliente
 * (`docs/cliente/Biblioteca_Maestra_Ejercicios_Santiago_Fitness_Method.pdf`,
 * 3 sep 2026). Donde el nombre anterior era genérico y el catálogo ofrecía
 * varias variantes, se conserva el nombre genérico hasta confirmación del
 * coach. Un renombrado no puede redefinir la variante del historial existente.
 */

export interface EjercicioBase {
  readonly id: string
  readonly nombre: string
}

export const EJERCICIOS_BASE: readonly EjercicioBase[] = [
  // ---- Empuje: pecho, tríceps y deltoides ----------------------------------
  { id: 'press-banca-15-smith', nombre: 'Press inclinado bajo (15°) en Smith' },
  { id: 'press-inclinado-convergente', nombre: 'Press convergente inclinado' },
  { id: 'press-banca-barra', nombre: 'Press de banca plano con barra' },
  { id: 'press-banca-mancuernas', nombre: 'Press plano con mancuernas' },
  { id: 'press-pecho-convergente', nombre: 'Press de pecho convergente horizontal' },
  { id: 'pec-deck', nombre: 'Pec deck / fly de pecho' },
  { id: 'fondos-triceps', nombre: 'Fondos en paralelas con énfasis en tríceps' },
  // A confirmar: el catálogo ofrece pushdown con barra recta, con barra V y con
  // cuerda. El historial existente no identifica el accesorio.
  { id: 'extension-triceps-polea', nombre: 'Extensión de tríceps en polea' },
  { id: 'press-frances-barra-z', nombre: 'Extensión acostado con barra EZ / skull crusher' },
  { id: 'elevacion-lateral-mancuernas', nombre: 'Elevación lateral con mancuernas' },
  // A confirmar: unilateral o bilateral en cable.
  { id: 'elevacion-lateral-polea', nombre: 'Elevación lateral en polea' },

  // ---- Tracción: espalda y bíceps ------------------------------------------
  // A confirmar: el catálogo separa agarre ancho, medio, cerrado neutro y supinado.
  { id: 'lat-pulldown-maquina', nombre: 'Lat pulldown' },
  { id: 'jalon-agarre-cerrado', nombre: 'Lat pulldown agarre cerrado neutro' },
  // A confirmar: pronada, supinada, neutra o asistida.
  { id: 'dominadas', nombre: 'Dominadas' },
  { id: 'remo-barra', nombre: 'Remo con barra inclinado' },
  // A confirmar: agarre neutro o ancho.
  { id: 'remo-sentado-cable', nombre: 'Remo sentado en polea' },
  { id: 'remo-mancuerna', nombre: 'Remo con mancuerna a una mano' },
  // A confirmar: barra recta o barra EZ.
  { id: 'curl-barra', nombre: 'Curl con barra' },
  // A confirmar: alterno o simultáneo.
  { id: 'curl-mancuernas', nombre: 'Curl con mancuernas' },
  { id: 'curl-martillo', nombre: 'Curl martillo' },

  // ---- Pierna: cuádriceps, femorales, glúteos y pantorrillas ---------------
  { id: 'hip-thrust-barra', nombre: 'Hip thrust con barra' },
  // A confirmar: barra alta o barra baja.
  { id: 'sentadilla-barra', nombre: 'Sentadilla con barra' },
  // A confirmar: inclinación y modelo de prensa.
  { id: 'prensa', nombre: 'Prensa de piernas' },
  { id: 'hack-squat', nombre: 'Hack squat' },
  // A confirmar: bilateral o unilateral.
  { id: 'extension-cuadriceps', nombre: 'Extensión de cuádriceps' },
  // A confirmar: walking, forward o reverse lunge.
  { id: 'zancadas-mancuernas', nombre: 'Zancadas con mancuernas' },
  { id: 'peso-muerto-rumano', nombre: 'Peso muerto rumano con barra' },
  { id: 'curl-femoral-tumbado', nombre: 'Curl femoral acostado' },
  { id: 'curl-femoral-sentado', nombre: 'Curl femoral sentado' },
  { id: 'patada-gluteo-polea', nombre: 'Patada de glúteo en cable' },
  { id: 'abduccion-maquina', nombre: 'Abducción de cadera sentado en máquina' },
  { id: 'elevacion-talones-pie', nombre: 'Standing calf raise en máquina' },
  { id: 'elevacion-talones-sentado', nombre: 'Seated calf raise' },
]

const POR_ID = new Map(EJERCICIOS_BASE.map((ejercicio) => [ejercicio.id, ejercicio.nombre]))

/**
 * El nombre canónico de un ejercicio.
 *
 * Lanza si el id no está en el catálogo: un ejercicio sin nombre canónico es
 * exactamente la divergencia que este módulo existe para impedir, y falla mejor
 * al construir la biblioteca que meses después en el día de alguien.
 */
export function nombreDe(id: string): string {
  const nombre = POR_ID.get(id)
  if (nombre === undefined) {
    throw new Error(`Ejercicio fuera del catálogo: ${id}`)
  }
  return nombre
}

/** Para validar en la frontera sin recorrer el array cada vez. */
export const IDS_DE_EJERCICIOS: ReadonlySet<string> = new Set(POR_ID.keys())
