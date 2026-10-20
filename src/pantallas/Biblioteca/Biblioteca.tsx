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

import { Esqueleto } from '../../componentes/Esqueleto'
import { useState } from 'react'
import { useLiveQuery } from '../../nube/eventos'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import { segunCantidad } from '../../logica/plural'
import { HojaEjercicio } from './HojaEjercicio'
import { ListaBiblioteca } from './ListaBiblioteca'
import type { Repositorio } from '../../datos/repositorio'
import type { Ejercicio } from '../../dominio/tipos'
import type { Memoria } from '../../aplicacion/memoria'
import type { FiltroMusculo } from '../../logica/filtrosBiblioteca'

interface Props {
  readonly repositorio?: Repositorio
  /** Filtro de músculo, recordado por `App` entre visitas. */
  readonly memoriaFiltro?: Memoria<FiltroMusculo>
}

export function Biblioteca({ repositorio = repositorioPorDefecto, memoriaFiltro }: Props = {}) {
  const [abierto, setAbierto] = useState<Ejercicio | null>(null)

  const ejercicios = useLiveQuery(() => repositorio.listarEjercicios(), [repositorio])

  if (ejercicios === undefined) return <Esqueleto etiqueta="Cargando la biblioteca" forma="lista" />

  return (
    <>
      <div className="contenido">
        {/* La biblioteca es el catálogo del método, no datos de nadie: aquí el
            nombre del participante no aportaba nada y además estaba fijo. */}
        <header className="pantalla">
          <h1 className="pantalla__titulo">Biblioteca</h1>
          <p className="pantalla__sub">{ejercicios.length} {segunCantidad(ejercicios.length, 'ejercicio', 'ejercicios')} del método</p>
        </header>

        <ListaBiblioteca ejercicios={ejercicios} alAbrir={setAbierto} memoriaMusculo={memoriaFiltro} />

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
