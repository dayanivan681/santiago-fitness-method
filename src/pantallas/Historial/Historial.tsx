/**
 * Pantalla de historial.
 * Guía del proyecto §18 (fecha, series, peso, reps, RIR, descanso, mejor
 * referencia y última sesión), §9 (son dos datos diferentes) y §25.
 */

import { useHistorial } from '../../aplicacion/useHistorial'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import { aPesoRegistradoLb } from '../../dominio/carga'
import { aComparable } from '../../dominio/serie'
import { calcularDescansos, formatearSegundos } from '../../logica/descanso'
import { evaluarSerie, ETIQUETA_PROGRESO_CORTA } from '../../logica/progreso'
import { Cabecera } from '../../componentes/Cabecera'
import type { Repositorio } from '../../datos/repositorio'
import type { Ejercicio, SerieComparable } from '../../dominio/tipos'
import type { SerieConFecha } from '../../datos/referencias'

interface Props {
  readonly repositorio?: Repositorio
}

export function Historial({ repositorio = repositorioPorDefecto }: Props = {}) {
  const { datos, cargando, elegirEjercicio } = useHistorial(repositorio)

  if (cargando) return <p className="aviso">Cargando…</p>
  if (!datos || datos.entrenados.length === 0) {
    return (
      <>
        <Cabecera kicker="Historial por variante" titulo="Progreso" />
        <p className="aviso">Todavía no hay entrenamientos registrados.</p>
      </>
    )
  }

  const { entrenados, ejercicio, referencias, sesiones } = datos
  if (!ejercicio) return <p className="aviso">Elige un ejercicio.</p>

  return (
    <>
      <Cabecera
        kicker="Historial por variante"
        titulo="Progreso"
        meta={`${sesiones.length} ${sesiones.length === 1 ? 'sesión' : 'sesiones'}`}
      />

      <div className="contenido">
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

        {/* §9: la mejor referencia sobrevive a los días malos; se muestra aparte. */}
        <div className="resumen" style={{ marginTop: 12 }}>
          <div className="resumen__tarjeta resumen__tarjeta--mejor">
            <span className="etiqueta-campo">Mejor referencia</span>
            <span className="resumen__valor">
              {referencias?.mejor ? describir(referencias.mejor, ejercicio) : '—'}
            </span>
            <span className="resumen__pie">
              {referencias?.mejor ? `RIR ${referencias.mejor.rir}` : 'Sin marca'}
            </span>
          </div>
          <div className="resumen__tarjeta">
            <span className="etiqueta-campo">Última sesión</span>
            <span className="resumen__valor">
              {referencias?.ultimaSesion[0]
                ? describir(referencias.ultimaSesion[0], ejercicio)
                : '—'}
            </span>
            <span className="resumen__pie">
              {referencias?.fechaUltimaSesion
                ? formatearFecha(referencias.fechaUltimaSesion)
                : 'Sin registros'}
            </span>
          </div>
        </div>

        <div className="sesiones" style={{ marginTop: 12 }}>
          {sesiones.map((sesion) => (
            <div key={sesion.fecha} className="sesion">
              <span className="sesion__fecha">{formatearFecha(sesion.fecha)}</span>
              <span className="sesion__cuerpo">
                <span className="sesion__series">{resumirSeries(sesion.series, ejercicio)}</span>
                <span className="sesion__detalle">
                  {resumirDetalle(sesion.series)}
                  {sesion.sinTerminar && ' · sin terminar'}
                </span>
              </span>
              <Veredicto series={sesion.series} ejercicio={ejercicio} referencias={referencias} />
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

function resumirSeries(series: readonly SerieConFecha[], ejercicio: Ejercicio): string {
  const peso = series[0]?.pesoRegistradoLb ?? 0
  const porLado = ejercicio.tipoCarga === 'porLado' ? '/lado' : ''
  const reps = series.map((serie) => serie.repsRealizadas).join(' · ')
  return `${peso}${porLado} lb × ${reps}`
}

function resumirDetalle(series: readonly SerieConFecha[]): string {
  const rir = Math.min(...series.map((serie) => serie.rir))
  const descansos = calcularDescansos(series)
  const valores = [...descansos.values()]
  if (valores.length === 0) return `RIR ${rir}`

  const medio = Math.round(valores.reduce((a, b) => a + b, 0) / valores.length)
  return `RIR ${rir} · descanso ${formatearSegundos(medio)}`
}


function describir(serie: SerieComparable, ejercicio: Ejercicio): string {
  const peso = Math.round(aPesoRegistradoLb(serie.cargaTotalLb, ejercicio) * 100) / 100
  return `${peso} lb × ${serie.reps}`
}

function formatearFecha(iso: string): string {
  const [, mes, dia] = iso.split('-')
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${Number(dia)} ${meses[Number(mes) - 1]}`
}
