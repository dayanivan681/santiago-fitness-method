import { createContext, useContext } from "react";
export type Ayuda = {
  clienteId: string;
  demo: boolean;
  preparada: boolean;
  tieneActividad: boolean;
  esCliente: boolean;
  cerrados: ReadonlySet<string>;
  completados: ReadonlySet<string>;
  cerrar: (id: string) => void;
  confirmarCliente: (id: string) => void;
  confirmarSerie: () => void;
};
export const ContextoAyuda = createContext<Ayuda | null>(null);
/** La demo usa memoria; las cuentas reales recuerdan preferencias por identidad. */
export const useAyuda = () => useContext(ContextoAyuda);
