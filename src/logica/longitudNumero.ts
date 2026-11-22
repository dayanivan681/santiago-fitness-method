/**
 * La caja del número no crece: a 375 px cuatro cifras a tamaño normal se salían
 * y pisaban los botones − y + (QA 20-nov, fallo 2). Se encoge la letra.
 */
export function claseDeLongitud(valor: number | string): string {
  const largo = String(valor).length
  if (largo >= 6) return ' valor--muy-largo'
  if (largo >= 4) return ' valor--largo'
  return ''
}
