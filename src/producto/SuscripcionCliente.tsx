import { Esqueleto } from "../componentes/Esqueleto";
import { useCallback, useEffect, useState } from "react";
import type { EstadoDeAcceso, Precio, RespuestaSuscripcion } from "../../shared/v2/suscripcion";
import { CopiarInvitacion } from "./CopiarInvitacion";
import type { AccionSuscripcion, ServicioSuscripciones } from "./servicioSuscripciones";
import { ETIQUETA_DE_ACCESO, fechaDeCobro, importeMensual } from "./suscripcionTextos";
import { ErrorVisible } from "./ui";

const TONO: Record<EstadoDeAcceso["estado"], string> = {
  activa: "ok",
  exenta: "ok",
  gracia: "aviso",
  vencida: "alerta",
  pausada: "neutro",
  sin_suscripcion: "neutro",
};

export function InsigniaSuscripcion({ acceso }: { acceso: EstadoDeAcceso }) {
  return <span className={`sfm-insignia sfm-insignia--${TONO[acceso.estado]}`}>{ETIQUETA_DE_ACCESO[acceso.estado]}</span>;
}

function detalle(r: RespuestaSuscripcion): string {
  const { acceso, periodoFin, cancelarAlFinal } = r;
  if (acceso.estado === "exenta") return "No se le cobra ni se le bloquea.";
  if (acceso.estado === "gracia") return `El último cobro falló. Entrena hasta el ${fechaDeCobro(acceso.graciaHasta)}; Stripe reintenta el pago.`;
  if (acceso.estado === "vencida") return "No puede entrenar hasta que pague. Ve su historial.";
  if (acceso.estado === "pausada") return "No se le cobra y no puede entrenar hasta que reanudes.";
  if (acceso.estado === "sin_suscripcion") return "Todavía no ha pagado. Elige su plan y mándale el enlace de pago.";
  if (!periodoFin) return "";
  return cancelarAlFinal ? `Termina el ${fechaDeCobro(periodoFin)}.` : `Próximo cobro: ${fechaDeCobro(periodoFin)}.`;
}

/** Hay una suscripción en Stripe sobre la que el coach puede actuar. */
function tieneSuscripcionViva(r: RespuestaSuscripcion): boolean {
  return !!r.estadoStripe && !["canceled", "incomplete", "incomplete_expired"].includes(r.estadoStripe);
}

/** Pestaña Suscripción de la ficha: estado, plan, enlace de pago y acciones. */
export function SuscripcionCliente({ servicio, clienteId, alCambiar }: {
  servicio: ServicioSuscripciones; clienteId: string; alCambiar?: () => void;
}) {
  const [datos, setDatos] = useState<RespuestaSuscripcion | null>(null);
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [elegido, setElegido] = useState("");
  const [enlace, setEnlace] = useState("");
  const [confirmarCancelacion, setConfirmarCancelacion] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    const r = await servicio.una(clienteId);
    setDatos(r);
    setElegido(r.precioId ?? "");
    if (r.pagosDisponibles) setPrecios(await servicio.precios());
  }, [servicio, clienteId]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void cargar().catch((e: Error) => setError(e.message));
  }, [cargar]);

  async function hacer(tarea: () => Promise<unknown>) {
    setOcupado(true);
    setError("");
    try {
      await tarea();
      await cargar();
      alCambiar?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar. Inténtalo de nuevo.");
    } finally {
      setOcupado(false);
    }
  }

  const accion = (a: AccionSuscripcion) => hacer(() => servicio.accion(clienteId, a));

  if (!datos) return error ? <ErrorVisible error={error} /> : <Esqueleto etiqueta="Cargando suscripción" forma="tarjeta" />;
  const viva = tieneSuscripcionViva(datos);

  return (
    <div className="sfm-suscripcion-coach">
      <div className="sfm-suscripcion-estado">
        <InsigniaSuscripcion acceso={datos.acceso} />
        <p>{detalle(datos)}</p>
      </div>
      <ErrorVisible error={error} />

      {!datos.pagosDisponibles && (
        <p className="sfm-hint">
          Los cobros todavía no están activados. Cuando conectes Stripe podrás elegir su plan y cobrarle desde aquí.
          Mientras tanto, nadie queda bloqueado.
        </p>
      )}

      {datos.pagosDisponibles && !viva && (
        <>
          <label className="sfm-field">
            <span>Plan</span>
            <select value={elegido} onChange={(e) => setElegido(e.target.value)} disabled={ocupado}>
              <option value="">Elige un plan</option>
              {precios.map((p) => (
                <option key={p.id} value={p.id}>{`${p.nombre} · ${importeMensual(p.importe, p.moneda, p.intervalo)}`}</option>
              ))}
            </select>
          </label>
          {elegido && elegido !== datos.precioId && (
            <button className="sfm-secondary" disabled={ocupado} onClick={() => void hacer(() => servicio.asignarPrecio(clienteId, elegido))}>
              Guardar plan
            </button>
          )}
          <button className="sfm-primary" disabled={ocupado} onClick={() => void hacer(async () => setEnlace(await servicio.enlaceDePago(clienteId)))}>
            Preparar enlace de pago
          </button>
          {enlace && (
            <div className="sfm-invitation">
              <p>Mándaselo personalmente. Caduca en 24 horas.</p>
              <CopiarInvitacion enlace={enlace} etiqueta="Enlace de pago" texto="Copiar enlace de pago" />
            </div>
          )}
        </>
      )}

      {datos.pagosDisponibles && viva && (
        <div className="sfm-suscripcion-acciones">
          <p className="sfm-hint">
            Plan: {precios.find((p) => p.id === datos.precioId)?.nombre ?? datos.precioId ?? "sin plan"}
          </p>
          {datos.acceso.estado === "pausada"
            ? <button className="sfm-secondary" disabled={ocupado} onClick={() => void accion("reanudar")}>Reanudar cobros</button>
            : <button className="sfm-secondary" disabled={ocupado} onClick={() => void accion("pausar")}>Pausar cobros</button>}
          {datos.cancelarAlFinal
            ? <button className="sfm-secondary" disabled={ocupado} onClick={() => void accion("mantener")}>Mantener suscripción</button>
            : !confirmarCancelacion && (
              <button className="sfm-secondary" disabled={ocupado} onClick={() => setConfirmarCancelacion(true)}>
                Cancelar al final del periodo
              </button>
            )}
          {confirmarCancelacion && !datos.cancelarAlFinal && (
            <div className="sfm-confirm" role="group" aria-label="Confirmar cancelación">
              <p>Seguirá entrenando hasta el fin del periodo pagado y después no se le volverá a cobrar.</p>
              <button className="sfm-danger" disabled={ocupado} onClick={() => { setConfirmarCancelacion(false); void accion("cancelar"); }}>
                Sí, cancelar
              </button>
              <button className="sfm-secondary" onClick={() => setConfirmarCancelacion(false)}>No</button>
            </div>
          )}
        </div>
      )}

      <label className="sfm-check">
        <input
          type="checkbox"
          checked={datos.exento}
          disabled={ocupado}
          onChange={(e) => void hacer(() => servicio.exento(clienteId, e.target.checked))}
        />
        <span>Exento de pago: nunca se le cobra ni se le bloquea (cortesía o pruebas).</span>
      </label>
    </div>
  );
}
