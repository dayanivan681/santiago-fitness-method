import { useEffect, useState, type CSSProperties } from 'react'
import { useMovimientoReducido } from '../../aplicacion/transiciones'
import { segunCantidad } from '../../logica/plural'
import { Hoja, Icono } from '../../producto/ui'

export function ContadorResumen({ valor, demora = 0 }: { readonly valor: number; readonly demora?: number }) {
  const reducido = useMovimientoReducido()
  const [mostrado, setMostrado] = useState(0)
  useEffect(() => {
    if (reducido) return
    let cuadro: number
    let inicio: number | undefined
    const contar = (ahora: number) => {
      inicio ??= ahora
      const progreso = Math.min(1, Math.max(0, (ahora - inicio - demora) / 600))
      setMostrado(Math.round(valor * (1 - (1 - progreso) ** 3)))
      if (progreso < 1) cuadro = requestAnimationFrame(contar)
    }
    cuadro = requestAnimationFrame(contar)
    return () => cancelAnimationFrame(cuadro)
  }, [valor, demora, reducido])
  // El lector recibe el valor final una vez, sin anunciar cada fotograma.
  return <strong aria-label={String(valor)}><span aria-hidden="true">{reducido ? valor : mostrado}</span></strong>
}

interface Props {
  readonly nombre: string
  readonly series: number
  readonly objetivo: number
  readonly ejercicios: number
  readonly cerrar: () => void
  readonly volver: () => void
}

export function ResumenSesion({ nombre, series, objetivo, ejercicios, cerrar, volver }: Props) {
  const porcentaje = objetivo > 0 ? Math.min(100, Math.round(series / objetivo * 100)) : 0
  const cifras = [
    [series, segunCantidad(series, 'Serie registrada', 'Series registradas')],
    [ejercicios, segunCantidad(ejercicios, 'Ejercicio entrenado', 'Ejercicios entrenados')],
    [porcentaje, '% del plan de hoy'],
  ] as const
  return (
    <Hoja titulo="Sesión completada" cerrar={cerrar}>
      <div className="resumen-sesion__sello" aria-hidden="true">
        <svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" pathLength="1" /></svg>
        <Icono nombre="check" size={30} />
      </div>
      <p data-tour="resumen">{nombre} · {new Date().toLocaleDateString('es', { day: 'numeric', month: 'long' })}</p>
      <div className="sfm-metrics resumen-sesion__cifras">
        {cifras.map(([valor, texto], indice) => (
          <div key={texto} style={{ '--demora-cifra': `${indice * 60}ms` } as CSSProperties}>
            <ContadorResumen valor={valor} demora={indice * 60} /><span>{texto}</span>
          </div>
        ))}
      </div>
      <p>Tu trabajo de hoy forma parte de tu progreso.</p>
      <button data-tour="cerrar-resumen" className="sfm-primary" onClick={volver}>Volver a Hoy</button>
      <button className="sfm-secondary" onClick={cerrar}>Revisar y corregir series</button>
    </Hoja>
  )
}
