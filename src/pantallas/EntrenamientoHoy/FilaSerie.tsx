import { OpcionesSerie } from "./OpcionesSerie";
import { segunCantidad } from '../../logica/plural'
import { useAyuda } from "../../producto/ayuda-contexto";
/**
 * Una serie: peso, reps y RIR.
 * Guía del proyecto §5 (registro serie por serie), §8 (evaluación contra la
 * referencia), §13 (el paso de peso lo marca el equipo), §14 (RIR).
 *
 * Pendiente muestra steppers; registrada muestra los valores en firme. El paso
 * de peso no es arbitrario: usa el incremento real de la máquina (§13, §17).
 */

import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { NumeroPaso } from '../../componentes/NumeroPaso'
import { movimientoReducido } from '../../aplicacion/transiciones'
import { aPesoRegistradoLb, incrementoRegistradoLb } from '../../dominio/carga'
import { aComparable } from '../../dominio/serie'
import { ETIQUETA_PROGRESO, evaluarSerie } from '../../logica/progreso'
import { formatearRir } from '../../dominio/rir'
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
import { Icono } from '../../producto/ui'
import { anomaliaDePeso, anomaliaDeReps, esTecleoValido, leerNumero } from '../../logica/valorAnomalo'
import { claseDeLongitud } from '../../logica/longitudNumero'

/** Pausa sin tocar la serie antes de guardar su borrador. */
export const ESPERA_BORRADOR_MS = 2000

interface Props {
  readonly numeroSerie: number
  readonly ejercicio: Ejercicio
  readonly repMin: number
  readonly repMax?: number
  readonly pesoSugeridoLb?: number
  readonly registrada?: SerieRegistrada
  readonly referencia?: SerieComparable
  /** La última serie efectiva de hoy: lo que se está levantando ahora mismo. */
  readonly partida?: SerieRegistrada
  readonly conEtiquetas: boolean
  /**
   * Series que aún no tocan.
   *
   * Cuatro bloques de steppers idénticos uno debajo de otro son un formulario,
   * no un entrenamiento: sólo se abre la que toca ahora y las demás esperan en
   * una línea. Se abren tocándolas, porque a veces se registra fuera de orden.
   *
   * La fila sigue montada, así que el borrador y el arrastre del peso desde la
   * serie anterior funcionan igual estén abiertas o no.
   */
  readonly colapsada?: boolean
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
  repMax = 100,
  pesoSugeridoLb,
  registrada,
  referencia,
  partida,
  conEtiquetas,
  colapsada = false,
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
  const pesoDePartida = partida?.pesoRegistradoLb ?? pesoSugeridoLb ?? pesoDeReferencia
  const repsDePartida = partida?.repsRealizadas ?? Math.min(repMax, Math.max(repMin, referencia?.reps ?? repMin))

  const [editando, setEditando] = useState(false)
  const [desplegada, setDesplegada] = useState(false)
  const [peso, setPeso] = useState(registrada?.pesoRegistradoLb ?? pesoDePartida)
  // Las reps también arrancan en la referencia: con el rango de fuerza (1–5),
  // empezar en el mínimo obligaría a pulsar cuatro veces cada serie.
  const [reps, setReps] = useState(registrada?.repsRealizadas ?? repsDePartida)
  const ayuda = useAyuda();
  const [rir, setRir] = useState(registrada?.rir ?? 2)

  // Técnica y calentamiento se marcan sólo cuando se salen de lo normal: por
  // defecto no ocupan sitio, que es lo que pide el cliente al quererlo simple.
  const [tecnica, setTecnica] = useState<Tecnica>(registrada?.tecnica ?? TECNICA_POR_DEFECTO)
  const [esCalentamiento, setEsCalentamiento] = useState(
    registrada?.esCalentamiento ?? false,
  )
  const [nota,setNota]=useState(registrada?.nota??'')
  const [error,setError]=useState('')
  const guardandoRef=useRef(false)
  const filaRef=useRef<HTMLDivElement>(null)
  const altoAntesDeGuardar = useRef(0)
  const antesColapsada=useRef(colapsada)
  useEffect(()=>{if(antesColapsada.current&&!colapsada)filaRef.current?.scrollIntoView?.({block:'nearest',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});antesColapsada.current=colapsada},[colapsada])
  const [guardando, setGuardando] = useState(false)
  // Sólo un guardado fallido cambia el botón a «Reintentar»; un fallo del
  // borrador se avisa, pero la serie aún no se intentó guardar.
  const [guardadoFallido, setGuardadoFallido] = useState(false)
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
  const cambiarRir = (v:SetStateAction<number>)=>{marcar(setRir)(v);}
  const cambiarTecnica = marcar(setTecnica)
  const cambiarCalentamiento = marcar(setEsCalentamiento)

