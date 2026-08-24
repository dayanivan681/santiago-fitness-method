/**
 * Una serie: peso, reps y RIR.
 * Guía del proyecto §5 (registro serie por serie), §8 (evaluación contra la
 * referencia), §13 (el paso de peso lo marca el equipo), §14 (RIR).
 *
 * Pendiente muestra steppers; registrada muestra los valores en firme. El paso
 * de peso no es arbitrario: usa el incremento real de la máquina (§13, §17).
 */

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { aPesoRegistradoLb, incrementoRegistradoLb } from '../../dominio/carga'
import { aComparable } from '../../dominio/serie'
import { ETIQUETA_PROGRESO, evaluarSerie } from '../../logica/progreso'
import { formatearRir, siguienteRir } from '../../dominio/rir'
import {
  TECNICAS,
  TECNICA_POR_DEFECTO,
  type Ejercicio,
  type SerieComparable,
  type SerieRegistrada,
  type Tecnica,
} from '../../dominio/tipos'
import { idBorrador, type ClaveDeBorrador } from '../../logica/borrador'
import { puedeDeshacerse } from '../../logica/correccion'
import type { Repositorio } from '../../datos/repositorio'
import type { NuevaSerie } from '../../aplicacion/useEntrenamiento'

interface Props {
  readonly numeroSerie: number
  readonly ejercicio: Ejercicio
  readonly repMin: number
  readonly registrada?: SerieRegistrada
  readonly referencia?: SerieComparable
  /** La última serie efectiva de hoy: lo que se está levantando ahora mismo. */
  readonly partida?: SerieRegistrada
  readonly conEtiquetas: boolean
  /** Sin ella no hay autosave: es lo que identifica el hueco que se teclea. */
  readonly claveDeBorrador?: Omit<ClaveDeBorrador, 'numeroSerie'>
  readonly repositorio?: Repositorio
  readonly onGuardar: (valores: NuevaSerie) => Promise<void>
  readonly onCorregir: (serie: SerieRegistrada, valores: NuevaSerie) => Promise<void>
  readonly onDeshacer?: (serie: SerieRegistrada) => Promise<void>
}

