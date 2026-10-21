import { Link } from "react-router";
import { sesionCompleta } from "../../shared/superseries";
import type { Alta, Cambio } from "../../shared/v2/contratos";
import { segunCantidad } from "../logica/plural";
import { pagoPendiente, usePagos } from "./pagos-contexto";
import type { Cliente } from "./servicio";
import { FilaCliente } from "./FilaCliente";
import { Avatar, Cabecera, Icono, Vacio } from "./ui";

export function HoyCoach({ clientes, borradores, base, listo }: {
  clientes: Cliente[];
  borradores: Cambio[];
  base: string;
  listo: boolean;
}) {
  const pagos = usePagos();
  const pagosPendientes = pagos.disponibles
    ? clientes.filter((c) => pagoPendiente(pagos.porCliente.get(c.perfil.id))).length
    : 0;
  const pendientes = clientes.filter((c) =>
    c.plan.estado !== "publicado" || !c.plan.revisado || !c.plan.dias.length ||
    c.plan.dias.some((d) => !sesionCompleta(d.slots)),
  );
  const siguiente = pendientes[0];
  const actividad = clientes.filter((c) => c.actividad?.ultima).sort((a, b) =>
    b.actividad!.ultima!.fecha.localeCompare(a.actividad!.ultima!.fecha),
  ).slice(0, 4);
  const sesiones = clientes.reduce((n, c) => n + (c.actividad?.semana ?? 0), 0);
  // La persona principal ya está arriba: no se repite como otra tarea pendiente.
  const otros = pendientes.length ? pendientes.slice(1, 4) : clientes.slice(0, 4);

  return <>
    <Cabecera titulo="Hoy" kicker={new Date().toLocaleDateString("es", {
      weekday: "long", day: "numeric", month: "long",
    })} accion={<Link className="sfm-icon-button" data-tour="nuevo" data-tour-action="abrir-alta"
      to={`${base}/nuevo`} aria-label="Nuevo cliente"><Icono nombre="mas" /></Link>} />
    <div className="sfm-coach-today">
      <div className="sfm-coach-work">
        {siguiente && <section aria-label="Revisión de programas">
          <h2 className="sfm-coach-section-title">
            {segunCantidad(pendientes.length, "Necesita revisión", "Necesitan revisión")}
          </h2>
          <div className="sfm-coach-review-card">
            <Link className="sfm-coach-review-person" data-tour-action="abrir-cliente"
              data-tour-client={siguiente.perfil.id} to={`${base}/clientes/${siguiente.perfil.id}`}>
              <Avatar nombre={siguiente.perfil.nombre} />
              <span className="sfm-row-body">
                <strong>{siguiente.perfil.nombre}</strong>
                <span className="sfm-pill">Programa por revisar</span>
                <small>{siguiente.plan.estado !== "publicado" ? "Programa sin publicar"
                  : !siguiente.plan.revisado ? "Revisión pendiente" : "Sesiones por completar"}</small>
              </span>
              <Icono nombre="flecha" size={20} />
            </Link>
            <Link className="sfm-primary" to={`${base}/clientes/${siguiente.perfil.id}`}>Revisar programa</Link>
          </div>
        </section>}
        {pagosPendientes > 0 && <Link className="sfm-coach-payment" to={`${base}/clientes?pagos=pendientes`}>
          <Icono nombre="pago" />
          <span>{segunCantidad(pagosPendientes, "1 pago pendiente", `${pagosPendientes} pagos pendientes`)}</span>
          <Icono nombre="flecha" size={20} />
        </Link>}
        <p className="sfm-coach-summary" aria-label="Resumen del coaching">
          <span>{listo ? segunCantidad(clientes.length, "1 cliente", `${clientes.length} clientes`) : "— clientes"}</span>
          <span aria-hidden="true">·</span>
          <span>{listo ? segunCantidad(sesiones, "1 sesión esta semana", `${sesiones} sesiones esta semana`) : "— sesiones esta semana"}</span>
        </p>
        {borradores.length > 0 && <section aria-label="Altas en curso">
          <h2 className="sfm-coach-section-title">Continúa donde lo dejaste</h2>
          <div className="sfm-list">
            {borradores.map((c) => <Link className="sfm-row" key={c.id} to={`${base}/nuevo/${c.id}`}>
              <Avatar nombre={(c.datos as Alta).perfil.nombre} />
              <span className="sfm-row-body">
                <strong>{(c.datos as Alta).perfil.nombre}</strong>
                <small>{base.startsWith("/demo") ? "Nuevo cliente" : "Onboarding"} · Paso {(c.datos as Alta).paso} de 3</small>
              </span>
              <Icono nombre="flecha" size={20} />
            </Link>)}
          </div>
        </section>}
        {listo && !clientes.length && <Vacio titulo="El método empieza con una persona"
          detalle="Prepara su objetivo, contexto y primer plan." accion={
            <Link className="sfm-primary" data-tour="nuevo" data-tour-action="abrir-alta" to={`${base}/nuevo`}>Comenzar onboarding</Link>
          } />}
      </div>
      <div className="sfm-coach-overview">
        {actividad.length > 0 && <section aria-label="Actividad reciente">
          <h2 className="sfm-coach-section-title">Actividad reciente</h2>
          <div className="sfm-list">
            {actividad.map((c) => <Link className="sfm-row" key={c.perfil.id}
              to={`${base}/clientes/${c.perfil.id}?seccion=actividad`}>
              <Avatar nombre={c.perfil.nombre} />
              <span className="sfm-row-body">
                <strong>{c.perfil.nombre}</strong>
                <small>{c.actividad!.ultima!.prescripcion?.nombre ?? "Entrenamiento"} · {c.actividad!.ultima!.completadaEn ? "Completado" : "En curso"}</small>
              </span>
              <time className="sfm-activity-date">{new Date(c.actividad!.ultima!.fecha + "T12:00:00")
                .toLocaleDateString("es", { day: "numeric", month: "short" })}</time>
              <Icono nombre="flecha" size={20} />
            </Link>)}
          </div>
        </section>}
        {otros.length > 0 && <section aria-label="Más clientes">
          <h2 className="sfm-coach-section-title">{pendientes.length ? "También por revisar" : "Tus clientes"}</h2>
          <div className="sfm-list">
            {otros.map((c) => <FilaCliente key={c.perfil.id} c={c} base={base} />)}
          </div>
        </section>}
        {clientes.length > 0 && <Link className="sfm-coach-all" to={`${base}/clientes`}>
          Ver clientes<Icono nombre="flecha" size={20} />
        </Link>}
      </div>
    </div>
  </>;
}
