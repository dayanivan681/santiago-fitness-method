import { GuiaAyuda } from "./GuiaAyuda";
import { Consejo } from "./Ayuda";
import { useAyuda } from "./ayuda-contexto";
import { useCallback, useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router";
import { ClienteApi } from "../nube/cloud";
import {
  Plan as ValidarPlan,
  type Alta,
  type Cambio,
  type Perfil,
  type Plan,
} from "../../shared/v2/contratos";
import { BIBLIOTECA_INICIAL } from "../datos/semilla/biblioteca";
import { ServicioCoach, ultimos, type Cliente } from "./servicio";
import {
  Avatar,
  Cabecera,
  ErrorVisible,
  Hoja,
  Icono,
  Marca,
  Vacio,
} from "./ui";
import { EditorPlan } from "./EditorPlan";
import { Onboarding } from "./Onboarding";
import { ResumenSesiones } from "./Progreso";
export function Coach({
  servicio,
  base,
  preview,
  entrenar,
}: {
  servicio: ServicioCoach;
  base: string;
  preview: (c: Cliente) => void;
  entrenar: (c: Cliente) => void;
}) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [borradores, setBorradores] = useState<Cambio[]>([]);
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);
  const cargar = useCallback(async () => {
    try {
      const [c, b] = await Promise.all([servicio.listar(), servicio.cambios()]);
      setClientes(c);
      setBorradores(
        ultimos(b, "alta").filter((v) => !(v.datos as Alta).completado),
      );
      setError("");
      setListo(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [servicio]);
  useEffect(() => {
    // La actualización ocurre después de leer el repositorio externo, nunca
    // durante el efecto. El mismo lector atiende publicación y refresco periódico.
    // oxlint-disable-next-line react/set-state-in-effect
    void cargar();
    const t = setInterval(() => {
      if (!document.hidden) void cargar();
    }, 4000);
    return () => clearInterval(t);
  }, [cargar]);
  return (
    <div className="sfm-shell sfm-shell--coach">
      <div className="sfm-brandbar">
        <Marca />
        <div className="sfm-brand-actions">
          {!servicio.demo && <GuiaAyuda base={base} permitirBienvenida={listo && clientes.length === 0 && borradores.length === 0} />}
          <span className="sfm-role">Coach</span>
        </div>
      </div>
      <main className="sfm-main">
        <ErrorVisible error={error} />
        <Routes>
          <Route
            index
            element={
              <HoyCoach
                clientes={clientes}
                borradores={borradores}
                base={base}
                listo={listo}
              />
            }
          />
          <Route
            path="clientes"
            element={
              <ListaClientes
                clientes={clientes}
                borradores={borradores}
                base={base}
                listo={listo}
              />
            }
          />
          <Route
            path="clientes/:clienteId"
            element={
              <FichaCoach
                clientes={clientes}
                servicio={servicio}
                base={base}
                actualizar={cargar}
                preview={preview}
                entrenar={entrenar}
              />
            }
          />
          <Route
            path="nuevo/:borradorId?"
            element={<Onboarding servicio={servicio} base={base} />}
          />
          <Route path="biblioteca" element={<BibliotecaCoach />} />
          <Route
            path="*"
            element={
              <HoyCoach
                clientes={clientes}
                borradores={borradores}
                base={base}
                listo={listo}
              />
            }
          />
        </Routes>
      </main>
      <nav className="sfm-tabbar" aria-label="Navegación del Coach">
        {[
          ["", "Hoy", "hoy"],
          ["/clientes", "Clientes", "clientes"],
          ["/biblioteca", "Biblioteca", "biblioteca"],
        ].map(([ruta, label, icon]) => (
          <NavLink end={ruta === ""} key={label} to={base + ruta}>
            <Icono nombre={icon} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
function HoyCoach({
  clientes,
  borradores,
  base,
  listo,
}: {
  clientes: Cliente[];
  borradores: Cambio[];
  base: string;
  listo: boolean;
}) {
  const actividad = clientes
    .filter((c) => c.actividad?.ultima)
    .sort((a, b) =>
      b.actividad!.ultima!.fecha.localeCompare(a.actividad!.ultima!.fecha),
    )
    .slice(0, 4);
  const pendientes = clientes.filter(
    (c) =>
      c.plan.estado !== "publicado" ||
      !c.plan.revisado ||
      c.plan.dias.length === 0 ||
      c.plan.dias.some((d) => d.slots.length < 5),
  );
  return (
    <>
      <Cabecera
        titulo="Tu coaching, hoy."
        kicker={new Date().toLocaleDateString("es", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        accion={
          <Link
            className="sfm-icon-button"
            data-tour="nuevo" data-tour-action="abrir-alta" to={`${base}/nuevo`}
            aria-label="Nuevo cliente"
          >
            <Icono nombre="mas" />
          </Link>
        }
      />
      {pendientes[0] && (
        <Link
          className="sfm-next-card"
          to={`${base}/clientes/${pendientes[0].perfil.id}`}
        >
          <span>
            <small>El siguiente paso</small>
            <strong>
              Revisar el plan de {pendientes[0].perfil.nombre.split(" ")[0]}
            </strong>
          </span>
          <Icono nombre="flecha" />
        </Link>
      )}
      <div className="sfm-metrics">
        <div>
          <strong>{listo ? clientes.length : "—"}</strong>
          <span>Clientes activos</span>
        </div>
        <div>
          <strong>
            {listo
              ? clientes.reduce((n, c) => n + (c.actividad?.semana ?? 0), 0)
              : "—"}
          </strong>
          <span>Sesiones esta semana</span>
        </div>
        <div>
          <strong>{listo ? borradores.length : "—"}</strong>
          <span>En onboarding</span>
        </div>
      </div>
      {borradores.length > 0 && (
        <>
          <div className="sfm-section-heading">
            <h2>Continúa donde lo dejaste</h2>
          </div>
          {borradores.map((c) => (
            <Link
              className="sfm-next-card"
              key={c.id}
              to={`${base}/nuevo/${c.id}`}
            >
              <span>
                <small>{base.startsWith("/demo") ? "Nuevo cliente" : "Onboarding"} · Paso {(c.datos as Alta).paso} de 3</small>
                <strong>{(c.datos as Alta).perfil.nombre}</strong>
              </span>
              <Icono nombre="flecha" />
            </Link>
          ))}
        </>
      )}
      {actividad.length > 0 && (
        <>
          <div className="sfm-section-heading">
            <h2>Actividad reciente</h2>
          </div>
          <div className="sfm-list">
            {actividad.map((c) => (
              <Link
                className="sfm-row"
                key={c.perfil.id}
                to={`${base}/clientes/${c.perfil.id}?seccion=actividad`}
              >
                <Avatar nombre={c.perfil.nombre} />
                <span className="sfm-row-body">
                  <strong>{c.perfil.nombre}</strong>
                  <small>
                    {c.actividad!.ultima!.prescripcion?.nombre ??
                      "Entrenamiento"}{" "}
                    ·{" "}
                    {c.actividad!.ultima!.completadaEn
                      ? "Completado"
                      : "En curso"}
                  </small>
                </span>
                <time className="sfm-activity-date">
                  {new Date(
                    c.actividad!.ultima!.fecha + "T12:00:00",
                  ).toLocaleDateString("es", {
                    day: "numeric",
                    month: "short",
                  })}
                </time>
              </Link>
            ))}
          </div>
        </>
      )}
      <div className="sfm-section-heading">
        <h2>{pendientes.length ? "Necesitan tu atención" : "Tus clientes"}</h2>
        <Link to={`${base}/clientes`}>Ver todos</Link>
      </div>
      <div className="sfm-list">
        {(pendientes.length ? pendientes : clientes).slice(0, 4).map((c) => (
          <FilaCliente key={c.perfil.id} c={c} base={base} />
        ))}
      </div>
      {listo && !clientes.length && (
        <Vacio
          titulo="El método empieza con una persona"
          detalle="Prepara su objetivo, contexto y primer plan."
          accion={
            <Link className="sfm-primary" data-tour="nuevo" data-tour-action="abrir-alta" to={`${base}/nuevo`}>
              Comenzar onboarding
            </Link>
          }
        />
      )}
    </>
  );
}
function FilaCliente({ c, base }: { c: Cliente; base: string }) {
  const incompleto =
    c.plan.estado !== "publicado" ||
    !c.plan.revisado ||
    c.plan.dias.length === 0 ||
    c.plan.dias.some((d) => d.slots.length < 5);
  return (
    <Link className="sfm-row" data-tour-action="abrir-cliente" data-tour-client={c.perfil.id} to={`${base}/clientes/${c.perfil.id}`}>
      <Avatar nombre={c.perfil.nombre} />
      <span className="sfm-row-body">
        <strong>{c.perfil.nombre}</strong>
        <small>
          {incompleto
            ? "Programa por revisar"
            : `${c.perfil.frecuenciaEntrenamiento} días · Programa publicado`}
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
function ListaClientes({
  clientes,
  borradores,
  base,
  listo,
}: {
  clientes: Cliente[];
  borradores: Cambio[];
  base: string;
  listo: boolean;
}) {
  const [q, setQ] = useState("");
  const visibles = clientes.filter((c) =>
    c.perfil.nombre
      .toLocaleLowerCase("es")
      .includes(q.trim().toLocaleLowerCase("es")),
  );
  return (
    <>
      <Cabecera
        titulo="Personas, antes que planes."
        kicker="Tus clientes"
        accion={
          <Link
            className="sfm-icon-button"
            data-tour="nuevo" data-tour-action="abrir-alta" to={`${base}/nuevo`}
            aria-label="Nuevo cliente"
          >
            <Icono nombre="mas" />
          </Link>
        }
      />
      <input
        className="sfm-search"
        data-tour="buscar-cliente" aria-label="Buscar cliente"
        placeholder="Buscar una persona"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="sfm-list">
        {visibles.map((c) => (
          <FilaCliente c={c} base={base} key={c.perfil.id} />
        ))}
      </div>
      {listo && clientes.length > 0 && !visibles.length && (
        <div role="status">
          <Vacio
            titulo="No encontramos esa persona"
            detalle="Prueba con otro nombre o vuelve a ver todos tus clientes."
          />
          <button className="sfm-text-button" onClick={() => setQ("")}>
            Ver todos los clientes
          </button>
        </div>
      )}
      {listo && !clientes.length && (
        <Vacio
          titulo="Tu próximo proceso empieza aquí"
          detalle="Da la bienvenida a tu primer cliente con un plan pensado para él."
        />
      )}
      <Link className="sfm-secondary" data-tour="nuevo" data-tour-action="abrir-alta" to={`${base}/nuevo`}>
        <Icono nombre="mas" /> {base.startsWith("/demo") ? "Crear cliente" : "Comenzar onboarding"}
      </Link>
      {borradores.length > 0 && (
        <>
          <div className="sfm-section-heading">
            <h2>{base.startsWith("/demo") ? "Clientes por terminar" : "Onboarding en curso"}</h2>
          </div>
          {borradores.map((c) => (
            <Link className="sfm-row" key={c.id} to={`${base}/nuevo/${c.id}`}>
              <Avatar nombre={(c.datos as Alta).perfil.nombre} />
              <span className="sfm-row-body">
                <strong>{(c.datos as Alta).perfil.nombre}</strong>
                <small>
                  Borrador guardado · Paso {(c.datos as Alta).paso}/3
                </small>
              </span>
              <Icono nombre="flecha" />
            </Link>
          ))}
        </>
      )}
    </>
  );
}
function FichaCoach(props: Parameters<typeof FichaCliente>[0]) {
  const { clienteId } = useParams();
  return <FichaCliente key={clienteId} {...props} />;
}
function FichaCliente({
  clientes,
  servicio,
  base,
  actualizar,
  preview,
  entrenar,
}: {
  clientes: Cliente[];
  servicio: ServicioCoach;
  base: string;
  actualizar: () => Promise<void>;
  preview: (c: Cliente) => void;
  entrenar: (c: Cliente) => void;
}) {
  const { clienteId } = useParams();
  const c = clientes.find((c) => c.perfil.id === clienteId);
  const [seccion, setSeccion] = useState(() =>
    new URLSearchParams(location.search).get("seccion") === "actividad"
      ? "actividad"
      : "programa",
  );
  const [plan, setPlan] = useState<Plan | null>(null);
  const [cambios, setCambios] = useState<Cambio[]>([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enlace, setEnlace] = useState("");
  const [confirmar, setConfirmar] = useState<"archivar" | "revocar" | null>(
    null,
  );
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const navegar = useNavigate();
  useEffect(() => {
    let vivo = true;
    const f = () =>
      servicio
        .cambios(clienteId)
        .then((r) => {
          if (vivo) setCambios(r);
        })
        .catch((e) => {
          if (vivo) setError(e.message);
        });
    void f();
    const t = setInterval(f, 4000);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, [clienteId, servicio]);
  if (!c) return <p className="sfm-loading">Abriendo cliente…</p>;
  const cliente = c;
  const borrador = ultimos(cambios, "plan").find((v) => v.id === "borrador");
  const docPerfil = ultimos(cambios, "perfil").find((v) => v.id === clienteId);
  async function guardar(publicar: boolean) {
    if (!plan) return;
    setOcupado(true);
    setError("");
    try {
      const valor = publicar
        ? ValidarPlan.parse({
            ...plan,
            id: "programa",
            estado: "publicado",
            revisado: true,
          })
        : { ...plan, id: "borrador", estado: "borrador" as const };
      await servicio.guardar(
        cliente.perfil.id,
        "plan",
        valor.id,
        publicar ? cliente.revision : (borrador?.revision ?? 0),
        valor,
      );
      setPlan(null);
      setMensaje(
        publicar
          ? "Programa publicado. El cliente lo recibirá automáticamente."
          : "Borrador guardado. El programa publicado sigue disponible.",
      );
      setCambios(await servicio.cambios(clienteId));
      await actualizar();

    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }
  async function invitar() {
    setOcupado(true);
    setError("");
    try {
      setEnlace(await servicio.invitar(cliente.perfil.id));

    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }
  return (
    <div className="sfm-client-detail-layout">
      <aside className="sfm-client-sidebar">
        <Link className="sfm-text-button" to={`${base}/clientes`}>
          Todos los clientes
        </Link>
        {clientes.map((persona) => (
          <FilaCliente key={persona.perfil.id} c={persona} base={base} />
        ))}
      </aside>
      <div className="sfm-client-detail">
        <Cabecera
          titulo={c.perfil.nombre}
          kicker="Su proceso"
          volver={`${base}/clientes`}
          accion={<Avatar nombre={c.perfil.nombre} />}
        />
        <ClienteCreado id={c.perfil.id} />
        <p className="sfm-client-goal">
          {c.perfil.objetivo || "Objetivo por conversar"}
        </p>
        <div className="sfm-client-actions">
          <button data-tour="preview" data-tour-action="abrir-preview" className="sfm-secondary" onClick={() => preview(c)}>
            Vista previa
          </button>
          <button className="sfm-secondary" onClick={() => entrenar(c)}>
            Entrenar juntos
          </button>
        </div>
        <div className="sfm-segmentos" aria-label="Ficha del cliente">
          {[
            ["programa", "Programa"],
            ["actividad", "Actividad"],
            ["perfil", "Perfil"],
          ].map(([key, label]) => (
            <button
              key={key}
              data-tour={`tab-${key}`} data-tour-action={key==='actividad'?'actividad-abierta':key==='perfil'?'perfil-abierto':'programa-abierto'} aria-pressed={seccion === key}
              onClick={() => setSeccion(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <ErrorVisible error={error} />
        {mensaje && (
          <p className="sfm-success" role="status">
            {mensaje}
          </p>
        )}
        {seccion === "programa" && (
          <>
            {plan ? (
              <>
                <div className="sfm-section-heading">
                  <h2>Preparando el siguiente paso</h2>
                  <button
                    className="sfm-text-button"
                    onClick={() => setPlan(null)}
                  >
                    Cancelar
                  </button>
                </div>
                <EditorPlan plan={plan} perfil={c.perfil} onChange={setPlan} />
                <div className="sfm-form-footer">
                  <button
                    className="sfm-primary"
                    disabled={
                      ocupado ||
                      !ValidarPlan.safeParse({
                        ...plan,
                        estado: "publicado",
                        revisado: true,
                      }).success
                    }
                    data-tour="publicar-plan" onClick={() => void guardar(true)}
                  >
                    Revisado · Publicar programa
                  </button>
                  <button
                    className="sfm-secondary"
                    disabled={ocupado}
                    data-tour="guardar-plan" onClick={() => void guardar(false)}
                  >
                    Guardar borrador
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="sfm-section-heading">
                  <h2>
                    Programa{" "}
                    {c.plan.estado === "publicado" ? "actual" : "por revisar"}
                  </h2>
                  <span className="sfm-pill">
                    {c.plan.estado === "publicado" ? "Publicado" : "Borrador"}
                  </span>
                </div>
                <div className="sfm-program-grid">
                  {c.plan.dias.map((d) => (
                    <button
                      key={d.id}
                      className="sfm-day-card"
                      onClick={() => setPlan(structuredClone(c.plan))}
                    >
                      <span className="sfm-eyebrow">
                        Sesión {String(d.orden).padStart(2, "0")}
                      </span>
                      <h3>{d.nombre}</h3>
                      <p>
                        {d.slots.length} ejercicios ·{" "}
                        {d.slots.reduce((n, s) => n + s.seriesObjetivo, 0)}{" "}
                        series
                      </p>
                      <span className="sfm-day-rule" />
                    </button>
                  ))}
                </div>
                <button
                  className="sfm-secondary" data-tour="preparar-plan" data-tour-action="preparar-plan"
                  onClick={() => setPlan(structuredClone(c.plan))}
                >
                  Preparar cambios
                </button>
                {borrador && (
                  <button
                    className="sfm-next-card" data-tour="retomar-plan" data-tour-action="retomar-plan"
                    onClick={() =>
                      setPlan(structuredClone(borrador.datos as Plan))
                    }
                  >
                    <span>
                      <small>Borrador disponible</small>
                      <strong>Retomar programación</strong>
                    </span>
                    <Icono nombre="flecha" />
                  </button>
                )}
                <div className="sfm-access-card">
                  <div>
                    <h2>Su acceso privado</h2>
                    <p>
                      La invitación se utiliza una vez. Puedes preparar otra
                      para un nuevo dispositivo.
                    </p>
                  </div>
                  <button
                    className="sfm-primary"
                    disabled={ocupado}
                    data-tour="invitar" onClick={() => void invitar()}
                  >
                    {servicio.demo ? "Probar invitación" : "Preparar invitación"}
                  </button>
                  {servicio.demo && <p className="sfm-hint">Simulación: no da acceso real ni envía mensajes.</p>}
                  {enlace && (
                    <div className="sfm-invitation" data-tour="invitacion">
                      <p>{servicio.demo?"Simulación: no se crea ni se envía ninguna invitación.":"Lista para compartir personalmente."}</p>
                      <input
                        aria-label="Invitación privada"
                        readOnly
                        value={enlace}
                      />
                      <button
                        className="sfm-secondary"
                        onClick={() =>
                          void navigator.clipboard
                            .writeText(enlace)
                            .then(() => setMensaje("Invitación copiada."))
                        }
                      >
                        Copiar invitación
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
        {seccion === "actividad" && (
          <div data-tour="actividad-cliente"><ResumenSesiones
            cambios={cambios}
            cliente={c.perfil.id}
            api={servicio.demo ? undefined : new ClienteApi(true, c.perfil.id)}
          /></div>
        )}
        {seccion === "perfil" && (
          <>
            {perfil ? (
              <>
                <label className="sfm-field">
                  <span>Nombre</span>
                  <input
                    value={perfil.nombre}
                    onChange={(e) =>
                      setPerfil({ ...perfil, nombre: e.target.value })
                    }
                  />
                </label>
                <div className="sfm-fields-grid">
                  {(
                    [
                      "edad",
                      "pesoCorporalLb",
                      "estaturaCm",
                      "frecuenciaEntrenamiento",
                    ] as const
                  ).map((k) => (
                    <label className="sfm-field" key={k}>
                      <span>
                        {
                          {
                            edad: "Edad · opcional",
                            pesoCorporalLb: "Peso · lb, opcional",
                            estaturaCm: "Estatura · cm, opcional",
                            frecuenciaEntrenamiento: "Días por semana",
                          }[k]
                        }
                      </span>
                      <input
                        type="number"
                        inputMode={
                          k === "edad" || k === "frecuenciaEntrenamiento"
                            ? "numeric"
                            : "decimal"
                        }
                        value={perfil[k] ?? ""}
                        onChange={(e) =>
                          setPerfil({
                            ...perfil,
                            [k]:
                              e.target.value === ""
                                ? k === "frecuenciaEntrenamiento"
                                  ? 1
                                  : null
                                : Number(e.target.value),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
                <label className="sfm-field">
                  <span>Sexo · opcional</span>
                  <select
                    value={perfil.sexo ?? ""}
                    onChange={(e) =>
                      setPerfil({
                        ...perfil,
                        sexo: (e.target.value || null) as Perfil["sexo"],
                      })
                    }
                  >
                    <option value="">Por confirmar</option>
                    <option value="femenino">Femenino</option>
                    <option value="masculino">Masculino</option>
                  </select>
                </label>
                {(["objetivo", "limitaciones", "notas"] as const).map((k) => (
                  <label className="sfm-field" key={k}>
                    <span>
                      {k === "notas"
                        ? "Notas privadas del Coach"
                        : k === "objetivo"
                          ? "Objetivo"
                          : "Limitaciones"}
                    </span>
                    <textarea data-tour={k==="objetivo"?"objetivo-perfil":undefined}
                      value={perfil[k]}
                      onChange={(e) =>
                        setPerfil({ ...perfil, [k]: e.target.value })
                      }
                    />
                  </label>
                ))}
                <details className="sfm-callout">
                  <summary>
                    Ejercicios a evitar · {perfil.ejerciciosEvitados.length}
                  </summary>
                  <p className="sfm-hint">
                    Estas indicaciones aparecen al preparar su programa.
                  </p>
                  {BIBLIOTECA_INICIAL.map((e) => (
                    <label className="sfm-check" key={e.id}>
                      <input
                        type="checkbox"
                        checked={perfil.ejerciciosEvitados.includes(e.id)}
                        onChange={(v) =>
                          setPerfil({
                            ...perfil,
                            ejerciciosEvitados: v.target.checked
                              ? [...perfil.ejerciciosEvitados, e.id]
                              : perfil.ejerciciosEvitados.filter(
                                  (id) => id !== e.id,
                                ),
                          })
                        }
                      />
                      <span>{e.nombre}</span>
                    </label>
                  ))}
                </details>
                <button
                  data-tour="guardar-perfil" className="sfm-primary"
                  disabled={ocupado}
                  onClick={() => {
                    setOcupado(true);
                    void servicio
                      .guardar(
                        c.perfil.id,
                        "perfil",
                        c.perfil.id,
                        docPerfil?.revision ?? 0,
                        perfil,
                      )
                      .then(() => {
                        setPerfil(null);

                        return actualizar();
                      })
                      .catch((e) => setError(e.message))
                      .finally(() => setOcupado(false));
                  }}
                >
                  Guardar perfil
                </button>
              </>
            ) : (
              <>
                <dl className="sfm-profile-data">
                  <div>
                    <dt>Frecuencia</dt>
                    <dd>{c.perfil.frecuenciaEntrenamiento} días por semana</dd>
                  </div>
                  <div>
                    <dt>Limitaciones</dt>
                    <dd>{c.perfil.limitaciones || "No se han indicado"}</dd>
                  </div>
                  <div>
                    <dt>Notas privadas</dt>
                    <dd>{c.perfil.notas || "Sin notas"}</dd>
                  </div>
                  <div>
                    <dt>Edad</dt>
                    <dd>
                      {c.perfil.edad
                        ? `${c.perfil.edad} años`
                        : "Por confirmar"}
                    </dd>
                  </div>
                  <div>
                    <dt>Peso</dt>
                    <dd>
                      {c.perfil.pesoCorporalLb
                        ? `${c.perfil.pesoCorporalLb} lb`
                        : "Por confirmar"}
                    </dd>
                  </div>
                </dl>
                <button
                  className="sfm-secondary"
                  data-tour="editar-perfil" data-tour-action="editar-perfil" onClick={() => setPerfil(structuredClone(c.perfil))}
                >
                  Editar perfil
                </button>
                <button
                  className="sfm-text-button"
                  onClick={() => setConfirmar("revocar")}
                >
                  Cerrar sus accesos
                </button>
                <button
                  className="sfm-text-button sfm-danger"
                  onClick={() => setConfirmar("archivar")}
                >
                  Archivar cliente
                </button>
              </>
            )}
          </>
        )}
        {confirmar && (
          <Hoja
            titulo={
              confirmar === "archivar"
                ? "Archivar este proceso"
                : "Cerrar accesos"
            }
            cerrar={() => setConfirmar(null)}
          >
            <p>
              {confirmar === "archivar"
                ? "Se conservarán el perfil, el programa y todo el historial. El cliente dejará de tener acceso."
                : "Se cerrarán sus dispositivos y se invalidarán las invitaciones anteriores. Podrás preparar una nueva."}
            </p>
            <button
              className="sfm-primary"
              onClick={() => {
                void servicio
                  .accion(c.perfil.id, confirmar)
                  .then(async () => {
                    setConfirmar(null);
                    await actualizar();
                    if (confirmar === "archivar") navegar(`${base}/clientes`);
                    else setMensaje("Accesos cerrados.");
                  })
                  .catch((e) => setError(e.message));
              }}
            >
              Confirmar
            </button>
            <button
              className="sfm-secondary"
              onClick={() => setConfirmar(null)}
            >
              Volver
            </button>
          </Hoja>
        )}
      </div>
    </div>
  );
}
function BibliotecaCoach() {
  const [q, setQ] = useState("");
  return (
    <>
      <Cabecera titulo="Conoce cada variante." kicker="Biblioteca del método" />
      <input
        className="sfm-search"
        aria-label="Buscar en biblioteca"
        placeholder="Buscar ejercicio"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="sfm-catalog-grid">
        {BIBLIOTECA_INICIAL.filter((e) =>
          e.nombre.toLowerCase().includes(q.toLowerCase()),
        ).map((e) => (
          <article className="sfm-exercise-card" key={e.id}>
            <img src={e.imagen} alt="" loading="lazy" />
            <div>
              <small>{e.equipo}</small>
              <h2>{e.nombre}</h2>
              <p>{e.explicacionCorta}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function ClienteCreado({ id }: { id: string }) {
  const ayuda = useAyuda();
  return ayuda?.completados.has(`creado:${id}`) ? <Consejo id={`creado:${id}`}><strong>Cliente creado. Su plan está listo.</strong></Consejo> : null;
}
