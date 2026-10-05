/**
 * El armazón de las hojas del cliente: fondo atenuado, panel que sube desde
 * abajo y cabecera con título y «Cerrar».
 *
 * Las cuatro hojas (ficha, filtros, variante asignada y ejercicios del día)
 * repetían este marcado. Aquí vive una vez, con el cierre animado
 * (`usePresencia`) intercalado en el mismo camino de siempre: el botón y el
 * fondo pasan por `useCapa` (historial, Atrás), y Escape y Atrás piden la
 * salida, que termina avisando a `onCerrar`.
 */

import { useRef, type AnimationEvent, type ReactNode } from 'react'
import { useCapa } from '../aplicacion/useCapa'
import { usePresencia } from '../aplicacion/usePresencia'

interface Props {
  /** Nombre del diálogo para el lector de pantalla. */
  readonly etiqueta: string
  readonly titulo: string
  readonly onCerrar: () => void
  /** Con función, el contenido recibe el mismo cierre que el botón «Cerrar». */
  readonly children: ReactNode | ((cerrar: () => void) => ReactNode)
}

export function HojaCapa({ etiqueta, titulo, onCerrar, children }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const { saliendo, salir, alTerminarAnimacion } = usePresencia(onCerrar)
  const cerrar = useCapa(true, salir, panel)

  // `animationend` sube desde dentro (el ✓ de una serie, un borrador
  // recuperado…): sólo cuenta la salida del propio panel.
  const alAnimar = (evento: AnimationEvent<HTMLDivElement>) => {
    if (evento.target === evento.currentTarget) alTerminarAnimacion()
  }

  return (
    <div
      className={saliendo ? 'hoja hoja--saliendo' : 'hoja'}
      role="dialog"
      aria-modal="true"
      aria-label={etiqueta}
    >
      {/* El fondo también cierra, pero con su propio nombre: dos botones
          "Cerrar" en el mismo diálogo confunden a quien usa lector de pantalla. */}
      <button
        type="button"
        className="hoja__fondo"
        onClick={cerrar}
        aria-label="Cerrar tocando fuera"
      />
      <div className="hoja__panel" ref={panel} tabIndex={-1} onAnimationEnd={alAnimar}>
        <div className="hoja__cabecera">
          <h2 className="hoja__titulo">{titulo}</h2>
          <button type="button" className="hoja__cerrar" onClick={cerrar}>
            Cerrar
          </button>
        </div>
        {typeof children === 'function' ? children(cerrar) : children}
      </div>
    </div>
  )
}
