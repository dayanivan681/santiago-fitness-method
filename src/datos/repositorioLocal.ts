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
  BorradorDeSerie,
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

  /**
   * El cliente cloud seleccionado en este dispositivo, o el primero durante
   * el piloto local. La selección sólo evita que una previsualización de otro
   * cliente lea el primer registro histórico de IndexedDB; no concede acceso.
   */
  async participanteActual(): Promise<Participante | undefined> {
    const seleccionado = idSeleccionado()
    if (seleccionado) {
      const encontrado = await this.db.participantes.get(seleccionado)
      if (encontrado) return encontrado
    }
    return this.db.participantes.toCollection().first()
  }

  async obtenerFotoDePerfil(participanteId: string): Promise<Blob | undefined> {
    return (await this.db.fotosDePerfil.get(participanteId))?.imagen
  }

  /** `put`: cambiar la foto sustituye la anterior, no acumula. */
  async guardarFotoDePerfil(participanteId: string, imagen: Blob): Promise<void> {
    await this.db.fotosDePerfil.put({ id: participanteId, imagen })
  }

  async borrarFotoDePerfil(participanteId: string): Promise<void> {
    await this.db.fotosDePerfil.delete(participanteId)
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
  async listarPlantillas(participanteId: string): Promise<PlantillaDia[]> {
    const plantillas = await this.db.plantillas
      .where('participanteId')
      .equals(participanteId)
      .toArray()
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

  listarSustituciones(participanteId: string, fecha: string): Promise<Sustitucion[]> {
    return this.db.sustituciones
      .where('[participanteId+fecha]')
      .equals([participanteId, fecha])
      .toArray()
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

  obtenerBorrador(id: string): Promise<BorradorDeSerie | undefined> {
    return this.db.borradores.get(id)
  }

  /** `put`: cada tecla pisa el borrador anterior de esa misma serie. */
  async guardarBorrador(borrador: BorradorDeSerie): Promise<void> {
    await this.db.borradores.put(borrador)
  }

  async borrarBorrador(id: string): Promise<void> {
    await this.db.borradores.delete(id)
  }

  listarSeriesDeSesion(sesionId: string): Promise<SerieRegistrada[]> {
    return this.db.series.where('sesionId').equals(sesionId).toArray()
  }

  async historialDeEjercicio(
    participanteId: string,
    ejercicioId: string,
  ): Promise<SerieConFecha[]> {
    const series = await this.db.series.where('ejercicioId').equals(ejercicioId).toArray()
    return this.conFecha(series, await this.sesionesDe(participanteId))
  }

  async historialDeEjercicios(
    participanteId: string,
    ejercicioIds: readonly string[],
  ): Promise<ReadonlyMap<string, SerieConFecha[]>> {
    const fechaPorSesion = await this.sesionesDe(participanteId)
    const series = await this.db.series
      .where('ejercicioId')
      .anyOf([...ejercicioIds])
      .toArray()

    const porEjercicio = new Map<string, SerieConFecha[]>(
      ejercicioIds.map((id) => [id, []]),
    )
    for (const serie of this.conFecha(series, fechaPorSesion)) {
      porEjercicio.get(serie.ejercicioId)?.push(serie)
    }
    return porEjercicio
  }

  async idsDeEjerciciosConHistorial(participanteId: string): Promise<string[]> {
    const suyas = await this.sesionesDe(participanteId)
    if (suyas.size === 0) return []

    const series = await this.db.series.where('sesionId').anyOf([...suyas.keys()]).toArray()
    return [...new Set(series.map((serie) => serie.ejercicioId))]
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

  async seriesEntreFechas(
    participanteId: string,
    desde: string,
    hasta: string,
  ): Promise<SerieConFecha[]> {
    const sesiones = await this.db.sesiones
      .where('fecha')
      .between(desde, hasta, true, true)
      .toArray()

    const fechaPorSesion = new Map(
      sesiones
        .filter((sesion) => sesion.participanteId === participanteId)
        .map((sesion) => [sesion.id, sesion.fecha]),
    )
    if (fechaPorSesion.size === 0) return []

    const series = await this.db.series
      .where('sesionId')
      .anyOf([...fechaPorSesion.keys()])
      .toArray()

    return series.map((serie) => ({
      ...serie,
      fecha: fechaPorSesion.get(serie.sesionId)!,
    }))
  }

  /** Las sesiones de un participante, por id, con su fecha. */
  private async sesionesDe(participanteId: string): Promise<Map<string, string>> {
    const sesiones = await this.db.sesiones
      .where('participanteId')
      .equals(participanteId)
      .toArray()
    return new Map(sesiones.map((sesion) => [sesion.id, sesion.fecha]))
  }

  /**
   * Adjunta a cada serie la fecha de su sesión (§7, §9, §18) y descarta las que
   * no son del participante: una serie sin sesión suya no es suya.
   */
  private conFecha(
    series: SerieRegistrada[],
    fechaPorSesion: Map<string, string>,
  ): SerieConFecha[] {
    return series.flatMap((serie) => {
      const fecha = fechaPorSesion.get(serie.sesionId)
      return fecha ? [{ ...serie, fecha }] : []
    })
  }
}

function idSeleccionado(): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('sfm_cliente_id')
    }
  } catch {
    // Un storage bloqueado no impide el modo local de participante único.
  }
  return null
}
