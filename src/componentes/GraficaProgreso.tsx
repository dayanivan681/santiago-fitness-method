import { useEffect, useRef, useState } from 'react'
import { formatearRir } from '../dominio/rir'
import { resumenDeProgreso, type PuntoProgreso } from '../logica/progresoGrafica'

const numero = (valor: number) => Number(valor.toFixed(2)).toLocaleString('es')
const unidad = (p: PuntoProgreso) => p.porLado ? 'lb/lado' : 'lb'
const fecha = (iso: string, larga = false) => new Date(`${iso}T12:00:00`).toLocaleDateString('es', { day: 'numeric', month: larga ? 'long' : 'short', ...(larga ? {year: 'numeric'} : {}) })
const cambio = (valor: number) => `${valor > 0 ? '+' : ''}${numero(valor)}`

export function GraficaProgreso({ puntos }: { readonly puntos: readonly PuntoProgreso[] }) {
  const [fechaElegida, elegir] = useState<string | null>(null)
  const contenedor = useRef<HTMLElement>(null)
  const [anchoVisible, setAnchoVisible] = useState(280)
  const tieneGrafica = puntos.length >= 2
  useEffect(() => {
    const elemento = contenedor.current
    if (!elemento || typeof ResizeObserver === 'undefined') return
    const observar = new ResizeObserver(([entrada]) => setAnchoVisible(entrada.contentRect.width))
    observar.observe(elemento)
    return () => observar.disconnect()
  }, [tieneGrafica])
  const resumen = resumenDeProgreso(puntos)
  if (puntos.length < 2 || !resumen) return <p className="aviso">La gráfica aparece a partir de la segunda sesión de este ejercicio.</p>
  const { primero, ultimo, diferenciaPeso, diferenciaReps } = resumen
  const seleccionado = puntos.find(p => p.fecha === fechaElegida) ?? ultimo
  const titular = diferenciaPeso !== 0
    ? `Desde el ${fecha(primero.fecha, true)}: de ${numero(primero.pesoLb)} a ${numero(ultimo.pesoLb)} ${unidad(ultimo)} (${cambio(diferenciaPeso)})`
    : `Desde el ${fecha(primero.fecha, true)}: de ${primero.reps} a ${ultimo.reps} repeticiones (${cambio(diferenciaReps)})`
  return <section ref={contenedor} className="grafica-progreso" aria-label="Progreso por ejercicio">
    <h2 className="grafica-progreso__titular">{titular}</h2>
    <p className="nota">Mejor serie efectiva de cada sesión. Compara el RIR para valorar el esfuerzo.</p>
    {(['pesoLb', 'reps'] as const).map(metrica => {
      const nombre = metrica === 'pesoLb' ? 'Peso' : 'Repeticiones'
      const ancho = Math.max(anchoVisible, puntos.length * 48 + 32)
      const maximo = Math.max(1, ...puntos.map(p => p[metrica]))
      const x = (i: number) => 28 + i * (ancho - 56) / (puntos.length - 1)
      const y = (p: PuntoProgreso) => 138 - p[metrica] / maximo * 90
      return <div key={metrica}>
        <h3>{nombre}{metrica === 'pesoLb' ? ` (${unidad(ultimo)})` : ''}</h3>
        <div className="grafica-progreso__scroll" tabIndex={0} aria-label={`${nombre}: sesiones en orden, desliza para ver todas`}>
          <div className="grafica-progreso__panel" style={{ minWidth: ancho }}>
            <svg viewBox={`0 0 ${ancho} 180`} width="100%" role="img" aria-label={`${nombre}: de ${numero(primero[metrica])} a ${numero(ultimo[metrica])}${metrica === 'pesoLb' ? ` ${unidad(ultimo)}` : ' repeticiones'}. ${puntos.length} sesiones, separadas por igual.`}>
              <path d={`M28 138 H${ancho - 28}`} className="grafica-progreso__eje" />
              <text x="28" y="156">0</text>
              <polyline points={puntos.map((p,i) => `${x(i)},${y(p)}`).join(' ')} className="grafica-progreso__linea" />
              {puntos.map((p,i) => <circle key={p.fecha} cx={x(i)} cy={y(p)} r={p === seleccionado ? 6 : 4} className={p === seleccionado ? 'grafica-progreso__punto grafica-progreso__punto--elegido' : 'grafica-progreso__punto'} />)}
              <text x={x(puntos.length - 1)} y={y(ultimo) - 16} textAnchor="end">{numero(ultimo[metrica])}{metrica === 'pesoLb' ? ` ${unidad(ultimo)}` : ''}</text>
              <text x="28" y="177">{fecha(primero.fecha)}</text>
              <text x={ancho - 28} y="177" textAnchor="end">{fecha(ultimo.fecha)}</text>
            </svg>
            {puntos.map((p,i) => <button key={p.fecha} type="button" className="grafica-progreso__boton" style={{left:`${x(i)/ancho*100}%`, top:`${y(p)/180*100}%`}} aria-label={`${numero(p.pesoLb)} ${unidad(p)} por ${p.reps} repeticiones, ${fecha(p.fecha,true)} · ${nombre}`} aria-pressed={p === seleccionado} onClick={() => elegir(p.fecha)} />)}
          </div>
        </div>
      </div>
    })}
    <p className="grafica-progreso__detalle" role="status">{fecha(seleccionado.fecha)} · {numero(seleccionado.pesoLb)} {unidad(seleccionado)} × {seleccionado.reps} · RIR {formatearRir(seleccionado.rir)}</p>
  </section>
}
