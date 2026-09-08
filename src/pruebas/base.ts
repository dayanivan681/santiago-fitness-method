/**
 * Bases de datos para las pruebas, que se cierran solas.
 *
 * Cada prueba abre una base nueva para no arrastrar estado de la anterior. Si
 * además no se cierran, las suscripciones de `useLiveQuery` de todas ellas se
 * quedan vivas y Node acaba avisando de que hay más de diez oyentes sobre la
 * misma señal —el famoso `MaxListenersExceededWarning`—. No es un problema de
 * la app: es que las pruebas dejaban las bases abiertas.
 */

import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { BaseDatosSantiago } from '../datos/esquema'
import { RepositorioLocal } from '../datos/repositorioLocal'
import type { Participante } from '../dominio/tipos'

const abiertas: BaseDatosSantiago[] = []

afterEach(async () => {
  // El orden importa. Cerrar la base con componentes todavía montados —o con
  // escrituras en vuelo— hace que Dexie rechace con `DatabaseClosedError`, y
  // ese rechazo sin dueño hace fallar la suite entera aunque todos los tests
  // pasen. Primero se desmonta, luego se deja respirar un tick, y al final se
  // cierra.
  cleanup()
  await new Promise((seguir) => setTimeout(seguir, 0))

  for (const base of abiertas.splice(0)) base.close()
})

/** Base aislada para una prueba; se cierra al terminar. */
export function baseDePrueba(nombre = `prueba-${crypto.randomUUID()}`): BaseDatosSantiago {
  const base = new BaseDatosSantiago(nombre)
  abiertas.push(base)
  return base
}

/** Selección explícita del perfil creado por el harness del piloto antiguo. */
export class RepositorioPilotoDePrueba extends RepositorioLocal {
  private seleccion: string | undefined
  async guardarParticipante(p: Participante) {
    await super.guardarParticipante(p)
    this.seleccion ??= p.id
  }
  async participanteActual() {
    return this.seleccion ? this.obtenerParticipante(this.seleccion) : undefined
  }
}

export function repositorioDePrueba(nombre?: string): RepositorioPilotoDePrueba {
  return new RepositorioPilotoDePrueba(baseDePrueba(nombre))
}
