/**
 * Frontera cloud de los dos roles.
 *
 * La app de entrenamiento conserva en IndexedDB el registro del participante
 * (series, sesiones, fotos y progreso). La identidad y la programación que el
 * coach administra viven aquí, en D1, para que un cambio hecho desde otro
 * dispositivo llegue al siguiente inicio de sesión del participante.
 */

import { PLANTILLAS_BASE, type EstimuloBase } from '../../shared/plantillas-base'
import {
  EJERCICIOS_BASE,
  IDS_DE_EJERCICIOS,
  type EjercicioBase,
} from '../../shared/ejercicios-base'

export type Estimulo = EstimuloBase
export type Progresion = 'mantener' | 'subirReps' | 'subirCarga' | 'revisarReducir'

export type SlotCloud = {
  orden: number
  ejercicioId: string
  estimulo: Estimulo
  seriesObjetivo: number
  repMin: number
  repMax: number
  descansoSegundos: number
  progresionFijada?: Progresion
}

export type PerfilCloud = {
  id: string
  nombre: string
  sexo: 'femenino' | 'masculino'
  edad: number
  estaturaCm: number
  pesoCorporalLb: number
  objetivo: string
  frecuenciaEntrenamiento: number
  limitaciones: string
  notas: string
  ejerciciosEvitados: string[]
}

export type RutinaCloud = {
  id: string
  clienteId: string
  nombre: string
  orden: number
  slots: SlotCloud[]
  actualizadoEn: number
}

type Entorno = { readonly ACCESO: D1Database }

/**
 * Catálogo para el formulario del coach.
 *
 * Derivado, no copiado. Antes eran 33 pares id/nombre escritos a mano aquí y
 * otros 33 en la biblioteca del cliente, sincronizados por disciplina: si
 * divergían, el coach podía programar un ejercicio que al participante le
 * desaparecía del día, o el día quedaba INCOMPLETE sin decir por qué.
 */
export const CATALOGO_EJERCICIOS: readonly EjercicioBase[] = EJERCICIOS_BASE

export type EstadoDiaProgramacion = {
  nombre: string
  orden: number
  ejercicios: number
  ejerciciosValidos: number
  completo: boolean
  detalle: string
}

export type EstadoProgramacion = {
  ready: boolean
  dias: EstadoDiaProgramacion[]
  problemasGenerales: string[]
}

export type CampoPerfilPendiente = 'edad' | 'estatura' | 'peso' | 'objetivo' | 'notas'

/**
 * Gate de release genérico: exactamente cuatro días, cada uno con 5–8 slots
 * válidos y consecutivos. No conoce IDs de clientes.
 */
