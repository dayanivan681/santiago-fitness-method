/**
 * Estado de la pantalla de coach.
 * Guía del proyecto §23 (reemplazar ejercicios) y §28 (definir los días que faltan).
 */

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Repositorio } from '../datos/repositorio'
import { ID_PARTICIPANTE_PILOTO } from '../datos/semilla'
import {
  actualizarSlot,
  anadirSlot,
  quitarSlot,
  reemplazarEjercicio,
} from '../logica/plantilla'
import type {
  Ejercicio,
  Participante,
  PlantillaDia,
  SlotPlantilla,
} from '../dominio/tipos'

export interface DatosCoach {
  readonly plantillas: readonly PlantillaDia[]
  readonly plantilla: PlantillaDia
  readonly ejercicios: readonly Ejercicio[]
  /** Punto G del cliente: sin el perfil no se puede avisar de las limitaciones. */
  readonly participante: Participante
}

export function useCoach(repositorio: Repositorio) {
  const [plantillaIdElegida, elegirPlantilla] = useState<string | null>(null)

  const datos = useLiveQuery(async (): Promise<DatosCoach | null> => {
    const [plantillas, ejercicios, participante] = await Promise.all([
      repositorio.listarPlantillas(),
      repositorio.listarEjercicios(),
      repositorio.obtenerParticipante(ID_PARTICIPANTE_PILOTO),
    ])
    if (plantillas.length === 0 || !participante) return null

    const plantilla =
      plantillas.find((p) => p.id === plantillaIdElegida) ?? plantillas[0]

    return { plantillas, plantilla, ejercicios, participante }
  }, [repositorio, plantillaIdElegida])

  /** Cada edición guarda la plantilla nueva; nunca se muta la anterior. */
  const editar = (transformar: (plantilla: PlantillaDia) => PlantillaDia) => async () => {
    if (!datos) return
    await repositorio.guardarPlantilla(transformar(datos.plantilla))
  }

  return {
    datos,
    cargando: datos === undefined,
    elegirPlantilla,
    reemplazar: (orden: number, ejercicioId: string) =>
      editar((p) => reemplazarEjercicio(p, orden, ejercicioId))(),
    ajustar: (orden: number, cambios: Partial<Omit<SlotPlantilla, 'orden'>>) =>
      editar((p) => actualizarSlot(p, orden, cambios))(),
    anadir: (ejercicioId: string) => editar((p) => anadirSlot(p, ejercicioId))(),
    quitar: (orden: number) => editar((p) => quitarSlot(p, orden))(),
  }
}
