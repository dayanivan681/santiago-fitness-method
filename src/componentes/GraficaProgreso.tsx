import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { formatearRir } from '../dominio/rir'
import { escalaDe, huecosDeTiempo, resumenDeProgreso, textoDeEsfuerzo, type HuecoDeTiempo, type PuntoProgreso } from '../logica/progresoGrafica'
import { segunCantidad } from '../logica/plural'

const numero = (valor: number) => Number(valor.toFixed(2)).toLocaleString('es')
const unidad = (p: PuntoProgreso) => p.porLado ? 'lb/lado' : 'lb'
const fecha = (iso: string, larga = false) => new Date(`${iso}T12:00:00`).toLocaleDateString('es', { day: 'numeric', month: larga ? 'long' : 'short', ...(larga ? {year: 'numeric'} : {}) })
const cambio = (valor: number) => `${valor > 0 ? '+' : ''}${numero(valor)}`

/*
 * Medidas en px de la gráfica (viewBox = px del panel). Los puntos nunca están a
 * menos de 48 px (zona táctil), así que estos umbrales sí llegan a aplicarse.
 */
/** «RIR 5+» mide unos 38 px a 12 px: por debajo de esto se amontonan. */
const RIR_EN_TODOS_DESDE = 56
/** «3 sem sin entrenar» completo; «3 sem» desde el mínimo; por debajo, sólo la línea. */
const HUECO_LARGO_DESDE = 104
const HUECO_CORTO_DESDE = 44
/** Una fecha corta («12 sept») mide unos 44 px: menos de esto entre dos, se pisan. */
const FECHA_SEPARACION = 52

/** «Con 1 pausa de 3 semanas.» para el lector de pantalla. */
function textoDePausas(huecos: readonly HuecoDeTiempo[]): string {
  if (huecos.length === 0) return ''
  const semanas = huecos.map(h => h.semanas)
  const lista = semanas.length === 1 ? `${semanas[0]}` : `${semanas.slice(0, -1).join(', ')} y ${semanas.at(-1)}`
  return ` Con ${huecos.length} ${segunCantidad(huecos.length, 'pausa', 'pausas')} de ${lista} semanas.`
}