export function evaluarEstadoProgramacion(
  rutinas: readonly RutinaCloud[],
  idsDelCoach: ReadonlySet<string> = new Set(),
): EstadoProgramacion {
  const existe = (id: string) => IDS_DE_EJERCICIOS.has(id) || idsDelCoach.has(id)
  const problemasGenerales: string[] = []
  if (rutinas.length !== DIAS_CLOUD_POR_DEFECTO.length) {
    problemasGenerales.push(
      `Se esperaban ${DIAS_CLOUD_POR_DEFECTO.length} días y hay ${rutinas.length}.`,
    )
  }

  const dias = DIAS_CLOUD_POR_DEFECTO.map((dia) => {
    const coincidencias = rutinas.filter((rutina) => rutina.orden === dia.orden)
    const rutina = coincidencias[0]
    if (!rutina) {
      return {
        nombre: dia.nombre,
        orden: dia.orden,
        ejercicios: 0,
        ejerciciosValidos: 0,
        completo: false,
        detalle: `${dia.nombre}: día ausente`,
      }
    }

    const ejerciciosValidos = rutina.slots.filter(
      (slot, indice) =>
        slot.orden === indice + 1 &&
        existe(slot.ejercicioId) &&
        Number.isInteger(slot.seriesObjetivo) &&
        slot.seriesObjetivo > 0 &&
        Number.isInteger(slot.repMin) &&
        Number.isInteger(slot.repMax) &&
        slot.repMin > 0 &&
        slot.repMax >= slot.repMin &&
        Number.isInteger(slot.descansoSegundos) &&
        slot.descansoSegundos >= 0,
    ).length
    const ejercicios = rutina.slots.length
    const cantidadValida = ejercicios >= 5 && ejercicios <= 8
    const completo = coincidencias.length === 1 && cantidadValida && ejerciciosValidos === ejercicios
    let detalle = `${dia.nombre}: ${ejercicios} ejercicios`
    if (coincidencias.length > 1) detalle = `${dia.nombre}: día duplicado`
    else if (!cantidadValida) detalle = `${dia.nombre}: ${ejercicios} ejercicios`
    else if (ejerciciosValidos !== ejercicios) {
      /*
       * Decir CUÁL falla, no sólo cuántos.
       *
       * Un id fuera del catálogo bloquea el día para siempre y con él la
       * generación de enlaces. Con un "3/5 válidos" a secas no hay forma de
       * saber qué ejercicio arreglar; nombrarlo convierte un callejón sin
       * salida en algo accionable.
       */
      const desconocidos = rutina.slots
        .filter((slot) => !existe(slot.ejercicioId))
        .map((slot) => slot.ejercicioId)
      detalle = desconocidos.length
        ? `${dia.nombre}: ejercicio fuera del catálogo (${desconocidos.join(', ')})`
        : `${dia.nombre}: ${ejerciciosValidos}/${ejercicios} ejercicios válidos`
    }
    return { nombre: dia.nombre, orden: dia.orden, ejercicios, ejerciciosValidos, completo, detalle }
  })

  return {
    ready: problemasGenerales.length === 0 && dias.every((dia) => dia.completo),
    dias,
    problemasGenerales,
  }
}

/** Campos de la semilla que todavía no representan datos confirmados. */
export function camposPendientesPerfil(perfil: PerfilCloud): CampoPerfilPendiente[] {
  const objetivoPendiente =
    perfil.objetivo.trim() === '' || perfil.objetivo.trim().toLowerCase() === 'pendiente de confirmar'
  const notasPendientes =
    perfil.notas.trim() === '' || perfil.notas.toLowerCase().includes('confirmar datos con el coach')
  const esPerfilSemilla = objetivoPendiente || notasPendientes
  const pendientes: CampoPerfilPendiente[] = []
  if (esPerfilSemilla && perfil.edad === 30) pendientes.push('edad')
  if (esPerfilSemilla && Math.abs(perfil.estaturaCm - 175.26) < 0.001) pendientes.push('estatura')
  if (esPerfilSemilla && Math.abs(perfil.pesoCorporalLb - 175) < 0.001) pendientes.push('peso')
  if (objetivoPendiente) pendientes.push('objetivo')
  if (notasPendientes) pendientes.push('notas')
  return pendientes
}

/** Equivalente puro del guard SQL que usa la migración 0004. */
export function slotsEstructuralmenteVacios(valor: string | null): boolean {
  if (valor === null || valor.trim() === '') return true
  try {
    const slots: unknown = JSON.parse(valor)
    return Array.isArray(slots) && slots.length === 0
  } catch {
    return false
  }
}

export const DIAS_CLOUD_POR_DEFECTO = PLANTILLAS_BASE.map((plantilla) => ({
  slug: plantilla.slug,
  nombre: plantilla.nombre,
  orden: plantilla.orden,
  slots: plantilla.slots.map((slot) => ({ ...slot })),
}))

const SLOT_DEFAULTS: Readonly<Record<Estimulo, Omit<SlotCloud, 'orden' | 'ejercicioId'>>> = {
  fuerza: { estimulo: 'fuerza', seriesObjetivo: 4, repMin: 1, repMax: 5, descansoSegundos: 180 },
  hipertrofia: {
    estimulo: 'hipertrofia',
    seriesObjetivo: 3,
    repMin: 6,
    repMax: 15,
    descansoSegundos: 120,
  },
  resistencia: {
    estimulo: 'resistencia',
    seriesObjetivo: 3,
    repMin: 15,
    repMax: 20,
    descansoSegundos: 60,
  },
}

