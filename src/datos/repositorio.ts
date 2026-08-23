/**
 * Contrato de acceso a datos.
 * Guía del proyecto §26: hoy la implementación es local (IndexedDB) y más
 * adelante será la nube. Toda la app depende de esta interfaz y no de Dexie,
 * así que ese cambio se hace en un solo archivo.
 */

import type {
  Ejercicio,
  Participante,
  PlantillaDia,
  RegistroDeProgreso,
  SerieRegistrada,
  Sesion,
  Sustitucion,
} from '../dominio/tipos'
import type { SerieConFecha } from './referencias'

export interface Repositorio {
  obtenerParticipante(id: string): Promise<Participante | undefined>
  guardarParticipante(participante: Participante): Promise<void>

  /**
   * El participante del piloto, o nada si todavía no se ha dado de alta.
   *
   * Su especificación V1 pide uno solo y sin panel ficticio, así que la app no
   * elige entre varios: entrena el que está. El día que haya más, esto pasa a
   * ser "el seleccionado" y nada más cambia, porque las sesiones ya se guardan
   * por participante.
   */
  participanteActual(): Promise<Participante | undefined>

  listarEjercicios(): Promise<Ejercicio[]>
  obtenerEjercicio(id: string): Promise<Ejercicio | undefined>
  guardarEjercicio(ejercicio: Ejercicio): Promise<void>

  listarPlantillas(): Promise<PlantillaDia[]>
  obtenerPlantilla(id: string): Promise<PlantillaDia | undefined>
  guardarPlantilla(plantilla: PlantillaDia): Promise<void>

  listarSesiones(participanteId: string): Promise<Sesion[]>
  crearSesion(sesion: Sesion): Promise<void>

  /**
   * Actualiza una sesión existente. Sirve para cerrarla; no crea nada, así que
   * no es una vía para saltarse el append-only de §19.
   */
  actualizarSesion(sesion: Sesion): Promise<void>

  /**
   * Cambios de variante que valen sólo para esa fecha (§23).
   *
   * Viven fuera de la plantilla a propósito: cambiar de máquina un martes no
   * puede reescribir el entrenamiento del participante para siempre.
   */
  listarSustituciones(fecha: string): Promise<Sustitucion[]>
  guardarSustitucion(sustitucion: Sustitucion): Promise<void>
  /** Deshace el cambio del día y devuelve la posición a la variante asignada. */
  quitarSustitucion(id: string): Promise<void>

  /** §19: añade al historial. Nunca sobrescribe una serie ya registrada. */
  registrarSerie(serie: SerieRegistrada): Promise<void>

  /**
   * Corrige una serie ya registrada.
   *
   * §19 prohíbe sobrescribir la información antigua, y esto no la toca: sirve
   * para arreglar un número mal puesto en la sesión que se está haciendo. Por
   * eso falla si la serie no existe — no es una puerta trasera para insertar.
   *
   * Quien llama debe limitarlo a la sesión de hoy; el historial cerrado no se
   * edita.
   */
  corregirSerie(serie: SerieRegistrada): Promise<void>

  listarSeriesDeSesion(sesionId: string): Promise<SerieRegistrada[]>

  /**
   * §16: el historial de una variante concreta, jamás mezclado con el de otra.
   * Devuelve cada serie con la fecha de su sesión para poder derivar las
   * referencias de §7 y §9.
   */
  historialDeEjercicio(ejercicioId: string): Promise<SerieConFecha[]>

  /** Ids de los ejercicios que ya se han entrenado alguna vez (§18). */
  idsDeEjerciciosConHistorial(): Promise<string[]>

  /**
   * Progreso físico: medidas y fotos con fecha.
   *
   * La foto va y viene por separado porque pesa: listar las medidas de un año
   * no puede arrastrar todas las imágenes. Y no sale del dispositivo — mientras
   * no haya cuentas, eso resuelve consentimiento y permisos por construcción.
   */
  listarProgreso(participanteId: string): Promise<RegistroDeProgreso[]>
  guardarProgreso(registro: RegistroDeProgreso, foto?: Blob): Promise<void>
  obtenerFotoDeProgreso(registroId: string): Promise<Blob | undefined>
  /** Borra el registro y su foto. Lo pide quien se equivocó de día o de foto. */
  borrarProgreso(registroId: string): Promise<void>

  /**
   * Series registradas entre dos fechas, con la suya. Es lo que necesita el
   * volumen semanal de §20 sin tener que recorrer sesión por sesión.
   */
  seriesEntreFechas(desde: string, hasta: string): Promise<SerieConFecha[]>
}

/**
 * Identificador único para entidades nuevas.
 *
 * `crypto.randomUUID` sólo existe en contexto seguro (HTTPS o localhost). Al
 * probar la app en el gimnasio desde el móvil por la red local — que es
 * http:// y no https:// — no está disponible, y sin este recambio guardar una
 * serie fallaría justo donde §27 dice que hay que probarla.
 */
export function nuevoId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return uuidDeBytesAleatorios()
}

/** UUID v4 a partir de `getRandomValues`, que sí está en contexto inseguro. */
function uuidDeBytesAleatorios(): string {
  const bytes = crypto
    .getRandomValues(new Uint8Array(16))
    // Los bits de versión (4) y variante van fijados por el formato.
    .map((byte, indice) => {
      if (indice === 6) return (byte & 0x0f) | 0x40
      if (indice === 8) return (byte & 0x3f) | 0x80
      return byte
    })

  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0'))
  const trozo = (desde: number, hasta: number) => hex.slice(desde, hasta).join('')

  return `${trozo(0, 4)}-${trozo(4, 6)}-${trozo(6, 8)}-${trozo(8, 10)}-${trozo(10, 16)}`
}

/** Fecha de hoy en formato ISO corto (YYYY-MM-DD), en hora local. */
export function fechaDeHoy(ahora = new Date()): string {
  const desfaseMs = ahora.getTimezoneOffset() * 60_000
  return new Date(ahora.getTime() - desfaseMs).toISOString().slice(0, 10)
}

const MS_POR_DIA = 86_400_000

/** La fecha de hace N días, para la ventana del volumen semanal (§20). */
export function fechaHaceDias(dias: number, ahora = new Date()): string {
  return fechaDeHoy(new Date(ahora.getTime() - dias * MS_POR_DIA))
}
