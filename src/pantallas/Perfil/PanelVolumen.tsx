/**
 * Volumen semanal por músculo.
 * Guía del proyecto §20 (objetivos), §21 (sólo cuentan las series directas),
 * §22 (el sexo ajusta el objetivo del pecho).
 *
 * Vive dentro de Perfil y no en la pantalla de entrenamiento: §25 pide que el
 * volumen quede en segundo plano.
 */

import {
  DIAS_DE_LA_VENTANA,
  NOMBRE_MUSCULO,
  useVolumen,
  type FilaVolumen,
} from '../../aplicacion/useVolumen'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import { ETIQUETA_VOLUMEN } from '../../logica/volumen'
import type { Repositorio } from '../../datos/repositorio'

interface Props {
  readonly repositorio?: Repositorio
}

export function PanelVolumen({ repositorio = repositorioPorDefecto }: Props = {}) {
  const { datos, cargando } = useVolumen(repositorio)

  if (cargando || !datos) return null

  if (datos.totalSeries === 0) {
    return (
      <section className="panel">
        <div className="panel__cabecera">
          <h2 className="panel__titulo">Volumen semanal</h2>
        </div>
        <p className="hoja__texto">Sin series en la ventana. Registra un entrenamiento.</p>
      </section>
    )
  }

  return (
    <section className="panel">
      <div className="panel__cabecera">
        <h2 className="panel__titulo">Volumen semanal</h2>
        <span className="panel__nota">Series directas</span>
      </div>

      {datos.conObjetivo.map((fila) => (
        <Fila key={fila.musculo} fila={fila} />
      ))}

      {datos.otros.length > 0 && (
        <>
          <span className="etiqueta-campo">Sin objetivo definido</span>
          {datos.otros.map((fila) => (
            <Fila key={fila.musculo} fila={fila} />
          ))}
        </>
      )}

      <p className="hoja__texto">
        Últimos {DIAS_DE_LA_VENTANA} días. Sólo cuenta el músculo principal de cada
        ejercicio: un press ya trabaja el deltoide anterior y un remo el posterior, así que
        ese trabajo aparece como indirecto — si no, el volumen saldría inflado.
      </p>
    </section>
  )
}

function Fila({ fila }: { readonly fila: FilaVolumen }) {
  const { musculo, directas, indirectas, objetivo, estado } = fila
  const porcentaje = objetivo ? Math.min(100, (directas / objetivo.max) * 100) : 0

  return (
    <div className="volumen">
      <div className="volumen__cabecera">
        <span className="volumen__musculo">{NOMBRE_MUSCULO[musculo]}</span>
        <span className={`volumen__cuenta tono--${estado}`}>
          {directas}
          {objetivo && ` / ${textoObjetivo(objetivo)}`}
        </span>
      </div>

      {/* El cliente pide estado legible, no sólo números. */}
      {objetivo && (
        <span className={`volumen__estado tono--${estado}`}>{ETIQUETA_VOLUMEN[estado]}</span>
      )}

      <div className="volumen__barra">
        <div
          className={`volumen__relleno relleno--${estado}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      {indirectas > 0 && (
        <span className="volumen__indirectas">+{indirectas} indirectas</span>
      )}
    </div>
  )
}

function textoObjetivo({ min, max }: { readonly min: number; readonly max: number }): string {
  return min === max ? String(min) : `${min}–${max}`
}