export function crearSlotCloud(orden: number, ejercicioId: string, estimulo: Estimulo): SlotCloud {
  return { orden, ejercicioId, ...SLOT_DEFAULTS[estimulo] }
}

const DEFAULT_CLIENTES: readonly PerfilCloud[] = [
  {
    id: 'santiago',
    nombre: 'Santiago',
    sexo: 'masculino',
    edad: 30,
    estaturaCm: 175.26,
    pesoCorporalLb: 175,
    objetivo: 'Pendiente de confirmar',
    frecuenciaEntrenamiento: 4,
    limitaciones: '',
    notas: 'Perfil inicial sincronizado; confirmar datos con el coach.',
    ejerciciosEvitados: [],
  },
  {
    id: 'dayan-test',
    // El id técnico no cambia: por él se filtra en producción (functions/lib/qa.ts).
    // Sólo cambia lo que lee el coach.
    nombre: 'Cliente de prueba 1',
    sexo: 'masculino',
    edad: 30,
    estaturaCm: 175.26,
    pesoCorporalLb: 175,
    objetivo: 'Pruebas de rol y sincronización',
    frecuenciaEntrenamiento: 4,
    limitaciones: '',
    notas: 'Cliente técnico para QA; no representa datos de Santiago.',
    ejerciciosEvitados: [],
  },
]

/** Crea la estructura si el despliegue aún no aplicó 0002. Es idempotente. */
export async function asegurarEsquemaRoles(db: D1Database): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS clientes (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        sexo TEXT NOT NULL DEFAULT 'masculino',
        edad INTEGER NOT NULL DEFAULT 30,
        estatura_cm REAL NOT NULL DEFAULT 175.26,
        peso_corporal_lb REAL NOT NULL DEFAULT 175,
        objetivo TEXT NOT NULL DEFAULT '',
        frecuencia_entrenamiento INTEGER NOT NULL DEFAULT 4,
        limitaciones TEXT NOT NULL DEFAULT '',
        notas TEXT NOT NULL DEFAULT '',
        ejercicios_evitados_json TEXT NOT NULL DEFAULT '[]',
        activo INTEGER NOT NULL DEFAULT 1,
        creado_en INTEGER NOT NULL,
        actualizado_en INTEGER NOT NULL
      )`,
    )
    .run()
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS rutinas (
        id TEXT PRIMARY KEY,
        cliente_id TEXT NOT NULL,
        nombre TEXT NOT NULL,
        orden INTEGER NOT NULL,
        slots_json TEXT NOT NULL DEFAULT '[]',
        actualizado_en INTEGER NOT NULL,
        UNIQUE(cliente_id, orden)
      )`,
    )
    .run()
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_rutinas_cliente ON rutinas(cliente_id, orden)').run()
}

/** Inserta sólo clientes/días ausentes; jamás pisa una configuración existente. */
export async function asegurarDatosIniciales(db: D1Database): Promise<void> {
  await asegurarEsquemaRoles(db)
  const ahora = Math.floor(Date.now() / 1000)

  for (const cliente of DEFAULT_CLIENTES) {
    await db
      .prepare(
        `INSERT INTO clientes
          (id, nombre, sexo, edad, estatura_cm, peso_corporal_lb, objetivo,
           frecuencia_entrenamiento, limitaciones, notas, ejercicios_evitados_json,
           activo, creado_en, actualizado_en)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, 1, ?12, ?12)
         ON CONFLICT(id) DO NOTHING`,
      )
      .bind(
        cliente.id,
        cliente.nombre,
        cliente.sexo,
        cliente.edad,
        cliente.estaturaCm,
        cliente.pesoCorporalLb,
        cliente.objetivo,
        cliente.frecuenciaEntrenamiento,
        cliente.limitaciones,
        cliente.notas,
        JSON.stringify(cliente.ejerciciosEvitados),
        ahora,
      )
      .run()

    for (const dia of DIAS_CLOUD_POR_DEFECTO) {
      await db
        .prepare(
          `INSERT INTO rutinas (id, cliente_id, nombre, orden, slots_json, actualizado_en)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6)
           ON CONFLICT(id) DO NOTHING`,
        )
        .bind(
          `${cliente.id}|${dia.slug}`,
          cliente.id,
          dia.nombre,
          dia.orden,
          JSON.stringify(dia.slots),
          ahora,
        )
        .run()
    }
  }
}

