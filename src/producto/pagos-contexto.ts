import { createContext, useContext } from "react";
import type { EstadoDeAcceso, ResumenSuscripcion } from "../../shared/v2/suscripcion";

export type Pagos = {
  /** Con Stripe apagado no se muestran insignias: nadie paga ni se bloquea. */
  disponibles: boolean;
  porCliente: ReadonlyMap<string, ResumenSuscripcion>;
};

export const ContextoPagos = createContext<Pagos>({ disponibles: false, porCliente: new Map() });

export const usePagos = () => useContext(ContextoPagos);

/** Estados que piden que el coach haga algo. */
const PENDIENTES = new Set<EstadoDeAcceso["estado"]>(["gracia", "vencida", "sin_suscripcion"]);

export function pagoPendiente(resumen: ResumenSuscripcion | undefined): boolean {
  return !!resumen && PENDIENTES.has(resumen.acceso.estado);
}
