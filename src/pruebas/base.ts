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
import { BaseDatosSantiago } from '../datos/esquema'
import { RepositorioLocal } from '../datos/repositorioLocal'

const abiertas: BaseDatosSantiago[] = []

afterEach(() => {
  for (const base of abiertas.splice(0)) base.close()
})

/** Base aislada para una prueba; se cierra al terminar. */
export function baseDePrueba(nombre = `prueba-${crypto.randomUUID()}`): BaseDatosSantiago {
  const base = new BaseDatosSantiago(nombre)
  abiertas.push(base)
  return base
}

/** Lo mismo, ya envuelto en el repositorio, que es lo que usan casi todas. */
export function repositorioDePrueba(nombre?: string): RepositorioLocal {
  return new RepositorioLocal(baseDePrueba(nombre))
}
