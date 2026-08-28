/**
 * Restaurar una copia desde el alta.
 *
 * El caso para el que existe la copia es justo éste: móvil nuevo, o navegador
 * que borró el almacenamiento. En los dos, la app arranca sin participante — así
 * que si sólo se pudiera restaurar desde Perfil, que necesita uno, la copia no
 * serviría cuando de verdad hace falta.
 */

import { useRef, useState } from 'react'
import { restaurarRespaldo } from '../../datos/respaldo'
import { esRespaldoValido } from '../../logica/respaldo'
import type { Repositorio } from '../../datos/repositorio'

interface Props {
  readonly repositorio: Repositorio
}

export function RestaurarCopia({ repositorio }: Props) {
  const [error, setError] = useState('')
  const archivo = useRef<HTMLInputElement>(null)

  async function importar(elegido: File | undefined) {
    if (!elegido) return

    try {
      const contenido: unknown = JSON.parse(await elegido.text())
      if (!esRespaldoValido(contenido)) {
        setError('Ese archivo no es una copia de esta app.')
        return
      }

      setError('')
      await restaurarRespaldo(repositorio, contenido)
    } catch {
      setError('No se pudo leer el archivo.')
    } finally {
      if (archivo.current) archivo.current.value = ''
    }
  }

  return (
    <section className="panel">
      <div className="panel__cabecera">
        <h2 className="panel__titulo">¿Ya tenías datos?</h2>
      </div>

      <p className="nota">
        Si vienes de otro móvil o se borró el navegador, restaura la copia en vez de
        empezar de cero.
      </p>

      <label className="filtro foto-perfil__elegir" style={{ alignSelf: 'flex-start' }}>
        Restaurar copia
        <input
          ref={archivo}
          type="file"
          accept="application/json,.json"
          aria-label="Archivo de copia"
          onChange={(e) => importar(e.target.files?.[0])}
        />
      </label>

      {error !== '' && (
        <p className="limitacion" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
