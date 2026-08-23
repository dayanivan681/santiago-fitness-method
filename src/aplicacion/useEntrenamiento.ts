/**
 * Estado de la pantalla "Entrenamiento de hoy".
 * Guía del proyecto §3 (ya viene cargado), §7 (referencia anterior), §24.
 */

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { derivarReferencias } from '../datos/referencias'
import { fechaDeHoy, nuevoId, type Repositorio } from '../datos/repositorio'
import { ID_PARTICIPANTE_PILOTO } from '../datos/semilla'
import { diaSugerido } from '../logica/rotacion'
import { reemplazarEjercicio } from '../logica/plantilla'
import { aplicarSustituciones, idSustitucion } from '../logica/sustitucion'
import { siguienteObjetivo, type Sugerencia } from '../logica/sugerencia'
import type { RangoReps } from '../dominio/estimulo'
import type {
  Ejercicio,
  Participante,
  PlantillaDia,
  ReferenciasEjercicio,
  SerieRegistrada,
  Sesion,
  SlotPlantilla,
  Tecnica,
  ValoresDeSerie,
} from '../dominio/tipos'

export interface EjercicioDelDia {
  readonly slot: SlotPlantilla
  readonly ejercicio: Ejercicio
  readonly rango: RangoReps
  /** §7: lo que hizo la última vez. Excluye lo registrado hoy. */
  readonly referencias: ReferenciasEjercicio
  /** §6: una pista, nunca un valor impuesto. */
  readonly sugerencia: Sugerencia
  readonly seriesDeHoy: readonly SerieRegistrada[]
  /** §16 y §23: alternativas del mismo movimiento, cada una con su historial. */
  readonly variantes: readonly Ejercicio[]
  /** Cambiado sólo para hoy: mañana vuelve la variante de la plantilla. */
  readonly soloHoy: boolean
  /** La variante que tiene asignada la plantilla, aunque hoy se entrene otra. */
  readonly ejercicioDeLaPlantillaId: string
}

/**
 * Hasta dónde llega un cambio de variante.
 *
 * Por defecto `soloHoy`: el motivo corriente para cambiar —la máquina está
 * ocupada— es de un día, y no puede reescribir la plantilla del participante.
 */
export type AlcanceDelCambio = 'soloHoy' | 'fijar'

export interface DatosEntrenamiento {
  readonly participante: Participante
  readonly plantillas: readonly PlantillaDia[]
  readonly plantilla: PlantillaDia
  readonly ejerciciosDelDia: readonly EjercicioDelDia[]
  readonly seriesHechas: number
  readonly seriesObjetivo: number
  /** Sin sesión no hay nada que cerrar: aún no se ha registrado ninguna serie. */
  readonly sesionDeHoy?: Sesion
}

export interface NuevaSerie {
  readonly pesoRegistradoLb: number
  readonly repsRealizadas: number
  readonly rir: number
  readonly tecnica?: Tecnica
  /** El calentamiento se guarda, pero no cuenta para nada (§20–21, §7, §9). */
  readonly esCalentamiento?: boolean
}

