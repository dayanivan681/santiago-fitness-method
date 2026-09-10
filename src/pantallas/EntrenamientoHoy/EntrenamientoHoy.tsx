/**
 * Hoy: qué toca entrenar y una sola acción para empezar.
 *
 * Guía del proyecto §3 (ya viene cargado), §24 (los 5 ejercicios), §25.
 *
 * Antes esta pantalla ERA el entrenamiento: abría con el primer ejercicio
 * desplegado y sus series listas para guardar, unos cuarenta controles tocables
 * en dos pantallas de scroll. Se entendía después de leerla, no de un vistazo.
 *
 * Ahora responde a una sola pregunta —qué tengo que hacer hoy— y el registro
 * vive en `Entrenamiento`, que es un modo aparte. Lo que se ve aquí es el plan,
 * no el formulario: los ejercicios del día son filas de lectura, sin controles.
 */

import { useEntrenamiento } from '../../aplicacion/useEntrenamiento'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import type { Repositorio } from '../../datos/repositorio'
import type { Memoria } from '../../aplicacion/memoria'

interface Props {
  readonly repositorio?: Repositorio
  /** Día elegido, recordado por `App` mientras dure la pestaña. */
  readonly memoriaDia?: Memoria<string | null>
  /** Entrar al modo entrenamiento. */
  readonly onComenzar?: () => void
}

export function EntrenamientoHoy({
  repositorio = repositorioPorDefecto,
  memoriaDia,
  onComenzar,
}: Props = {}) {
  const { datos, elegirPlantilla, cargando } = useEntrenamiento(repositorio, memoriaDia)

  if (cargando) return <p className="aviso">Cargando…</p>
  if (!datos) return <p className="aviso">No hay entrenamiento configurado todavía.</p>

  const { plantilla, plantillas, ejerciciosDelDia, seriesHechas, seriesObjetivo, sesionDeHoy } =
    datos

  const enCurso = Boolean(sesionDeHoy && !sesionDeHoy.completadaEn)
  const terminada = Boolean(sesionDeHoy?.completadaEn)

  return (
    <>
      <div className="contenido">
        <header data-tour="sesion-hoy" className="pantalla">
          <p className="sfm-eyebrow">Tu próxima sesión</p>
          <h2 className="sfm-today-title">{plantilla.nombre}</h2>
          <p className="pantalla__sub">
            {ejerciciosDelDia.length > 0 && (
              <>
                {ejerciciosDelDia.length} ejercicios · {seriesObjetivo} series
              </>
            )}
          </p>
        </header>

        {ejerciciosDelDia.length>0&&<div className="sfm-session-visual" aria-hidden="true">{ejerciciosDelDia.slice(0,3).map(e=><img key={e.ejercicio.id} src={e.ejercicio.imagen} alt=""/>)}</div>}
        <nav className="filtros" aria-label="Día de entrenamiento">
          {plantillas.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              className={opcion.id === plantilla.id ? 'filtro filtro--activo' : 'filtro'}
              aria-pressed={opcion.id === plantilla.id}
              onClick={() => elegirPlantilla(opcion.id)}
            >
              {opcion.nombre}
            </button>
          ))}
        </nav>

        {ejerciciosDelDia.length === 0 ? (
          // Si el coach aún no ha publicado ese día desde /admin, el participante
          // recibe un estado vacío explícito en vez de controles de programación.
          <p className="aviso">
            {plantilla.nombre} todavía no tiene ejercicios definidos. Tu coach está preparando esta sesión.
          </p>
        ) : (
          <>
            {/* La única acción de la pantalla. Con una sesión abierta cambia de
                verbo y lleva el progreso: entrar y seguir es lo mismo. */}
            <button type="button" data-tour="comenzar" className="accion" onClick={onComenzar} style={{ marginTop: 18 }}>
              {enCurso
                ? `Continuar · ${seriesHechas} de ${seriesObjetivo} series`
                : terminada
                  ? 'Volver al entrenamiento'
                  : 'Comenzar entrenamiento'}
            </button>

            {terminada && (
              <p className="nota nota--hecho" style={{ marginTop: 12 }}>
                Sesión terminada. Lo registrado ya está en el historial.
              </p>
            )}

            <h2 className="grupo__titulo">Tu sesión, paso a paso</h2>
            <div className="grupo grupo--pleno">
              {ejerciciosDelDia.map((ejercicioDelDia) => {
                const hechas = ejercicioDelDia.seriesDeHoy.length
                return (
                  <div className="fila" key={ejercicioDelDia.ejercicio.id}>
                    <img className="sfm-exercise-thumb" src={ejercicioDelDia.ejercicio.imagen} alt="" loading="lazy"/>
                    <span className="fila__cuerpo">
                      <span className="fila__titulo">{ejercicioDelDia.ejercicio.nombre}</span>
                      <span className="fila__detalle">
                        {ejercicioDelDia.slot.seriesObjetivo} series ·{' '}
                        {ejercicioDelDia.slot.repMin}–{ejercicioDelDia.slot.repMax} reps
                      </span>
                    </span>
                    {hechas > 0 && (
                      <span className="fila__valor">
                        {hechas}/{ejercicioDelDia.slot.seriesObjetivo}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </>
  )
}
