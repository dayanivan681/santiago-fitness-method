/**
 * La barra del descanso. Fija abajo, sobre la navegación.
 *
 * Se dibuja al nivel de `App`, así que sigue en pantalla aunque el participante
 * se vaya a la biblioteca a mirar cómo se hace el siguiente ejercicio.
 *
 * El estado no se transmite sólo por color: "Descanso" y "Descanso terminado"
 * son textos distintos, y el aviso de los últimos segundos se anuncia además
 * con el propio número.
 */

import { formatearSegundos } from '../logica/descanso'
import { PRORROGA_SEGUNDOS, SEGUNDOS_DE_AVISO } from '../logica/temporizador'
import { useControlDescanso } from '../aplicacion/contextoDescanso'

export function Descanso() {
  const { estado, restantes, prorrogar, terminar, barraDeSesion } = useControlDescanso()

  if (estado.estado === 'inactivo') return null

  const terminado = estado.estado === 'terminado'
  const acabando = !terminado && restantes <= SEGUNDOS_DE_AVISO

  return (
    <div
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
      <button type="button" className="descanso__boton" onClick={prorrogar}>
        +{PRORROGA_SEGUNDOS}s
      </button>
      <button
        type="button"
        className="descanso__boton descanso__boton--fuerte"
        onClick={terminar}
      >
        Listo
      </button>
    </div>
  )
}
