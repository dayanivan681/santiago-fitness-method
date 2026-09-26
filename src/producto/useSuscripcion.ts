import { useCallback, useEffect, useState } from "react";
import type { RespuestaSuscripcion } from "../../shared/v2/suscripcion";

export type Api = { pedir: <T>(ruta: string, body?: unknown) => Promise<T> };

/** Veces que se vuelve a preguntar tras volver de Checkout, esperando al webhook. */
const REINTENTOS_TRAS_PAGO = 10;
const ESPERA_TRAS_PAGO_MS = 3000;

/**
 * Estado de la suscripción del cliente. Se recarga al volver a la pestaña y,
 * tras pagar en Stripe (`?suscripcion=ok`), hasta que el webhook la active.
 */
export function useSuscripcion(api: Api | undefined): { resumen: RespuestaSuscripcion | null; volviendoDePago: boolean } {
  const [resumen, setResumen] = useState<RespuestaSuscripcion | null>(null);
  const [volviendoDePago, setVolviendoDePago] = useState(
    () => new URLSearchParams(window.location.search).get("suscripcion") === "ok",
  );
  const cargar = useCallback(async () => {
    if (!api) return null;
    try {
      const r = await api.pedir<RespuestaSuscripcion>("/suscripcion");
      setResumen(r);
      return r;
    } catch {
      // Sin conexión: se conserva el último estado conocido.
      return null;
    }
  }, [api]);

  useEffect(() => {
    // La lectura es externa (API); el estado se fija cuando llega la respuesta.
    // oxlint-disable-next-line react/set-state-in-effect
    void cargar();
    const alVolver = () => { if (!document.hidden) void cargar(); };
    document.addEventListener("visibilitychange", alVolver);
    return () => document.removeEventListener("visibilitychange", alVolver);
  }, [cargar]);

  useEffect(() => {
    if (!volviendoDePago) return;
    let intentos = 0;
    const temporizador = setInterval(async () => {
      intentos++;
      const r = await cargar();
      if ((r?.acceso.puedeEntrenar && r.acceso.estado !== "gracia") || intentos >= REINTENTOS_TRAS_PAGO) {
        clearInterval(temporizador);
        setVolviendoDePago(false);
      }
    }, ESPERA_TRAS_PAGO_MS);
    return () => clearInterval(temporizador);
  }, [volviendoDePago, cargar]);

  return { resumen, volviendoDePago };
}

/** Con Stripe encendido, el cliente sin acceso no puede empezar a entrenar. */
export function suscripcionBloquea(resumen: RespuestaSuscripcion | null): boolean {
  return !!resumen?.pagosDisponibles && !resumen.acceso.puedeEntrenar;
}
