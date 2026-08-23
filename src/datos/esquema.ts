/**
 * Base de datos local.
 * Guía del proyecto §26: por ahora guardado local en el dispositivo; más adelante
 * base de datos en la nube. Todo el acceso pasa por `Repositorio` para que ese
 * cambio quede contenido en una sola capa.
 */

import Dexie, { type EntityTable } from 'dexie'
import type {
  Ejercicio,
  Participante,
  PlantillaDia,
  SerieRegistrada,
  BorradorDeSerie,
  RegistroDeProgreso,
  Sesion,
  Sustitucion,
} from '../dominio/tipos'

export class BaseDatosSantiago extends Dexie {
  participantes!: EntityTable<Participante, 'id'>
  ejercicios!: EntityTable<Ejercicio, 'id'>
  plantillas!: EntityTable<PlantillaDia, 'id'>
  sesiones!: EntityTable<Sesion, 'id'>
  series!: EntityTable<SerieRegistrada, 'id'>
  sustituciones!: EntityTable<Sustitucion, 'id'>
  progreso!: EntityTable<RegistroDeProgreso, 'id'>
  /** Las fotos, aparte: una lista de medidas no debe arrastrar megas de imagen. */
  fotos!: EntityTable<{ id: string; imagen: Blob }, 'id'>
  /** Foto de perfil, con el id del participante como clave. Aparte por lo mismo. */
  fotosDePerfil!: EntityTable<{ id: string; imagen: Blob }, 'id'>
  /** Series a medio teclear. Se borran al guardarlas de verdad. */
  borradores!: EntityTable<BorradorDeSerie, 'id'>

  constructor(nombre = 'santiago-fitness-method') {
    super(nombre)
    this.version(1).stores({
      participantes: 'id',
      ejercicios: 'id, musculoPrimario',
      plantillas: 'id, nombre',
      sesiones: 'id, participanteId, fecha, plantillaDiaId',
      // §16: el índice por ejercicioId es lo que mantiene separado el historial
      // de cada variante.
      series: 'id, sesionId, ejercicioId',
    })

    // v2: `orden` explícito en las plantillas. Se rellena en vez de recrear las
    // filas porque §19 prohíbe perder lo ya registrado.
    this.version(2)
      .stores({ plantillas: 'id, nombre, orden' })
      .upgrade((tx) =>
        // `modify` escribe sobre la fila almacenada: la mutación vive aquí, en
        // el borde con IndexedDB, y no se escapa al dominio.
        tx
          .table<Editable<PlantillaDia>>('plantillas')
          .toCollection()
          .modify((plantilla) => {
            plantilla.orden = ORDEN_INICIAL_DIAS[plantilla.id] ?? ORDEN_DESCONOCIDO
          }),
      )

    // v3: los cambios de variante que valen sólo para un día. Tabla aparte y no
    // un campo en la plantilla: la plantilla es lo permanente, esto caduca.
    this.version(3).stores({ sustituciones: 'id, fecha' })

    // v4: progreso físico. La imagen vive en su propia tabla, con el id del
    // registro como clave, para poder leer las medidas sin cargar las fotos.
    this.version(4).stores({
      progreso: 'id, participanteId, fecha',
      fotos: 'id',
    })

    // v5: foto de perfil. Su V1 la pide junto a los datos de §2, y es distinta
    // de las fotos de progreso: identifica al participante, no documenta su
    // evolución. Tabla propia para no cargar la imagen al leer la ficha.
    this.version(5).stores({ fotosDePerfil: 'id' })

    // v6: borradores de serie. El cliente pide autosave y recuperación si la
    // app se cierra; entre ajustar el peso y tocar Guardar puede pasar de todo.
    this.version(6).stores({ borradores: 'id, [participanteId+fecha]' })

    // v8 va después; se declara aquí abajo.

    // v7: las sustituciones pasan a ser de un participante. Las que ya existen
    // se le asignan al que hay —§19: no se borra nada—, y su id se rehace para
    // que siga coincidiendo con el que calcula la app.
    this.version(7)
      .stores({ sustituciones: 'id, [participanteId+fecha]' })
      .upgrade(async (tx) => {
        const participantes = await tx.table<Participante>('participantes').toArray()
        const dueno = participantes[0]?.id
        if (!dueno) return

        const tabla = tx.table<Sustitucion>('sustituciones')
        const existentes = await tabla.toArray()
        await tabla.clear()
        await tabla.bulkAdd(
          existentes.map((sustitucion) => ({
            ...sustitucion,
            participanteId: dueno,
            id: `${dueno}|${sustitucion.fecha}|${sustitucion.plantillaDiaId}|${sustitucion.orden}`,
          })),
        )
      })

    // v8: los días pasan a ser de un participante. Los que ya existen se le
    // asignan al que hay, con sus ejercicios y ajustes intactos (§19, §23).
    this.version(8)
      .stores({ plantillas: 'id, nombre, orden, participanteId' })
      .upgrade(async (tx) => {
        const participantes = await tx.table<Participante>('participantes').toArray()
        const dueno = participantes[0]?.id
        if (!dueno) return

        await tx
          .table<Editable<PlantillaDia>>('plantillas')
          .toCollection()
          .modify((plantilla) => {
            plantilla.participanteId = dueno
          })
      })
  }
}

type Editable<T> = { -readonly [K in keyof T]: T[K] }

/** §28: Upper A · Lower A · Upper B · Lower B. */
const ORDEN_INICIAL_DIAS: Readonly<Record<string, number>> = {
  'upper-a': 1,
  'lower-a': 2,
  'upper-b': 3,
  'lower-b': 4,
}

/** Las plantillas que el coach cree después van al final hasta que las ordene. */
const ORDEN_DESCONOCIDO = 99

export const db = new BaseDatosSantiago()
