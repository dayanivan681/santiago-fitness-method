/**
 * Pantalla de biblioteca.
 * Guía del proyecto §15: visual, sirve para identificar el ejercicio sin saber
 * los nombres técnicos. §16: las variantes aparecen separadas, porque lo son.
 *
 * Era una rejilla de dos columnas de tarjetas con foto, y con 33 ejercicios ya
 * obligaba a leer en zigzag: los nombres del método —«Press de pecho
 * convergente horizontal»— ocupan tres líneas dentro de media tarjeta. Ahora es
 * una lista de filas con miniatura: el nombre manda y la foto sigue estando.
 *
 * §15 se mantiene —la biblioteca es visual y sirve para identificar el
 * ejercicio sin saber su nombre técnico—, sólo que la foto grande vive en la
 * ficha, que es donde de verdad se estudia un ejercicio. El resto de lo que
 * pide el punto H del cliente (músculos, tipo de carga, alternativas) sigue
 * abriéndose al tocar.
 */

import { useState } from 'react'
import { useLiveQuery } from '../../nube/eventos'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import { NOMBRE_MUSCULO, etiquetaEquipo } from '../../dominio/etiquetas'
import { normalizarBusqueda } from '../../logica/busqueda'
import { segunCantidad } from '../../logica/plural'
import { HojaEjercicio } from './HojaEjercicio'
import type { Repositorio } from '../../datos/repositorio'
import type { Ejercicio, Equipo, Musculo } from '../../dominio/tipos'
import { useMemoria, type Memoria } from '../../aplicacion/memoria'

interface Props {
  readonly repositorio?: Repositorio
  /** Filtro de músculo, recordado por `App` entre visitas. */
  readonly memoriaFiltro?: Memoria<Musculo | typeof TODOS>
}

const TODOS = 'todos'

export function Biblioteca({ repositorio = repositorioPorDefecto, memoriaFiltro }: Props = {}) {
  const filtroPropio = useMemoria<Musculo | typeof TODOS>(TODOS)
  const { valor: filtro, recordar: setFiltro } = memoriaFiltro ?? filtroPropio
  const [abierto, setAbierto] = useState<Ejercicio | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [equipo, setEquipo] = useState<Equipo | typeof TODOS>(TODOS)

  const ejercicios = useLiveQuery(async () => {
    const todos = await repositorio.listarEjercicios()
    return todos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [repositorio])

  if (ejercicios === undefined) return <p className="aviso">Cargando…</p>

  const musculos = [...new Set(ejercicios.map((e) => e.musculoPrimario))].sort((a, b) =>
    NOMBRE_MUSCULO[a].localeCompare(NOMBRE_MUSCULO[b], 'es'),
  )
  const termino = normalizarBusqueda(busqueda)
  const equipos = [...new Set(ejercicios.map((e) => e.equipo))].sort((a, b) =>
    etiquetaEquipo(a).localeCompare(etiquetaEquipo(b), 'es'),
  )
  const porMusculo = ejercicios.filter(
    (ejercicio) =>
      (filtro === TODOS || ejercicio.musculoPrimario === filtro) &&
      (equipo === TODOS || ejercicio.equipo === equipo),
  )
  // Buscar manda sobre el filtro: quien escribe «smith» quiere el Smith, no el
  // Smith dentro de Pecho. Con 293 ejercicios en camino, teclear es el camino
  // rápido y los filtros el de explorar.
  const visibles = termino
    ? ejercicios.filter((ejercicio) => normalizarBusqueda(ejercicio.nombre).includes(termino))
    : porMusculo

  return (
    <>
      <div className="contenido">
        {/* La biblioteca es el catálogo del método, no datos de nadie: aquí el
            nombre del participante no aportaba nada y además estaba fijo. */}
        <header className="pantalla">
          <h1 className="pantalla__titulo">Biblioteca</h1>
          <p className="pantalla__sub">{ejercicios.length} {segunCantidad(ejercicios.length, 'ejercicio', 'ejercicios')} del método</p>
        </header>

        {/* Un solo campo, sin botón de lupa al lado: ese par es un formulario
            de sitio web. Filtra según se escribe, sin enviar nada. */}
        <div className="busca">
          <svg className="busca__icono" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="6" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar ejercicio"
            aria-label="Buscar ejercicio"
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>

        <nav
          className={termino ? 'filtros filtro--en-pausa' : 'filtros'}
          aria-label="Filtrar por músculo"
          aria-disabled={termino ? true : undefined}
        >
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

        <label
          className={termino ? 'filtro-equipo filtro--en-pausa' : 'filtro-equipo'}
          aria-disabled={termino ? true : undefined}
        >
          <span>Equipo</span>
          <select value={equipo} onChange={(evento) => setEquipo(evento.target.value as Equipo | typeof TODOS)}>
            <option value={TODOS}>Todos</option>
            {equipos.map((e) => (
              <option key={e} value={e}>
                {etiquetaEquipo(e)}
              </option>
            ))}
          </select>
        </label>

        {/* Buscar manda sobre los filtros: se dice, y los filtros quedan en pausa. */}
        {termino && <p className="aviso-busqueda">Buscando en toda la biblioteca</p>}

        {visibles.length === 0 ? (
          // Antes filtrar sin resultados dejaba una rejilla en blanco, sin decir
          // nada. Ahora se dice, y con qué se buscó.
          <p className="aviso">
            {termino ? 'No hay ningún ejercicio que se llame así.' : 'No hay ningún ejercicio con esos filtros.'}
          </p>
        ) : (
          <div className="grupo grupo--pleno">
            {visibles.map((ejercicio) => (
              <button
                key={ejercicio.id}
                type="button"
                className="fila"
                onClick={() => setAbierto(ejercicio)}
              >
                {ejercicio.imagen ? (
                  <img className="fila__miniatura" src={ejercicio.imagen} alt="" />
                ) : (
                  <span className="fila__miniatura" />
                )}
                <span className="fila__cuerpo">
                  <span className="fila__titulo">{ejercicio.nombre}</span>
                  <span className="fila__detalle">{etiquetaEquipo(ejercicio.equipo)}</span>
                </span>
                <span className="fila__flecha" aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </div>
        )}

        <p className="nota" style={{ marginTop: 16 }}>
          Cada variante mantiene su propio historial: Smith, convergente, cable, mancuernas
          y barra libre no se mezclan.
        </p>
      </div>

      {abierto && (
        <HojaEjercicio
          ejercicio={abierto}
          biblioteca={ejercicios}
          // Saltar de una equivalente a otra sin cerrar y volver a buscar.
          onElegir={setAbierto}
          onCerrar={() => setAbierto(null)}
        />
      )}
    </>
  )
}
