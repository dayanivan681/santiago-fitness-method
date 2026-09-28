/**
 * Biblioteca de ejercicios.
 * Guía del proyecto §15–17.
 *
 * §16: cada variante es una fila propia. El equipo y el ángulo forman parte de
 * la identidad, por eso el id los incluye — press banca con barra y press banca
 * en Smith nunca comparten historial.
 *
 * §23 necesita que aquí haya de dónde elegir: sin una biblioteca amplia, el
 * coach no puede reemplazar nada ni definir Lower A, Upper B y Lower B (§28).
 *
 * IMÁGENES: free-exercise-db (dominio público bajo Unlicense) y generación IA.
 * Procedencia y prompts en public/ejercicios/PROCEDENCIA.md. Van empaquetadas en `public/ejercicios/`
 * porque §27 exige usar la app en el gimnasio, sin depender de la conexión.
 * Conviene reconfirmar la licencia antes de un lanzamiento comercial y
 * sustituirlas por fotos de las máquinas reales cuando las haya: §15 pide que
 * la imagen sirva para identificar el ejercicio, y nada lo hace mejor que el
 * aparato que el participante tiene delante.
 *
 * PESOS E INCREMENTOS: estimados a confirmar en el piloto (§27). Ver
 * ESTIMADOS-A-CONFIRMAR.md.
 */

import type { Ejercicio } from '../../../dominio/tipos'
import { EMPUJE } from './empuje'
import { TRACCION } from './traccion'
import { PIERNA } from './pierna'
import { AMPLIACION_UNILATERAL } from './unilaterales'

export * from './empuje'
export * from './traccion'
export * from './pierna'
export * from './unilaterales'
export * from './cargas'

export const BIBLIOTECA_INICIAL: readonly Ejercicio[] = [...EMPUJE, ...TRACCION, ...PIERNA, ...AMPLIACION_UNILATERAL]
