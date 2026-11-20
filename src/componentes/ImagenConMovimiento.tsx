import { useState } from 'react'
import type { Ejercicio } from '../dominio/tipos'
import { esAnimacionBase } from '../datos/semilla/biblioteca/animaciones'

const NOTA_IMAGEN_IA = 'Imagen generada con IA · equipo representativo.'

const prefiereSinMovimiento = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

/**
 * Imagen grande de la ficha. Si el ejercicio tiene GIF (del coach o del catálogo
 * base), se reproduce aquí (y sólo aquí). Si no carga (sin conexión), se vuelve a
 * la foto fija. Con «reducir movimiento» se muestra la foto y un botón para verlo
 * a demanda.
 *
 * Las notas dependen de lo que se ve: la de IA sólo con la foto generada, y el
 * aviso de la animación (`notaAnimacion`) sólo mientras se reproduce.
 */
export function ImagenConMovimiento({ ejercicio, className }: { readonly ejercicio: Ejercicio; readonly className: string }) {
  const [fallo, setFallo] = useState(false)
  const [verMovimiento, setVerMovimiento] = useState(() => !prefiereSinMovimiento())
  // Sólo se sabe al cargarla: el coach puede subir una animación apaisada.
  const [apaisada, setApaisada] = useState(false)
  const animar = !!ejercicio.animacion && !fallo
  if (!ejercicio.imagen && !animar) return null
  const seAnima = animar && verMovimiento
  // El GIF del coach y su foto fija salen en vertical 3:4; los del catálogo son
  // horizontales, igual que un GIF del coach más ancho que alto. Todos se ven
  // completos, sin recorte ni bandas.
  const horizontal = !!ejercicio.animacion && (esAnimacionBase(ejercicio.animacion) || (seAnima && apaisada))
  const formato = horizontal ? 'movimiento-horizontal' : 'movimiento'
  const clase = ejercicio.animacion ? `${className} ${className}--${formato}` : className
  const nota = seAnima ? ejercicio.notaAnimacion : ejercicio.imagenGenerada ? NOTA_IMAGEN_IA : undefined
  return (
    <>
      {seAnima ? (
        <img
          className={clase}
          src={ejercicio.animacion}
          alt=""
          onError={() => setFallo(true)}
          onLoad={(e) => setApaisada(e.currentTarget.naturalWidth > e.currentTarget.naturalHeight)}
        />
      ) : (
        <img className={clase} src={ejercicio.imagen} alt="" />
      )}
      {animar && !verMovimiento && (
        <button type="button" className="boton-guardar boton-guardar--secundario" onClick={() => setVerMovimiento(true)}>
          Ver movimiento
        </button>
      )}
      {nota && <p className="hoja__texto">{nota}</p>}
    </>
  )
}
