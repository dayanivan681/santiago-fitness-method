/**
 * Perfil del participante.
 * Guía del proyecto §2: nombre, sexo, edad, estatura, peso, objetivo,
 * frecuencia y limitaciones. Todo editable por el coach.
 */

import { useLiveQuery } from 'dexie-react-hooks'
import type { Repositorio } from '../datos/repositorio'
import type { Participante } from '../dominio/tipos'

export function usePerfil(repositorio: Repositorio) {
  const participante = useLiveQuery(() => repositorio.participanteActual(), [repositorio])

  async function guardar(cambios: Participante): Promise<void> {
    await repositorio.guardarParticipante(cambios)
  }

  return { participante, cargando: participante === undefined, guardar }
}
