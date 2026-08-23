/**
 * Implementación local del repositorio sobre IndexedDB (Dexie).
 * Guía del proyecto §26 (guardado local) y §19 (historial append-only).
 */

import { BaseDatosSantiago, db as baseCompartida } from './esquema'
import type { Repositorio } from './repositorio'
import type { SerieConFecha } from './referencias'
import type {
  Ejercicio,
  Participante,
  PlantillaDia,
  RegistroDeProgreso,
  SerieRegistrada,
  Sesion,
  Sustitucion,
} from '../dominio/tipos'

export class RepositorioLocal implements Repositorio {
  private readonly db: BaseDatosSantiago

  constructor(db: BaseDatosSantiago = baseCompartida) {
    this.db = db
  }

  obtenerParticipante(id: string): Promise<Participante | undefined> {
    return this.db.participantes.get(id)
  }

  async guardarParticipante(participante: Participante): Promise<void> {
    await this.db.participantes.put(participante)
  }

  /** El primero que haya: durante el piloto hay uno y sólo uno (§27). */
  async participanteActual(): Promise<Participante | undefined> {
    return this.db.participantes.toCollection().first()
  }

  listarEjercicios(): Promise<Ejercicio[]> {
    return this.db.ejercicios.toArray()
  }

  obtenerEjercicio(id: string): Promise<Ejercicio | undefined> {
    return this.db.ejercicios.get(id)
  }

  async guardarEjercicio(ejercicio: Ejercicio): Promise<void> {
    await this.db.ejercicios.put(ejercicio)
  }

  /** §28 fija la secuencia de la rotación, así que se ordena explícitamente. */
  async listarPlantillas(): Promise<PlantillaDia[]> {
    const plantillas = await this.db.plantillas.toArray()
    return plantillas.sort((a, b) => a.orden - b.orden)
  }

  obtenerPlantilla(id: string): Promise<PlantillaDia | undefined> {
    return this.db.plantillas.get(id)
  }

  async guardarPlantilla(plantilla: PlantillaDia): Promise<void> {
    await this.db.plantillas.put(plantilla)
  }

  listarSesiones(participanteId: string): Promise<Sesion[]> {
    return this.db.sesiones.where('participanteId').equals(participanteId).toArray()
  }

  async crearSesion(sesion: Sesion): Promise<void> {
    await this.db.sesiones.add(sesion)
  }

  async actualizarSesion(sesion: Sesion): Promise<void> {
    const actualizadas = await this.db.sesiones.update(sesion.id, sesion)
    if (actualizadas === 0) {
      throw new Error(`No existe la sesión ${sesion.id}`)
    }
  }

  listarSustituciones(fecha: string): Promise<Sustitucion[]> {
    return this.db.sustituciones.where('fecha').equals(fecha).toArray()
  }

  /** `put`: cambiar de opinión el mismo día pisa la sustitución anterior. */
  async guardarSustitucion(sustitucion: Sustitucion): Promise<void> {
    await this.db.sustituciones.put(sustitucion)
  }

  async quitarSustitucion(id: string): Promise<void> {
    await this.db.sustituciones.delete(id)
  }

  /**
   * §19: `add` y no `put`. Si algún día se intenta reescribir una serie ya
   * registrada, esto falla en vez de perder el dato en silencio.
   */
  async registrarSerie(serie: SerieRegistrada): Promise<void> {
    await this.db.series.add(serie)
  }

  /**
   * Sólo actualiza lo que ya existe. Si la serie no está, es un error de quien
   * llama y no una inserción encubierta que esquive el append-only de §19.
   */
  async corregirSerie(serie: SerieRegistrada): Promise<void> {
    const actualizadas = await this.db.series.update(serie.id, serie)
    if (actualizadas === 0) {
      throw new Error(`No existe la serie ${serie.id}: corregir no crea registros`)
    }
  }

  listarSeriesDeSesion(sesionId: string): Promise<SerieRegistrada[]> {
    return this.db.series.where('sesionId').equals(sesionId).toArray()
  }

  async historialDeEjercicio(ejercicioId: string): Promise<SerieConFecha[]> {
    const series = await this.db.series.where('ejercicioId').equals(ejercicioId).toArray()
    return this.conFecha(series)
  }

  async idsDeEjerciciosConHistorial(): Promise<string[]> {
    const claves = await this.db.series.orderBy('ejercicioId').uniqueKeys()
    return claves.map(String)
  }

  listarProgreso(participanteId: string): Promise<RegistroDeProgreso[]> {
    return this.db.progreso.where('participanteId').equals(participanteId).toArray()
  }

  /**
   * Guarda el registro y, si la hay, su foto. Sin foto no borra la que hubiera:
   * corregir una medida no puede llevarse por delante la imagen de ese día.
   */
  async guardarProgreso(registro: RegistroDeProgreso, foto?: Blob): Promise<void> {
    await this.db.progreso.put(registro)
    if (foto) {
      await this.db.fotos.put({ id: registro.id, imagen: foto })
    }
  }

  async obtenerFotoDeProgreso(registroId: string): Promise<Blob | undefined> {
    const guardada = await this.db.fotos.get(registroId)
    return guardada?.imagen
  }

  /** La foto se va con el registro: dejarla suelta ocuparía sitio para siempre. */
  async borrarProgreso(registroId: string): Promise<void> {
    await this.db.progreso.delete(registroId)
    await this.db.fotos.delete(registroId)
  }

  async seriesEntreFechas(desde: string, hasta: string): Promise<SerieConFecha[]> {
    const sesiones = await this.db.sesiones
      .where('fecha')
      .between(desde, hasta, true, true)
      .toArray()
    if (sesiones.length === 0) return []

    const fechaPorSesion = new Map(sesiones.map((sesion) => [sesion.id, sesion.fecha]))
    const series = await this.db.series
      .where('sesionId')
      .anyOf([...fechaPorSesion.keys()])
      .toArray()

    return series.map((serie) => ({
      ...serie,
      fecha: fechaPorSesion.get(serie.sesionId)!,
    }))
  }

  /** Adjunta a cada serie la fecha de su sesión (§7, §9, §18). */
  private async conFecha(series: SerieRegistrada[]): Promise<SerieConFecha[]> {
    if (series.length === 0) return []

    const idsDeSesion = [...new Set(series.map((serie) => serie.sesionId))]
    const sesiones = await this.db.sesiones.bulkGet(idsDeSesion)
    const fechaPorSesion = new Map(
      sesiones
        .filter((sesion): sesion is Sesion => sesion !== undefined)
        .map((sesion) => [sesion.id, sesion.fecha]),
    )

    return series.flatMap((serie) => {
      const fecha = fechaPorSesion.get(serie.sesionId)
      return fecha ? [{ ...serie, fecha }] : []
    })
  }
}
