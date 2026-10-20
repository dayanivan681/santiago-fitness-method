/**
 * Estado de la pantalla "Entrenamiento de hoy".
 * Guía del proyecto §3 (ya viene cargado), §7 (referencia anterior), §24.
 */

import { useMemoria, type Memoria } from './memoria'
import { useLiveQuery } from '../nube/eventos'
import { derivarReferencias, type SerieConFecha } from '../datos/referencias'
import { fechaDeHoy, type Repositorio } from '../datos/repositorio'
import { diaSugerido } from '../logica/rotacion'
import { sesionesDeSemana } from '../logica/semana'
import { reemplazarEjercicio } from '../logica/plantilla'
import { aplicarSustituciones, idSustitucion } from '../logica/sustitucion'
import {
  aplicarCorreccion,
  deshacerCorreccion,
  puedeDeshacerse,
} from '../logica/correccion'
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
  readonly sesionesSemana: number
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
  readonly nota?: string
  readonly pesoRegistradoLb: number
  readonly repsRealizadas: number
  readonly rir: number
  readonly tecnica?: Tecnica
  /** El calentamiento se guarda, pero no cuenta para nada (§20–21, §7, §9). */
  readonly esCalentamiento?: boolean
}

/**
 * `memoriaDia` la pone `App` para que volver a Hoy desde otra pestaña abra el
 * día que se estaba mirando y no el de la rotación. Sin ella el hook guarda la
 * elección por su cuenta, que es lo que hacen las pruebas.
 */
export function useEntrenamiento(repositorio: Repositorio, memoriaDia?: Memoria<string | null>) {
  // El hook interno se llama siempre, haya memoria de fuera o no: el orden de
  // los hooks no puede depender de un argumento opcional.
  const propia = useMemoria<string | null>(null)
  const { valor: plantillaIdElegida, recordar: elegirPlantilla } = memoriaDia ?? propia

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
    const sesiones = await repositorio.listarSesiones(datos.participante.id)
    const existente = sesiones.find(
      (sesion) => sesion.fecha === fecha && sesion.plantillaDiaId === datos.plantilla.id,
    )

    const sesionId = existente?.id ?? `entreno:${datos.participante.id}|${fecha}|${datos.plantilla.id}`
    if (!existente) {
      await repositorio.crearSesion({
        id: sesionId,
        participanteId: datos.participante.id,
        plantillaDiaId: datos.plantilla.id,
        fecha,
      })
    }

    await repositorio.registrarSerie({
      id: `${sesionId}|${ejercicioId}|${numeroSerie}`,
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
    await repositorio.corregirSerie(aplicarCorreccion(serie, valores))
  }

  /** Devuelve la serie a como estaba, sin borrar el rastro de la corrección. */
  async function deshacerUltimaCorreccion(serie: SerieRegistrada): Promise<void> {
    if (!puedeDeshacerse(serie)) return
    await repositorio.corregirSerie(deshacerCorreccion(serie))
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

    const id = idSustitucion(
      datos.participante.id,
      fechaDeHoy(),
      datos.plantilla.id,
      orden,
    )

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
      participanteId: datos.participante.id,
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
    deshacerUltimaCorreccion,
    terminarSesion,
    cambiarVariante,
    cargando: datos === undefined,
  }
}

async function cargarEntrenamiento(
  repositorio: Repositorio,
  plantillaIdElegida: string | null,
): Promise<DatosEntrenamiento | null> {
  const fecha = fechaDeHoy()
  const participante = await repositorio.participanteActual()
  if (!participante) return null

  const [plantillas, sesiones, ejercicios, sustituciones] = await Promise.all([
    repositorio.listarPlantillas(participante.id),
    repositorio.listarSesiones(participante.id),
    repositorio.listarEjercicios(),
    repositorio.listarSustituciones(participante.id, fecha),
  ])

  // Una publicación posterior puede quitar un día; la sesión iniciada conserva
  // su prescripción y sigue siendo accesible hasta terminarla.
  for(const s of sesiones.filter(s=>s.fecha===fecha && s.prescripcion)){if(!plantillas.some(p=>p.id===s.plantillaDiaId))plantillas.push(s.prescripcion!)}
  if (plantillas.length === 0) return null

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
  const plantillaHistorica = sesionDeHoy?.prescripcion ?? plantilla
  const plantillaDeHoy = aplicarSustituciones(plantillaHistorica, sustituciones)
  const slots = [...plantillaDeHoy.slots].sort((a, b) => a.orden - b.orden)
  // De una vez, no ejercicio por ejercicio: así no se releen las sesiones del
  // participante una vez por cada uno de los ocho huecos del día.
  const historiales = await repositorio.historialDeEjercicios(
    participante.id,
    slots.map((slot) => slot.ejercicioId),
  )
  const cargados = await Promise.all(
    slots.map((slot) =>
      cargarEjercicio(
        historiales.get(slot.ejercicioId) ?? [],
        slot,
        plantilla,
        fecha,
        seriesDeHoy,
        ejercicios.map(e => ({...e,...sesionDeHoy?.cargas?.[e.id]})),
      ),
    ),
  )
  const ejerciciosDelDia = cargados.filter((e): e is EjercicioDelDia => e !== null)

  return {
    participante,
    sesionesSemana: sesionesDeSemana(sesiones),
    plantillas,
    plantilla: plantillaHistorica,
    ejerciciosDelDia,
    seriesHechas: ejerciciosDelDia.reduce((total, e) => total + e.seriesDeHoy.length, 0),
    seriesObjetivo: ejerciciosDelDia.reduce((total, e) => total + e.slot.seriesObjetivo, 0),
    sesionDeHoy,
  }
}

async function cargarEjercicio(
  historial: readonly SerieConFecha[],
  slot: SlotPlantilla,
  plantillaGuardada: PlantillaDia,
  fecha: string,
  seriesDeHoy: readonly SerieRegistrada[],
  biblioteca: readonly Ejercicio[],
): Promise<EjercicioDelDia | null> {
  const ejercicio = biblioteca.find((e) => e.id === slot.ejercicioId)
  if (!ejercicio) return null

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
      fijada: slot.progresionFijada,
    }),
    seriesDeHoy: seriesDeHoy.filter((serie) => serie.ejercicioId === ejercicio.id),
    variantes: biblioteca.filter((e) => e.movimiento === ejercicio.movimiento),
    soloHoy: asignadaId !== ejercicio.id,
    ejercicioDeLaPlantillaId: asignadaId ?? ejercicio.id,
  }
}
