import { Link } from "react-router";
import { sesionCompleta } from "../../shared/superseries";
import { segunCantidad } from "../logica/plural";
import type { Cliente } from "./servicio";
import { usePagos } from "./pagos-contexto";
import { InsigniaSuscripcion } from "./SuscripcionCliente";
import { Avatar, Icono } from "./ui";

export function FilaCliente({ c, base }: { c: Cliente; base: string }) {
  const pagos = usePagos();
  const suscripcion = pagos.disponibles ? pagos.porCliente.get(c.perfil.id) : undefined;
  const incompleto =
    c.plan.estado !== "publicado" ||
    !c.plan.revisado ||
    c.plan.dias.length === 0 ||
    c.plan.dias.some((d) => !sesionCompleta(d.slots));
  return (
    <Link className="sfm-row" data-tour-action="abrir-cliente" data-tour-client={c.perfil.id} to={`${base}/clientes/${c.perfil.id}`}>
      <Avatar nombre={c.perfil.nombre} />
      <span className="sfm-row-body">
        <strong>{c.perfil.nombre}</strong>
        {suscripcion && <InsigniaSuscripcion acceso={suscripcion.acceso} />}
        <small>
          {incompleto
            ? "Programa por revisar"
            : `${c.plan.dias.length} ${segunCantidad(c.plan.dias.length, "sesión", "sesiones")} · Programa publicado`}
        </small>
      </span>
      <span
        className={`sfm-status-dot ${incompleto ? "sfm-status-dot--pending" : ""}`}
        aria-label={incompleto ? "Pendiente" : "Publicado"}
      />
      <Icono nombre="flecha" size={16} />
    </Link>
  );
}
