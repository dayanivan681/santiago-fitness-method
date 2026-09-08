import type { Repositorio } from '../datos/repositorio'
import { RepositorioMemoria } from '../nube/memoria'
/** El arranque autentica antes de instalar un repositorio durable. */
export let repositorio:Repositorio = new RepositorioMemoria()
export function instalarRepositorio(nuevo:Repositorio){repositorio=nuevo}