/** Primera y última fecha, más las de cada lado de una pausa, sin que se pisen. */
function indicesDeFechas(total: number, huecos: readonly HuecoDeTiempo[], x: (i: number) => number): number[] {
  const candidatos = [...new Set([0, ...huecos.flatMap(h => [h.desde, h.hasta]), total - 1])].sort((a, b) => a - b)
  const elegidos: number[] = []
  for (const i of candidatos) {
    const previo = elegidos.at(-1)
    if (previo === undefined || x(i) - x(previo) >= FECHA_SEPARACION) elegidos.push(i)
    else if (i === total - 1 && previo !== 0) elegidos[elegidos.length - 1] = i
  }
  return elegidos
}

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
  const { primero, ultimo, diferenciaPeso, diferenciaReps, rirPrimero, rirUltimo } = resumen
  const seleccionado = puntos.find(p => p.fecha === fechaElegida) ?? ultimo
  const huecos = huecosDeTiempo(puntos)
  const inicioDeHueco = new Set(huecos.map(h => h.desde))
  // §7 «Por RIR»: la mejora se lee junto al esfuerzo con que se hizo.
  const esfuerzo = textoDeEsfuerzo(rirPrimero, rirUltimo)
  const titular = diferenciaPeso !== 0
    ? `Desde el ${fecha(primero.fecha, true)}: de ${numero(primero.pesoLb)} a ${numero(ultimo.pesoLb)} ${unidad(ultimo)} (${cambio(diferenciaPeso)}), ${esfuerzo}`
    : `Desde el ${fecha(primero.fecha, true)}: de ${primero.reps} a ${ultimo.reps} repeticiones (${cambio(diferenciaReps)}), ${esfuerzo}`
  return <section ref={contenedor} className="grafica-progreso" aria-label="Progreso por ejercicio">
    <h2 className="grafica-progreso__titular">{titular}</h2>
    <p className="nota">Mejor serie efectiva de cada sesión. Compara el RIR para valorar el esfuerzo.</p>
    {(['pesoLb', 'reps'] as const).map((metrica, indice) => {
      const nombre = metrica === 'pesoLb' ? 'Peso' : 'Repeticiones'
      const ancho = Math.max(anchoVisible, puntos.length * 48 + 32)
      // Las líneas no necesitan empezar en 0: la escala se ajusta a los valores.
      const { min, max } = metrica === 'pesoLb' ? escalaDe(puntos.map(p => p.pesoLb), 5, 10) : escalaDe(puntos.map(p => p.reps), 1, 4)
      const separacion = (ancho - 56) / (puntos.length - 1)
      const x = (i: number) => 28 + i * separacion
      const y = (p: PuntoProgreso) => 138 - (p[metrica] - min) / (max - min) * 90
      const tramo = (i: number) => `M${x(i)} ${y(puntos[i])} L${x(i + 1)} ${y(puntos[i + 1])}`
      const tramosSeguidos = puntos.slice(1).map((_, i) => i).filter(i => !inicioDeHueco.has(i))
      const conRir = metrica === 'pesoLb'
      const rirVisible = (p: PuntoProgreso) => conRir && (separacion >= RIR_EN_TODOS_DESDE || p === seleccionado)
      // La cifra del último punto va encima; si no cabe, debajo, y entonces por debajo de su RIR.
      const ultimoArriba = y(ultimo) - 16 >= 62
      const yValorUltimo = ultimoArriba ? y(ultimo) - 16 : y(ultimo) + (rirVisible(ultimo) ? 36 : 26)
      return <div key={metrica}>
        <h3>{nombre}{metrica === 'pesoLb' ? ` (${unidad(ultimo)})` : ''}</h3>
        <div className="grafica-progreso__marco">
        {/* La escala queda fija a la izquierda aunque el panel se desplace. */}
        <span className="grafica-progreso__escala grafica-progreso__escala--max" aria-hidden="true">{numero(max)}</span>
        <span className="grafica-progreso__escala grafica-progreso__escala--min" aria-hidden="true">{numero(min)}</span>
        <div ref={el => { paneles.current[indice] = el }} onScroll={e => alDesplazar(e.currentTarget)} className="grafica-progreso__scroll" tabIndex={0} aria-label={`${nombre}: sesiones en orden, desliza para ver todas`}>
          <div className="grafica-progreso__panel" style={{ minWidth: ancho }}>
            <svg viewBox={`0 0 ${ancho} 180`} width="100%" role="img" aria-label={`${nombre}: de ${numero(primero[metrica])} a ${numero(ultimo[metrica])}${metrica === 'pesoLb' ? ` ${unidad(ultimo)}` : ' repeticiones'}. ${puntos.length} sesiones, separadas por igual.${textoDePausas(huecos)}`}>
              <path d={`M28 138 H${ancho - 28}`} className="grafica-progreso__eje" />
              <path d={`M28 48 H${ancho - 28}`} className="grafica-progreso__eje grafica-progreso__eje--techo" />
              {tramosSeguidos.length > 0 && <path d={tramosSeguidos.map(tramo).join(' ')} className="grafica-progreso__linea" />}
              {/* Una pausa larga: el tramo se atenúa y se discontinúa, y dice cuánto duró. */}
              {huecos.length > 0 && <path d={huecos.map(h => tramo(h.desde)).join(' ')} className="grafica-progreso__linea grafica-progreso__linea--hueco" />}
              {separacion >= HUECO_CORTO_DESDE && huecos.map(h => {
                const yMedio = (y(puntos[h.desde]) + y(puntos[h.hasta])) / 2
                // Encima del tramo, salvo que choque con el techo o con la cifra del último punto.
                const debajo = yMedio - 8 < 40 || h.hasta === puntos.length - 1
                return <text key={h.desde} x={(x(h.desde) + x(h.hasta)) / 2} y={debajo ? yMedio + 18 : yMedio - 8} textAnchor="middle" className="grafica-progreso__hueco">
                  {separacion >= HUECO_LARGO_DESDE ? `${h.texto} sin entrenar` : h.texto}
                </text>
              })}
              {puntos.map((p,i) => <circle key={p.fecha} cx={x(i)} cy={y(p)} r={p === seleccionado ? 6 : 4} className={p === seleccionado ? 'grafica-progreso__punto grafica-progreso__punto--elegido' : 'grafica-progreso__punto'} />)}
              {puntos.map((p,i) => rirVisible(p) && <text key={`rir-${p.fecha}`} x={x(i)} y={y(p) + 18} textAnchor="middle" className="grafica-progreso__rir">RIR {formatearRir(p.rir)}</text>)}
              <text x={x(puntos.length - 1)} y={yValorUltimo} textAnchor="end">{numero(ultimo[metrica])}{metrica === 'pesoLb' ? ` ${unidad(ultimo)}` : ''}</text>
              {indicesDeFechas(puntos.length, huecos, x).map(i => <text key={`fecha-${i}`} x={x(i)} y="177" textAnchor={i === 0 ? 'start' : i === puntos.length - 1 ? 'end' : 'middle'} className="grafica-progreso__fecha">{fecha(puntos[i].fecha)}</text>)}
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