  // Al registrarse una serie anterior cambia el punto de partida de ésta. Se
  // sigue **sólo si el participante no ha tocado nada**: pisarle lo que lleva
  // tecleado por guardar otra serie sería peor que no ajustar.
  const clavePartida = `${pesoDePartida}:${repsDePartida}`
  const [partidaSeguida, setPartidaSeguida] = useState(clavePartida)
  if (clavePartida !== partidaSeguida) {
    setPartidaSeguida(clavePartida)
    if (!tocado && !registrada) {
      setPeso(pesoDePartida)
      setReps(repsDePartida)
    }
  }


  // Se recupera lo que quedó a medias antes de cerrar la app. Sólo mientras la
  // serie no esté registrada: después manda lo guardado, no el borrador.
  const recuperado = useRef(false)
  // Se avisa de que estos números los dejó él a medias: sin decirlo, aparecen
  // valores que no recuerda haber escrito y no sabe si son suyos o una
  // sugerencia de la app.
  const [vieneDeBorrador, setVieneDeBorrador] = useState(false)
  useEffect(() => {
    if (!idDelBorrador || !repositorio || registrada || recuperado.current) return

    let vigente = true
    repositorio.obtenerBorrador(idDelBorrador).then((borrador) => {
      if (!vigente) return
      // Marca el intento aunque no hubiera nada: sin esto, el autosave no
      // llegaría a activarse nunca en una serie estrenada.
      recuperado.current = true
      if (!borrador) return
      setVieneDeBorrador(true)
      setPeso(borrador.pesoRegistradoLb)
      setReps(borrador.repsRealizadas)
      setRir(borrador.rir)
      setNota(borrador.nota??'')
      setTecnica(borrador.tecnica ?? TECNICA_POR_DEFECTO)
      setEsCalentamiento(borrador.esCalentamiento ?? false)
    })

    return () => {
      vigente = false
    }
  }, [idDelBorrador, repositorio, registrada])

  // Registrada y sin editar: los valores se muestran en firme.
  const hecha = registrada !== undefined && !editando
  useLayoutEffect(() => {
    const fila = filaRef.current
    if (!fila || !hecha || !altoAntesDeGuardar.current || movimientoReducido()) return
    const desde = altoAntesDeGuardar.current
    altoAntesDeGuardar.current = 0
    fila.style.setProperty('--alto-serie-desde', `${desde}px`)
    fila.style.setProperty('--alto-serie-hasta', `${fila.getBoundingClientRect().height}px`)
    fila.classList.add('serie--plegando')
    const limpiar = (evento: AnimationEvent) => {
      if (evento.target === fila && evento.animationName === 'sfm-plegar-serie') fila.classList.remove('serie--plegando')
    }
    fila.addEventListener('animationend', limpiar)
    return () => {
      fila.removeEventListener('animationend', limpiar)
      fila.classList.remove('serie--plegando')
    }
  }, [hecha])
  // El veredicto sólo tiene sentido sobre lo guardado: mientras se corrige, el
  // de antes hablaría de unos números que ya se están cambiando.
  const resultado =
    hecha && registrada && referencia
      ? evaluarSerie(aComparable(registrada, ejercicio), referencia)
      : undefined

