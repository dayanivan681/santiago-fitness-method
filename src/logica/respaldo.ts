/** Compatibilidad de lectura con respaldos v1. La restauración cloud vive en /api/v2/importar. */
import { RespaldoV1 } from "../../shared/v2/importacion"
import type {
  Participante,
  PlantillaDia,
  RegistroDeProgreso,
  SerieRegistrada,
  Sesion,
  Sustitucion,
} from '../dominio/tipos'

/** Sube cuando el formato deje de poder leerse con el código anterior. */
export const VERSION_RESPALDO = 1

/** Una foto, en base64, para que quepa dentro del mismo archivo. */
export interface FotoRespaldada {
  /** Id del registro de progreso, o del participante si es la de perfil. */
  readonly id: string
  readonly tipo: string
  readonly datos: string
}

export interface Respaldo {
  readonly version: number
  readonly exportadoEn: string
  readonly participante: Participante
  readonly plantillas: readonly PlantillaDia[]
  readonly sesiones: readonly Sesion[]
  readonly series: readonly SerieRegistrada[]
  readonly progreso: readonly RegistroDeProgreso[]
  readonly sustituciones: readonly Sustitucion[]
  /** Opcionales: son lo que más pesa y se puede exportar sin ellas. */
  readonly fotos?: readonly FotoRespaldada[]
  readonly fotoDePerfil?: FotoRespaldada
}

/**
 * ¿Este archivo es un respaldo que se puede restaurar?
 *
 * El archivo lo elige el usuario, así que puede ser cualquier cosa. Restaurar
 * algo a medias encima de meses de entrenamiento no tendría vuelta atrás, así
 * que ante la duda se rechaza entero.
 */
export function esRespaldoValido(candidato: unknown): candidato is Respaldo {
  return RespaldoV1.safeParse(candidato).success
}

/** Un nombre que se distinga de otros respaldos al verlo en la carpeta. */
export function formatearNombreDeArchivo(nombre: string, fecha: string): string {
  const limpio = nombre
    .normalize('NFD')
    // Sin acentos ni signos: el archivo viaja por correo y por WhatsApp.
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `santiago-fitness-${limpio || 'participante'}-${fecha}.json`
}
