import type { EstadoDeAcceso } from "../../shared/v2/suscripcion";

/** Nombre corto del estado, igual para el cliente y para el coach. */
export const ETIQUETA_DE_ACCESO: Record<EstadoDeAcceso["estado"], string> = {
  activa: "Al día",
  exenta: "Exento",
  gracia: "En gracia",
  vencida: "Vencida",
  pausada: "Pausada",
  sin_suscripcion: "Sin suscripción",
};

/** «26 de octubre» a partir de segundos Unix. */
export function fechaDeCobro(segundos: number): string {
  return new Date(segundos * 1000).toLocaleDateString("es", { day: "numeric", month: "long" });
}

/** Importe de Stripe (en céntimos) legible: «$80,00 al mes». */
export function importeMensual(importe: number | null, moneda: string, intervalo: string): string {
  if (importe === null) return "Importe variable";
  const cantidad = new Intl.NumberFormat("es", { style: "currency", currency: moneda.toUpperCase() }).format(importe / 100);
  const periodo = { day: "al día", week: "a la semana", month: "al mes", year: "al año" }[intervalo] ?? `cada ${intervalo}`;
  return `${cantidad} ${periodo}`;
}
