/**
 * Clientes técnicos de QA.
 *
 * `dayan-test` existe para probar roles, impersonación y programación sin tocar
 * los datos de nadie real. En preview y en desarrollo hace falta; en producción
 * estorba, porque aparece en la lista del coach como si fuera un cliente más y
 * se confunde con Santiago.
 *
 * La fila se conserva siempre: se oculta, no se borra. Así el historial de QA
 * sigue disponible y preview puede seguir usándola — la base de datos es la
 * misma en los dos entornos.
 *
 * De momento la clasificación va por id reservado, que es suficiente para un
 * único cliente técnico y queda documentado aquí. Si algún día hay varios,
 * toca una columna `es_qa` en la tabla `clientes`.
 */

/** Ids reservados para pruebas. Nunca son clientes reales. */
const CLIENTES_QA: readonly string[] = ['dayan-test']

export type EntornoQa = {
  readonly SHOW_QA_CLIENTS?: string
}

export function esClienteQa(id: string): boolean {
  return CLIENTES_QA.includes(id)
}

/**
 * Si este entorno debe enseñar los clientes de QA.
 *
 * Falla ocultando: sin variable, se comporta como producción. Un despliegue mal
 * configurado deja el cliente técnico fuera de la vista, que es el error
 * inofensivo; el contrario enseñaría QA al coach como si fuera real.
 *
 * No se mira el hostname a propósito: la regla tiene que ser explícita y
 * revisable en `wrangler.toml`, no deducida de una cadena de texto.
 */
export function qaHabilitado(env: EntornoQa): boolean {
  return env.SHOW_QA_CLIENTS === 'true'
}

/** Quita los clientes de QA de una lista cuando el entorno no los muestra. */
export function filtrarClientesQa<T extends { readonly id: string }>(
  clientes: readonly T[],
  mostrarQa: boolean,
): T[] {
  return mostrarQa ? [...clientes] : clientes.filter((cliente) => !esClienteQa(cliente.id))
}

/** Si una operación sobre este cliente debe rechazarse en este entorno. */
export function clienteQaBloqueado(id: string, mostrarQa: boolean): boolean {
  return !mostrarQa && esClienteQa(id)
}
