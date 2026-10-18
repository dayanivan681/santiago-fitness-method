/**
 * Modelo de datos de Santiago Fitness Method.
 * Guía del proyecto §2, §4, §5, §15–19.
 */

import type { Estimulo } from './estimulo'
import type { PerfilCarga } from './carga'
import type { TipoDeProgresion } from './progresion'

export type Sexo = 'femenino' | 'masculino'

/** §2: perfil del participante. Todo editable por el coach. */
export interface Participante {
  readonly id: string
  readonly nombre: string
  readonly sexo: Sexo
  readonly edad: number
  readonly estaturaCm: number
  readonly pesoCorporalLb: number
  readonly objetivo: string
  /** Días de entrenamiento por semana. */
  readonly frecuenciaEntrenamiento: number
  /** Lesiones o limitaciones importantes, en palabras del coach. */
  readonly limitaciones: string
  /**
   * Notas del coach sobre este participante.
   *
   * Su especificación V1 las pide junto a los datos de §2. No son las
   * limitaciones —eso condiciona el entrenamiento y va aparte—, sino el
   * contexto que no cabe en un campo: horarios, historial, lo que sea.
   */
  readonly notas?: string
  /**
   * Ejercicios que este participante no debe hacer.
   *
   * El cliente pide que la limitación no sea sólo texto: si el perfil dice
   * evitar el press militar con barra, la app tiene que avisar al asignarlo y
   * proponer equivalentes. El texto explica el porqué; esta lista es la parte
   * que la app puede comprobar. Opcional: los perfiles anteriores no la tienen.
   */
  readonly ejerciciosEvitados?: readonly string[]
}

/**
 * §16: las variantes se mantienen separadas. El equipo forma parte de la
 * identidad del ejercicio, no es un atributo intercambiable.
 */
export type Equipo =
  | 'smith'
  | 'convergente'
  | 'cable'
  | 'mancuernas'
  | 'barraLibre'
  | 'maquinaTradicional'
  /** Plate-loaded: se carga con discos. `maquinaTradicional` es la de pila (selectorizada). */
  | 'maquinaDiscos'
  | 'pesoCorporal'

/** Músculos con objetivo semanal (§20) más los que reciben trabajo indirecto (§21). */
export type Musculo =
  | 'pecho'
  | 'espalda'
  | 'cuadriceps'
  | 'gluteos'
  | 'femoral'
  | 'biceps'
  | 'triceps'
  | 'deltoideLateral'
  | 'deltoideAnterior'
  | 'deltoidePosterior'
  | 'pantorrillas'
  | 'core'
  /** Sin objetivo semanal: se entrena, pero no cuenta en el volumen (§20). */
  | 'aductores'

/**
 * §15–17: una fila **por variante**. Press inclinado Smith y press inclinado
 * convergente son dos ejercicios distintos con historiales distintos (§16),
 * por eso `equipo` y `angulo` son parte de la identidad y no metadatos.
 */
export interface Ejercicio extends PerfilCarga {
  readonly id: string
  readonly nombre: string
  readonly equipo: Equipo
  /** Ángulo o variante fina: '15°', 'inclinado', 'neutro'… (§16). */
  readonly angulo?: string
  /**
   * Patrón de movimiento que comparten las variantes entre sí (§16, §23).
   *
   * Agrupa sin mezclar: sirve para ofrecer alternativas al cambiar de variante,
   * pero cada ejercicio sigue teniendo su propio historial. Press inclinado
   * Smith y press inclinado convergente comparten `movimiento` y no comparten
   * nada más.
   */
  readonly movimiento: string
  /** §15: la biblioteca es visual, sirve para identificar el ejercicio. */
  readonly imagen: string
  /**
   * GIF con el movimiento (sólo ejercicios del coach). Se reproduce únicamente
   * en la ficha; listas, miniaturas y Hoy siguen con `imagen`, que es fija y
   * funciona sin conexión.
   */
  readonly animacion?: string
  /** Aviso bajo la animación cuando enseña algo distinto de la ficha (p. ej. otro equipo). */
  readonly notaAnimacion?: string
  /** Distingue una representación sintética de una fotografía real. */
  readonly imagenGenerada?: boolean
  readonly explicacionCorta: string
  /** §21: sólo el primario suma contra los objetivos de volumen directo. */
  readonly musculoPrimario: Musculo
  readonly musculosSecundarios: readonly Musculo[]
}

