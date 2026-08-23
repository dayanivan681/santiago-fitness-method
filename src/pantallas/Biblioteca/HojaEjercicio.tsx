/**
 * Ficha completa de un ejercicio.
 *
 * El análisis del cliente (punto H) pide que cada ejercicio incluya equipo,
 * músculo principal, secundarios, tipo de carga, instrucciones muy breves y
 * alternativas equivalentes. Todo eso no cabe en la cuadrícula sin volverla
 * ilegible en el móvil, así que la cuadrícula sigue siendo visual —§15— y el
 * detalle se abre debajo.
 *
 * Las alternativas salen del campo `movimiento`, que es el que agrupa las
 * variantes equivalentes (§16, §23). No hay una lista aparte que mantener.
 */

import { useCapa } from '../../aplicacion/useCapa'
import { etiquetaEquipo } from '../../componentes/ImagenEjercicio'
import { ETIQUETA_CARGA, NOMBRE_MUSCULO } from '../../dominio/etiquetas'
import type { Ejercicio } from '../../dominio/tipos'

interface Props {
  readonly ejercicio: Ejercicio
  readonly biblioteca: readonly Ejercicio[]
  readonly onElegir: (ejercicio: Ejercicio) => void
  readonly onCerrar: () => void
}

export function HojaEjercicio({ ejercicio, biblioteca, onElegir, onCerrar }: Props) {
  const cerrar = useCapa(true, onCerrar)

  // §16: mismas equivalentes que ofrece la sustitución, menos ella misma.
  const alternativas = biblioteca.filter(
    (otro) => otro.movimiento === ejercicio.movimiento && otro.id !== ejercicio.id,
  )

  return (
    <div className="hoja" role="dialog" aria-label={ejercicio.nombre}>
      <button type="button" className="hoja__fondo" onClick={cerrar} aria-label="Cerrar" />

      <div className="hoja__panel">
        <div className="hoja__cabecera">
          <h2 className="hoja__titulo">{ejercicio.nombre}</h2>
          <button type="button" className="hoja__cerrar" onClick={cerrar}>
            Cerrar
          </button>
        </div>

        {/* §15: la imagen es lo que identifica el ejercicio sin saber su nombre. */}
        {ejercicio.imagen && (
          <img className="hoja__imagen" src={ejercicio.imagen} alt="" />
        )}

        <div className="rejilla-datos">
          <Dato etiqueta="Equipo" valor={etiquetaEquipo(ejercicio.equipo)} />
          <Dato etiqueta="Tipo de carga" valor={ETIQUETA_CARGA[ejercicio.tipoCarga]} />
          <Dato
            etiqueta="Músculo principal"
            valor={NOMBRE_MUSCULO[ejercicio.musculoPrimario]}
          />
          <Dato
            etiqueta="Secundarios"
            valor={
              ejercicio.musculosSecundarios.length === 0
                ? '—'
                : ejercicio.musculosSecundarios.map((m) => NOMBRE_MUSCULO[m]).join(' · ')
            }
          />
        </div>

        {/* "Instrucciones muy breves. Evitar explicaciones largas." */}
        <p className="hoja__texto">{ejercicio.explicacionCorta}</p>

        <div>
          <span className="etiqueta-campo">Alternativas equivalentes</span>
          {alternativas.length === 0 ? (
            <p className="hoja__texto">No hay otra variante de este movimiento.</p>
          ) : (
            <div className="filtros" style={{ marginTop: 6, flexWrap: 'wrap' }}>
              {alternativas.map((alternativa) => (
                <button
                  key={alternativa.id}
                  type="button"
                  className="filtro"
                  onClick={() => onElegir(alternativa)}
                >
                  {alternativa.nombre}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* §16: la equivalencia sirve para elegir, no para mezclar historiales. */}
        <p className="nota">
          Cada variante guarda su propio historial. Cambiar de una a otra no los mezcla.
        </p>
      </div>
    </div>
  )
}

function Dato({ etiqueta, valor }: { readonly etiqueta: string; readonly valor: string }) {
  return (
    <div className="dato">
      <span className="etiqueta-campo">{etiqueta}</span>
      <span className="dato__valor">{valor}</span>
    </div>
  )
}
