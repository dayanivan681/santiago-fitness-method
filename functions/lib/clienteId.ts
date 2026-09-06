/**
 * Identidad interna de clientes nuevos.
 *
 * No deriva del nombre, email ni ningún valor del formulario. El prefijo hace
 * que sea reconocible en diagnóstico y los 128 bits aleatorios del UUID evitan
 * colisiones entre nombres iguales y entre peticiones concurrentes.
 */

import { crearPerfil, type PerfilCloud } from './roles'

const PREFIJO_CLIENTE = 'cliente-'
const UUID_COMPACTO = /^[0-9a-f]{32}$/
const MAX_INTENTOS = 5

type DatosPerfilNuevo = Omit<PerfilCloud, 'id'>
type GenerarUuid = () => string

export function generarIdentificadorCliente(
  generarUuid: GenerarUuid = () => crypto.randomUUID(),
): string {
  const compacto = generarUuid().replaceAll('-', '').toLowerCase()
  if (!UUID_COMPACTO.test(compacto)) {
    throw new Error('El generador seguro no devolvió un UUID válido.')
  }
  return `${PREFIJO_CLIENTE}${compacto}`
}

/** Sólo una colisión real de la clave del cliente justifica reintentar. */
export function esColisionDeIdentificador(error: unknown): boolean {
  const mensaje = error instanceof Error ? error.message : String(error)
  return /unique constraint failed:\s*clientes\.id/i.test(mensaje)
}

/**
 * Crea y devuelve el perfil con identidad asignada por el servidor.
 *
 * La restricción PRIMARY KEY de D1 es la autoridad frente a dos peticiones
 * simultáneas. Si ambas obtuvieran el mismo UUID, una gana y la otra genera uno
 * nuevo. Cualquier otro fallo se propaga sin crear un segundo cliente incierto.
 */
export async function crearPerfilConIdAutomatico(
  db: D1Database,
  datos: DatosPerfilNuevo,
  generarUuid?: GenerarUuid,
): Promise<PerfilCloud> {
  for (let intento = 0; intento < MAX_INTENTOS; intento += 1) {
    const perfil: PerfilCloud = {
      id: generarIdentificadorCliente(generarUuid),
      ...datos,
    }

    try {
      await crearPerfil(db, perfil)
      return perfil
    } catch (error) {
      if (!esColisionDeIdentificador(error)) throw error
    }
  }

  throw new Error('No se pudo reservar una identidad única para el cliente.')
}
