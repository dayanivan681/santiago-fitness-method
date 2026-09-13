import { createContext, useContext } from "react";
export type AyudaDemo = {
  clienteId: string;
  esCliente: boolean;
  cerrados: ReadonlySet<string>;
  completados: ReadonlySet<string>;
  cerrar: (id: string) => void;
  confirmarCliente: (id: string) => void;
  confirmarSerie: () => void;
};
export const ContextoAyudaDemo = createContext<AyudaDemo | null>(null);
/** Sólo existe dentro de /demo. No escribe en dispositivos ni en cuentas. */
export const useAyudaDemo = () => useContext(ContextoAyudaDemo);
