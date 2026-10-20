import type { Sesion } from '../dominio/tipos'
import { fechaDeHoy } from '../datos/repositorio'

/** Semana de calendario local, de lunes a domingo; no una ventana de siete días. */
export function sesionesDeSemana(sesiones: readonly Sesion[], ahora = new Date()): number {
  const lunes = new Date(ahora)
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7))
  const inicio = fechaDeHoy(lunes)
  const hoy = fechaDeHoy(ahora)
  return sesiones.filter(s => s.completadaEn && s.fecha >= inicio && s.fecha <= hoy).length
}
