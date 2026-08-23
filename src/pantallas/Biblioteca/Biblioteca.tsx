/**
 * Pantalla de biblioteca.
 * Guía del proyecto §15: visual, sirve para identificar el ejercicio sin saber
 * los nombres técnicos. Imagen, nombre, equipo y explicación corta.
 * §16: las variantes aparecen separadas, porque lo son.
 */

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import { NOMBRE_MUSCULO } from '../../aplicacion/useVolumen'
import { Cabecera } from '../../componentes/Cabecera'
import { etiquetaEquipo } from '../../componentes/ImagenEjercicio'
import type { Repositorio } from '../../datos/repositorio'
import type { Musculo } from '../../dominio/tipos'

interface Props {
  readonly repositorio?: Repositorio
}

const TODOS = 'todos'

export function Biblioteca({ repositorio = repositorioPorDefecto }: Props = {}) {
  const [filtro, setFiltro] = useState<Musculo | typeof TODOS>(TODOS)

  const ejercicios = useLiveQuery(async () => {
    const todos = await repositorio.listarEjercicios()
    return todos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [repositorio])

  if (ejercicios === undefined) return <p className="aviso">Cargando…</p>

  const musculos = [...new Set(ejercicios.map((e) => e.musculoPrimario))].sort((a, b) =>
    NOMBRE_MUSCULO[a].localeCompare(NOMBRE_MUSCULO[b], 'es'),
  )
  const visibles =
    filtro === TODOS
      ? ejercicios
      : ejercicios.filter((ejercicio) => ejercicio.musculoPrimario === filtro)

  return (
    <>
      <Cabecera
        kicker="Participante 001"
        titulo="Biblioteca"
        meta={`${ejercicios.length} ejercicios`}
      />

      <div className="contenido">
        <nav className="filtros" aria-label="Filtrar por músculo">
          <button
            type="button"
            className={filtro === TODOS ? 'filtro filtro--activo' : 'filtro'}
            aria-pressed={filtro === TODOS}
            onClick={() => setFiltro(TODOS)}
          >
            Todos
          </button>
          {musculos.map((musculo) => (
            <button
              key={musculo}
              type="button"
              className={filtro === musculo ? 'filtro filtro--activo' : 'filtro'}
              aria-pressed={filtro === musculo}
              onClick={() => setFiltro(musculo)}
            >
              {NOMBRE_MUSCULO[musculo]}
            </button>
          ))}
        </nav>

        <div className="rejilla" style={{ marginTop: 12 }}>
          {visibles.map((ejercicio) => (
            <article key={ejercicio.id} className="ficha">
              {ejercicio.imagen ? (
                <img className="ficha__imagen" src={ejercicio.imagen} alt="" />
              ) : (
                <span className="ficha__imagen" />
              )}
              <div className="ficha__cuerpo">
                <h2 className="ficha__nombre">{ejercicio.nombre}</h2>
                <span className="ficha__equipo">{etiquetaEquipo(ejercicio.equipo)}</span>
                <p className="ficha__pista">{ejercicio.explicacionCorta}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="nota" style={{ marginTop: 12 }}>
          Cada variante mantiene su propio historial: Smith, convergente, cable, mancuernas
          y barra libre no se mezclan.
        </p>
      </div>
    </>
  )
}
