import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { formatearRir } from '../dominio/rir'
import { escalaDe, resumenDeProgreso, type PuntoProgreso } from '../logica/progresoGrafica'

const numero = (valor: number) => Number(valor.toFixed(2)).toLocaleString('es')
const unidad = (p: PuntoProgreso) => p.porLado ? 'lb/lado' : 'lb'
const fecha = (iso: string, larga = false) => new Date(`${iso}T12:00:00`).toLocaleDateString('es', { day: 'numeric', month: larga ? 'long' : 'short', ...(larga ? {year: 'numeric'} : {}) })
const cambio = (valor: number) => `${valor > 0 ? '+' : ''}${numero(valor)}`

/** Los paneles de una misma gráfica muestran siempre el mismo tramo de sesiones. */
function copiarDesplazamiento(paneles: readonly (HTMLDivElement | null)[], origen: HTMLDivElement) {
  for (const panel of paneles)
    if (panel && panel !== origen && panel.scrollLeft !== origen.scrollLeft) panel.scrollLeft = origen.scrollLeft
}

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
  // Dos paneles (peso y repeticiones) que se desplazan juntos y se abren en lo más reciente.
  const paneles = useRef<(HTMLDivElement | null)[]>([])
  const sincronizando = useRef(false)
  useLayoutEffect(() => {
    for (const panel of paneles.current) if (panel) panel.scrollLeft = panel.scrollWidth
  }, [puntos, anchoVisible])
  const alDesplazar = (origen: HTMLDivElement) => {
    if (sincronizando.current) return
    sincronizando.current = true
    copiarDesplazamiento(paneles.current, origen)
    requestAnimationFrame(() => { sincronizando.current = false })
  }
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
    {(['pesoLb', 'reps'] as const).map((metrica, indice) => {
      const nombre = metrica === 'pesoLb' ? 'Peso' : 'Repeticiones'
      const ancho = Math.max(anchoVisible, puntos.length * 48 + 32)
      // Las líneas no necesitan empezar en 0: la escala se ajusta a los valores.
      const { min, max } = metrica === 'pesoLb' ? escalaDe(puntos.map(p => p.pesoLb), 5, 10) : escalaDe(puntos.map(p => p.reps), 1, 4)
      const x = (i: number) => 28 + i * (ancho - 56) / (puntos.length - 1)
      const y = (p: PuntoProgreso) => 138 - (p[metrica] - min) / (max - min) * 90
      return <div key={metrica}>
        <h3>{nombre}{metrica === 'pesoLb' ? ` (${unidad(ultimo)})` : ''}</h3>
        <div className="grafica-progreso__marco">
        {/* La escala queda fija a la izquierda aunque el panel se desplace. */}
        <span className="grafica-progreso__escala grafica-progreso__escala--max" aria-hidden="true">{numero(max)}</span>
        <span className="grafica-progreso__escala grafica-progreso__escala--min" aria-hidden="true">{numero(min)}</span>
        <div ref={el => { paneles.current[indice] = el }} onScroll={e => alDesplazar(e.currentTarget)} className="grafica-progreso__scroll" tabIndex={0} aria-label={`${nombre}: sesiones en orden, desliza para ver todas`}>
          <div className="grafica-progreso__panel" style={{ minWidth: ancho }}>
            <svg viewBox={`0 0 ${ancho} 180`} width="100%" role="img" aria-label={`${nombre}: de ${numero(primero[metrica])} a ${numero(ultimo[metrica])}${metrica === 'pesoLb' ? ` ${unidad(ultimo)}` : ' repeticiones'}. ${puntos.length} sesiones, separadas por igual.`}>
              <path d={`M28 138 H${ancho - 28}`} className="grafica-progreso__eje" />
              <path d={`M28 48 H${ancho - 28}`} className="grafica-progreso__eje grafica-progreso__eje--techo" />
              <polyline points={puntos.map((p,i) => `${x(i)},${y(p)}`).join(' ')} className="grafica-progreso__linea" />
              {puntos.map((p,i) => <circle key={p.fecha} cx={x(i)} cy={y(p)} r={p === seleccionado ? 6 : 4} className={p === seleccionado ? 'grafica-progreso__punto grafica-progreso__punto--elegido' : 'grafica-progreso__punto'} />)}
              <text x={x(puntos.length - 1)} y={y(ultimo) - 16 < 62 ? y(ultimo) + 26 : y(ultimo) - 16} textAnchor="end">{numero(ultimo[metrica])}{metrica === 'pesoLb' ? ` ${unidad(ultimo)}` : ''}</text>
              <text x="28" y="177">{fecha(primero.fecha)}</text>
              <text x={ancho - 28} y="177" textAnchor="end">{fecha(ultimo.fecha)}</text>
            </svg>
            {puntos.map((p,i) => <button key={p.fecha} type="button" className="grafica-progreso__boton" style={{left:`${x(i)/ancho*100}%`, top:`${y(p)/180*100}%`}} aria-label={`${numero(p.pesoLb)} ${unidad(p)} por ${p.reps} repeticiones, ${fecha(p.fecha,true)} · ${nombre}`} aria-pressed={p === seleccionado} onClick={() => elegir(p.fecha)} />)}
          </div>
        </div>
        </div>
      </div>
    })}
    <p className="grafica-progreso__detalle" role="status">{fecha(seleccionado.fecha)} · {numero(seleccionado.pesoLb)} {unidad(seleccionado)} × {seleccionado.reps} · RIR {formatearRir(seleccionado.rir)}</p>
  </section>
}
