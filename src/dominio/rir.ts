/**
 * RIR — repeticiones en reserva.
 * Guía del proyecto §14: "escala 0–5+. Nunca se lee de forma aislada."
 *
 * El "+" importa: el tope de la escala no es un cinco exacto, es "cinco o más
 * repeticiones en reserva". Mostrarlo como un 5 pelado le quita ese matiz al
 * coach, que es quien lee este número junto a la carga y las reps.
 */

export const RIR_MAXIMO = 5

/** El propio tope, y cualquier valor por encima (series antiguas, datos externos). */
export function formatearRir(rir: number): string {
  return rir >= RIR_MAXIMO ? `${rir}+` : String(rir)
}

/** Cicla el selector de RIR: sube de uno en uno y del tope vuelve a cero. */
export function siguienteRir(rir: number): number {
  return (rir + 1) % (RIR_MAXIMO + 1)
}
