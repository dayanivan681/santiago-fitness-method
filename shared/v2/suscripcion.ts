/** Tipos de suscripción compartidos por el servidor y la app. */

export type EstadoDeAcceso =
  | { estado: "activa" | "exenta"; puedeEntrenar: true }
  | { estado: "gracia"; puedeEntrenar: true; graciaHasta: number }
  | { estado: "vencida" | "pausada" | "sin_suscripcion"; puedeEntrenar: false };

export type ResumenSuscripcion = {
  clienteId: string;
  precioId: string | null;
  /** Estado tal como lo da Stripe; `null` si nunca hubo suscripción. */
  estadoStripe: string | null;
  /** Fin del periodo pagado, en segundos Unix. */
  periodoFin: number | null;
  cancelarAlFinal: boolean;
  exento: boolean;
  acceso: EstadoDeAcceso;
};

export type RespuestaSuscripcion = ResumenSuscripcion & { pagosDisponibles: boolean };

export type Precio = { id: string; nombre: string; importe: number | null; moneda: string; intervalo: string };
