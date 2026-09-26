/**
 * Etiqueta de una cifra en singular o en plural.
 *
 * Las cifras grandes de la app van en un `<strong>` y su etiqueta aparte, así
 * que el número no cambia pero la etiqueta sí: «1 serie registrada», «0 series
 * registradas», «2 series registradas». En español el cero va en plural.
 */
export function segunCantidad(cantidad: number, singular: string, plural: string): string {
  return cantidad === 1 ? singular : plural
}
