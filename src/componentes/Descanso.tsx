/**
 * La barra del descanso. Fija abajo, sobre la navegación.
 *
 * Se dibuja al nivel de `App`, así que sigue en pantalla aunque el participante
 * se vaya a la biblioteca a mirar cómo se hace el siguiente ejercicio.
 *
 * El estado no se transmite sólo por color: "Descanso" y "Descanso terminado"
 * son textos distintos, y el aviso de los últimos segundos se anuncia además
 * con el propio número.
 *
 * Al estar fija, la barra flota sobre el contenido: por eso publica su altura
 * en `--alto-cronometro` y la pantalla reserva ese hueco al final. Sin eso, la
 * última serie guardada y su botón "Editar" quedaban debajo del cronómetro y el
 * toque se lo llevaba él (QA-MOB-01).
 */

import { useLayoutEffect, useRef } from 'react'
import { formatearSegundos } from '../logica/descanso'
import { PRORROGA_SEGUNDOS, SEGUNDOS_DE_AVISO } from '../logica/temporizador'
import { useControlDescanso } from '../aplicacion/contextoDescanso'

/** La variable que lee `.contenido` para dejarle sitio. */
export const VARIABLE_ALTO = '--alto-cronometro'

export function Descanso() {
  const { estado, restantes, prorrogar, terminar, barraDeSesion } = useControlDescanso()
  const barra = useRef<HTMLDivElement>(null)

  const inactivo = estado.estado === 'inactivo'
  const terminado = estado.estado === 'terminado'

  /*
   * Publica la altura directamente en el DOM, sin pasar por el estado de React.
   *
   * La primera versión guardaba la medida en un `useState` y la escribía en
   * otro efecto. Eso metía un repintado síncrono dentro del efecto de
   * maquetación en cada arranque del descanso, y en las pruebas bastaba para
   * que el borrado del borrador en IndexedDB no llegara a completarse. Aquí no
   * hay nada que repintar: se mide y se escribe.
   *
   * Se mide en vez de fijar un número porque la barra cambia de alto entre
   * "Descanso" y "Descanso terminado", y a 320 px el rótulo puede envolver.
   */
  useLayoutEffect(() => {
    const raiz = document.documentElement
    const nodo = barra.current
    if (inactivo || !nodo) {
      raiz.style.removeProperty(VARIABLE_ALTO)
      return undefined
    }

    const publicar = () => {
      const alto = Math.ceil(nodo.getBoundingClientRect().height)
      if (alto > 0) raiz.style.setProperty(VARIABLE_ALTO, `${alto}px`)
      else raiz.style.removeProperty(VARIABLE_ALTO)
    }
    publicar()

    const observador =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(publicar)
    observador?.observe(nodo)

    return () => {
      observador?.disconnect()
      raiz.style.removeProperty(VARIABLE_ALTO)
    }
  }, [inactivo, terminado, barraDeSesion])

  if (inactivo) return null

  const acabando = !terminado && restantes <= SEGUNDOS_DE_AVISO

  return (
    <div
      data-tour="reloj" ref={barra}
      className={[
        'descanso',
        acabando && 'descanso--acabando',
        terminado && 'descanso--terminado',
        // Sin barra de sesión debajo, el cronómetro baja a ocupar su sitio.
        !barraDeSesion && 'descanso--sin-barra',
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
      aria-label="Temporizador de descanso"
    >
      <span className="descanso__rotulo">{terminado ? 'Descanso terminado' : 'Descanso'}</span>
      {!terminado && <span className="descanso__tiempo">{formatearSegundos(restantes)}</span>}
      <button type="button" className="descanso__boton" aria-label={`Añadir ${PRORROGA_SEGUNDOS} segundos`} onClick={prorrogar}>
        +{PRORROGA_SEGUNDOS}s
      </button>
      <button
        type="button"
        data-tour="cerrar-descanso" className="descanso__boton descanso__boton--fuerte"
        onClick={terminar}
      >
        {terminado ? 'Listo' : 'Omitir'}
      </button>
    </div>
  )
}
