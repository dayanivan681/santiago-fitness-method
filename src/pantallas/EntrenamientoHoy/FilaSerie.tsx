/**
 * Una serie: peso, reps y RIR.
 * Guía del proyecto §5 (registro serie por serie), §8 (evaluación contra la
 * referencia), §13 (el paso de peso lo marca el equipo), §14 (RIR).
 *
 * Pendiente muestra steppers; registrada muestra los valores en firme. El paso
 * de peso no es arbitrario: usa el incremento real de la máquina (§13, §17).
 */

import { useState } from 'react'
import { aPesoRegistradoLb, incrementoRegistradoLb } from '../../dominio/carga'
import { aComparable } from '../../dominio/serie'
import { ETIQUETA_PROGRESO, evaluarSerie } from '../../logica/progreso'
import {
  TECNICAS,
  TECNICA_POR_DEFECTO,
  type Ejercicio,
  type SerieComparable,
  type SerieRegistrada,
  type Tecnica,
} from '../../dominio/tipos'
import type { NuevaSerie } from '../../aplicacion/useEntrenamiento'

/** §14: la escala llega hasta 5+; el toque cicla 0–5. */
const RIR_MAXIMO = 5

interface Props {
  readonly numeroSerie: number
  readonly ejercicio: Ejercicio
  readonly repMin: number
  readonly registrada?: SerieRegistrada
  readonly referencia?: SerieComparable
  readonly conEtiquetas: boolean
  readonly onGuardar: (valores: NuevaSerie) => Promise<void>
  readonly onCorregir: (serie: SerieRegistrada, valores: NuevaSerie) => Promise<void>
}

