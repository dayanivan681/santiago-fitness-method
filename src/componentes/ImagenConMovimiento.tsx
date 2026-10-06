import { useState } from 'react'
import type { Ejercicio } from '../dominio/tipos'
import { esAnimacionBase } from '../datos/semilla/biblioteca/animaciones'

const prefiereSinMovimiento = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

/**
 * Imagen grande de la ficha. Si el ejercicio tiene GIF (del coach o del catálogo
 * base), se reproduce aquí (y sólo aquí). Sin conexión el GIF no está en caché: al fallar se vuelve a la foto fija.
 * Con «reducir movimiento» se muestra la foto y un botón para verlo a demanda.
 */
export function ImagenConMovimiento({ ejercicio, className }: { readonly ejercicio: Ejercicio; readonly className: string }) {
  const [fallo, setFallo] = useState(false)
  const [verMovimiento, setVerMovimiento] = useState(() => !prefiereSinMovimiento())
  const animar = !!ejercicio.animacion && !fallo
  if (!ejercicio.imagen && !animar) return null
  // El GIF del coach y su foto fija salen en vertical 3:4; los del catálogo son
  // horizontales. Los dos se ven completos, sin recorte.
  const formato = ejercicio.animacion && esAnimacionBase(ejercicio.animacion) ? 'movimiento-horizontal' : 'movimiento'
  const clase = ejercicio.animacion ? `${className} ${className}--${formato}` : className
  return (
    <>
      {animar && verMovimiento ? (
        <img className={clase} src={ejercicio.animacion} alt="" onError={() => setFallo(true)} />
      ) : (
        <img className={clase} src={ejercicio.imagen} alt="" />
      )}
      {animar && !verMovimiento && (
        <button type="button" className="boton-guardar boton-guardar--secundario" onClick={() => setVerMovimiento(true)}>
          Ver movimiento
        </button>
      )}
    </>
  )
}