type FilaCliente = {
  id: string
  nombre: string
  sexo: string
  edad: number
  estatura_cm: number
  peso_corporal_lb: number
  objetivo: string
  frecuencia_entrenamiento: number
  limitaciones: string
  notas: string
  ejercicios_evitados_json: string
}

type FilaRutina = {
  id: string
  cliente_id: string
  nombre: string
  orden: number
  slots_json: string
  actualizado_en: number
}

export async function listarPerfiles(db: D1Database): Promise<PerfilCloud[]> {
  const filas = await db
    .prepare(
      `SELECT id, nombre, sexo, edad, estatura_cm, peso_corporal_lb, objetivo,
              frecuencia_entrenamiento, limitaciones, notas, ejercicios_evitados_json
         FROM clientes WHERE activo = 1 ORDER BY CASE id WHEN 'santiago' THEN 0 ELSE 1 END, nombre`,
    )
    .all<FilaCliente>()
  return (filas.results ?? []).map(convertirPerfil)
}

export async function obtenerPerfil(db: D1Database, id: string): Promise<PerfilCloud | null> {
  const fila = await db
    .prepare(
      `SELECT id, nombre, sexo, edad, estatura_cm, peso_corporal_lb, objetivo,
              frecuencia_entrenamiento, limitaciones, notas, ejercicios_evitados_json
         FROM clientes WHERE id = ?1 AND activo = 1`,
    )
    .bind(id)
    .first<FilaCliente>()
  return fila ? convertirPerfil(fila) : null
}

export async function listarRutinas(db: D1Database, clienteId: string): Promise<RutinaCloud[]> {
  const filas = await db
    .prepare(
      `SELECT id, cliente_id, nombre, orden, slots_json, actualizado_en
         FROM rutinas WHERE cliente_id = ?1 ORDER BY orden`,
    )
    .bind(clienteId)
    .all<FilaRutina>()
  return (filas.results ?? []).map(convertirRutina)
}

export async function obtenerRutina(
  db: D1Database,
  clienteId: string,
  orden: number,
): Promise<RutinaCloud | null> {
  const fila = await db
    .prepare(
      `SELECT id, cliente_id, nombre, orden, slots_json, actualizado_en
         FROM rutinas WHERE cliente_id = ?1 AND orden = ?2`,
    )
    .bind(clienteId, orden)
    .first<FilaRutina>()
  return fila ? convertirRutina(fila) : null
}

export async function guardarRutina(db: D1Database, rutina: RutinaCloud): Promise<void> {
  await db
    .prepare(
      `UPDATE rutinas SET nombre = ?1, slots_json = ?2, actualizado_en = ?3
         WHERE id = ?4 AND cliente_id = ?5`,
    )
    .bind(rutina.nombre, JSON.stringify(rutina.slots), rutina.actualizadoEn, rutina.id, rutina.clienteId)
    .run()
}

