/**
 * Foto de perfil del participante.
 *
 * Su especificación V1 la pide junto a los datos de §2. Es distinta de las
 * fotos de progreso: **ésta identifica a la persona**, aquéllas documentan su
 * evolución. Por eso vive en la ficha y no en el panel de mediciones.
 *
 * Como las de progreso, se guarda encogida y **no sale del dispositivo**.
 */

import { useEffect, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { reducirImagen } from '../../datos/imagen'
import type { Repositorio } from '../../datos/repositorio'
import type { Participante } from '../../dominio/tipos'

interface Props {
  readonly participante: Participante
  readonly repositorio: Repositorio
}

export function FotoDePerfil({ participante, repositorio }: Props) {
  const foto = useLiveQuery(
    // `null` es "no tiene"; `undefined` sería "todavía cargando".
    async () => (await repositorio.obtenerFotoDePerfil(participante.id)) ?? null,
    [repositorio, participante.id],
  )

  // La URL se deriva de la foto en vez de fijarse desde un efecto: así no hay
  // un render de más cada vez que la imagen llega o cambia.
  const url = useMemo(() => (foto ? URL.createObjectURL(foto) : undefined), [foto])

  // Sin revocar, cada cambio de foto dejaría la anterior retenida en memoria.
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url)
  }, [url])

  // Los botones miran el dato, no el render: si la vista previa fallara, la
  // foto seguiría guardada y hay que poder quitarla igualmente.
  const tieneFoto = foto !== null && foto !== undefined

  async function elegir(archivo: File | undefined) {
    if (!archivo) return
    await repositorio.guardarFotoDePerfil(participante.id, await reducirImagen(archivo))
  }

  return (
    <div className="foto-perfil">
      {url ? (
        <img className="foto-perfil__imagen" src={url} alt={`Foto de ${participante.nombre}`} />
      ) : (
        // Las iniciales evitan un hueco gris cuando no hay foto, que es lo
        // normal: la foto es opcional.
        <span className="foto-perfil__imagen foto-perfil__iniciales" aria-hidden="true">
          {iniciales(participante.nombre)}
        </span>
      )}

      <div className="foto-perfil__acciones">
        <label className="filtro foto-perfil__elegir">
          {tieneFoto ? 'Cambiar foto' : 'Añadir foto'}
          <input
            type="file"
            accept="image/*"
            aria-label="Foto de perfil"
            onChange={(e) => elegir(e.target.files?.[0])}
          />
        </label>

        {tieneFoto && (
          <button
            type="button"
            className="filtro"
            onClick={() => repositorio.borrarFotoDePerfil(participante.id)}
          >
            Quitar
          </button>
        )}
      </div>
    </div>
  )
}

/** Hasta dos iniciales: más se lee como una sigla, no como una persona. */
function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase() ?? '')
    .join('')
}
