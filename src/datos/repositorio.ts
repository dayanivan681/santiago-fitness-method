/**
 * Contrato de acceso a datos.
 * Guía del proyecto §26: la interfaz comparte lógica entre repositorio cloud
 * (caché y cola durable), demo en memoria y recuperación local antigua.
 * La identidad la establece el acceso autenticado, nunca el primer registro.
 */

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
import type { SerieConFecha } from './referencias'
import type { IdentidadCatalogo } from '../../shared/catalogo-maestro'

export interface Repositorio {
  obtenerParticipante(id: string): Promise<Participante | undefined>
  guardarParticipante(participante: Participante): Promise<void>

  /**
   * Foto local del participante, conservada para recuperar respaldos antiguos.
   * La UI cloud usa R2 privado y exige consentimiento explícito para subirla.
   *
   * Va aparte del `Participante` para no arrastrar la imagen cada vez que se
   * lee la ficha o se lista.
   */
  obtenerFotoDePerfil(participanteId: string): Promise<Blob | undefined>
  guardarFotoDePerfil(participanteId: string, imagen: Blob): Promise<void>
  borrarFotoDePerfil(participanteId: string): Promise<void>

  /**
   * Participante asociado explícitamente al repositorio de esta identidad.
   * Una base antigua puede contener previews: no se selecciona el primer perfil
   * ni se interpreta su presencia como prueba de pertenencia.
   */
  participanteActual(): Promise<Participante | undefined>

  listarEjercicios(): Promise<Ejercicio[]>
  obtenerEjercicio(id: string): Promise<Ejercicio | undefined>
  guardarEjercicio(ejercicio: Ejercicio): Promise<void>

  /**
   * Identidades de la biblioteca maestra. No son fichas programables todavía:
   * sus metadatos opcionales se conservan separados para que la UI actual de
   * 33 ejercicios no pueda seleccionarlas accidentalmente.
   */
  listarIdentidadesCatalogo(): Promise<IdentidadCatalogo[]>
  obtenerIdentidadCatalogo(id: string): Promise<IdentidadCatalogo | undefined>
  guardarIdentidadCatalogo(identidad: IdentidadCatalogo): Promise<void>

  /** Los días de un participante concreto (§23, §28). */
  listarPlantillas(participanteId: string): Promise<PlantillaDia[]>
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
  listarSustituciones(participanteId: string, fecha: string): Promise<Sustitucion[]>
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
   * Borradores de serie: lo tecleado que aún no se ha guardado.
   *
   * Se leen al abrir el ejercicio para recuperar lo que quedó a medias, y se
   * borran en cuanto la serie se registra de verdad — no antes, o una app que
   * se cierre entre medias perdería justo lo que esto protege.
   */
  obtenerBorrador(id: string): Promise<BorradorDeSerie | undefined>
  guardarBorrador(borrador: BorradorDeSerie): Promise<void>
  borrarBorrador(id: string): Promise<void>

  /**
   * §16: el historial de una variante concreta, jamás mezclado con el de otra
   * —ni con el de otro participante—.
   *
   * La interfaz es de un solo participante y lo seguirá siendo mientras el
   * cliente quiera un piloto, pero las consultas ya filtran: el día que haya un
   * segundo, sus datos no aparecerán mezclados con los del primero.
   *
   * Devuelve cada serie con la fecha de su sesión para poder derivar las
   * referencias de §7 y §9.
   */
  historialDeEjercicio(
    participanteId: string,
    ejercicioId: string,
  ): Promise<SerieConFecha[]>

  /**
   * El historial de varios ejercicios de una vez.
   *
   * La pantalla de entrenamiento necesita el de los cinco a ocho ejercicios del
   * día. Pedirlos uno a uno relee las sesiones del participante otras tantas
   * veces; así son dos consultas en total.
   */
  historialDeEjercicios(
    participanteId: string,
    ejercicioIds: readonly string[],
  ): Promise<ReadonlyMap<string, SerieConFecha[]>>

  /** Ids de los ejercicios que ese participante ya ha entrenado (§18). */
  idsDeEjerciciosConHistorial(participanteId: string): Promise<string[]>

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
  seriesEntreFechas(
    participanteId: string,
    desde: string,
    hasta: string,
  ): Promise<SerieConFecha[]>
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
