import { RepositorioLocal } from '../datos/repositorioLocal'
import type { Repositorio } from '../datos/repositorio'

/** Instancia única de la app. §26: hoy local, mañana nube — se cambia aquí. */
export const repositorio: Repositorio = new RepositorioLocal()
