/**
 * Rotación de los días de entrenamiento.
 * Guía del proyecto §28: Upper A · Lower A · Upper B · Lower B.
 */

import type { PlantillaDia, Sesion } from '../dominio/tipos'

/**
 * El día que toca hoy: el siguiente al de la última sesión registrada.
 *
 * §3 pide que al entrar el entrenamiento ya esté cargado, así que la app
 * propone un día en vez de preguntar. El participante siempre puede cambiarlo
 * — la rotación es una comodidad, no una imposición.
 */
export function diaSugerido(
  plantillas: readonly PlantillaDia[],
  sesiones: readonly Sesion[],
): PlantillaDia | undefined {
  if (plantillas.length === 0) return undefined
  if (sesiones.length === 0) return plantillas[0]

  const ultima = sesiones.reduce((masReciente, sesion) =>
    sesion.fecha > masReciente.fecha ? sesion : masReciente,
  )

  const indiceUltimo = plantillas.findIndex(
    (plantilla) => plantilla.id === ultima.plantillaDiaId,
  )
  if (indiceUltimo === -1) return plantillas[0]

  return plantillas[(indiceUltimo + 1) % plantillas.length]
}
