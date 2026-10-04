import { useState } from 'react'
import type { Ejercicio } from '../dominio/tipos'

const prefiereSinMovimiento = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

/**
 * Imagen grande de la ficha. Si el coach subió un GIF, se reproduce aquí (y sólo
 * aquí). Sin conexión el GIF no está en caché: al fallar se vuelve a la foto fija.
 * Con «reducir movimiento» se muestra la foto y un botón para verlo a demanda.
 */
export function ImagenConMovimiento({ ejercicio, className }: { readonly ejercicio: Ejercicio; readonly className: string }) {
  const [fallo, setFallo] = useState(false)
  const [verMovimiento, setVerMovimiento] = useState(() => !prefiereSinMovimiento())
  const animar = !!ejercicio.animacion && !fallo
  if (!ejercicio.imagen && !animar) return null
  return (
    <>
      {animar && verMovimiento ? (
        <img className={className} src={ejercicio.animacion} alt="" onError={() => setFallo(true)} />
      ) : (
        <img className={className} src={ejercicio.imagen} alt="" />
      )}
      {animar && !verMovimiento && (
        <button type="button" className="boton-guardar boton-guardar--secundario" onClick={() => setVerMovimiento(true)}>
          Ver movimiento
        </button>
      )}
    </>
  )
}
