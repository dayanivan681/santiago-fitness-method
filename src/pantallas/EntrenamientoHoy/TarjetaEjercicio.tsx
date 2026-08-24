/**
 * Un ejercicio de la sesión, plegable.
 * Guía del proyecto §24 (imagen, series, referencia, peso, reps, RIR y descanso)
 * y §25 (lo importante primero: plegado se ve el plan, desplegado se registra).
 */

import { aPesoRegistradoLb } from '../../dominio/carga'
import { formatearRir } from '../../dominio/rir'
import { ETIQUETA_CARGA, etiquetaEquipo } from '../../dominio/etiquetas'
import { Miniatura } from '../../componentes/Miniatura'
import { FilaSerie } from './FilaSerie'
import { ETIQUETA_SUGERENCIA, type Sugerencia } from '../../logica/sugerencia'
import type { ClaveDeBorrador } from '../../logica/borrador'
import type { Repositorio } from '../../datos/repositorio'
import type { EjercicioDelDia, NuevaSerie } from '../../aplicacion/useEntrenamiento'
import { esEfectiva } from '../../dominio/tipos'
import type { Ejercicio, SerieComparable, SerieRegistrada } from '../../dominio/tipos'

const ETIQUETA_ESTIMULO = {
  fuerza: 'Fuerza',
  hipertrofia: 'Hipertrofia',
  resistencia: 'Resistencia',
} as const

interface Props {
  readonly item: EjercicioDelDia
  readonly abierta: boolean
  readonly onAlternar: () => void
  readonly onAbrirVariantes: () => void
  /** El cliente pide temporizador manual: lo arranca el participante, no el guardado. */
  readonly onDescansar: () => void
  readonly onGuardarSerie: (
    ejercicioId: string,
    numeroSerie: number,
    valores: NuevaSerie,
  ) => Promise<void>
  readonly onCorregirSerie: (serie: SerieRegistrada, valores: NuevaSerie) => Promise<void>
  readonly onDeshacerCorreccion?: (serie: SerieRegistrada) => Promise<void>
  /** Identifica el hueco que se teclea, para el autosave del borrador. */
  readonly claveDeBorrador?: Omit<ClaveDeBorrador, 'numeroSerie'>
  readonly repositorio?: Repositorio
}