export async function guardarPerfil(db: D1Database, perfil: PerfilCloud): Promise<void> {
  await db
    .prepare(
      `UPDATE clientes SET nombre = ?1, sexo = ?2, edad = ?3, estatura_cm = ?4,
          peso_corporal_lb = ?5, objetivo = ?6, frecuencia_entrenamiento = ?7,
          limitaciones = ?8, notas = ?9, ejercicios_evitados_json = ?10,
          actualizado_en = ?11 WHERE id = ?12 AND activo = 1`,
    )
    .bind(
      perfil.nombre,
      perfil.sexo,
      perfil.edad,
      perfil.estaturaCm,
      perfil.pesoCorporalLb,
      perfil.objetivo,
      perfil.frecuenciaEntrenamiento,
      perfil.limitaciones,
      perfil.notas,
      JSON.stringify(perfil.ejerciciosEvitados),
      Math.floor(Date.now() / 1000),
      perfil.id,
    )
    .run()
}

export async function crearPerfil(db: D1Database, perfil: PerfilCloud): Promise<void> {
  const ahora = Math.floor(Date.now() / 1000)
  const alta = db
    .prepare(
      `INSERT INTO clientes
        (id, nombre, sexo, edad, estatura_cm, peso_corporal_lb, objetivo,
         frecuencia_entrenamiento, limitaciones, notas, ejercicios_evitados_json,
         activo, creado_en, actualizado_en)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, 1, ?12, ?12)`,
    )
    .bind(
      perfil.id,
      perfil.nombre,
      perfil.sexo,
      perfil.edad,
      perfil.estaturaCm,
      perfil.pesoCorporalLb,
      perfil.objetivo,
      perfil.frecuenciaEntrenamiento,
      perfil.limitaciones,
      perfil.notas,
      JSON.stringify(perfil.ejerciciosEvitados),
      ahora,
    )

  const dias = DIAS_CLOUD_POR_DEFECTO.map((dia) =>
    db
      .prepare(
        `INSERT INTO rutinas (id, cliente_id, nombre, orden, slots_json, actualizado_en)
         VALUES (?1, ?2, ?3, ?4, '[]', ?5)`,
      )
      .bind(`${perfil.id}|${dia.slug}`, perfil.id, dia.nombre, dia.orden, ahora)
  )

  // Cliente y cuatro días nacen juntos. `batch` es transaccional en D1: una
  // colisión o fallo intermedio no puede dejar un perfil a medias.
  await db.batch([alta, ...dias])
}

/**
 * Da de baja a un cliente.
 *
 * No borra: apaga `activo`, que es por lo que ya filtran `listarPerfiles` y
 * `obtenerPerfil`. La columna estaba en el esquema desde el principio sin que
 * nadie la escribiera; esto es lo que faltaba para usarla.
 *
 * Se conserva la programación a propósito. Un toque de más en el móvil no puede
 * destruir cuatro días de trabajo, y devolver a alguien a la lista es un
 * `UPDATE clientes SET activo = 1` desde la consola de D1.
 *
 * Lo que sí se corta de raíz es el acceso: invitaciones pendientes y sesiones
 * vivas quedan revocadas en el mismo lote. Un cliente "eliminado" que siguiera
 * entrando con la cookie que ya tenía haría de esta función una mentira.
 *
 * Las tres sentencias van en un `batch` porque son una sola decisión: si la
 * baja se aplicara sin la revocación, el resultado sería exactamente el estado
 * peligroso que esto existe para impedir.
 */
export async function archivarCliente(db: D1Database, id: string): Promise<void> {
  const ahora = Math.floor(Date.now() / 1000)
  await db.batch([
    db
      .prepare('UPDATE clientes SET activo = 0, actualizado_en = ?1 WHERE id = ?2')
      .bind(ahora, id),
    db
      .prepare(
        `UPDATE invitaciones SET revocada_en = ?1
          WHERE cliente_id = ?2 AND consumida_en IS NULL AND revocada_en IS NULL`,
      )
      .bind(ahora, id),
    db
      .prepare('UPDATE sesiones SET revocada_en = ?1 WHERE cliente_id = ?2 AND revocada_en IS NULL')
      .bind(ahora, id),
    db.prepare('DELETE FROM cuentas WHERE cliente_id = ?').bind(id),
    db.prepare('DELETE FROM restablecimientos WHERE cliente_id = ?').bind(id),
  ])
}