  // Escritura del borrador que espera a que el cliente deje de tocar.
  const borradorPendiente = useRef<(() => void) | null>(null)
  // Un valor improbable se guarda sólo tras confirmarlo. El aviso vale para los
  // números con que se pidió: cambiarlos lo retira sin más.
  const [aviso, setAviso] = useState<{ peso: number; reps: number; campo: 'peso' | 'reps'; texto: string } | null>(null)
  const avisoVigente = aviso && aviso.peso === peso && aviso.reps === reps ? aviso.texto : ''
  const conUnidad = (valor: number) => `${valor} lb${porLado ? '/lado' : ''}`
  async function guardar(confirmado = false) {
    if (guardandoRef.current) return
    // Se normaliza aquí y no sólo al salir del campo: con Enter se guarda antes
    // de que el redondeo del blur llegue al estado.
    const pesoFinal = Math.max(0, redondear(peso))
    const repsFinal = Math.max(1, Math.round(reps))
    const pesoAnterior = registrada?.pesoRegistradoLb ?? pesoDePartida
    const anomaliaPeso = anomaliaDePeso(pesoFinal, { partida: pesoAnterior, porLado })
    const anomaliaReps = anomaliaDeReps(repsFinal, repMax)
    if (anomaliaPeso === 'tope' || anomaliaReps === 'tope') {
      setAviso(null)
      setError(
        anomaliaPeso === 'tope'
          ? `${conUnidad(pesoFinal)} parece un error. Revisa el peso antes de guardar.`
          : `${repsFinal} reps parece un error. Revisa las reps antes de guardar.`,
      )
      return
    }
    if (!confirmado && (anomaliaPeso || anomaliaReps)) {
      setError('')
      setAviso({
        peso,
        reps,
        campo: anomaliaPeso ? 'peso' : 'reps',
        texto: anomaliaPeso
          ? pesoAnterior > 0
            ? `${conUnidad(pesoFinal)} es más del doble de ${conUnidad(pesoAnterior)}. ¿Es correcto?`
            : `${conUnidad(pesoFinal)} es mucho peso. ¿Es correcto?`
          : `${repsFinal} reps son muchas más de las previstas. ¿Es correcto?`,
      })
      return
    }
    setAviso(null)
    altoAntesDeGuardar.current = filaRef.current?.getBoundingClientRect().height ?? 0
    guardandoRef.current=true
    // El borrador pendiente ya no debe escribirse: lo que se registra ahora lo
    // sustituye. Si escribiera tarde (temporizador, segundo plano o al salir de
    // la fila) dejaría un borrador huérfano tras borrarBorrador.
    const borradorSinEscribir = borradorPendiente.current
    borradorPendiente.current = null
    setError('')
    setGuardadoFallido(false)
    setGuardando(true)
    try {
      const valores = {
        pesoRegistradoLb: pesoFinal,
        repsRealizadas: repsFinal,
        rir,
        tecnica,
        esCalentamiento,
        ...(nota.trim()?{nota:nota.trim()}:{}),
      }
      if (registrada) {
        await onCorregir(registrada, valores)
        setEditando(false)

      } else {
        await onGuardar(valores)
        // Sólo después de registrarla de verdad: si se borrara antes y el
        // guardado fallara, se perdería justo lo que el borrador protege.
        if (idDelBorrador && repositorio) await repositorio.borrarBorrador(idDelBorrador)
        ayuda?.confirmarSerie();

      }
    } catch(e){
      // Si el registro falla, el borrador vuelve a proteger los valores.
      borradorSinEscribir?.()
      setError(e instanceof Error?e.message:'No se pudo guardar. Tus valores siguen aquí.');setGuardadoFallido(true)
    } finally {
      guardandoRef.current=false
      setGuardando(false)
    }
  }

  // Una lectura cloud reconstruye los objetos de la clave. Sólo sus valores
  // identifican un borrador: depender del objeto vuelve a guardarlo con cada
  // refresco y la confirmación de ese guardado dispara otra escritura.
  const participanteBorrador = claveDeBorrador?.participanteId
  const fechaBorrador = claveDeBorrador?.fecha
  const plantillaBorrador = claveDeBorrador?.plantillaDiaId
  const ordenBorrador = claveDeBorrador?.orden

