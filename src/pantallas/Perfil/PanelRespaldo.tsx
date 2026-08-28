/**
 * Copia de seguridad de los datos.
 *
 * Todo vive en el dispositivo (§26), y eso deja un riesgo sin red: si el
 * navegador borra su almacenamiento se van meses de entrenamiento, y §19 —"lo
 * registrado no se pierde"— deja de cumplirse por algo que no depende de la app.
 *
 * El archivo es además, mientras no haya cuentas, la única forma de que el coach
 * reciba lo que hizo el participante.
 */

import { useRef, useState } from 'react'
import { exportarRespaldo, restaurarRespaldo } from '../../datos/respaldo'
import { esRespaldoValido, formatearNombreDeArchivo } from '../../logica/respaldo'
import { fechaDeHoy, type Repositorio } from '../../datos/repositorio'
import type { Participante } from '../../dominio/tipos'

interface Props {
  readonly participante: Participante
  readonly repositorio: Repositorio
}

type Estado = { readonly tipo: 'quieto' } | { readonly tipo: 'ok' | 'error'; readonly texto: string }

export function PanelRespaldo({ participante, repositorio }: Props) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'quieto' })
  const archivo = useRef<HTMLInputElement>(null)

  async function exportar() {
    const respaldo = await exportarRespaldo(repositorio, participante.id)
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(respaldo)], { type: 'application/json' }),
    )

    // Una descarga normal del navegador: el archivo no sale del dispositivo
    // hasta que el participante decida enviarlo.
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = formatearNombreDeArchivo(participante.nombre, fechaDeHoy())
    enlace.click()
    URL.revokeObjectURL(url)

    setEstado({ tipo: 'ok', texto: 'Copia descargada.' })
  }

  async function importar(elegido: File | undefined) {
    if (!elegido) return

    try {
      const contenido: unknown = JSON.parse(await elegido.text())
      // Nunca se confía en un archivo que elige el usuario: restaurar algo a
      // medias encima del historial no tendría vuelta atrás.
      if (!esRespaldoValido(contenido)) {
        setEstado({ tipo: 'error', texto: 'Ese archivo no es una copia de esta app.' })
        return
      }

      await restaurarRespaldo(repositorio, contenido)
      setEstado({ tipo: 'ok', texto: 'Copia restaurada.' })
    } catch {
      setEstado({ tipo: 'error', texto: 'No se pudo leer el archivo.' })
    } finally {
      // Sin esto, volver a elegir el mismo archivo no dispararía el evento.
      if (archivo.current) archivo.current.value = ''
    }
  }

  return (
    <section className="panel">
      <div className="panel__cabecera">
        <h2 className="panel__titulo">Copia de seguridad</h2>
        <span className="panel__nota">Un archivo, en tu móvil</span>
      </div>

      <p className="nota">
        Los datos viven sólo en este dispositivo. Guarda una copia de vez en cuando: si
        se borra el navegador o cambias de móvil, es lo único que los recupera.
      </p>

      <div className="foto-perfil__acciones">
        <button type="button" className="filtro" onClick={exportar}>
          Descargar copia
        </button>

        <label className="filtro foto-perfil__elegir">
          Restaurar copia
          <input
            ref={archivo}
            type="file"
            accept="application/json,.json"
            aria-label="Archivo de copia"
            onChange={(e) => importar(e.target.files?.[0])}
          />
        </label>
      </div>

      {estado.tipo !== 'quieto' && (
        <p className={estado.tipo === 'ok' ? 'nota nota--hecho' : 'limitacion'} role="status">
          {estado.texto}
        </p>
      )}
    </section>
  )
}
