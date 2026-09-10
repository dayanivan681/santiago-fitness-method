import { createContext, useContext } from "react";
export type Capitulo = "crear" | "gestionar" | "preview" | "cliente";
export type ControlRecorrido = {
  paso: string | null;
  activo: boolean;
  clienteId: string;
  nombreEjemplo: string;
  emitir: (evento: string, clienteId?: string) => void;
  iniciar: (capitulo: Capitulo, clienteId?: string) => Promise<void>;
  pausar: () => void;
};
export const ContextoRecorrido = createContext<ControlRecorrido | null>(null);
/** Fuera de /demo no hay controlador, efectos ni persistencia de tutorial. */
export function useRecorrido() {
  return useContext(ContextoRecorrido);
}