export function FilaSerie({
  numeroSerie,
  ejercicio,
  repMin,
  registrada,
  referencia,
  conEtiquetas,
  onGuardar,
  onCorregir,
}: Props) {
  const paso = incrementoRegistradoLb(ejercicio)
  const porLado = ejercicio.tipoCarga === 'porLado'

  // §6: el punto de partida es la referencia anterior, no una imposición — el
  // participante la ajusta con ± y confirma tocando Guardar.
  const pesoDeReferencia = referencia
    ? redondear(aPesoRegistradoLb(referencia.cargaTotalLb, ejercicio))
    : 0

  const [editando, setEditando] = useState(false)
  const [peso, setPeso] = useState(registrada?.pesoRegistradoLb ?? pesoDeReferencia)
  // Las reps también arrancan en la referencia: con el rango de fuerza (1–5),
  // empezar en el mínimo obligaría a pulsar cuatro veces cada serie.
  const [reps, setReps] = useState(registrada?.repsRealizadas ?? referencia?.reps ?? repMin)
  const [rir, setRir] = useState(registrada?.rir ?? 2)
  // Técnica y calentamiento se marcan sólo cuando se salen de lo normal: por
  // defecto no ocupan sitio, que es lo que pide el cliente al quererlo simple.
  const [tecnica, setTecnica] = useState<Tecnica>(registrada?.tecnica ?? TECNICA_POR_DEFECTO)
  const [esCalentamiento, setEsCalentamiento] = useState(
    registrada?.esCalentamiento ?? false,
  )
  const [guardando, setGuardando] = useState(false)

  // Registrada y sin editar: los valores se muestran en firme.
  const hecha = registrada !== undefined && !editando
  // El veredicto sólo tiene sentido sobre lo guardado: mientras se corrige, el
  // de antes hablaría de unos números que ya se están cambiando.
  const resultado =
    hecha && registrada && referencia
      ? evaluarSerie(aComparable(registrada, ejercicio), referencia)
      : undefined

  async function guardar() {
    if (guardando) return
    setGuardando(true)
    try {
      const valores = {
        pesoRegistradoLb: peso,
        repsRealizadas: reps,
        rir,
        tecnica,
        esCalentamiento,
      }
      if (registrada) {
        await onCorregir(registrada, valores)
        setEditando(false)
      } else {
        await onGuardar(valores)
      }
    } finally {
      setGuardando(false)
    }
  }

  const etiqueta = `serie ${numeroSerie} de ${ejercicio.nombre}`

  return (
    <div className={hecha ? 'serie serie--hecha' : 'serie'}>
      <div className="serie__cabecera">
        <span className="serie__titulo">
          Serie {numeroSerie}
          {(hecha ? registrada.esCalentamiento : esCalentamiento) && (
            <span className="marca marca--calentamiento">Calentamiento</span>
          )}
        </span>

        {hecha ? (
          <span className="serie__meta">
            {registrada.tecnica && registrada.tecnica !== TECNICA_POR_DEFECTO && (
              <span className={`marca marca--${registrada.tecnica}`}>
                {ETIQUETA_TECNICA[registrada.tecnica]}
              </span>
            )}
            {resultado && (
              <span className={`serie__veredicto veredicto--${resultado}`}>
                {ETIQUETA_PROGRESO[resultado]}
              </span>
            )}
          </span>
        ) : (
          <span className="serie__meta">
            <button
              type="button"
              className={`marca marca--${tecnica} marca--tocable`}
              onClick={() => setTecnica(siguienteTecnica)}
              aria-label={`Técnica de la ${etiqueta}`}
            >
              {ETIQUETA_TECNICA[tecnica]}
            </button>
            <button
              type="button"
              className={
                esCalentamiento
                  ? 'marca marca--calentamiento marca--tocable'
                  : 'marca marca--tocable'
              }
              aria-pressed={esCalentamiento}
              onClick={() => setEsCalentamiento((valor) => !valor)}
              aria-label={`Marcar la ${etiqueta} como calentamiento`}
            >
              Calent.
            </button>
          </span>
        )}
      </div>

      <div className="serie__campos">
        <div className="campo campo--peso">
          {conEtiquetas && (
            <span className="etiqueta-campo">Peso {porLado ? '(lb/lado)' : '(lb)'}</span>
          )}
          {hecha ? (
            <output className="valor" aria-label={`Peso de la ${etiqueta}`}>
              {registrada.pesoRegistradoLb}
            </output>
          ) : (
            <div className="paso">
              <button
                type="button"
                className="paso__boton"
                disabled={peso <= 0}
                onClick={() => setPeso((p) => redondear(Math.max(0, p - paso)))}
                aria-label={`Bajar peso de la ${etiqueta}`}
              >
                –
              </button>
              <output className="valor" aria-label={`Peso de la ${etiqueta}`}>
                {peso}
              </output>
              <button
                type="button"
                className="paso__boton"
                onClick={() => setPeso((p) => redondear(p + paso))}
                aria-label={`Subir peso de la ${etiqueta}`}
              >
                +
              </button>
            </div>
          )}
        </div>

        <div className="campo campo--reps">
          {conEtiquetas && <span className="etiqueta-campo">Reps</span>}
          {hecha ? (
            <output className="valor" aria-label={`Reps de la ${etiqueta}`}>
              {registrada.repsRealizadas}
            </output>
          ) : (
            <div className="paso">
              <button
                type="button"
                className="paso__boton"
                disabled={reps <= 1}
                onClick={() => setReps((r) => Math.max(1, r - 1))}
                aria-label={`Bajar reps de la ${etiqueta}`}
              >
                –
              </button>
              <output className="valor" aria-label={`Reps de la ${etiqueta}`}>
                {reps}
              </output>
              <button
                type="button"
                className="paso__boton"
                onClick={() => setReps((r) => r + 1)}
                aria-label={`Subir reps de la ${etiqueta}`}
              >
                +
              </button>
            </div>
          )}
        </div>

        <div className="campo campo--rir">
          {conEtiquetas && <span className="etiqueta-campo">RIR</span>}
          {hecha ? (
            <output className="valor" aria-label={`RIR de la ${etiqueta}`}>
              {registrada.rir}
            </output>
          ) : (
            <button
              type="button"
              className="valor valor--tocable"
              onClick={() => setRir((valor) => (valor + 1) % (RIR_MAXIMO + 1))}
              aria-label={`RIR de la ${etiqueta}`}
            >
              {rir}
            </button>
          )}
        </div>
      </div>

      <div className="serie__pie">
        <span className="serie__anterior">
          {referencia
            ? `Anterior: ${pesoDeReferencia}${porLado ? '/lado' : ''} lb × ${referencia.reps} · RIR ${referencia.rir}`
            : 'Primera vez con este ejercicio'}
        </span>
        {hecha ? (
          <button
            type="button"
            className="boton-guardar boton-guardar--secundario"
            onClick={() => setEditando(true)}
            aria-label={`Editar la ${etiqueta}`}
          >
            Editar
          </button>
        ) : (
          <button
            type="button"
            className="boton-guardar"
            onClick={guardar}
            disabled={guardando}
            aria-label={`Guardar la ${etiqueta}`}
          >
            {guardando ? '…' : 'Guardar'}
          </button>
        )}
      </div>
    </div>
  )
}

/** Las cuatro de la escala del cliente, en una etiqueta corta para el móvil. */
const ETIQUETA_TECNICA: Readonly<Record<Tecnica, string>> = {
  excelente: 'Téc. exc.',
  buena: 'Téc. buena',
  aceptable: 'Téc. acept.',
  deficiente: 'Téc. defic.',
}

function siguienteTecnica(actual: Tecnica): Tecnica {
  return TECNICAS[(TECNICAS.indexOf(actual) + 1) % TECNICAS.length]
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100
}