/**
 * Si el identificador ya está ocupado, activo o dado de baja.
 *
 * `crearPerfil` hace un INSERT desnudo, así que reutilizar un id termina en un
 * error de constraint de SQLite delante del coach. Preguntar antes permite
 * decir cuál de los dos casos es, que son remedios distintos.
 */
export async function estadoDelIdentificador(
  db: D1Database,
  id: string,
): Promise<'libre' | 'activo' | 'archivado'> {
  const fila = await db
    .prepare('SELECT activo FROM clientes WHERE id = ?1')
    .bind(id)
    .first<{ activo: number }>()
  if (!fila) return 'libre'
  return fila.activo === 1 ? 'activo' : 'archivado'
}

export function perfilDeSesion(perfil: PerfilCloud): PerfilCloud {
  return { ...perfil, ejerciciosEvitados: [...perfil.ejerciciosEvitados] }
}

export function validarSlots(valor: unknown): SlotCloud[] {
  if (!Array.isArray(valor)) return []
  return valor
    .map((item, indice) => {
      const registro = item as Partial<SlotCloud>
      const estimulo: Estimulo =
        registro.estimulo === 'fuerza' || registro.estimulo === 'resistencia'
          ? registro.estimulo
          : 'hipertrofia'
      return {
        orden: indice + 1,
        ejercicioId: typeof registro.ejercicioId === 'string' ? registro.ejercicioId : '',
        ...SLOT_DEFAULTS[estimulo],
        ...(typeof registro.seriesObjetivo === 'number'
          ? { seriesObjetivo: enteroEntre(registro.seriesObjetivo, 1, 20) }
          : {}),
        ...(typeof registro.repMin === 'number'
          ? { repMin: enteroEntre(registro.repMin, 1, 100) }
          : {}),
        ...(typeof registro.repMax === 'number'
          ? { repMax: enteroEntre(registro.repMax, 1, 100) }
          : {}),
        ...(typeof registro.descansoSegundos === 'number'
          ? { descansoSegundos: enteroEntre(registro.descansoSegundos, 0, 3600) }
          : {}),
        ...(esProgresion(registro.progresionFijada)
          ? { progresionFijada: registro.progresionFijada }
          : {}),
      }
    })
    .filter((slot) => slot.ejercicioId.length > 0)
    .slice(0, 8)
}

function convertirPerfil(fila: FilaCliente): PerfilCloud {
  let ejerciciosEvitados: string[] = []
  try {
    const valor: unknown = JSON.parse(fila.ejercicios_evitados_json || '[]')
    if (Array.isArray(valor)) ejerciciosEvitados = valor.filter((id): id is string => typeof id === 'string')
  } catch {
    ejerciciosEvitados = []
  }
  return {
    id: fila.id,
    nombre: fila.nombre,
    sexo: fila.sexo === 'femenino' ? 'femenino' : 'masculino',
    edad: fila.edad,
    estaturaCm: fila.estatura_cm,
    pesoCorporalLb: fila.peso_corporal_lb,
    objetivo: fila.objetivo,
    frecuenciaEntrenamiento: fila.frecuencia_entrenamiento,
    limitaciones: fila.limitaciones,
    notas: fila.notas,
    ejerciciosEvitados,
  }
}

function convertirRutina(fila: FilaRutina): RutinaCloud {
  let valor: unknown
  try {
    valor = JSON.parse(fila.slots_json || '[]')
  } catch {
    valor = []
  }
  return {
    id: fila.id,
    clienteId: fila.cliente_id,
    nombre: fila.nombre,
    orden: fila.orden,
    slots: validarSlots(valor),
    actualizadoEn: fila.actualizado_en,
  }
}

function enteroEntre(valor: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(valor)))
}

function esProgresion(valor: unknown): valor is Progresion {
  return (
    valor === 'mantener' ||
    valor === 'subirReps' ||
    valor === 'subirCarga' ||
    valor === 'revisarReducir'
  )
}

export type { Entorno }
