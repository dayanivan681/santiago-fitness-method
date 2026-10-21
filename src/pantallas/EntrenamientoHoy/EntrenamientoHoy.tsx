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

import { Esqueleto } from '../../componentes/Esqueleto'
import { useState, type ReactNode } from 'react'
import { useEntrenamiento } from '../../aplicacion/useEntrenamiento'
import { bloquesDe, nombreDeGrupo } from '../../../shared/superseries'
import { HojaEjercicio } from '../Biblioteca/HojaEjercicio'
import type { Ejercicio } from '../../dominio/tipos'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import type { Repositorio } from '../../datos/repositorio'
import type { Memoria } from '../../aplicacion/memoria'
import { Icono } from '../../producto/ui'

interface Props {
  readonly repositorio?: Repositorio
  /** Día elegido, recordado por `App` mientras dure la pestaña. */
  readonly memoriaDia?: Memoria<string | null>
  /** Entrar al modo entrenamiento. */
  readonly onComenzar?: () => void
  readonly consejo?: ReactNode
}

export function EntrenamientoHoy({
  repositorio = repositorioPorDefecto,
  memoriaDia,
  onComenzar,
  consejo,
}: Props = {}) {
  const { datos, elegirPlantilla, cargando } = useEntrenamiento(repositorio, memoriaDia)
  const [fichaDe, setFichaDe] = useState<Ejercicio | null>(null)

  if (cargando) return <Esqueleto etiqueta="Cargando tu sesión" />
  if (!datos) return <p className="aviso">No hay entrenamiento configurado todavía.</p>

  const { plantilla, plantillas, ejerciciosDelDia, seriesHechas, seriesObjetivo, sesionDeHoy, participante } =
    datos
  // La ficha deja saltar a las variantes equivalentes del día, como en el entrenamiento.
  const bibliotecaDelDia = [
    ...new Map(ejerciciosDelDia.flatMap((e) => e.variantes).map((e) => [e.id, e])).values(),
  ]

  const enCurso = Boolean(sesionDeHoy && !sesionDeHoy.completadaEn)
  const terminada = Boolean(sesionDeHoy?.completadaEn)

  return (
    <>
      <div className="contenido sfm-today">
        {/* Hasta 5 días caben todos a la vista (no hay que descubrir que la fila se desliza); con 6 o 7 se desplaza. */}
        <nav className="filtros filtros--dias" data-dias={plantillas.length} aria-label="Día de entrenamiento">
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

        <section className="sfm-routine-card" data-tour="sesion-hoy" aria-labelledby="sesion-hoy-titulo">
          {ejerciciosDelDia.length > 0 && <img className="sfm-routine-photo" src={ejerciciosDelDia[0].ejercicio.imagen} alt="" />}
          <div className="sfm-routine-body">
            <header className="pantalla">
              <h2 id="sesion-hoy-titulo" className="sfm-today-title">{plantilla.nombre}</h2>
              {ejerciciosDelDia.length > 0 && <p className="pantalla__sub">{ejerciciosDelDia.length} ejercicios · {seriesObjetivo} series</p>}
            </header>
            {ejerciciosDelDia.length === 0 ? <p className="aviso">
              {plantilla.nombre} todavía no tiene ejercicios definidos. Tu coach está preparando esta sesión.
            </p> : <button type="button" data-tour="comenzar" className="accion accion--principal sfm-routine-start" onClick={onComenzar}>
              <Icono nombre="comenzar" size={20} />
              <span>{enCurso ? `Continuar · ${seriesHechas} de ${seriesObjetivo} series`
                : terminada ? 'Volver al entrenamiento' : 'Comenzar entrenamiento'}</span>
            </button>}
          </div>
        </section>
        <div className="semana-sesiones">
          <p><span>Semana</span><span>{datos.sesionesSemana} de {participante.frecuenciaEntrenamiento} sesiones</span></p>
          <div role="progressbar" aria-label="Sesiones de la semana" aria-valuemin={0}
            aria-valuemax={participante.frecuenciaEntrenamiento}
            aria-valuenow={Math.min(datos.sesionesSemana, participante.frecuenciaEntrenamiento)}
            aria-valuetext={`${datos.sesionesSemana} de ${participante.frecuenciaEntrenamiento} sesiones`}>
            <span style={{ transform: `scaleX(${Math.min(1, datos.sesionesSemana / Math.max(1, participante.frecuenciaEntrenamiento))})` }} />
          </div>
        </div>

        {ejerciciosDelDia.length > 0 && (
          <>
            {terminada && (
              <p className="nota nota--hecho" style={{ marginTop: 12 }}>
                Sesión terminada. Lo registrado ya está en el historial.
              </p>
            )}

            <h2 className="grupo__titulo">Tu sesión, paso a paso</h2>
            <div className="grupo grupo--pleno">
              {bloquesDe(ejerciciosDelDia.map((e) => e.slot)).map((bloque) => {
                const enGrupo = Boolean(bloque.grupo && bloque.indices.length > 1)
                const filas = bloque.indices.map((indice, posicion) => {
                  const ejercicioDelDia = ejerciciosDelDia[indice]
                  const prefijo = enGrupo ? `${bloque.grupo}${posicion + 1} · ` : ''
                  const hechas = ejercicioDelDia.seriesDeHoy.length
                return (
                  <div className="fila" key={ejercicioDelDia.ejercicio.id}>
                    {/* Petición del coach: un cuadro al lado de cada ejercicio que el
                        participante toca para ver cómo se hace, antes de empezar. */}
                    <button
                      type="button"
                      className="sfm-exercise-thumb sfm-exercise-thumb--boton"
                      aria-label={`Ver ${ejercicioDelDia.ejercicio.nombre}`}
                      onClick={() => setFichaDe(ejercicioDelDia.ejercicio)}
                    >
                      <img src={ejercicioDelDia.ejercicio.imagen} alt="" loading="lazy"/>
                      <span aria-hidden="true"><Icono nombre="abrir" size={14} /></span>
                    </button>
                    <span className="fila__cuerpo">
                      <span className="fila__titulo">{ejercicioDelDia.ejercicio.nombre}</span>
                      <span className="fila__detalle">
                        {prefijo}{ejercicioDelDia.slot.seriesObjetivo} series ·{' '}
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
                })
                if (!enGrupo) return filas
                const etiqueta = `${nombreDeGrupo(bloque.indices.length)} ${bloque.grupo}`
                return (
                  <div className="superserie" role="group" aria-label={etiqueta} key={`grupo-${bloque.indices[0]}`}>
                    <span className="superserie__etiqueta">{etiqueta}</span>
                    {filas}
                  </div>
                )
              })}
            </div>
          </>
        )}
        {consejo && <div className="sfm-client-advice">{consejo}</div>}
      </div>
      {fichaDe && (
        <HojaEjercicio
          ejercicio={fichaDe}
          biblioteca={bibliotecaDelDia}
          historial={{ participanteId: participante.id, repositorio }}
          onElegir={setFichaDe}
          onCerrar={() => setFichaDe(null)}
        />
      )}
    </>
  )
}
