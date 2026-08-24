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
import { fechaDeHoy, type Repositorio } from '../../datos/repositorio'

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

      <div className="contenido">
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
                aunque falten ejercicios o series. */}
            {sesionDeHoy &&
              (sesionDeHoy.completadaEn ? (
                <p className="nota nota--hecho">
                  Sesión terminada. Lo registrado ya está en el historial.
                </p>
              ) : (
                <button
                  type="button"
                  className="boton-guardar boton-terminar"
                  onClick={terminarSesion}
                >
                  Terminar sesión · {seriesHechas} de {seriesObjetivo} series
                </button>
              ))}

            <p className="nota">
              La app no impone el peso. Muestra la referencia anterior; tú ajustas lo que
              realmente hiciste antes de guardar.
            </p>
          </div>
        )}
      </div>

      {/* El nombre importa: los campos de la serie son <output>, que también
          anuncian estado, y sin él no se distinguiría cuál es el cronómetro. */}
      {descanso > 0 && (
        <div
          className={
            descanso <= SEGUNDOS_DE_AVISO ? 'descanso descanso--acabando' : 'descanso'
          }
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