export function TarjetaEjercicio({
  item,
  abierta,
  onAlternar,
  onAbrirVariantes,
  onDescansar,
  onGuardarSerie,
  onCorregirSerie,
  onDeshacerCorreccion,
  claveDeBorrador,
  repositorio,
}: Props) {
  const { slot, ejercicio, referencias, seriesDeHoy, sugerencia } = item

  // §7: cada serie se compara contra la del mismo número de la última vez.
  const referenciaDe = (numeroSerie: number): SerieComparable | undefined =>
    referencias.ultimaSesion[numeroSerie - 1] ?? referencias.ultimaSesion.at(-1)

  /**
   * De dónde parte una serie que aún no se ha registrado.
   *
   * Lo que se está levantando **hoy** manda sobre lo de la semana pasada: si la
   * serie 1 fue a 50 lb, la 2 empieza ahí y no en la referencia antigua. Sigue
   * siendo un punto de partida editable, nunca una imposición (§6).
   *
   * El calentamiento se excluye: arrancar la serie de trabajo con el peso de la
   * aproximación sería justo lo contrario de lo que hace falta.
   */
  const partidaDe = (numeroSerie: number): SerieRegistrada | undefined =>
    seriesDeHoy
      .filter((serie) => serie.numeroSerie < numeroSerie && esEfectiva(serie))
      .sort((a, b) => a.numeroSerie - b.numeroSerie)
      .at(-1)

  const numerosDeSerie = Array.from({ length: slot.seriesObjetivo }, (_, i) => i + 1)
  const hechas = seriesDeHoy.length
  const completo = hechas >= slot.seriesObjetivo

  return (
    <article className="ejercicio">
      <button
        type="button"
        className="ejercicio__resumen"
        onClick={onAlternar}
        aria-expanded={abierta}
      >
        <Miniatura ejercicio={ejercicio} estimulo={slot.estimulo} />

        <span className="ejercicio__identidad">
          <span className={`ejercicio__tag tinta--${slot.estimulo}`}>
            <span className={`ejercicio__punto punto--${slot.estimulo}`} />
            {ETIQUETA_ESTIMULO[slot.estimulo]}
          </span>
          <span className="ejercicio__nombre">{ejercicio.nombre}</span>
          <span className="ejercicio__plan">
            {slot.seriesObjetivo} series · {slot.repMin}–{slot.repMax} reps
          </span>
        </span>

        <span className="ejercicio__estado">
          {/* Cambio de un día: que se vea, o parecería que la plantilla cambió. */}
          {item.soloHoy && <span className="ejercicio__marca">Sólo hoy</span>}
          {hechas > 0 && (
            <span
              className={
                completo ? 'ejercicio__marca ejercicio__marca--completo' : 'ejercicio__marca'
              }
            >
              {completo ? 'Completo' : 'En curso'}
            </span>
          )}
          <span className="ejercicio__cuenta">
            {hechas}/{slot.seriesObjetivo}
          </span>
        </span>
      </button>

      {abierta && (
        <div className="ejercicio__detalle">
          {/* §7 y §9: última sesión y mejor referencia son dos datos distintos. */}
          <div className="referencias">
            <div className="referencia">
              <span className="etiqueta-campo">Última sesión</span>
              <span className="referencia__valor">
                {referencias.ultimaSesion.length > 0
                  ? describir(referencias.ultimaSesion[0], ejercicio)
                  : '—'}
              </span>
            </div>
            {referencias.mejor && (
              <div className="referencia referencia--mejor">
                <span className="etiqueta-campo">Mejor referencia</span>
                <span className="referencia__valor">
                  {describir(referencias.mejor, ejercicio)}
                </span>
              </div>
            )}
          </div>

          {/* Objetivo de hoy y recomendación: el cliente los quiere visibles sin
              navegar, con sus cuatro etiquetas. */}
          <div className="objetivo">
            <span className="objetivo__bloque">
              <span className="etiqueta-campo">Objetivo de hoy</span>
              <span className="objetivo__valor">
                {slot.seriesObjetivo} × {slot.repMin}–{slot.repMax}
              </span>
            </span>
            <span className={`recomendacion recomendacion--${sugerencia.tipo}`}>
              {ETIQUETA_SUGERENCIA[sugerencia.tipo]}
              {/* Si la fijó el coach, que no parezca un cálculo de la app. */}
              {slot.progresionFijada && ' · del coach'}
            </span>
          </div>

          {/* La recomendación ya calculaba estas cifras y no se veían: sin ellas
              el rótulo dice qué hacer pero no cuánto. */}
          {detalleDeSugerencia(sugerencia, ejercicio) && (
            <p className="recomendacion__detalle">
              {detalleDeSugerencia(sugerencia, ejercicio)}
            </p>
          )}

          <div className="detalle-carga">
            <span className="detalle-carga__texto">
              {ETIQUETA_CARGA[ejercicio.tipoCarga]} · {etiquetaEquipo(ejercicio.equipo)}
            </span>
            <span style={{ display: 'flex', gap: 14 }}>
              <button type="button" className="enlace" onClick={onDescansar}>
                Descanso
              </button>
              {item.variantes.length > 1 && (
                <button type="button" className="enlace" onClick={onAbrirVariantes}>
                  Cambiar variante
                </button>
              )}
            </span>
          </div>

          {numerosDeSerie.map((numeroSerie) => (
            <FilaSerie
              key={`${ejercicio.id}-${numeroSerie}`}
              numeroSerie={numeroSerie}
              ejercicio={ejercicio}
              repMin={slot.repMin}
              registrada={seriesDeHoy.find((serie) => serie.numeroSerie === numeroSerie)}
              referencia={referenciaDe(numeroSerie)}
              partida={partidaDe(numeroSerie)}
              // Las etiquetas PESO / REPS / RIR se ponen sólo en la primera
              // serie: repetirlas en las cuatro es ruido (§25).
              conEtiquetas={numeroSerie === 1}
              claveDeBorrador={claveDeBorrador}
              repositorio={repositorio}
              onGuardar={(valores) => onGuardarSerie(ejercicio.id, numeroSerie, valores)}
              onCorregir={onCorregirSerie}
              onDeshacer={onDeshacerCorreccion}
            />
          ))}
        </div>
      )}
    </article>
  )
}

/**
 * Las cifras de la recomendación, en palabras.
 *
 * Sólo cuando existen: sin referencia previa no hay peso ni repeticiones que
 * proponer, y enseñar un número inventado sería peor que no enseñar ninguno.
 */
function detalleDeSugerencia(sugerencia: Sugerencia, ejercicio: Ejercicio): string {
  const porLado = ejercicio.tipoCarga === 'porLado' ? '/lado' : ''

  if (sugerencia.tipo === 'subirReps') {
    return `Objetivo: ${sugerencia.repsObjetivo} reps con el mismo peso.`
  }

  if (sugerencia.tipo === 'subirCarga') {
    const carga = `${sugerencia.pesoRegistradoSugeridoLb}${porLado} lb (+${sugerencia.incrementoRegistradoLb}${porLado})`
    // §11: en hipertrofia se reinicia en el rango bajo al subir el peso.
    return sugerencia.repsObjetivo === undefined
      ? `Objetivo: ${carga}.`
      : `Objetivo: ${carga}, reiniciando en ${sugerencia.repsObjetivo} reps.`
  }

  return ''
}

function describir(serie: SerieComparable, ejercicio: Ejercicio): string {
  const peso = Math.round(aPesoRegistradoLb(serie.cargaTotalLb, ejercicio) * 100) / 100
  const porLado = ejercicio.tipoCarga === 'porLado' ? '/lado' : ''
  return `${peso}${porLado} lb × ${serie.reps} · RIR ${formatearRir(serie.rir)}`
}