  // Autosave: cada ajuste se guarda sin esperar a Guardar. El borrador vive
  // aparte del historial, así que esto no registra nada en §19 antes de tiempo.
  // Espera a que el cliente deje de tocar: cada guardado es una fila en la
  // nube y subir el peso de 5 en 5 escribía una por toque. Salir de la fila o
  // pasar la app a segundo plano guarda lo pendiente al momento.
  useEffect(() => {
    const guardarYa = () => {
      const pendiente = borradorPendiente.current
      borradorPendiente.current = null
      pendiente?.()
    }
    const alOcultar = () => { if (document.hidden) guardarYa() }
    document.addEventListener('visibilitychange', alOcultar)
    return () => {
      document.removeEventListener('visibilitychange', alOcultar)
      guardarYa()
    }
  }, [])
  useEffect(() => {
    borradorPendiente.current = null
    if (!idDelBorrador || !repositorio || !participanteBorrador || !fechaBorrador || !plantillaBorrador || ordenBorrador === undefined || registrada) return
    // No guardar antes de haber intentado recuperar, ni si nadie tocó nada.
    if (!recuperado.current || !tocado) return

    const guardar = () => repositorio.guardarBorrador({
      id: idDelBorrador,
      participanteId: participanteBorrador,
      fecha: fechaBorrador,
      plantillaDiaId: plantillaBorrador,
      orden: ordenBorrador,
      numeroSerie,
      pesoRegistradoLb: peso,
      repsRealizadas: reps,
      rir,
      tecnica,
      esCalentamiento,
      ...(nota.trim()?{nota:nota.trim()}:{}),
      guardadoEn: new Date().toISOString(),
    }).catch(e=>setError(e instanceof Error?e.message:'No se pudo conservar el borrador.'))
    borradorPendiente.current = guardar
    const t = setTimeout(() => {
      // Ya lo escribió el paso a segundo plano o lo descartó Guardar.
      if (borradorPendiente.current !== guardar) return
      borradorPendiente.current = null
      guardar()
    }, ESPERA_BORRADOR_MS)
    return () => clearTimeout(t)
  }, [
    nota,
    idDelBorrador,
    repositorio,
    participanteBorrador,
    fechaBorrador,
    plantillaBorrador,
    ordenBorrador,
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

  // Una serie registrada nunca se colapsa por aquí: ya se pinta compacta y su
  // botón «Editar» tiene que seguir a la vista.
  if (colapsada && !hecha && !desplegada) {
    return (
      <button
        type="button"
        className="serie serie--pendiente"
        onClick={() => setDesplegada(true)}
        aria-label={`Abrir la ${etiqueta}`}
      >
        <span className="serie__titulo">Serie {numeroSerie}</span>
        {/* Con `×` chocaría literalmente con el formato de «Última vez», y no
            son lo mismo: esto es de dónde parte, aquello es lo que se hizo.
            Las reps son el objetivo del coach, no un valor que parezca hecho;
            sin peso de partida, sólo el rango en vez de «0 lb». */}
        <span className="serie__pendiente-valor">
          {peso > 0
            ? `${peso} lb${porLado ? '/lado' : ''} · ${objetivoDeReps(repMin, repMax, reps)}`
            : objetivoDeReps(repMin, repMax, reps)}
        </span>
      </button>
    )
  }

  return (
    <div data-tour={!hecha?"serie-activa":undefined} ref={filaRef} className={hecha ? 'serie serie--hecha' : 'serie'}>
      <div className="serie__cabecera">
        <span className="serie__titulo">
          Serie {numeroSerie}
          {!hecha && vieneDeBorrador && (
            <span className="marca marca--recuperado">Recuperado sin guardar</span>
          )}
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
              <Icono nombre="check" size={16} />
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
          <OpcionesSerie>
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
              Calentamiento
            </button>
<label className="sfm-field sfm-field--compact"><span>Nota de esta serie</span><textarea className="sfm-series-note" aria-label={`Nota de la ${etiqueta}`} maxLength={4000} value={nota} onChange={e=>{setTocado(true);setNota(e.target.value)}} placeholder="Algo que recordar"/></label>
          </OpcionesSerie>
        )}
      </div>

      <div className="serie__campos">
        <div data-tour={!hecha?"peso-serie":undefined} className="campo campo--peso">
          {conEtiquetas && (
            <span className="etiqueta-campo">Peso {porLado ? '(lb/lado)' : '(lb)'}</span>
          )}
          {hecha ? (
            <output className="valor" aria-label={`Peso de la ${etiqueta}`}>
              {registrada.pesoRegistradoLb}
            </output>
          ) : editandoPeso ? (
            <EntradaNumero
              valor={peso}
              decimales
              etiqueta={`Peso de la ${etiqueta}`}
              /* La tecla de retorno dice «siguiente», no «hecho»: después del
                 peso vienen las reps, y hasta ahora Enter sólo cerraba el campo
                 y dejaba al participante volviendo a tocar la pantalla. */
              enterKeyHint="next"
              onCambiar={(valor) => cambiarPeso(valor)}
              onCerrar={() => {
                cambiarPeso((p) => Math.max(0, redondear(p)))
                setEditandoPeso(false)
              }}
              onEnter={() => {
                // El campo de reps entra con foco, así que abrirlo es encadenar
                // el foco sin tocar nada.
                setEditandoReps(true)
              }}
            />
          ) : (
            <div className="paso">
              <button
                type="button"
                className="paso__boton"
                disabled={peso <= 0}
                onClick={() => {cambiarPeso((p) => redondear(Math.max(0, p - paso)));}}
                aria-label={`Bajar peso de la ${etiqueta}`}
              >
                –
              </button>
              <button
                type="button"
                className={`valor valor--tocable${claseDeLongitud(peso)}`}
                aria-label={`Peso de la ${etiqueta}`}
                onClick={() => setEditandoPeso(true)}
              >
                <NumeroPaso valor={peso} />
              </button>
              <button
                type="button"
                className="paso__boton"
                onClick={() => {cambiarPeso((p) => redondear(p + paso));}}
                aria-label={`Subir peso de la ${etiqueta}`}
              >
                +
              </button>
            </div>
          )}
        </div>

        <div data-tour={!hecha?"reps-serie":undefined} className="campo campo--reps">
          {conEtiquetas && <span className="etiqueta-campo">Reps</span>}
          {hecha ? (
            <output className="valor" aria-label={`Reps de la ${etiqueta}`}>
              {registrada.repsRealizadas}
            </output>
          ) : editandoReps ? (
            <EntradaNumero
              valor={reps}
              decimales={false}
              etiqueta={`Reps de la ${etiqueta}`}
              /* Aquí sí se termina: peso → reps → guardar, sin cerrar y volver
                 a abrir el teclado entre medias. */
              enterKeyHint="done"
              onCambiar={(valor) => cambiarReps(valor)}
              onCerrar={() => {
                cambiarReps((r) => Math.max(1, Math.round(r)))
                setEditandoReps(false)
              }}
              onEnter={() => void guardar()}
            />
          ) : (
            <div className="paso">
              <button
                type="button"
                className="paso__boton"
                disabled={reps <= 1}
                onClick={() => {cambiarReps((r) => Math.max(1, r - 1));}}
                aria-label={`Bajar reps de la ${etiqueta}`}
              >
                –
              </button>
              <button
                type="button"
                className={`valor valor--tocable${claseDeLongitud(reps)}`}
                aria-label={`Reps de la ${etiqueta}`}
                onClick={() => setEditandoReps(true)}
              >
                <NumeroPaso valor={reps} />
              </button>
              <button
                type="button"
                className="paso__boton"
                onClick={() => {cambiarReps((r) => r + 1);}}
                aria-label={`Subir reps de la ${etiqueta}`}
              >
                +
              </button>
            </div>
          )}
        </div>

        <div className="campo campo--rir">
          {conEtiquetas && <span className="etiqueta-campo">RIR</span>}
          {!hecha && ayuda?.esCliente && <span className="sfm-rir-help">¿Cuántas repeticiones más podrías hacer?</span>}
          {hecha ? (
            <output className="valor" aria-label={`RIR de la ${etiqueta}`}>
              {formatearRir(registrada.rir)}
            </output>
          ) : (
            <div className="sfm-rir-segments" data-tour={!hecha?"rir-serie":undefined} role="group" aria-label={`RIR de la ${etiqueta}`}>
              {[0,1,2,3,4,5].map(valor => <button key={valor} type="button" aria-pressed={rir===valor} aria-label={`RIR ${valor}${valor===5?'+':''} de la ${etiqueta}`} onClick={()=>cambiarRir(()=>valor)}>{valor===5?'5+':valor}</button>)}
            </div>
          )}
        </div>
      </div>

      {error&&<p className="sfm-set-error" role="alert">{error}</p>}
      {!hecha && avisoVigente && (
        <div className="serie__aviso" role="alert">
          <p>{avisoVigente}</p>
          <div className="serie__aviso-acciones">
            <button
              type="button"
              className="boton-guardar boton-guardar--secundario"
              onClick={() => {
                setAviso(null)
                if (aviso?.campo === 'reps') setEditandoReps(true)
                else setEditandoPeso(true)
              }}
            >
              Corregir
            </button>
            <button type="button" className="boton-guardar" onClick={() => void guardar(true)}>
              Sí, guardar
            </button>
          </div>
        </div>
      )}
      <div className="serie__pie">
        <span className="serie__anterior">
          {referencia
            ? `Anterior: ${pesoDeReferencia} lb${porLado ? '/lado' : ''} × ${referencia.reps} · RIR ${formatearRir(referencia.rir)}`
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
              data-tour="editar-serie" data-tour-action="editar-serie" onClick={() => setEditando(true)}
              aria-label={`Editar la ${etiqueta}`}
            >
              Editar
            </button>
          </span>
        ) : (
          <button
            type="button"
            data-tour="guardar-serie"
            className={guardando ? 'boton-guardar boton-guardar--guardando' : 'boton-guardar'}
            onClick={() => void guardar()}
            disabled={guardando}
            aria-busy={guardando}
            aria-label={`Guardar la ${etiqueta}`}
          >
            {/* Pendiente, error o listo: el botón dice en qué punto está. El
                éxito lo pinta la fila ya registrada, nunca antes de guardarla. */}
            {guardando ? 'Guardando…' : guardadoFallido ? 'Reintentar' : 'Completar serie'}
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * El número que se teclea en una serie.
 *
 * Guarda el texto y no el número: con el número, borrar dejaba un 0 que se
 * quedaba delante de lo siguiente («01080»). Vacío no cambia nada; al salir
 * vuelve el valor anterior.
 *
 * Al entrar se selecciona todo, así lo que se escribe sustituye el valor en vez
 * de ir detrás («5» → «5135»). Es `type="text"` con teclado numérico porque iOS
 * Safari no deja seleccionar dentro de un `type="number"`, y además así se
 * acepta la coma del teclado en español.
 */
function EntradaNumero({
  valor,
  decimales,
  etiqueta,
  enterKeyHint,
  onCambiar,
  onCerrar,
  onEnter,
}: {
  readonly valor: number
  readonly decimales: boolean
  readonly etiqueta: string
  readonly enterKeyHint: 'next' | 'done'
  readonly onCambiar: (valor: number) => void
  readonly onCerrar: () => void
  readonly onEnter: () => void
}) {
  const [texto, setTexto] = useState(() => String(valor))
  const campo = useRef<HTMLInputElement>(null)
  const tecleado = useRef(false)
  const inicial = useRef(valor)
  useEffect(() => {
    const nodo = campo.current
    if (!nodo) return
    nodo.focus()
    nodo.select()
    // iOS a veces pierde la selección hecha antes de que abra el teclado.
    const cuadro = requestAnimationFrame(() => {
      if (document.activeElement === nodo && !tecleado.current) nodo.setSelectionRange(0, nodo.value.length)
    })
    return () => cancelAnimationFrame(cuadro)
  }, [])
  return (
    <input
      ref={campo}
      type="text"
      inputMode={decimales ? 'decimal' : 'numeric'}
      autoComplete="off"
      className={`valor valor--edicion${claseDeLongitud(texto)}`}
      aria-label={etiqueta}
      enterKeyHint={enterKeyHint}
      value={texto}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        const nuevo = e.target.value
        if (!esTecleoValido(nuevo, decimales)) return
        tecleado.current = true
        setTexto(nuevo)
        const numero = leerNumero(nuevo)
        if (numero !== null) onCambiar(numero)
      }}
      onBlur={() => {
        if (leerNumero(texto) === null) onCambiar(inicial.current)
        onCerrar()
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Enter') return
        e.preventDefault()
        e.currentTarget.blur()
        onEnter()
      }}
    />
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

/** «6–15 reps», «8 reps» o «1 rep». Sin tope prescrito, las reps de partida. */
function objetivoDeReps(repMin: number, repMax: number, reps: number): string {
  if (repMax >= 100) return `${reps} ${segunCantidad(reps, 'rep', 'reps')}`
  if (repMin === repMax) return `${repMin} ${segunCantidad(repMin, 'rep', 'reps')}`
  return `${repMin}–${repMax} reps`
}
