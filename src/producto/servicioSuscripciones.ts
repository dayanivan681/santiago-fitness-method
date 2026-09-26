import type { EstadoDeAcceso, Precio, RespuestaSuscripcion, ResumenSuscripcion } from "../../shared/v2/suscripcion";
import { ClienteApi } from "../nube/cloud";

export type AccionSuscripcion = "pausar" | "reanudar" | "cancelar" | "mantener";

const DIA = 24 * 60 * 60;

/** Precio de la demo: nunca se cobra ni se consulta a Stripe. */
const PRECIO_DEMO: Precio = { id: "price_demo_mensual", nombre: "Coaching mensual", importe: 8000, moneda: "usd", intervalo: "month" };

function ahora(): number {
  return Math.floor(Date.now() / 1000);
}

/** Estados de ejemplo para enseñar cada situación en la demo. */
function suscripcionDemo(clienteId: string, indice: number): ResumenSuscripcion {
  const base = { clienteId, precioId: PRECIO_DEMO.id, cancelarAlFinal: false, exento: false };
  const ejemplos: Array<Pick<ResumenSuscripcion, "estadoStripe" | "periodoFin"> & { acceso: EstadoDeAcceso }> = [
    { estadoStripe: "active", periodoFin: ahora() + 18 * DIA, acceso: { estado: "activa", puedeEntrenar: true } },
    { estadoStripe: "past_due", periodoFin: ahora() - 2 * DIA, acceso: { estado: "gracia", puedeEntrenar: true, graciaHasta: ahora() + 5 * DIA } },
    { estadoStripe: null, periodoFin: null, acceso: { estado: "sin_suscripcion", puedeEntrenar: false } },
  ];
  return { ...base, ...ejemplos[indice % ejemplos.length] };
}

/**
 * Suscripciones de los clientes para el panel del coach. La rama demo guarda
 * todo en memoria con datos ficticios; la real habla con `/admin/api/v2`.
 */
export class ServicioSuscripciones {
  readonly demo: boolean;
  private demoEstado = new Map<string, ResumenSuscripcion>();

  constructor(demo = false) {
    this.demo = demo;
  }

  /** Estado de ejemplo de cada persona de la demo: demo-persona-1 al día, -2 en gracia, -3 sin pagar. */
  private demoOriginal(clienteId: string): ResumenSuscripcion {
    const numero = Number(/(\d+)$/.exec(clienteId)?.[1] ?? 1);
    return suscripcionDemo(clienteId, numero - 1);
  }

  private demoDe(clienteId: string): ResumenSuscripcion {
    if (!this.demoEstado.has(clienteId)) this.demoEstado.set(clienteId, this.demoOriginal(clienteId));
    return this.demoEstado.get(clienteId)!;
  }

  private cambiarDemo(clienteId: string, cambios: Partial<ResumenSuscripcion>): void {
    this.demoEstado.set(clienteId, { ...this.demoDe(clienteId), ...cambios });
  }

  async listar(ids: string[]): Promise<{ suscripciones: ResumenSuscripcion[]; pagosDisponibles: boolean }> {
    if (this.demo) return { suscripciones: ids.map((id) => this.demoDe(id)), pagosDisponibles: true };
    return new ClienteApi(true).pedir("/suscripciones");
  }

  async una(clienteId: string): Promise<RespuestaSuscripcion> {
    if (this.demo) return { ...this.demoDe(clienteId), pagosDisponibles: true };
    return new ClienteApi(true, clienteId).pedir("/suscripcion");
  }

  async precios(): Promise<Precio[]> {
    if (this.demo) return [PRECIO_DEMO];
    return (await new ClienteApi(true).pedir<{ precios: Precio[] }>("/precios")).precios;
  }

  async asignarPrecio(clienteId: string, precioId: string): Promise<void> {
    if (this.demo) return this.cambiarDemo(clienteId, { precioId });
    await new ClienteApi(true, clienteId).pedir("/suscripcion/asignar-precio", { precioId });
  }

  async enlaceDePago(clienteId: string): Promise<string> {
    if (this.demo) return "Simulación: aquí aparecerá el enlace de pago de Stripe.";
    return (await new ClienteApi(true, clienteId).pedir<{ url: string }>("/suscripcion/enlace-de-pago", {})).url;
  }

  async accion(clienteId: string, accion: AccionSuscripcion): Promise<void> {
    if (this.demo) {
      const actual = this.demoDe(clienteId);
      if (accion === "cancelar" || accion === "mantener") return this.cambiarDemo(clienteId, { cancelarAlFinal: accion === "cancelar" });
      const pausada = accion === "pausar";
      return this.cambiarDemo(clienteId, {
        acceso: pausada ? { estado: "pausada", puedeEntrenar: false } : { estado: "activa", puedeEntrenar: true },
        estadoStripe: actual.estadoStripe ?? "active",
      });
    }
    await new ClienteApi(true, clienteId).pedir(`/suscripcion/${accion}`, {});
  }

  async exento(clienteId: string, exento: boolean): Promise<void> {
    if (this.demo) {
      const acceso: EstadoDeAcceso = exento ? { estado: "exenta", puedeEntrenar: true } : this.demoOriginal(clienteId).acceso;
      return this.cambiarDemo(clienteId, { exento, acceso });
    }
    await new ClienteApi(true, clienteId).pedir("/suscripcion/exento", { exento });
  }
}
