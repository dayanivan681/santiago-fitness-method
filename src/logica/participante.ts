/**
 * Alta de un participante.
 * Guía del proyecto §2 (los ocho datos, todos editables por el coach) y §27.
 *
 * Su especificación V1 pide *"1 participante real al inicio, sin panel ficticio
 * de clientes"*, y su criterio 1 pide darlo de alta **en menos de dos minutos**.
 * De ahí los valores por defecto: todo llega con un estimado razonable y lo
 * único que hay que escribir es el nombre. El coach corrige lo que importe.
 */

import { nuevoId } from '../datos/repositorio'
import type { Participante, Sexo } from '../dominio/tipos'

export const EDAD_MINIMA = 14
export const EDAD_MAXIMA = 100
const FRECUENCIA_MINIMA = 1
const FRECUENCIA_MAXIMA = 7

/** Lo que se pide en el alta. El identificador lo pone la app, no el coach. */
export interface DatosAlta {
  readonly nombre: string
  readonly sexo: Sexo
  readonly edad: number
  readonly estaturaCm: number
  readonly pesoCorporalLb: number
  readonly objetivo: string
  readonly frecuenciaEntrenamiento: number
  readonly limitaciones: string
  /** Opcional, igual que en `Participante`: los perfiles anteriores no la tienen. */
  readonly notas?: string
}

/** Estimados de arranque; ninguno es un dato del cliente, todos son editables. */
export const ALTA_POR_DEFECTO: DatosAlta = {
  nombre: '',
  sexo: 'masculino',
  edad: 30,
  estaturaCm: 175,
  pesoCorporalLb: 175,
  objetivo: 'Ganar fuerza y masa muscular',
  // §28: la rotación de cuatro días es la que trae la app.
  frecuenciaEntrenamiento: 4,
  limitaciones: '',
  notas: '',
}

/**
 * Todo lo que falta o no cuadra, junto.
 *
 * Devolverlo de uno en uno obligaría a corregir, enviar y volver a empezar, y
 * esto se rellena en un móvil.
 */
export function erroresDeAlta(datos: DatosAlta): readonly string[] {
  const errores: string[] = []

  if (datos.nombre.trim() === '') errores.push('Escribe el nombre del participante.')
  if (datos.edad < EDAD_MINIMA || datos.edad > EDAD_MAXIMA) {
    errores.push(`La edad debe estar entre ${EDAD_MINIMA} y ${EDAD_MAXIMA} años.`)
  }
  if (datos.estaturaCm <= 0) errores.push('Falta la estatura.')
  if (datos.pesoCorporalLb <= 0) errores.push('Falta el peso corporal.')
  if (
    datos.frecuenciaEntrenamiento < FRECUENCIA_MINIMA ||
    datos.frecuenciaEntrenamiento > FRECUENCIA_MAXIMA
  ) {
    errores.push(
      `Los entrenos por semana van de ${FRECUENCIA_MINIMA} a ${FRECUENCIA_MAXIMA}.`,
    )
  }

  return errores
}

/**
 * Participante nuevo a partir del alta.
 *
 * El identificador es propio y no una constante: el piloto tiene uno solo, pero
 * las sesiones ya se guardan por participante, así que añadir el segundo no
 * obliga a tocar el modelo.
 */
export function crearParticipante(datos: DatosAlta): Participante {
  return {
    ...datos,
    id: nuevoId(),
    nombre: datos.nombre.trim(),
    objetivo: datos.objetivo.trim(),
    limitaciones: datos.limitaciones.trim(),
    notas: (datos.notas ?? '').trim(),
    ejerciciosEvitados: [],
  }
}
