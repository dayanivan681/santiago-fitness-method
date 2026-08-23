/**
 * Alta del participante para las pruebas.
 *
 * En la app la hace el coach en pantalla (`AltaParticipante`); aquí lo que
 * interesa es el estado posterior, no volver a teclear el formulario en cada
 * test.
 */

import { ALTA_POR_DEFECTO, crearParticipante, type DatosAlta } from '../logica/participante'
import type { Repositorio } from '../datos/repositorio'
import type { Participante } from '../dominio/tipos'

export async function sembrarParticipante(
  repositorio: Repositorio,
  cambios: Partial<DatosAlta> = {},
): Promise<Participante> {
  const participante = crearParticipante({
    ...ALTA_POR_DEFECTO,
    nombre: 'Participante de prueba',
    ...cambios,
  })
  await repositorio.guardarParticipante(participante)
  return participante
}
