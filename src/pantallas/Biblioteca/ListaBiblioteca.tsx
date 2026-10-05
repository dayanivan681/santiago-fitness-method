/**
 * La lista de la Biblioteca, la misma para el cliente y para el coach.
 *
 * Pensada para el teléfono y para quien no es técnico: un buscador fijo arriba
 * con «Filtrar» al lado, los filtros puestos como pastillas que se quitan con
 * un toque, y filas grandes con el nombre en texto normal. Sin buscar ni elegir
 * músculo, 336 ejercicios se leen agrupados por músculo («Pecho · 44»).
 */

import { useState, type ReactNode } from 'react'
import { useMemoria, type Memoria } from '../../aplicacion/memoria'
import { ETIQUETA_EQUIPO, NOMBRE_MUSCULO, etiquetaEquipo } from '../../dominio/etiquetas'
import { normalizarBusqueda } from '../../logica/busqueda'
import { segunCantidad } from '../../logica/plural'
import {
  SIN_FILTROS,
  TODOS,
  agruparPorMusculo,
  cuantosFiltros,
  visiblesDeBiblioteca,
  type FiltroEquipo,
  type FiltroMusculo,
  type FiltrosBiblioteca,
} from '../../logica/filtrosBiblioteca'
import { HojaFiltros } from './HojaFiltros'
import type { Ejercicio } from '../../dominio/tipos'

const SIN_FOTO = '/ejercicios/sin-foto.svg'

interface Props {
  readonly ejercicios: readonly Ejercicio[]
  readonly alAbrir: (ejercicio: Ejercicio) => void
  /** «Tuyo», «GIF»… delante del equipo. */
  readonly insignias?: (ejercicio: Ejercicio) => ReactNode
  /** Sólo el coach: con esto aparece «Solo mis ejercicios» en Filtrar. */
  readonly esPropio?: (ejercicio: Ejercicio) => boolean
  /** Qué hacer si la búsqueda no encuentra nada. */
  readonly detalleSinResultados?: string
  /** El músculo elegido, recordado entre visitas por quien monta la pantalla. */
  readonly memoriaMusculo?: Memoria<FiltroMusculo>
}

export function ListaBiblioteca({
  ejercicios,
  alAbrir,
  insignias,
  esPropio,
  detalleSinResultados = 'Revisa cómo está escrito.',
  memoriaMusculo,
}: Props) {
  const musculoPropio = useMemoria<FiltroMusculo>(TODOS)
  const { valor: musculo, recordar: setMusculo } = memoriaMusculo ?? musculoPropio
  const { valor: equipo, recordar: setEquipo } = useMemoria<FiltroEquipo>(TODOS)
  const { valor: soloMios, recordar: setSoloMios } = useMemoria(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtrando, setFiltrando] = useState(false)

  const filtros: FiltrosBiblioteca = { musculo, equipo, soloMios }
  const cambiar = (nuevos: FiltrosBiblioteca) => {
    setMusculo(nuevos.musculo)
    setEquipo(nuevos.equipo)
    setSoloMios(nuevos.soloMios)
  }
  const termino = normalizarBusqueda(busqueda)
  const visibles = visiblesDeBiblioteca(ejercicios, termino, filtros, esPropio)
  const activos = cuantosFiltros(filtros)
  const agrupar = !termino && musculo === TODOS

  const fila = (ejercicio: Ejercicio) => (
    <button key={ejercicio.id} type="button" className="fila" onClick={() => alAbrir(ejercicio)}>
      <img
        className="fila__miniatura"
        src={ejercicio.imagen || SIN_FOTO}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <span className="fila__cuerpo">
        <span className="fila__titulo">{ejercicio.nombre}</span>
        <span className="fila__detalle">
          {insignias?.(ejercicio)}
          {etiquetaEquipo(ejercicio.equipo)}
        </span>
      </span>
      <span className="fila__flecha" aria-hidden="true">
        ›
      </span>
    </button>
  )

  return (
    <>
      {/* Fijo arriba: con 336 ejercicios, volver a buscar no puede exigir subir. */}
      <div className="biblioteca__barra">
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
        <button
          type="button"
          className={activos ? 'biblioteca__filtrar biblioteca__filtrar--activo' : 'biblioteca__filtrar'}
          aria-haspopup="dialog"
          onClick={() => setFiltrando(true)}
        >
          {activos ? `Filtrar · ${activos}` : 'Filtrar'}
        </button>
      </div>

      {activos > 0 && (
        <div
          className={termino ? 'pastillas filtro--en-pausa' : 'pastillas'}
          aria-label="Filtros puestos"
          aria-disabled={termino ? true : undefined}
          role="group"
        >
          {musculo !== TODOS && (
            <Pastilla texto={NOMBRE_MUSCULO[musculo]} quitar={() => setMusculo(TODOS)} />
          )}
          {equipo !== TODOS && <Pastilla texto={ETIQUETA_EQUIPO[equipo]} quitar={() => setEquipo(TODOS)} />}
          {soloMios && <Pastilla texto="Solo mis ejercicios" quitar={() => setSoloMios(false)} />}
        </div>
      )}

      {/* Buscar manda sobre los filtros: se dice, y quedan en pausa. */}
      {termino && <p className="aviso-busqueda">Buscando en toda la biblioteca</p>}

      <p className="biblioteca__contador">
        {visibles.length} {segunCantidad(visibles.length, 'ejercicio', 'ejercicios')}
      </p>

      {visibles.length === 0 ? (
        <div className="biblioteca__vacio">
          <p className="biblioteca__vacio-titulo">
            {termino ? `No hay ejercicios con “${busqueda.trim()}”.` : 'No hay ejercicios con estos filtros.'}
          </p>
          <p className="biblioteca__vacio-detalle">
            {termino ? detalleSinResultados : 'Prueba con otro músculo u otro equipo.'}
          </p>
          {!termino && (
            <button
              type="button"
              className="boton-guardar boton-guardar--secundario"
              onClick={() => cambiar(SIN_FILTROS)}
            >
              Quitar filtros
            </button>
          )}
        </div>
      ) : agrupar ? (
        agruparPorMusculo(visibles).map(([m, suyos]) => (
          <section key={m} aria-label={NOMBRE_MUSCULO[m]}>
            <h2 className="grupo__titulo biblioteca__grupo">
              {NOMBRE_MUSCULO[m]} · {suyos.length}
            </h2>
            <div className="grupo grupo--pleno">{suyos.map(fila)}</div>
          </section>
        ))
      ) : (
        <div className="grupo grupo--pleno">{visibles.map(fila)}</div>
      )}

      {filtrando && (
        <HojaFiltros
          ejercicios={ejercicios}
          filtros={filtros}
          cambiar={cambiar}
          esPropio={esPropio}
          cerrar={() => setFiltrando(false)}
        />
      )}
    </>
  )
}

function Pastilla({ texto, quitar }: { readonly texto: string; readonly quitar: () => void }) {
  return (
    <button type="button" className="pastilla" aria-label={`Quitar ${texto}`} onClick={quitar}>
      {texto} <span aria-hidden="true">✕</span>
    </button>
  )
}
