import { NOMBRE_MUSCULO, etiquetaEquipo } from '../dominio/etiquetas'
import type { Ejercicio } from '../dominio/tipos'
import { conceptosDeBusqueda, contieneConcepto } from './sinonimos'

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
 *
 * Si el término entero no aparece, se busca por partes y en los dos idiomas:
 * cada palabra (o frase conocida) tiene que estar, ella o su traducción, en
 * algún sitio. Así «lateral raise» encuentra «Elevación lateral con
 * mancuernas» y «sentadilla» encuentra «Goblet Squat» (QA 20-nov).
 */
export function coincide(
  ejercicio: Pick<Ejercicio, 'nombre' | 'musculoPrimario' | 'equipo'>,
  termino: string,
): boolean {
  const textos = [ejercicio.nombre, NOMBRE_MUSCULO[ejercicio.musculoPrimario], etiquetaEquipo(ejercicio.equipo)].map(
    normalizarBusqueda,
  )
  if (textos.some((texto) => texto.includes(termino))) return true
  return coincidePorPartes(textos.join(' | '), termino)
}

/**
 * La misma búsqueda bilingüe sobre un texto suelto, como el nombre de una ficha
 * del catálogo. `termino` ya normalizado; vacío lo encuentra todo.
 */
export function coincideTexto(texto: string, termino: string): boolean {
  const normalizado = normalizarBusqueda(texto)
  return normalizado.includes(termino) || coincidePorPartes(normalizado, termino)
}

function coincidePorPartes(texto: string, termino: string): boolean {
  const conceptos = conceptosDeBusqueda(termino)
  return conceptos.length > 0 && conceptos.every((concepto) => contieneConcepto(texto, concepto))
}
