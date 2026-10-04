import { useCallback, useEffect, useMemo, useState } from "react";
import type { EjercicioCoach } from "../../shared/v2/biblioteca";
import { aEjercicioDominio } from "../nube/biblioteca";
import { combinar, type BibliotecaDelCoach } from "./contextoBiblioteca";
import type { ServicioCoach } from "./servicio";

/**
 * Ejercicios del coach cargados junto a los clientes. Si la lectura falla se
 * conserva lo último recibido y se avisa con `error`; nunca tumba el panel.
 */
export function useBibliotecaDelCoach(servicio: ServicioCoach): BibliotecaDelCoach {
  const [lista, setLista] = useState<readonly EjercicioCoach[]>([]);
  const [error, setError] = useState("");
  const recargar = useCallback(async () => {
    try {
      setLista(await servicio.biblioteca.listar());
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [servicio]);
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void recargar();
  }, [recargar]);
  return useMemo(
    () => ({
      ejercicios: combinar(lista.map((e) => aEjercicioDominio(e, servicio.biblioteca.urlDeFoto, servicio.biblioteca.urlDeAnimacion))),
      propios: new Map(lista.map((e) => [e.id, e])),
      error,
      recargar,
      servicio: servicio.biblioteca,
    }),
    [lista, error, recargar, servicio],
  );
}
