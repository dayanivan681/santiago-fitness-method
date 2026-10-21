import { ErrorVisible } from "./ui";
import { useState } from "react";
import type { RespuestaSuscripcion } from "../../shared/v2/suscripcion";
import { ETIQUETA_DE_ACCESO, fechaDeCobro } from "./suscripcionTextos";

import type { Api } from "./useSuscripcion";
type Navegar = (url: string) => void;

const irAStripe: Navegar = (url) => window.location.assign(url);

/** Botón que pide a la API una URL de Stripe y lleva al cliente allí. */
function BotonStripe({ api, ruta, texto, navegar, clase = "sfm-primary" }: {
  api: Api; ruta: string; texto: string; navegar: Navegar; clase?: string;
}) {
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  async function ir() {
    setOcupado(true);
    setError("");
    try {
      navegar((await api.pedir<{ url: string }>(ruta, {})).url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo abrir el pago. Inténtalo de nuevo.");
      setOcupado(false);
    }
  }
  return (
    <>
      <button className={clase} disabled={ocupado} onClick={() => void ir()}>{texto}</button>
      <ErrorVisible error={error} />
    </>
  );
}

/** Si ya hubo una suscripción que cobra, se arregla en el portal; si no, se paga una nueva. */
function accionDePago(resumen: RespuestaSuscripcion): { ruta: string; texto: string } {
  const terminada = !resumen.estadoStripe || ["canceled", "incomplete", "incomplete_expired"].includes(resumen.estadoStripe);
  return terminada
    ? { ruta: "/suscripcion/pagar", texto: "Pagar suscripción" }
    : { ruta: "/suscripcion/gestionar", texto: "Actualizar pago" };
}

export function AvisoSuscripcion({ resumen, api, navegar = irAStripe, volviendoDePago = false }: {
  resumen: RespuestaSuscripcion | null; api: Api; navegar?: Navegar; volviendoDePago?: boolean;
}) {
  if (!resumen?.pagosDisponibles) return null;
  const { acceso } = resumen;
  if (volviendoDePago && !(acceso.puedeEntrenar && acceso.estado !== "gracia"))
    return <p className="sfm-callout sfm-suscripcion-aviso" role="status">Pago recibido. Estamos activando tu suscripción…</p>;
  if (acceso.estado === "gracia")
    return (
      <div className="sfm-callout sfm-suscripcion-aviso" role="status">
        <p>No pudimos cobrar tu suscripción. Puedes seguir entrenando hasta el {fechaDeCobro(acceso.graciaHasta)}.</p>
        <BotonStripe api={api} ruta="/suscripcion/gestionar" texto="Actualizar pago" navegar={navegar} clase="sfm-secondary" />
      </div>
    );
  if (acceso.puedeEntrenar) return null;
  const accion = accionDePago(resumen);
  return (
    <section className="sfm-callout sfm-suscripcion-aviso" id="suscripcion-aviso" tabIndex={-1} aria-labelledby="suscripcion-aviso-titulo">
      <h2 id="suscripcion-aviso-titulo">Activa tu suscripción para entrenar</h2>
      <p>
        {acceso.estado === "pausada"
          ? "Tu coach pausó tu suscripción. Habla con él para reanudarla."
          : "Tu suscripción no está activa. Tu historial y tu progreso siguen disponibles."}
      </p>
      {acceso.estado !== "pausada" && <BotonStripe api={api} ruta={accion.ruta} texto={accion.texto} navegar={navegar} />}
    </section>
  );
}

export function MiSuscripcion({ resumen, api, navegar = irAStripe }: {
  resumen: RespuestaSuscripcion | null; api: Api; navegar?: Navegar;
}) {
  if (!resumen?.pagosDisponibles) return null;
  const { acceso, periodoFin, cancelarAlFinal, exento } = resumen;
  const conStripe = !!resumen.estadoStripe && !["canceled", "incomplete_expired"].includes(resumen.estadoStripe);
  return (
    <section className="sfm-callout sfm-suscripcion" aria-labelledby="mi-suscripcion">
      <h2 id="mi-suscripcion">Mi suscripción</h2>
      <p><strong>{exento ? "Incluida por tu coach" : ETIQUETA_DE_ACCESO[acceso.estado]}</strong></p>
      {!exento && periodoFin && acceso.puedeEntrenar && (
        <p className="sfm-hint">
          {cancelarAlFinal ? `Termina el ${fechaDeCobro(periodoFin)}.` : `Próximo cobro: ${fechaDeCobro(periodoFin)}.`}
        </p>
      )}
      {!exento && (conStripe
        ? <BotonStripe api={api} ruta="/suscripcion/gestionar" texto="Gestionar pago" navegar={navegar} clase="sfm-secondary" />
        : acceso.estado !== "pausada" && <BotonStripe api={api} ruta="/suscripcion/pagar" texto="Pagar suscripción" navegar={navegar} />)}
    </section>
  );
}
