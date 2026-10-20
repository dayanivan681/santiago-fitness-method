/**
 * El ejercicio que se está entrenando ahora.
 *
 * Sale de la antigua `TarjetaEjercicio`, que era un acordeón: en la pantalla
 * cabían los cinco ejercicios del día a la vez y el abierto sumaba unos
 * cuarenta controles. Aquí sólo hay uno, así que el nombre puede dominar y los
 * datos de apoyo caben en dos líneas de texto en vez de en tres cajas con borde.
 *
 * Lo que se conserva íntegro, porque es producto y no decoración: última vez y
 * mejor referencia como datos distintos (§7 y §9), el objetivo del día con su
 * recomendación y sus cifras, y el acceso a descanso, ficha y variantes.
 */

import { useEffect,useRef } from 'react'
import { describirSerie, resumirUltimaVez } from '../../logica/ultimaVez'
import { etiquetaCarga, etiquetaEquipo } from '../../dominio/etiquetas'
import { FilaSerie } from './FilaSerie'
import { ETIQUETA_SUGERENCIA, type Sugerencia } from '../../logica/sugerencia'
import type { ClaveDeBorrador } from '../../logica/borrador'
import type { Repositorio } from '../../datos/repositorio'
import type { EjercicioDelDia, NuevaSerie } from '../../aplicacion/useEntrenamiento'
import { esEfectiva } from '../../dominio/tipos'
import type { Ejercicio, SerieComparable, SerieRegistrada } from '../../dominio/tipos'
import { Icono } from '../../producto/ui'

const ETIQUETA_ESTIMULO = {
  fuerza: 'Fuerza',
  hipertrofia: 'Hipertrofia',
  resistencia: 'Resistencia',
} as const