export function useEntrenamiento(repositorio: Repositorio) {
  const [plantillaIdElegida, elegirPlantilla] = useState<string | null>(null)

  const datos = useLiveQuery(
    () => cargarEntrenamiento(repositorio, plantillaIdElegida),
    [repositorio, plantillaIdElegida],
  )

  async function registrarSerie(
    ejercicioId: string,
    numeroSerie: number,
    valores: NuevaSerie,
  ): Promise<void> {
    if (!datos) return

    const fecha = fechaDeHoy()
    const sesiones = await repositorio.listarSesiones(ID_PARTICIPANTE_PILOTO)
    const existente = sesiones.find(
      (sesion) => sesion.fecha === fecha && sesion.plantillaDiaId === datos.plantilla.id,
    )

    const sesionId = existente?.id ?? nuevoId()
    if (!existente) {
      await repositorio.crearSesion({
        id: sesionId,
        participanteId: ID_PARTICIPANTE_PILOTO,
        plantillaDiaId: datos.plantilla.id,
        fecha,
      })
    }

    await repositorio.registrarSerie({
      id: nuevoId(),
      sesionId,
      ejercicioId,
      numeroSerie,
      // §5: el descanso se deriva de estos instantes, no se teclea.
      instante: new Date().toISOString(),
      ...valores,
    })
  }

  /**
   * Corrige una serie de la sesión de hoy.
   *
   * Conserva el `instante` original a propósito: el descanso de §5 se deriva de
   * esas marcas de tiempo, y sellarlas de nuevo al corregir un número diría que
   * descansaste hasta el momento de la corrección, que es falso.
   */
  async function corregirSerie(
    serie: SerieRegistrada,
    valores: NuevaSerie,
  ): Promise<void> {
    await repositorio.corregirSerie({
      ...serie,
      ...valores,
      // El cliente pide corregir "sin perder auditoría": lo equivocado se apila,
      // no desaparece.
      correcciones: [...(serie.correcciones ?? []), valoresAnteriores(serie)],
    })
  }

  /** Cierra la sesión de hoy. La cierra el participante, nunca la app. */
  async function terminarSesion(): Promise<void> {
    if (!datos?.sesionDeHoy) return
    await repositorio.actualizarSesion({
      ...datos.sesionDeHoy,
      completadaEn: new Date().toISOString(),
    })
  }

  /**
   * §23: el participante selecciona la variante asignada. Cambia el ejercicio
   * del slot y conserva series, rango, estímulo y descanso; el historial de
   * cada variante sigue siendo suyo (§16).
   */
  async function cambiarVariante(
    orden: number,
    ejercicioId: string,
    alcance: AlcanceDelCambio = 'soloHoy',
  ): Promise<void> {
    if (!datos) return

    const id = idSustitucion(fechaDeHoy(), datos.plantilla.id, orden)

    if (alcance === 'fijar') {
      await repositorio.guardarPlantilla(
        reemplazarEjercicio(datos.plantilla, orden, ejercicioId),
      )
      // Ya está en la plantilla: la sustitución del día sobra y estorbaría.
      await repositorio.quitarSustitucion(id)
      return
    }

    // Volver a la variante asignada se hace quitando la sustitución, no
    // guardando una que apunte al mismo sitio.
    const asignada = datos.plantilla.slots.find((slot) => slot.orden === orden)
    if (asignada?.ejercicioId === ejercicioId) {
      await repositorio.quitarSustitucion(id)
      return
    }

    await repositorio.guardarSustitucion({
      id,
      fecha: fechaDeHoy(),
      plantillaDiaId: datos.plantilla.id,
      orden,
      ejercicioId,
    })
  }

  return {
    datos,
    elegirPlantilla,
    registrarSerie,
    corregirSerie,
    terminarSesion,
    cambiarVariante,
    cargando: datos === undefined,
  }
}

/** Foto de los valores que se sustituyen, para el rastro de auditoría. */
function valoresAnteriores(serie: SerieRegistrada): ValoresDeSerie {
  return {
    pesoRegistradoLb: serie.pesoRegistradoLb,
    repsRealizadas: serie.repsRealizadas,
    rir: serie.rir,
    tecnica: serie.tecnica,
    esCalentamiento: serie.esCalentamiento,
    corregidaEn: new Date().toISOString(),
  }
}