export function FilaSerie({
  numeroSerie,
  ejercicio,
  repMin,
  registrada,
  referencia,
  partida,
  conEtiquetas,
  claveDeBorrador,
  repositorio,
  onGuardar,
  onCorregir,
  onDeshacer,
}: Props) {
  const paso = incrementoRegistradoLb(ejercicio)
  const porLado = ejercicio.tipoCarga === 'porLado'

  // §6: el punto de partida es la referencia anterior, no una imposición — el
  // participante la ajusta con ± y confirma tocando Guardar.
  const pesoDeReferencia = referencia
    ? redondear(aPesoRegistradoLb(referencia.cargaTotalLb, ejercicio))
    : 0

  // Lo de hoy manda sobre la referencia de la sesión anterior.
  const pesoDePartida = partida?.pesoRegistradoLb ?? pesoDeReferencia
  const repsDePartida = partida?.repsRealizadas ?? referencia?.reps ?? repMin

  const [editando, setEditando] = useState(false)
  const [peso, setPeso] = useState(registrada?.pesoRegistradoLb ?? pesoDePartida)
  // Las reps también arrancan en la referencia: con el rango de fuerza (1–5),
  // empezar en el mínimo obligaría a pulsar cuatro veces cada serie.
  const [reps, setReps] = useState(registrada?.repsRealizadas ?? repsDePartida)
  const [rir, setRir] = useState(registrada?.rir ?? 2)

  // Técnica y calentamiento se marcan sólo cuando se salen de lo normal: por
  // defecto no ocupan sitio, que es lo que pide el cliente al quererlo simple.
  const [tecnica, setTecnica] = useState<Tecnica>(registrada?.tecnica ?? TECNICA_POR_DEFECTO)
  const [esCalentamiento, setEsCalentamiento] = useState(
    registrada?.esCalentamiento ?? false,
  )
  const [guardando, setGuardando] = useState(false)
  // Tocar el valor lo abre para escribirlo directo. Sin esto, arrancar de 0
  // hasta un peso real serían decenas de toques del stepper.
  const [editandoPeso, setEditandoPeso] = useState(false)
  const [editandoReps, setEditandoReps] = useState(false)

  const idDelBorrador =
    claveDeBorrador && repositorio
      ? idBorrador({ ...claveDeBorrador, numeroSerie })
      : undefined

  // Sólo se guarda borrador de lo que el participante tocó. Guardarlo siempre
  // dejaría copias de valores que nadie escribió, y esas copias acabarían
  // pisando la referencia del día siguiente.
  const [tocado, setTocado] = useState(false)
  const marcar =
    <T,>(aplicar: Dispatch<SetStateAction<T>>) =>
    (valor: SetStateAction<T>) => {
      setTocado(true)
      aplicar(valor)
    }
  const cambiarPeso = marcar(setPeso)
  const cambiarReps = marcar(setReps)
  const cambiarRir = marcar(setRir)
  const cambiarTecnica = marcar(setTecnica)
  const cambiarCalentamiento = marcar(setEsCalentamiento)

  // Al registrarse una serie anterior cambia el punto de partida de ésta. Se
  // sigue **sólo si el participante no ha tocado nada**: pisarle lo que lleva
  // tecleado por guardar otra serie sería peor que no ajustar.
  const [partidaSeguida, setPartidaSeguida] = useState(pesoDePartida)
  if (pesoDePartida !== partidaSeguida) {
    setPartidaSeguida(pesoDePartida)
    if (!tocado && !registrada) {
      setPeso(pesoDePartida)
      setReps(repsDePartida)
    }
  }


  // Se recupera lo que quedó a medias antes de cerrar la app. Sólo mientras la
  // serie no esté registrada: después manda lo guardado, no el borrador.
  const recuperado = useRef(false)
  useEffect(() => {
    if (!idDelBorrador || !repositorio || registrada || recuperado.current) return

    let vigente = true
    repositorio.obtenerBorrador(idDelBorrador).then((borrador) => {
      if (!vigente) return
      // Marca el intento aunque no hubiera nada: sin esto, el autosave no
      // llegaría a activarse nunca en una serie estrenada.
      recuperado.current = true
      if (!borrador) return
      setPeso(borrador.pesoRegistradoLb)
      setReps(borrador.repsRealizadas)
      setRir(borrador.rir)
      setTecnica(borrador.tecnica ?? TECNICA_POR_DEFECTO)
      setEsCalentamiento(borrador.esCalentamiento ?? false)
    })

    return () => {
      vigente = false
    }
  }, [idDelBorrador, repositorio, registrada])

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
        // Sólo después de registrarla de verdad: si se borrara antes y el
        // guardado fallara, se perdería justo lo que el borrador protege.
        if (idDelBorrador && repositorio) await repositorio.borrarBorrador(idDelBorrador)
      }
    } finally {
      setGuardando(false)
    }
  }

  // Autosave: cada ajuste se guarda sin esperar a Guardar. El borrador vive
  // aparte del historial, así que esto no registra nada en §19 antes de tiempo.
  useEffect(() => {
    if (!idDelBorrador || !repositorio || !claveDeBorrador || registrada) return
    // No guardar antes de haber intentado recuperar, ni si nadie tocó nada.
    if (!recuperado.current || !tocado) return

    repositorio.guardarBorrador({
      id: idDelBorrador,
      ...claveDeBorrador,
      numeroSerie,
      pesoRegistradoLb: peso,
      repsRealizadas: reps,
      rir,
      tecnica,
      esCalentamiento,
      guardadoEn: new Date().toISOString(),
    })
  }, [
    idDelBorrador,
    repositorio,
    claveDeBorrador,
    registrada,
    numeroSerie,
    tocado,
    peso,
    reps,
    rir,
    tecnica,
    esCalentamiento,
  ])

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
            {/* Confirmación de que quedó guardada. El check la da de un vistazo;
                el texto va oculto pero lo lee el lector de pantalla, que es
                quien no puede ver ni el check ni el cambio de color. */}
            <span
              className="serie__confirmacion"
              role="status"
              aria-label={`Serie ${numeroSerie} de ${ejercicio.nombre}`}
            >
              <span aria-hidden="true">✓</span>
              <span className="solo-lectores">Guardada</span>
            </span>
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
              onClick={() => cambiarTecnica(siguienteTecnica)}
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
              onClick={() => cambiarCalentamiento((valor) => !valor)}
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
          ) : editandoPeso ? (
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              className="valor valor--edicion"
              aria-label={`Peso de la ${etiqueta}`}
              autoFocus
              value={peso}
              onChange={(e) => cambiarPeso(Number(e.target.value))}
              onBlur={() => {
                cambiarPeso((p) => Math.max(0, redondear(p)))
                setEditandoPeso(false)
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          ) : (
            <div className="paso">
              <button
                type="button"
                className="paso__boton"
                disabled={peso <= 0}
                onClick={() => cambiarPeso((p) => redondear(Math.max(0, p - paso)))}
                aria-label={`Bajar peso de la ${etiqueta}`}
              >
                –
              </button>
              <button
                type="button"
                className="valor valor--tocable"
                aria-label={`Peso de la ${etiqueta}`}
                onClick={() => setEditandoPeso(true)}
              >
                {peso}
              </button>
              <button
                type="button"
                className="paso__boton"
                onClick={() => cambiarPeso((p) => redondear(p + paso))}
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
          ) : editandoReps ? (
            <input
              type="number"
              inputMode="numeric"
              min="1"
              className="valor valor--edicion"
              aria-label={`Reps de la ${etiqueta}`}
              autoFocus
              value={reps}
              onChange={(e) => cambiarReps(Number(e.target.value))}
              onBlur={() => {
                cambiarReps((r) => Math.max(1, Math.round(r)))
                setEditandoReps(false)
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          ) : (
            <div className="paso">
              <button
                type="button"
                className="paso__boton"
                disabled={reps <= 1}
                onClick={() => cambiarReps((r) => Math.max(1, r - 1))}
                aria-label={`Bajar reps de la ${etiqueta}`}
              >
                –
              </button>
              <button
                type="button"
                className="valor valor--tocable"
                aria-label={`Reps de la ${etiqueta}`}
                onClick={() => setEditandoReps(true)}
              >
                {reps}
              </button>
              <button
                type="button"
                className="paso__boton"
                onClick={() => cambiarReps((r) => r + 1)}
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
              {formatearRir(registrada.rir)}
            </output>
          ) : (
            <button
              type="button"
              className="valor valor--tocable"
              onClick={() => cambiarRir(siguienteRir)}
              aria-label={`RIR de la ${etiqueta}`}
            >
              {formatearRir(rir)}
            </button>
          )}
        </div>
      </div>

      <div className="serie__pie">
        <span className="serie__anterior">
          {referencia
            ? `Anterior: ${pesoDeReferencia}${porLado ? '/lado' : ''} lb × ${referencia.reps} · RIR ${formatearRir(referencia.rir)}`
            : 'Primera vez con este ejercicio'}
        </span>
        {hecha ? (
          <span style={{ display: 'flex', gap: 8 }}>
            {/* Deshacer no borra el rastro: apila una reversión (§19). */}
            {onDeshacer && puedeDeshacerse(registrada) && (
              <button
                type="button"
                className="boton-guardar boton-guardar--secundario"
                onClick={() => onDeshacer(registrada)}
                aria-label={`Deshacer la corrección de la ${etiqueta}`}
              >
                Deshacer
              </button>
            )}
            <button
              type="button"
              className="boton-guardar boton-guardar--secundario"
              onClick={() => setEditando(true)}
              aria-label={`Editar la ${etiqueta}`}
            >
              Editar
            </button>
          </span>
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