interface Props {
  readonly item: EjercicioDelDia
  readonly onIdentidadVisible?: (visible:boolean)=>void
  readonly onAbrirVariantes: () => void
  /** Abre la ficha del ejercicio: datos, equivalentes e historial de la variante. */
  readonly onAbrirFicha: () => void
  /** Arranca el descanso a mano; guardar una serie nunca lo inicia. */
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

export function CuerpoEjercicio({
  item,
  onIdentidadVisible,
  onAbrirVariantes,
  onAbrirFicha,
  onDescansar,
  onGuardarSerie,
  onCorregirSerie,
  onDeshacerCorreccion,
  claveDeBorrador,
  repositorio,
}: Props) {
  const { slot, ejercicio, referencias, seriesDeHoy, sugerencia } = item
  const identidad=useRef<HTMLElement>(null)
  useEffect(()=>{if(typeof IntersectionObserver==='undefined'||!identidad.current)return;const observer=new IntersectionObserver(([e])=>onIdentidadVisible?.(e.isIntersecting),{rootMargin:'-60px 0px 0px 0px'});observer.observe(identidad.current);return()=>observer.disconnect()},[onIdentidadVisible])

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

  /**
   * La que toca ahora: la primera sin registrar.
   *
   * Sólo ésa se abre. Las siguientes esperan en una línea y se abren tocándolas,
   * porque registrar fuera de orden es legítimo —una serie extra, corregir una
   * aproximación— pero no es lo normal.
   */
  const enTurno = numerosDeSerie.find(
    (numero) => !seriesDeHoy.some((serie) => serie.numeroSerie === numero),
  )
  const ultimaVez = resumirUltimaVez(referencias.ultimaSesion, ejercicio)
  const detalle = detalleDeSugerencia(sugerencia, ejercicio)

  return (
    <section className="entreno__ejercicio">
      <header ref={identidad} className="entreno__identidad">
        <button type="button" className="sfm-workout-image" onClick={onAbrirFicha} aria-label="Ver ficha del ejercicio"><img src={ejercicio.imagen} alt=""/><span>Ver ejercicio <Icono nombre="abrir" size={14} /></span></button>
        <span className={`ejercicio__tag tinta--${slot.estimulo}`}>
          <span className={`ejercicio__punto punto--${slot.estimulo}`} />
          {ETIQUETA_ESTIMULO[slot.estimulo]}
          {/* Cambio de un día: que se vea, o parecería que la plantilla cambió. */}
          {item.soloHoy && <span className="ejercicio__marca">Sólo hoy</span>}
        </span>
        <h2 className="entreno__nombre">{ejercicio.nombre}</h2>
        <p className="entreno__plan">
          {slot.seriesObjetivo} series · {slot.repMin}–{slot.repMax} reps ·{' '}
          {etiquetaCarga(ejercicio.tipoCarga, ejercicio.equipo)} · {etiquetaEquipo(ejercicio.equipo)}
        </p>
      </header>

      {/* §7 y §9: última sesión y mejor referencia son dos datos distintos. Van
          en línea, no en dos cajas: son apoyo para decidir el peso, no fichas. */}
      <div className="referencias">
        <p className="referencia">
          <span className="etiqueta-campo">Última vez</span>{' '}
          {/* Todas las series de la última sesión, no sólo la primera: en un
              ejercicio de cuatro, la primera es la menos representativa. */}
          <span className="referencia__valor">
            {ultimaVez ?? <span className="referencia__vacio">Sin historial</span>}
          </span>
        </p>
        {referencias.mejor && (
          <p className="referencia referencia--mejor">
            <span className="etiqueta-campo">Mejor referencia</span>{' '}
            <span className="referencia__valor">
              {describirSerie(referencias.mejor, ejercicio, { conRir: true })}
            </span>
          </p>
        )}
      </div>

      {/* El objetivo del día y su recomendación. El cliente los quiere visibles
          sin navegar; las cifras las calculaba ya y antes no se veían. */}
      <p className="entreno__objetivo">
        <span className="etiqueta-campo">Objetivo de hoy</span>{' '}
        <span className="entreno__objetivo-valor">
          {slot.seriesObjetivo} × {slot.repMin}–{slot.repMax}
        </span>
        {slot.pesoSugeridoLb === undefined && <span className={`recomendacion recomendacion--${sugerencia.tipo}`}>
          {ETIQUETA_SUGERENCIA[sugerencia.tipo]}
          {/* Si la fijó el coach, que no parezca un cálculo de la app. */}
          {slot.progresionFijada && ' · del coach'}
        </span>}
        {slot.pesoSugeridoLb === undefined && detalle && <span className="recomendacion__detalle">{detalle}</span>}
      </p>

      {slot.pesoSugeridoLb !== undefined && <p className="sfm-hint">
        Peso sugerido por tu Coach: <strong>{slot.pesoSugeridoLb} lb{ejercicio.tipoCarga === 'porLado' ? ' por lado' : ''}</strong>. Puedes ajustarlo.
      </p>}
      <div className="entreno__series">
        {numerosDeSerie.map((numeroSerie) => (
          <FilaSerie
            key={`${ejercicio.id}-${numeroSerie}`}
            numeroSerie={numeroSerie}
            ejercicio={ejercicio}
            repMin={slot.repMin}
            repMax={slot.repMax}
            pesoSugeridoLb={slot.pesoSugeridoLb}
            registrada={seriesDeHoy.find((serie) => serie.numeroSerie === numeroSerie)}
            referencia={referenciaDe(numeroSerie)}
            partida={partidaDe(numeroSerie)}
            // Las etiquetas PESO / REPS / RIR van en la serie que toca —para no
            // repetirlas en las cuatro (§25)— y en las ya guardadas, donde los
            // tres números quedan en una línea y sin ellas no dirían nada.
            conEtiquetas={
              numeroSerie === enTurno ||
              seriesDeHoy.some((serie) => serie.numeroSerie === numeroSerie)
            }
            colapsada={enTurno !== undefined && numeroSerie > enTurno}
            claveDeBorrador={claveDeBorrador}
            repositorio={repositorio}
            onGuardar={(valores) => onGuardarSerie(ejercicio.id, numeroSerie, valores)}
            onCorregir={onCorregirSerie}
            onDeshacer={onDeshacerCorreccion}
          />
        ))}
      </div>

      {/* Acciones del ejercicio: enlaces de texto, no botones con borde. Están
          bajo las series porque se usan poco comparado con guardar. */}
      <div className="entreno__acciones">
        <button type="button" className="enlace" data-tour="abrir-descanso" onClick={onDescansar}>
          Descanso
        </button>
        {/* Consultar el ejercicio delante de la máquina, sin salir. */}
        <button type="button" className="enlace" onClick={onAbrirFicha}>
          Ficha
        </button>
        {item.variantes.length > 1 && (
          <button type="button" className="enlace" onClick={onAbrirVariantes}>
            Cambiar variante
          </button>
        )}
      </div>
    </section>
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
    const carga = `${sugerencia.pesoRegistradoSugeridoLb} lb${porLado} (+${sugerencia.incrementoRegistradoLb}${porLado})`
    // §11: en hipertrofia se reinicia en el rango bajo al subir el peso.
    return sugerencia.repsObjetivo === undefined
      ? `Objetivo: ${carga}.`
      : `Objetivo: ${carga}, reiniciando en ${sugerencia.repsObjetivo} reps.`
  }

  return ''
}