/** §3 y §4: el entrenamiento del día ya viene definido; el participante no escribe nada de esto. */
export interface SlotPlantilla {
  /** Posición 1–12 dentro de la sesión (§4). */
  readonly orden: number
  readonly ejercicioId: string
  readonly estimulo: Estimulo
  readonly seriesObjetivo: number
  readonly repMin: number
  readonly repMax: number
  readonly descansoSegundos: number
  /** Peso editable sugerido por el Coach, en la unidad de registro del ejercicio. */
  readonly pesoSugeridoLb?: number
  /**
   * Recomendación fijada por el coach para este ejercicio.
   *
   * Su especificación V1 quiere la progresión *"siempre editable por el
   * coach"*. Sin fijar, la calcula la app. Opcional: los días programados antes
   * de que existiera este campo no lo tienen.
   */
  readonly progresionFijada?: TipoDeProgresion
  /** Misma letra en slots consecutivos = bi-serie o tri-serie (`shared/superseries`). */
  readonly grupo?: string
}

/** §28: Upper A · Lower A · Upper B · Lower B. */
export interface PlantillaDia {
  readonly id: string
  /**
   * De quién es este día.
   *
   * El coach ajusta la estructura para cada persona (§23), así que editar el
   * Upper A de uno no puede cambiar el del otro. La interfaz sigue siendo de un
   * solo participante; esto es lo que evita que se mezclen cuando haya más.
   */
  readonly participanteId: string
  readonly nombre: string
  /**
   * Posición en la rotación semanal. Explícito porque el almacenamiento no
   * garantiza orden y §28 fija una secuencia concreta que la rotación (§3)
   * necesita respetar.
   */
  readonly orden: number
  readonly slots: readonly SlotPlantilla[]
}

/** §18–19: cada entrenamiento se añade al historial, nunca se sobrescribe. */
export interface Sesion {
  readonly id: string
  readonly participanteId: string
  readonly plantillaDiaId: string
  /** Fecha ISO (YYYY-MM-DD). */
  readonly fecha: string
  /**
   * Momento en que el participante dio la sesión por terminada (ISO).
   *
   * La cierra él a mano, nunca la app: §19 dice que lo registrado es lo que
   * pasó, y una sesión a medias —con ejercicios omitidos o menos series— es un
   * dato válido, no un error que haya que corregir.
   */
  readonly prescripcion?: PlantillaDia
  readonly cargas?: Record<string, PerfilCarga>
  readonly planRevision?: number
  readonly procedencia?: 'app' | 'importacion'
  readonly completadaEn?: string
}

/**
 * Calidad de ejecución de una serie, en la escala que pide el cliente.
 * Se ordena de mejor a peor: el índice sirve para comparar.
 */
export const TECNICAS = ['excelente', 'buena', 'aceptable', 'deficiente'] as const
export type Tecnica = (typeof TECNICAS)[number]

/** Lo normal es entrenar con buena técnica; sólo se marca cuando se sale de ahí. */
export const TECNICA_POR_DEFECTO: Tecnica = 'buena'

/** §5: registro serie por serie. */
export interface SerieRegistrada {
  readonly id: string
  readonly sesionId: string
  readonly ejercicioId: string
  readonly numeroSerie: number
  /** Tal como lo escribió el participante; se interpreta según `tipoCarga` (§17). */
  readonly pesoRegistradoLb: number
  readonly repsRealizadas: number
  /** §14: escala 0–5+. Nunca se lee de forma aislada. */
  readonly rir: number
  /**
   * Momento en que se registró la serie (ISO). §5 pide guardar el tiempo de
   * descanso; se deriva de aquí en vez de pedirlo tecleado, porque §1 exige
   * registrar sin perder tiempo. Opcional: las series guardadas antes de que
   * existiera este campo no lo tienen.
   */
  readonly carga?: PerfilCarga
  readonly instante?: string
  /**
   * Calidad de ejecución. El cliente pide que entre en la decisión: una mejora
   * con peor técnica no cuenta como progreso. Opcional — sin marcar se asume
   * `TECNICA_POR_DEFECTO`.
   */
  readonly tecnica?: Tecnica
  /**
   * Serie de calentamiento. Se guarda, pero **no cuenta**: ni para el volumen
   * (§20–21), ni para las referencias (§7, §9), ni para el veredicto (§8). Si
   * contara, inflaría el volumen y ensuciaría la mejor referencia.
   */
  readonly esCalentamiento?: boolean
  /** §5: "eventualmente técnica o nota breve, si vemos que realmente hace falta". */
  readonly nota?: string
  /**
   * Valores que tenía la serie antes de cada corrección, del más antiguo al más
   * reciente.
   *
   * El cliente pide corregir "sin perder auditoría del historial", y tiene
   * razón: sobrescribir el número equivocado lo hacía desaparecer. Guardarlo es
   * además más fiel a §19, que prohíbe perder lo ya registrado.
   */
  readonly correcciones?: readonly ValoresDeSerie[]
}

