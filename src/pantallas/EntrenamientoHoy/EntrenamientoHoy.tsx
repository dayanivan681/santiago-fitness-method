/**
 * Pantalla principal.
 * Guía del proyecto §3 (ya viene cargado), §24 (los 5 ejercicios), §25.
 */

import { useEffect, useRef, useState } from 'react'
import { useEntrenamiento } from '../../aplicacion/useEntrenamiento'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import { Cabecera } from '../../componentes/Cabecera'
import { formatearSegundos } from '../../logica/descanso'
import { TarjetaEjercicio } from './TarjetaEjercicio'
import { HojaVariantes } from './HojaVariantes'
import { HojaEjercicio } from '../Biblioteca/HojaEjercicio'
import { fechaDeHoy, type Repositorio } from '../../datos/repositorio'
import type { Ejercicio } from '../../dominio/tipos'

/** §12: el descanso se puede alargar sin pelearse con el cronómetro. */
const PRORROGA_SEGUNDOS = 30

/** Cuándo el cronómetro empieza a avisar de verdad. */
const SEGUNDOS_DE_AVISO = 10

interface Props {
  readonly repositorio?: Repositorio
}

export function EntrenamientoHoy({ repositorio = repositorioPorDefecto }: Props = {}) {
  const {
    datos,
    elegirPlantilla,
    registrarSerie,
    corregirSerie,
    deshacerUltimaCorreccion,
    terminarSesion,
    cambiarVariante,
    cargando,
  } = useEntrenamiento(repositorio)

  const [abierta, setAbierta] = useState(0)
  const [variantesDe, setVariantesDe] = useState<number | null>(null)
  const [fichaDe, setFichaDe] = useState<Ejercicio | null>(null)
  const [descanso, setDescanso] = useState(0)
  const temporizador = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => detener(temporizador), [])

  function arrancarDescanso(segundos: number) {
    detener(temporizador)
    setDescanso(segundos)
    temporizador.current = setInterval(() => {
      setDescanso((quedan) => {
        if (quedan <= 1) {
          detener(temporizador)
          return 0
        }
        return quedan - 1
      })
    }, 1000)
  }

  /**
   * Al completar la última serie, el ejercicio se pliega y se abre el siguiente.
   *
   * Es lo que se hace en el gimnasio: terminas y pasas al que toca. Plegado
   * sigue viéndose el resumen —`4/4`, "Completo"— y se puede reabrir para
   * corregir, así que no se esconde nada.
   */
  function avanzarSiTermino(indice: number, numeroSerie: number, seriesObjetivo: number) {
    if (numeroSerie < seriesObjetivo) return
    setAbierta((actual) => (actual === indice ? indice + 1 : actual))
  }

  if (cargando) return <p className="aviso">Cargando…</p>
  if (!datos) return <p className="aviso">No hay entrenamiento configurado todavía.</p>

  const {
    participante,
    plantilla,
    plantillas,
    ejerciciosDelDia,
    seriesHechas,
    seriesObjetivo,
    sesionDeHoy,
  } = datos
  const item = variantesDe === null ? undefined : ejerciciosDelDia[variantesDe]
  const bibliotecaDelDia = ejerciciosUnicos(
    ejerciciosDelDia.flatMap((ejercicioDelDia) => ejercicioDelDia.variantes),
  )

  // El cliente pide que el temporizador NO arranque solo: lo activa el
  // participante. Ojo con no confundirlo con el descanso *medido* que guarda el
  // historial (§5), que se sigue derivando solo de las marcas de tiempo.

  return (
    <>
      <Cabecera
        kicker={plantilla.nombre}
        titulo="Entrenamiento de hoy"
        meta={`${seriesHechas}/${seriesObjetivo} series`}
      />

      {/* Con la barra de sesión abajo hace falta más hueco, o el último texto
          queda a seis píxeles de quedar tapado. */}
      <div
        className={
          sesionDeHoy && !sesionDeHoy.completadaEn ? 'contenido contenido--con-barra' : 'contenido'
        }
      >
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

        {/* Portada del día: da identidad a la sesión antes de la lista (§24).
            Sin foto real va compacta, para no empujar la primera serie fuera de
            la pantalla en un móvil pequeño. */}
        {ejerciciosDelDia.length > 0 && (
          <div className="portada portada--compacta" style={{ marginTop: 12 }}>
            <div className="portada__imagen">
              <span className="portada__marcador">Foto del día</span>
            </div>
            <div className="portada__pie">
              <div className="portada__dia">{plantilla.nombre}</div>
              <div className="portada__lema">Disciplina = Resultados</div>
            </div>
          </div>
        )}

        {ejerciciosDelDia.length === 0 ? (
          // §28: Lower A, Upper B y Lower B siguen sin confirmarse.
          <p className="aviso">
            {plantilla.nombre} todavía no tiene ejercicios definidos. Se configuran desde
            Perfil → Estructura de 4 días.
          </p>
        ) : (
          <div className="pila" style={{ marginTop: 12 }}>
            {ejerciciosDelDia.map((ejercicioDelDia, indice) => (
              <TarjetaEjercicio
                key={ejercicioDelDia.ejercicio.id}
                item={ejercicioDelDia}
                abierta={abierta === indice}
                onAlternar={() => setAbierta((actual) => (actual === indice ? -1 : indice))}
                onAbrirVariantes={() => setVariantesDe(indice)}
                onAbrirFicha={() => setFichaDe(ejercicioDelDia.ejercicio)}
                onDescansar={() => arrancarDescanso(ejercicioDelDia.slot.descansoSegundos)}
                onGuardarSerie={async (ejercicioId, numeroSerie, valores) => {
                  await registrarSerie(ejercicioId, numeroSerie, valores)
                  avanzarSiTermino(indice, numeroSerie, ejercicioDelDia.slot.seriesObjetivo)
                }}
                onCorregirSerie={corregirSerie}
                onDeshacerCorreccion={deshacerUltimaCorreccion}
                repositorio={repositorio}
                claveDeBorrador={{
                  participanteId: participante.id,
                  fecha: fechaDeHoy(),
                  plantillaDiaId: plantilla.id,
                  orden: ejercicioDelDia.slot.orden,
                }}
              />
            ))}

            {/* §19: la sesión la cierra el participante. Se guarda lo que hizo,
                aunque falten ejercicios o series. Ahora vive en la barra fija;
                aquí sólo queda la confirmación de que ya está cerrada. */}
            {sesionDeHoy?.completadaEn && (
              <p className="nota nota--hecho">
                Sesión terminada. Lo registrado ya está en el historial.
              </p>
            )}

            <p className="nota">
              La app no impone el peso. Muestra la referencia anterior; tú ajustas lo que
              realmente hiciste antes de guardar.
            </p>
          </div>
        )}
      </div>

      {/* El nombre importa: los campos de la serie son <output>, que también
          anuncian estado, y sin él no se distinguiría cuál es el cronómetro. */}
      {/*
       * Progreso de la sesión, siempre a la vista.
       *
       * Antes había que bajar hasta el final de la lista —hasta ocho ejercicios—
       * para ver cuánto llevabas y para poder cerrar la sesión. Con esto se sabe
       * de un vistazo y se cierra desde donde estés.
       */}
      {sesionDeHoy && !sesionDeHoy.completadaEn && (
        <div
          className="progreso-sesion"
          role="progressbar"
          aria-label="Progreso de la sesión"
          aria-valuemin={0}
          aria-valuemax={seriesObjetivo}
          aria-valuenow={seriesHechas}
        >
          <span
            className="progreso-sesion__relleno"
            style={{ width: `${(seriesHechas / Math.max(1, seriesObjetivo)) * 100}%` }}
          />
          <span className="progreso-sesion__texto">
            {seriesHechas} de {seriesObjetivo} series
          </span>
          <button
            type="button"
            className="progreso-sesion__terminar"
            onClick={terminarSesion}
          >
            Terminar sesión
          </button>
        </div>
      )}

      {descanso > 0 && (
        <div
          className={[
            'descanso',
            descanso <= SEGUNDOS_DE_AVISO && 'descanso--acabando',
            // Sin barra de sesión debajo, el cronómetro ocupa su sitio.
            !(sesionDeHoy && !sesionDeHoy.completadaEn) && 'descanso--sin-barra',
          ]
            .filter(Boolean)
            .join(' ')}
          role="status"
          aria-label="Temporizador de descanso"
        >
          <span className="descanso__rotulo">Descanso</span>
          <span className="descanso__tiempo">{formatearSegundos(descanso)}</span>
          <button
            type="button"
            className="descanso__boton"
            onClick={() => setDescanso((quedan) => quedan + PRORROGA_SEGUNDOS)}
          >
            +{PRORROGA_SEGUNDOS}s
          </button>
          <button
            type="button"
            className="descanso__boton descanso__boton--fuerte"
            onClick={() => {
              detener(temporizador)
              setDescanso(0)
            }}
          >
            Listo
          </button>
        </div>
      )}

      {/* La ficha se superpone: la tarjeta sigue montada debajo, así que abrirla
          y cerrarla no cuesta lo que llevas tecleado en la serie. */}
      {fichaDe && (
        <HojaEjercicio
          ejercicio={fichaDe}
          biblioteca={bibliotecaDelDia}
          historial={{ participanteId: participante.id, repositorio }}
          onElegir={setFichaDe}
          onCerrar={() => setFichaDe(null)}
        />
      )}

      {item && (
        <HojaVariantes
          variantes={item.variantes}
          actualId={item.ejercicio.id}
          asignadaId={item.ejercicioDeLaPlantillaId}
          participante={participante}
          rango={item.rango}
          repositorio={repositorio}
          onCerrar={() => setVariantesDe(null)}
          onElegir={async (ejercicioId, alcance) => {
            await cambiarVariante(item.slot.orden, ejercicioId, alcance)
            setVariantesDe(null)
          }}
        />
      )}
    </>
  )
}

function detener(ref: { current: ReturnType<typeof setInterval> | null }) {
  if (ref.current) {
    clearInterval(ref.current)
    ref.current = null
  }
}

/**
 * Cada ejercicio del día carga todas sus variantes, así que al aplanarlas se
 * repite el mismo catálogo varias veces. La ficha necesita una sola fila por
 * ejercicio: además de evitar botones duplicados, conserva claves React únicas.
 */
function ejerciciosUnicos(ejercicios: readonly Ejercicio[]): Ejercicio[] {
  return [...new Map(ejercicios.map((ejercicio) => [ejercicio.id, ejercicio])).values()]
}
