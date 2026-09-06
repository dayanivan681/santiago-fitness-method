/**
 * Pantalla de historial.
 * Guía del proyecto §18 (fecha, series, peso, reps, RIR, descanso, mejor
 * referencia y última sesión), §9 (son dos datos diferentes) y §25.
 */

import { useState } from 'react'
import { describirSerie, resumirUltimaVez } from '../../logica/ultimaVez'
import { useHistorial } from '../../aplicacion/useHistorial'
import { FilaSerie } from '../EntrenamientoHoy/FilaSerie'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import { aComparable } from '../../dominio/serie'
import { formatearRir } from '../../dominio/rir'
import { calcularDescansos, formatearSegundos } from '../../logica/descanso'
import { evaluarSerie, ETIQUETA_PROGRESO_CORTA } from '../../logica/progreso'
import type { Repositorio } from '../../datos/repositorio'
import type { Ejercicio, SerieComparable } from '../../dominio/tipos'
import type { SerieConFecha } from '../../datos/referencias'
import type { Memoria } from '../../aplicacion/memoria'

interface Props {
  readonly repositorio?: Repositorio
  /** Ejercicio del filtro, recordado por `App` entre visitas. */
  readonly memoriaEjercicio?: Memoria<string | null>
}

export function Historial({ repositorio = repositorioPorDefecto, memoriaEjercicio }: Props = {}) {
  const { datos, cargando, elegirEjercicio, corregirSerie, deshacerUltimaCorreccion } =
    useHistorial(repositorio, memoriaEjercicio)
  // Una sola sesión abierta a la vez: corregir es puntual, no se navega así.
  const [abierta, setAbierta] = useState<string | null>(null)

  if (cargando) return <p className="aviso">Cargando…</p>
  if (!datos || datos.entrenados.length === 0) {
    return (
      <div className="contenido">
        <header className="pantalla">
          <h1 className="pantalla__titulo">Historial</h1>
        </header>
        <p className="aviso">Todavía no hay entrenamientos registrados.</p>
      </div>
    )
  }

  const { entrenados, ejercicio, referencias, sesiones } = datos
  if (!ejercicio) return <p className="aviso">Elige un ejercicio.</p>

  return (
    <>
      <div className="contenido">
        <header className="pantalla">
          <h1 className="pantalla__titulo">Historial</h1>
          <p className="pantalla__sub">
            {sesiones.length} {sesiones.length === 1 ? 'sesión' : 'sesiones'} de{' '}
            {ejercicio.nombre}
          </p>
        </header>

        <nav className="filtros" aria-label="Ejercicio del historial">
          {entrenados.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              className={opcion.id === ejercicio.id ? 'filtro filtro--activo' : 'filtro'}
              aria-pressed={opcion.id === ejercicio.id}
              onClick={() => elegirEjercicio(opcion.id)}
            >
              {opcion.nombre}
            </button>
          ))}
        </nav>

        {/* §9: la mejor referencia sobrevive a los días malos; se muestra aparte.
            Dos líneas, no dos tarjetas: son dos datos, no dos fichas. */}
        <div className="resumen">
          <p className="resumen__linea">
            <span className="etiqueta-campo">Mejor referencia</span>{' '}
            <span className="resumen__valor">
              {referencias?.mejor ? describirSerie(referencias.mejor, ejercicio) : '—'}
            </span>
            <span className="resumen__pie">
              {referencias?.mejor ? `RIR ${formatearRir(referencias.mejor.rir)}` : 'Sin marca'}
            </span>
          </p>
          <p className="resumen__linea">
            <span className="etiqueta-campo">Última sesión</span>{' '}
            <span className="resumen__valor">
              {referencias?.ultimaSesion[0]
                ? describirSerie(referencias.ultimaSesion[0], ejercicio)
                : '—'}
            </span>
            <span className="resumen__pie">
              {referencias?.fechaUltimaSesion
                ? formatearFecha(referencias.fechaUltimaSesion)
                : 'Sin registros'}
            </span>
          </p>
        </div>

        <div className="grupo grupo--pleno">
          {sesiones.map((sesion) => (
            <div key={sesion.fecha}>
              {/* Un número mal apuntado se descubre días después: la sesión se
                  abre para corregirlo sin salir del historial. */}
              <button
                type="button"
                className="fila sesion"
                aria-expanded={abierta === sesion.fecha}
                onClick={() =>
                  setAbierta((actual) => (actual === sesion.fecha ? null : sesion.fecha))
                }
              >
                <span className="sesion__fecha">
                  {formatearFecha(sesion.fecha)}
                  {sesion.dia && <span className="sesion__dia">{sesion.dia}</span>}
                </span>
                <span className="sesion__cuerpo">
                  <span className="sesion__series">{resumirUltimaVez(sesion.series.map((s) => aComparable(s, ejercicio)), ejercicio) ?? '—'}</span>
                  <span className="sesion__detalle">
                    {resumirDetalle(sesion.series)}
                    {sesion.sinTerminar && ' · sin terminar'}
                  </span>
                </span>
                <Veredicto series={sesion.series} ejercicio={ejercicio} referencias={referencias} />
              </button>

              {abierta === sesion.fecha && (
                <div className="sesion__correccion">
                  {sesion.series.map((serie) => (
                    <FilaSerie
                      key={serie.id}
                      numeroSerie={serie.numeroSerie}
                      ejercicio={ejercicio}
                      repMin={serie.repsRealizadas}
                      registrada={serie}
                      conEtiquetas={serie.numeroSerie === sesion.series[0].numeroSerie}
                      // Sin autosave: un borrador aquí no tiene sentido, esto
                      // ya está registrado.
                      onGuardar={async () => {}}
                      onCorregir={corregirSerie}
                      onDeshacer={deshacerUltimaCorreccion}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="nota" style={{ marginTop: 12 }}>
          Un día malo se guarda, pero no borra la mejor referencia. Son dos datos diferentes.
        </p>
      </div>
    </>
  )
}

/** §8 aplicado a la mejor serie de la sesión contra la mejor referencia. */
function Veredicto({
  series,
  ejercicio,
  referencias,
}: {
  readonly series: readonly SerieConFecha[]
  readonly ejercicio: Ejercicio
  readonly referencias?: { readonly mejor?: SerieComparable }
}) {
  const mejorDelDia = series
    .map((serie) => aComparable(serie, ejercicio))
    .reduce<SerieComparable | undefined>(
      (mejor, serie) =>
        !mejor || serie.cargaTotalLb > mejor.cargaTotalLb || serie.reps > mejor.reps
          ? serie
          : mejor,
      undefined,
    )

  if (!mejorDelDia || !referencias?.mejor) return <span className="sesion__veredicto" />

  const resultado = evaluarSerie(mejorDelDia, referencias.mejor)
  return (
    <span className={`sesion__veredicto veredicto--${resultado}`}>
      {ETIQUETA_PROGRESO_CORTA[resultado]}
    </span>
  )
}


function resumirDetalle(series: readonly SerieConFecha[]): string {
  const rir = Math.min(...series.map((serie) => serie.rir))
  const descansos = calcularDescansos(series)
  const valores = [...descansos.values()]
  if (valores.length === 0) return `RIR ${formatearRir(rir)}`

  const medio = Math.round(valores.reduce((a, b) => a + b, 0) / valores.length)
  return `RIR ${formatearRir(rir)} · descanso ${formatearSegundos(medio)}`
}



function formatearFecha(iso: string): string {
  const [, mes, dia] = iso.split('-')
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${Number(dia)} ${meses[Number(mes) - 1]}`
}