/** Lo que puede cambiar al corregir una serie. */
export interface ValoresDeSerie {
  readonly nota?: string
  readonly pesoRegistradoLb: number
  readonly repsRealizadas: number
  readonly rir: number
  readonly tecnica?: Tecnica
  readonly esCalentamiento?: boolean
  /** Cuándo se sustituyeron estos valores. */
  readonly corregidaEn: string
  /**
   * Por qué se sustituyeron.
   *
   * Deshacer una corrección **no borra el rastro**: apila otra entrada más, con
   * este motivo, para que el historial siga contando que hubo una corrección y
   * después una vuelta atrás. Ausente significa `correccion`, que es lo que
   * había antes de existir este campo.
   */
  readonly motivo?: 'correccion' | 'reversion'
}

/**
 * Borrador de una serie que se está tecleando y todavía no se ha guardado.
 *
 * §19 pide que no se pierda nada de lo registrado, y el cliente pide autosave y
 * recuperación si la app se cierra. Entre que el participante ajusta el peso y
 * toca Guardar puede pasar de todo —una llamada, que el móvil mate la pestaña—,
 * y sin esto ese ajuste se perdería.
 */
export interface BorradorDeSerie {
  readonly nota?: string
  /** Derivado de participante, fecha, día, posición y número de serie. */
  readonly id: string
  readonly participanteId: string
  /** Fecha ISO (YYYY-MM-DD). */
  readonly fecha: string
  readonly plantillaDiaId: string
  /** Posición del ejercicio dentro del día. */
  readonly orden: number
  readonly numeroSerie: number
  readonly pesoRegistradoLb: number
  readonly repsRealizadas: number
  readonly rir: number
  readonly tecnica?: Tecnica
  readonly esCalentamiento?: boolean
  readonly guardadoEn: string
}

/** Serie efectiva: la que cuenta. Excluye el calentamiento. */
export function esEfectiva(serie: SerieRegistrada): boolean {
  return serie.esCalentamiento !== true
}

/**
 * Una serie ya normalizada a carga total, lista para comparar (§17).
 * Es la unidad que consume toda la lógica de progresión.
 */
export interface SerieComparable {
  readonly cargaTotalLb: number
  readonly reps: number
  readonly rir: number
  /** Entra en el veredicto: una mejora con peor técnica no es progreso. */
  readonly tecnica: Tecnica
}

/**
 * §7 y §9: las dos referencias son **datos diferentes** y conviven.
 * Un día malo se guarda pero no borra `mejor`.
 */
export interface ReferenciasEjercicio {
  readonly ejercicioId: string
  /** Lo que hizo la última vez; es lo que se muestra al entrar (§7). */
  readonly ultimaSesion: readonly SerieComparable[]
  /** La mejor serie histórica. Sobrevive a los días malos (§9). */
  readonly mejor?: SerieComparable
  readonly fechaUltimaSesion?: string
}

/**
 * Cambio de variante que vale **sólo para un día**.
 *
 * El caso corriente es puntual —"la máquina está ocupada"—, así que cambiar de
 * variante no puede reescribir la plantilla del participante para siempre. La
 * sustitución se guarda aparte, con su fecha, y la plantilla sigue intacta para
 * la próxima vuelta de la rotación (§23: cambiar un ejercicio no destruye la
 * estructura del entrenamiento).
 */
export interface Sustitucion {
  /** Derivado de participante, fecha, día y posición: una por hueco y día. */
  readonly id: string
  readonly participanteId: string
  /** Fecha ISO (YYYY-MM-DD) en la que aplica. */
  readonly fecha: string
  readonly plantillaDiaId: string
  /** Posición dentro del día, no el ejercicio: es el hueco lo que se rellena. */
  readonly orden: number
  readonly ejercicioId: string
}

/**
 * Medidas corporales de un día. Todas opcionales: se apunta lo que se midió.
 *
 * En pulgadas, como el resto de la app trabaja en libras y pies: el método es
 * imperial y convertir mentalmente en el gimnasio es una fuente de errores.
 */
export interface Medidas {
  readonly pesoCorporalLb?: number
  readonly cinturaPulgadas?: number
  readonly pechoPulgadas?: number
  readonly brazoPulgadas?: number
  readonly musloPulgadas?: number
}

/**
 * Un punto de control del progreso físico: medidas y foto, con su fecha.
 *
 * La foto se guarda **en el dispositivo y no se sube a ningún sitio**. Mientras
 * no haya cuentas, esa decisión resuelve por construcción el consentimiento y
 * los permisos que el cliente pregunta en su análisis.
 */
export interface RegistroDeProgreso {
  readonly id: string
  readonly participanteId: string
  /** Fecha ISO (YYYY-MM-DD). */
  readonly fecha: string
  readonly medidas: Medidas
  /** Si tiene foto, se guarda aparte para no cargarla al leer la lista. */
  readonly tieneFoto: boolean
}
