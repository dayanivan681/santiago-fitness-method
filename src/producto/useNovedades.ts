import { useCallback, useState } from "react";
import { NOVEDADES, novedadesPendientes, type Audiencia, type Novedad } from "./notas-novedades";

/**
 * Novedades pendientes tras una actualización. Lo visto se recuerda en este
 * dispositivo (decisión del dueño, 2026-10-21): otro teléfono lo vuelve a
 * mostrar una vez. Sin almacenamiento disponible se muestra igual y no se
 * recuerda; nunca bloquea la app.
 */
const clave = (audiencia: Audiencia) => `sfm-novedades-vistas:${audiencia}`;

function leerVistas(audiencia: Audiencia): Set<string> | null {
  try {
    const guardado = localStorage.getItem(clave(audiencia));
    if (guardado === null) return null;
    const ids: unknown = JSON.parse(guardado);
    return new Set(Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return null;
  }
}

function guardarVistas(audiencia: Audiencia, lista: readonly Novedad[]): void {
  const previas = leerVistas(audiencia) ?? new Set<string>();
  const ids = [...new Set([...previas, ...lista.filter((n) => n.audiencia === audiencia).map((n) => n.id)])];
  try {
    localStorage.setItem(clave(audiencia), JSON.stringify(ids));
  } catch {
    // Sin almacenamiento (modo privado, bloqueado): se volverá a mostrar.
  }
}

export function useNovedades(
  audiencia: Audiencia,
  activo: boolean,
  { lista = NOVEDADES, hoy }: { lista?: readonly Novedad[]; hoy?: Date } = {},
): { pendientes: readonly Novedad[]; marcarVistas: () => void } {
  const [pendientes, setPendientes] = useState<readonly Novedad[]>(() =>
    activo ? novedadesPendientes(lista, audiencia, leerVistas(audiencia), hoy ?? new Date()) : [],
  );
  const marcarVistas = useCallback(() => {
    guardarVistas(audiencia, lista);
    setPendientes([]);
  }, [audiencia, lista]);
  return { pendientes, marcarVistas };
}
