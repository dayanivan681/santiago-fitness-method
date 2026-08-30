/**
 * Frontera cloud de los dos roles.
 *
 * La app de entrenamiento conserva en IndexedDB el registro del participante
 * (series, sesiones, fotos y progreso). La identidad y la programación que el
 * coach administra viven aquí, en D1, para que un cambio hecho desde otro
 * dispositivo llegue al siguiente inicio de sesión del participante.
 */

export type Estimulo = 'fuerza' | 'hipertrofia' | 'resistencia'
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

/** Catálogo pequeño y estable para el formulario del coach. */
export const CATALOGO_EJERCICIOS: readonly { id: string; nombre: string }[] = [
  { id: 'press-banca-15-smith', nombre: 'Press banca 15° Smith' },
  { id: 'press-inclinado-convergente', nombre: 'Press inclinado convergente' },
  { id: 'press-banca-barra', nombre: 'Press banca plano con barra' },
  { id: 'press-banca-mancuernas', nombre: 'Press banca plano con mancuernas' },
  { id: 'press-pecho-convergente', nombre: 'Press pecho convergente' },
  { id: 'pec-deck', nombre: 'Pec deck (aperturas en máquina)' },
  { id: 'fondos-triceps', nombre: 'Fondos en paralelas (tríceps)' },
  { id: 'extension-triceps-polea', nombre: 'Extensión de tríceps en polea' },
  { id: 'press-frances-barra-z', nombre: 'Press francés con barra Z' },
  { id: 'elevacion-lateral-mancuernas', nombre: 'Elevación lateral' },
  { id: 'elevacion-lateral-polea', nombre: 'Elevación lateral en polea' },
  { id: 'lat-pulldown-maquina', nombre: 'Lat pulldown' },
  { id: 'jalon-agarre-cerrado', nombre: 'Jalón agarre cerrado' },
  { id: 'dominadas', nombre: 'Dominadas' },
  { id: 'remo-barra', nombre: 'Remo con barra' },
  { id: 'remo-sentado-cable', nombre: 'Remo sentado en polea' },
  { id: 'remo-mancuerna', nombre: 'Remo con mancuerna a una mano' },
  { id: 'curl-barra', nombre: 'Curl con barra' },
  { id: 'curl-mancuernas', nombre: 'Curl con mancuernas' },
  { id: 'curl-martillo', nombre: 'Curl martillo' },
  { id: 'hip-thrust-barra', nombre: 'Hip thrust con barra' },
  { id: 'sentadilla-barra', nombre: 'Sentadilla con barra' },
  { id: 'prensa', nombre: 'Prensa de piernas' },
  { id: 'hack-squat', nombre: 'Hack squat' },
  { id: 'extension-cuadriceps', nombre: 'Extensión de cuádriceps' },
  { id: 'zancadas-mancuernas', nombre: 'Zancadas con mancuernas' },
  { id: 'peso-muerto-rumano', nombre: 'Peso muerto rumano' },
  { id: 'curl-femoral-tumbado', nombre: 'Curl femoral tumbado' },
  { id: 'curl-femoral-sentado', nombre: 'Curl femoral sentado' },
  { id: 'patada-gluteo-polea', nombre: 'Patada de glúteo en polea' },
  { id: 'abduccion-maquina', nombre: 'Abducción en máquina' },
  { id: 'elevacion-talones-pie', nombre: 'Elevación de talones de pie' },
  { id: 'elevacion-talones-sentado', nombre: 'Elevación de talones sentado' },
]

const DIAS = [
  { slug: 'upper-a', nombre: 'Upper A', orden: 1 },
  { slug: 'lower-a', nombre: 'Lower A', orden: 2 },
  { slug: 'upper-b', nombre: 'Upper B', orden: 3 },
  { slug: 'lower-b', nombre: 'Lower B', orden: 4 },
] as const

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

const DEFAULT_SLOTS: Readonly<Record<string, readonly SlotCloud[]>> = {
  'upper-a': [
    slot(1, 'press-banca-15-smith', 'fuerza'),
    slot(2, 'press-inclinado-convergente', 'hipertrofia'),
    slot(3, 'lat-pulldown-maquina', 'hipertrofia'),
    slot(4, 'hip-thrust-barra', 'hipertrofia'),
    slot(5, 'elevacion-lateral-mancuernas', 'resistencia'),
  ],
  'lower-a': [
    slot(1, 'sentadilla-barra', 'fuerza'),
    slot(2, 'prensa', 'hipertrofia'),
    slot(3, 'curl-femoral-tumbado', 'hipertrofia'),
    slot(4, 'patada-gluteo-polea', 'hipertrofia'),
    slot(5, 'elevacion-talones-pie', 'resistencia'),
  ],
  'upper-b': [
    slot(1, 'remo-barra', 'fuerza'),
    slot(2, 'press-pecho-convergente', 'hipertrofia'),
    slot(3, 'jalon-agarre-cerrado', 'hipertrofia'),
    slot(4, 'curl-mancuernas', 'hipertrofia'),
    slot(5, 'extension-triceps-polea', 'resistencia'),
  ],
  'lower-b': [
    slot(1, 'peso-muerto-rumano', 'fuerza'),
    slot(2, 'hack-squat', 'hipertrofia'),
    slot(3, 'hip-thrust-barra', 'hipertrofia'),
    slot(4, 'extension-cuadriceps', 'hipertrofia'),
    slot(5, 'elevacion-talones-sentado', 'resistencia'),
  ],
}

function slot(orden: number, ejercicioId: string, estimulo: Estimulo): SlotCloud {
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
    nombre: 'QA Role Split',
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

    for (const dia of DIAS) {
      const slots = cliente.id === 'santiago' ? [] : DEFAULT_SLOTS[dia.slug] ?? []
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
          JSON.stringify(slots),
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
  await db
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
    .run()
  for (const dia of DIAS) {
    await db
      .prepare(
        `INSERT INTO rutinas (id, cliente_id, nombre, orden, slots_json, actualizado_en)
         VALUES (?1, ?2, ?3, ?4, '[]', ?5)`,
      )
      .bind(`${perfil.id}|${dia.slug}`, perfil.id, dia.nombre, dia.orden, ahora)
      .run()
  }
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
