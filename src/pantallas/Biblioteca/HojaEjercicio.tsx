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

import { useRef } from 'react'
import { useLiveQuery } from '../../nube/eventos'
import { useCapa } from '../../aplicacion/useCapa'
import { ETIQUETA_CARGA, NOMBRE_MUSCULO, etiquetaEquipo } from '../../dominio/etiquetas'
import type { Repositorio } from '../../datos/repositorio'
import type { SerieConFecha } from '../../datos/referencias'
import type { Ejercicio } from '../../dominio/tipos'

interface Props {
  readonly ejercicio: Ejercicio
  readonly biblioteca: readonly Ejercicio[]
  /**
   * Con quién y con qué leer el historial de esta variante.
   *
   * Opcional: en la biblioteca se consulta el catálogo, sin nadie entrenando
   * detrás. Desde el entrenamiento sí interesa saber qué se levantó aquí.
   */
  readonly historial?: {
    readonly participanteId: string
    readonly repositorio: Repositorio
  }
  readonly onElegir: (ejercicio: Ejercicio) => void
  readonly onCerrar: () => void
}

export function HojaEjercicio({
  ejercicio,
  biblioteca,
  historial,
  onElegir,
  onCerrar,
}: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const cerrar = useCapa(true, onCerrar, panel)

  // §16: mismas equivalentes que ofrece la sustitución, menos ella misma.
  const alternativas = biblioteca.filter(
    (otro) => otro.movimiento === ejercicio.movimiento && otro.id !== ejercicio.id,
  )

  return (
    <div className="hoja" role="dialog" aria-modal="true" aria-label={ejercicio.nombre}>
      {/* El fondo también cierra, pero con su propio nombre: dos botones
          "Cerrar" en el mismo diálogo confunden a quien usa lector de pantalla. */}
      <button
        type="button"
        className="hoja__fondo"
        onClick={cerrar}
        aria-label="Cerrar tocando fuera"
      />

      <div className="hoja__panel" ref={panel} tabIndex={-1}>
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

        {historial && (
          <HistorialDeLaVariante
            ejercicio={ejercicio}
            participanteId={historial.participanteId}
            repositorio={historial.repositorio}
          />
        )}

        {/* §16: la equivalencia sirve para elegir, no para mezclar historiales. */}
        <p className="nota">
          Cada variante guarda su propio historial. Cambiar de una a otra no los mezcla.
        </p>
      </div>
    </div>
  )
}

/**
 * Lo que se ha levantado en **esta** variante, de más reciente a más antiguo.
 * §16: el historial no se mezcla con el de las equivalentes.
 */
function HistorialDeLaVariante({
  ejercicio,
  participanteId,
  repositorio,
}: {
  readonly ejercicio: Ejercicio
  readonly participanteId: string
  readonly repositorio: Repositorio
}) {
  const sesiones = useLiveQuery(async () => {
    const series = await repositorio.historialDeEjercicio(participanteId, ejercicio.id)
    return agruparPorFecha(series)
  }, [repositorio, participanteId, ejercicio.id])

  return (
    <div>
      <span className="etiqueta-campo">Historial de esta variante</span>
      {sesiones === undefined ? null : sesiones.length === 0 ? (
        <p className="hoja__texto">Todavía sin entrenar.</p>
      ) : (
        <div className="pila" style={{ marginTop: 6 }}>
          {sesiones.map((sesion) => (
            <div key={sesion.fecha} className="historial-variante">
              <span className="historial-variante__fecha">{formatearFecha(sesion.fecha)}</span>
              <span className="historial-variante__series">
                {resumir(sesion.series, ejercicio)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Las últimas sesiones, que es lo que se mira antes de cargar la barra. */
const SESIONES_VISIBLES = 5

function agruparPorFecha(series: readonly SerieConFecha[]) {
  const porFecha = new Map<string, SerieConFecha[]>()
  for (const serie of series) {
    porFecha.set(serie.fecha, [...(porFecha.get(serie.fecha) ?? []), serie])
  }

  return [...porFecha.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, SESIONES_VISIBLES)
    .map(([fecha, suyas]) => ({
      fecha,
      series: [...suyas].sort((a, b) => a.numeroSerie - b.numeroSerie),
    }))
}

function resumir(series: readonly SerieConFecha[], ejercicio: Ejercicio): string {
  const porLado = ejercicio.tipoCarga === 'porLado' ? '/lado' : ''
  const peso = series[0]?.pesoRegistradoLb ?? 0
  return `${peso}${porLado} lb × ${series.map((s) => s.repsRealizadas).join(' · ')}`
}

function formatearFecha(iso: string): string {
  const [, mes, dia] = iso.split('-')
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${Number(dia)} ${meses[Number(mes) - 1]}`
}

function Dato({ etiqueta, valor }: { readonly etiqueta: string; readonly valor: string }) {
  return (
    <div className="dato">
      <span className="etiqueta-campo">{etiqueta}</span>
      <span className="dato__valor">{valor}</span>
    </div>
  )
}
