import { NOMBRE_MUSCULO, etiquetaEquipo } from '../dominio/etiquetas'
import type { Ejercicio } from '../dominio/tipos'

/**
 * Normalizar un texto para buscarlo.
 *
 * Sin quitar los acentos, «Elevacion» no encuentra «Elevación» y «Aduccion» no
 * encuentra «Aducción»: en un teclado de móvil casi nadie escribe la tilde. Y
 * sin fijar el idioma, `toLowerCase` no baja la I mayúscula igual en todos los
 * sitios.
 *
 * La misma regla que usa el buscador del catálogo en la consola del coach
 * (`functions/admin/[[ruta]].ts`), pero aquí no se puede importar: ese código
 * corre en Cloudflare y éste en el navegador.
 */
export function normalizarBusqueda(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es')
}

/**
 * ¿Aparece `termino` (ya normalizado) en el ejercicio?
 *
 * Mira el nombre y también el músculo principal y el equipo: muchos nombres de
 * la Biblioteca Maestra están en inglés y «hombro» o «polea» tienen que
 * encontrar «Cable Machine Shoulder Press».
 */
export function coincide(
  ejercicio: Pick<Ejercicio, 'nombre' | 'musculoPrimario' | 'equipo'>,
  termino: string,
): boolean {
  return [ejercicio.nombre, NOMBRE_MUSCULO[ejercicio.musculoPrimario], etiquetaEquipo(ejercicio.equipo)].some(
    (texto) => normalizarBusqueda(texto).includes(termino),
  )
}
