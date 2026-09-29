import { createContext, useContext } from "react";
import type { EjercicioCoach } from "../../shared/v2/biblioteca";
import { BIBLIOTECA_INICIAL } from "../datos/semilla/biblioteca";
import type { Ejercicio } from "../dominio/tipos";
import type { ServicioBiblioteca } from "./servicioBiblioteca";

export const FOTO_PENDIENTE = "/ejercicios/sin-foto.svg";

/**
 * Los ejercicios del coach como fichas de dominio, las mismas que lee el resto
 * de la app. `urlDeFoto` decide desde dónde se sirve la foto (coach o cliente).
 */
export function aEjercicioDominio(e: EjercicioCoach, urlDeFoto: (e: EjercicioCoach) => string | null): Ejercicio {
  return {
    id: e.id,
    nombre: e.nombre,
    equipo: e.equipo,
    movimiento: e.movimiento,
    imagen: (e.tieneFoto ? urlDeFoto(e) : null) ?? FOTO_PENDIENTE,
    explicacionCorta: e.explicacionCorta,
    musculoPrimario: e.musculoPrimario,
    musculosSecundarios: e.musculosSecundarios,
    tipoCarga: e.tipoCarga,
    incrementoMinimoLb: e.incrementoMinimoLb,
    ...(e.pesoBaseMaquinaLb === null ? {} : { pesoBaseMaquinaLb: e.pesoBaseMaquinaLb }),
  };
}

export type BibliotecaDelCoach = {
  /** Las fichas fijas del código más las del coach, en ese orden. */
  ejercicios: readonly Ejercicio[];
  /** Sólo las del coach, por id: son las que llevan la insignia «Tuyo». */
  propios: ReadonlyMap<string, EjercicioCoach>;
  /** Texto del último fallo al leer los ejercicios del coach; vacío si todo va bien. */
  error: string;
  recargar: () => Promise<void>;
  /** Para crear, editar y subir fotos; ausente fuera del panel del coach. */
  servicio?: ServicioBiblioteca;
};

export const ContextoBiblioteca = createContext<BibliotecaDelCoach>({
  ejercicios: BIBLIOTECA_INICIAL,
  propios: new Map(),
  error: "",
  recargar: async () => {},
});

export const useBiblioteca = () => useContext(ContextoBiblioteca);

export function combinar(propios: readonly Ejercicio[]): readonly Ejercicio[] {
  return propios.length ? [...BIBLIOTECA_INICIAL, ...propios] : BIBLIOTECA_INICIAL;
}
