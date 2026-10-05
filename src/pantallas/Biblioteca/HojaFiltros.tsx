/**
 * Hoja «Filtrar» de la Biblioteca.
 *
 * Sustituye a los 14 chips de músculo que se desplazaban de lado y al selector
 * de equipo: dos listas grandes de una sola elección, con su número, y los
 * botones para ver el resultado o quitarlo todo. Los cambios se aplican al
 * momento; «Ver N ejercicios» sólo cierra.
 */

import { useRef } from 'react'
import { useCapa } from '../../aplicacion/useCapa'
import { ETIQUETA_EQUIPO, NOMBRE_MUSCULO } from '../../dominio/etiquetas'
import { segunCantidad } from '../../logica/plural'
import {
  SIN_FILTROS,
  TODOS,
  aplicarFiltros,
  type FiltroEquipo,
  type FiltroMusculo,
  type FiltrosBiblioteca,
} from '../../logica/filtrosBiblioteca'
import type { Ejercicio, Equipo, Musculo } from '../../dominio/tipos'

const MUSCULOS = (Object.keys(NOMBRE_MUSCULO) as Musculo[]).sort((a, b) =>
  NOMBRE_MUSCULO[a].localeCompare(NOMBRE_MUSCULO[b], 'es'),
)
const EQUIPOS = (Object.keys(ETIQUETA_EQUIPO) as Equipo[]).sort((a, b) =>
  ETIQUETA_EQUIPO[a].localeCompare(ETIQUETA_EQUIPO[b], 'es'),
)

interface Props {
  readonly ejercicios: readonly Ejercicio[]
  readonly filtros: FiltrosBiblioteca
  readonly cambiar: (filtros: FiltrosBiblioteca) => void
  /** Sólo el coach: activa el interruptor «Solo mis ejercicios». */
  readonly esPropio?: (ejercicio: Ejercicio) => boolean
  readonly cerrar: () => void
}

export function HojaFiltros({ ejercicios, filtros, cambiar, esPropio, cerrar: alCerrar }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const cerrar = useCapa(true, alCerrar, panel)
  const total = aplicarFiltros(ejercicios, filtros, esPropio).length
  const cuantos = (parcial: Partial<FiltrosBiblioteca>) =>
    aplicarFiltros(ejercicios, { ...filtros, ...parcial }, esPropio).length

  return (
    <div className="hoja" role="dialog" aria-modal="true" aria-label="Filtrar">
      <button type="button" className="hoja__fondo" onClick={cerrar} aria-label="Cerrar tocando fuera" />
      <div className="hoja__panel" ref={panel} tabIndex={-1}>
        <div className="hoja__cabecera">
          <h2 className="hoja__titulo">Filtrar</h2>
          <button type="button" className="hoja__cerrar" onClick={cerrar}>
            Cerrar
          </button>
        </div>

        {esPropio && (
          <label className="opcion-filtro opcion-filtro--interruptor">
            <span>Solo mis ejercicios</span>
            <input
              type="checkbox"
              role="switch"
              checked={filtros.soloMios}
              onChange={(e) => cambiar({ ...filtros, soloMios: e.target.checked })}
            />
          </label>
        )}

        <Opciones<FiltroMusculo>
          titulo="Músculo"
          valor={filtros.musculo}
          opciones={[TODOS, ...MUSCULOS]}
          etiqueta={(m) => (m === TODOS ? 'Todos' : NOMBRE_MUSCULO[m])}
          numero={(m) => cuantos({ musculo: m })}
          elegir={(musculo) => cambiar({ ...filtros, musculo })}
        />
        <Opciones<FiltroEquipo>
          titulo="Equipo"
          valor={filtros.equipo}
          opciones={[TODOS, ...EQUIPOS]}
          etiqueta={(e) => (e === TODOS ? 'Todos' : ETIQUETA_EQUIPO[e])}
          numero={(e) => cuantos({ equipo: e })}
          elegir={(equipo) => cambiar({ ...filtros, equipo })}
        />

        <div className="hoja-filtros__pie">
          <button type="button" className="boton-guardar" onClick={cerrar}>
            Ver {total} {segunCantidad(total, 'ejercicio', 'ejercicios')}
          </button>
          <button
            type="button"
            className="boton-guardar boton-guardar--secundario"
            onClick={() => cambiar(SIN_FILTROS)}
          >
            Quitar filtros
          </button>
        </div>
      </div>
    </div>
  )
}

/** Lista de una sola elección: filas de 48 px con el número de ejercicios. */
function Opciones<T extends string>({
  titulo,
  valor,
  opciones,
  etiqueta,
  numero,
  elegir,
}: {
  readonly titulo: string
  readonly valor: T
  readonly opciones: readonly T[]
  readonly etiqueta: (opcion: T) => string
  readonly numero: (opcion: T) => number
  readonly elegir: (opcion: T) => void
}) {
  return (
    <div role="group" aria-label={titulo} className="hoja-filtros__grupo">
      <p className="hoja-filtros__titulo">{titulo}</p>
      {opciones.map((opcion) => (
        <button
          key={opcion}
          type="button"
          className={opcion === valor ? 'opcion-filtro opcion-filtro--activa' : 'opcion-filtro'}
          aria-pressed={opcion === valor}
          onClick={() => elegir(opcion)}
        >
          <span>{etiqueta(opcion)}</span>
          <span className="opcion-filtro__numero" aria-hidden="true">
            {numero(opcion)}
          </span>
        </button>
      ))}
    </div>
  )
}
