/**
 * Sincroniza la configuración administrada por el coach.
 *
 * Sólo perfil y plantillas llegan desde D1. Series, sesiones, fotos y progreso
 * siguen en IndexedDB porque pertenecen al registro local del participante;
 * esta frontera explícita evita presentar una nube ficticia.
 */

import type { Repositorio } from '../datos/repositorio'
import type { Participante, PlantillaDia, SlotPlantilla } from '../dominio/tipos'

type RespuestaCloud = {
  profile?: Partial<Participante> & { id?: string }
  routines?: readonly RutinaCloud[]
  preview?: boolean
}

type RutinaCloud = {
  id?: string
  clienteId?: string
  nombre?: string
  orden?: number
  slots?: readonly Partial<SlotPlantilla>[]
}

export type ResultadoSincronizacion = {
  clienteId: string
  preview: boolean
}

/** Devuelve null cuando no hay sesión cloud o la app corre sin red local. */
export async function sincronizarConfiguracionCloud(
  repositorio: Repositorio,
): Promise<ResultadoSincronizacion | null> {
  if (typeof fetch !== 'function') return null

  try {
    const respuesta = await fetch('/api/cliente', {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!respuesta.ok) return null

    const datos = (await respuesta.json()) as RespuestaCloud
    const perfil = perfilValido(datos.profile)
    if (!perfil) return null

    await repositorio.guardarParticipante(perfil)
    for (const rutina of datos.routines ?? []) {
      const plantilla = plantillaValida(rutina, perfil.id)
      if (plantilla) await repositorio.guardarPlantilla(plantilla)
    }

    seleccionarParticipanteLocalmente(perfil.id)
    return { clienteId: perfil.id, preview: datos.preview === true }
  } catch {
    // El guardado local sigue permitiendo revisar datos ya descargados si la
    // red falla después de que el borde autorizó la carga inicial.
    return null
  }
}

function perfilValido(perfil: RespuestaCloud['profile']): Participante | null {
  if (!perfil || typeof perfil.id !== 'string' || perfil.id.length === 0) return null
  if (typeof perfil.nombre !== 'string') return null
  return {
    id: perfil.id,
    nombre: perfil.nombre,
    sexo: perfil.sexo === 'femenino' ? 'femenino' : 'masculino',
    edad: numero(perfil.edad, 30),
    estaturaCm: numero(perfil.estaturaCm, 175.26),
    pesoCorporalLb: numero(perfil.pesoCorporalLb, 175),
    objetivo: typeof perfil.objetivo === 'string' ? perfil.objetivo : '',
    frecuenciaEntrenamiento: numero(perfil.frecuenciaEntrenamiento, 4),
    limitaciones: typeof perfil.limitaciones === 'string' ? perfil.limitaciones : '',
    notas: typeof perfil.notas === 'string' ? perfil.notas : '',
    ejerciciosEvitados: Array.isArray(perfil.ejerciciosEvitados)
      ? perfil.ejerciciosEvitados.filter((id): id is string => typeof id === 'string')
      : [],
  }
}

function plantillaValida(rutina: RutinaCloud, clienteId: string): PlantillaDia | null {
  const orden = numero(rutina.orden, 0)
  if (orden < 1 || orden > 4 || typeof rutina.nombre !== 'string') return null
  const slots = (rutina.slots ?? [])
    .map((slot, indice) => slotValido(slot, indice + 1))
    .filter((slot): slot is SlotPlantilla => slot !== null)
  return {
    id: typeof rutina.id === 'string' && rutina.id.length > 0 ? rutina.id : `${clienteId}|dia-${orden}`,
    participanteId: clienteId,
    nombre: rutina.nombre,
    orden,
    slots,
  }
}

function slotValido(slot: Partial<SlotPlantilla>, orden: number): SlotPlantilla | null {
  if (typeof slot.ejercicioId !== 'string' || slot.ejercicioId.length === 0) return null
  const estimulo = slot.estimulo === 'fuerza' || slot.estimulo === 'resistencia' ? slot.estimulo : 'hipertrofia'
  const repMin = entero(slot.repMin, 1, 100, 6)
  const repMax = entero(slot.repMax, repMin, 100, Math.max(repMin, 15))
  const progresion =
    slot.progresionFijada === 'mantener' ||
    slot.progresionFijada === 'subirReps' ||
    slot.progresionFijada === 'subirCarga' ||
    slot.progresionFijada === 'revisarReducir'
      ? slot.progresionFijada
      : undefined
  return {
    orden,
    ejercicioId: slot.ejercicioId,
    estimulo,
    seriesObjetivo: entero(slot.seriesObjetivo, 1, 20, 3),
    repMin: Math.min(repMin, repMax),
    repMax: Math.max(repMin, repMax),
    descansoSegundos: entero(slot.descansoSegundos, 0, 3600, 120),
    ...(progresion ? { progresionFijada: progresion } : {}),
    ...(typeof slot.grupo === 'string' && /^[A-Z]$/.test(slot.grupo) ? { grupo: slot.grupo } : {}),
  }
}

function entero(valor: unknown, min: number, max: number, porDefecto: number): number {
  return typeof valor === 'number' && Number.isFinite(valor)
    ? Math.max(min, Math.min(max, Math.round(valor)))
    : porDefecto
}

function numero(valor: unknown, porDefecto: number): number {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : porDefecto
}

function seleccionarParticipanteLocalmente(id: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('sfm_cliente_id', id)
    }
  } catch {
    // Storage bloqueado (p. ej. modo privado estricto): la app sigue leyendo
    // el primer participante local sin conceder ningún permiso extra.
  }
}