async function cargarEntrenamiento(
  repositorio: Repositorio,
  plantillaIdElegida: string | null,
): Promise<DatosEntrenamiento | null> {
  const fecha = fechaDeHoy()
  const [participante, plantillas, sesiones, ejercicios, sustituciones] = await Promise.all([
    repositorio.obtenerParticipante(ID_PARTICIPANTE_PILOTO),
    repositorio.listarPlantillas(),
    repositorio.listarSesiones(ID_PARTICIPANTE_PILOTO),
    repositorio.listarEjercicios(),
    repositorio.listarSustituciones(fecha),
  ])

  if (!participante || plantillas.length === 0) return null

  // Si ya se empezó a registrar hoy, ese es el día que se está entrenando. Sin
  // esta regla la rotación avanzaría en cuanto se guarda la primera serie y la
  // pantalla saltaría al día siguiente en mitad de la sesión.
  const sesionEmpezadaHoy = sesiones.filter((sesion) => sesion.fecha === fecha).at(-1)

  const plantilla =
    plantillas.find((p) => p.id === plantillaIdElegida) ??
    plantillas.find((p) => p.id === sesionEmpezadaHoy?.plantillaDiaId) ??
    diaSugerido(plantillas, sesiones)
  if (!plantilla) return null

  const sesionDeHoy = sesiones.find(
    (sesion) => sesion.fecha === fecha && sesion.plantillaDiaId === plantilla.id,
  )
  const seriesDeHoy = sesionDeHoy
    ? await repositorio.listarSeriesDeSesion(sesionDeHoy.id)
    : []

  // La plantilla guardada es la del participante; ésta es la que se entrena
  // hoy, con los cambios puntuales aplicados encima.
  const plantillaDeHoy = aplicarSustituciones(plantilla, sustituciones)
  const slots = [...plantillaDeHoy.slots].sort((a, b) => a.orden - b.orden)
  const cargados = await Promise.all(
    slots.map((slot) =>
      cargarEjercicio(repositorio, slot, plantilla, fecha, seriesDeHoy, ejercicios),
    ),
  )
  const ejerciciosDelDia = cargados.filter((e): e is EjercicioDelDia => e !== null)

  return {
    participante,
    plantillas,
    plantilla,
    ejerciciosDelDia,
    seriesHechas: ejerciciosDelDia.reduce((total, e) => total + e.seriesDeHoy.length, 0),
    seriesObjetivo: ejerciciosDelDia.reduce((total, e) => total + e.slot.seriesObjetivo, 0),
    sesionDeHoy,
  }
}

async function cargarEjercicio(
  repositorio: Repositorio,
  slot: SlotPlantilla,
  plantillaGuardada: PlantillaDia,
  fecha: string,
  seriesDeHoy: readonly SerieRegistrada[],
  biblioteca: readonly Ejercicio[],
): Promise<EjercicioDelDia | null> {
  const ejercicio = biblioteca.find((e) => e.id === slot.ejercicioId)
  if (!ejercicio) return null

  const historial = await repositorio.historialDeEjercicio(ejercicio.id)
  const rango = { min: slot.repMin, max: slot.repMax }
  const asignadaId = plantillaGuardada.slots.find((s) => s.orden === slot.orden)?.ejercicioId

  // §7 habla de "el entrenamiento anterior": lo de hoy no puede ser su propia
  // referencia, o el participante vería su primera serie como si fuera la marca
  // a superar.
  const historialPrevio = historial.filter((serie) => serie.fecha !== fecha)
  const referencias = derivarReferencias(ejercicio.id, historialPrevio, ejercicio, rango)

  return {
    slot,
    ejercicio,
    rango,
    referencias,
    sugerencia: siguienteObjetivo(referencias.ultimaSesion, {
      rango,
      perfil: ejercicio,
      estimulo: slot.estimulo,
      seriesObjetivo: slot.seriesObjetivo,
    }),
    seriesDeHoy: seriesDeHoy.filter((serie) => serie.ejercicioId === ejercicio.id),
    variantes: biblioteca.filter((e) => e.movimiento === ejercicio.movimiento),
    soloHoy: asignadaId !== ejercicio.id,
    ejercicioDeLaPlantillaId: asignadaId ?? ejercicio.id,
  }
}
