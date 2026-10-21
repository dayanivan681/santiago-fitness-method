import { Esqueleto } from "../componentes/Esqueleto";
import { GuiaAyuda } from "./GuiaAyuda";
import { contarBloques } from "../../shared/superseries";
import { CopiarInvitacion } from "./CopiarInvitacion";
import { SuscripcionCliente } from "./SuscripcionCliente";
import { ContextoPagos, pagoPendiente, usePagos, type Pagos } from "./pagos-contexto";
import { Consejo } from "./Ayuda";
import { useAyuda } from "./ayuda-contexto";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { ClienteApi } from "../nube/cloud";
import {
  Plan as ValidarPlan,
  type Alta,
  type Cambio,
  type Perfil,
  type Plan,
} from "../../shared/v2/contratos";
import { ContextoBiblioteca, useBiblioteca } from "./contextoBiblioteca";
import { useBibliotecaDelCoach } from "./useBibliotecaDelCoach";
import { BibliotecaCoach } from "./BibliotecaCoach";
import { ServicioCoach, ultimos, type Cliente } from "./servicio";
import { borradorPendiente } from "./borrador-plan";
import {
  Avatar,
  Cabecera,
  ErrorVisible,
  Hoja,
  Icono,
  Vacio,
} from "./ui";
import { EditorPlan } from "./EditorPlan";
import { HoyCoach } from "./CoachHoy";
import { AvisoNovedades } from "./Novedades";
import { useNovedades } from "./useNovedades";
import { FilaCliente } from "./FilaCliente";
import "./coach-ios.css";
import "./coach-laptop.css";
import { Onboarding } from "./Onboarding";
import { ResumenSesiones } from "./Progreso";
/**
 * Cada cuánto el panel pregunta por novedades. El servidor contesta 304 o sólo
 * lo nuevo, pero cada pregunta cuenta en el límite diario de lecturas de D1.
 */
const INTERVALO_PANEL_MS = 15_000;
const INTERVALO_PAGOS_MS = 120_000;
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
  const novedades = useNovedades("coach", !servicio.demo);
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);
  const biblioteca = useBibliotecaDelCoach(servicio);
  const [pagos, setPagos] = useState<Pagos>({ disponibles: false, porCliente: new Map() });
  /**
   * Los pagos no van en el 304 de /clientes: preguntarlos en cada refresco
   * periódico era una lectura de D1 cada 15 s con el panel abierto. Se piden al
   * cambiar de pantalla, si cambia la lista de clientes o cada 2 minutos.
   */
  const ultimosPagos = useRef({ clave: "", en: 0 });
  const cargar = useCallback(async (forzarPagos = false) => {
    try {
      const [c, b] = await Promise.all([servicio.listar(), servicio.cambios()]);
      setClientes(c);
      const ids = c.map((x) => x.perfil.id);
      const clave = ids.join("|");
      if (forzarPagos || clave !== ultimosPagos.current.clave || Date.now() - ultimosPagos.current.en > INTERVALO_PAGOS_MS) {
        ultimosPagos.current = { clave, en: Date.now() };
        // Los pagos nunca impiden ver a los clientes: si fallan, sin insignias.
        void servicio.suscripciones
          .listar(ids)
          .then((r) => setPagos({ disponibles: r.pagosDisponibles, porCliente: new Map(r.suscripciones.map((x) => [x.clienteId, x])) }))
          .catch(() => setPagos({ disponibles: false, porCliente: new Map() }));
      }
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
    // Refresco periódico sólo con la pestaña visible, y al volver a ella.
    const f = () => {
      if (!document.hidden) void cargar();
    };
    const t = setInterval(f, INTERVALO_PANEL_MS);
    document.addEventListener("visibilitychange", f);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", f);
    };
  }, [cargar]);
  // Al cambiar de pantalla (cliente recién creado, volver de un borrador) se
  // pregunta ya: no hay que esperar al temporizador. Sin cambios, el servidor contesta 304.
  const { pathname } = useLocation();
  useEffect(() => {
    // La actualización ocurre después de leer el repositorio externo, nunca
    // durante el efecto. El mismo lector atiende publicación y refresco periódico.
    // oxlint-disable-next-line react/set-state-in-effect
    void cargar(true);
  }, [cargar, pathname]);
  return (
    <ContextoPagos.Provider value={pagos}>
    <ContextoBiblioteca.Provider value={biblioteca}>
    <div className="sfm-shell sfm-shell--coach">
      <div className="sfm-brandbar">
        <span className="sfm-coach-wordmark">SANTIAGO FM · COACH</span>
        <div className="sfm-brand-actions">
          {!servicio.demo && <GuiaAyuda base={base} permitirBienvenida={listo && !novedades.pendientes.length} clientes={clientes.length} />}
          {novedades.pendientes.length > 0 && <AvisoNovedades novedades={novedades.pendientes} cerrar={novedades.marcarVistas} />}
        </div>
      </div>
      <main className="sfm-main sfm-main--coach">
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
                actualizar={() => cargar(true)}
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
        {([
          ["", "Hoy", "hoy"],
          ["/clientes", "Clientes", "clientes"],
          ["/biblioteca", "Biblioteca", "biblioteca"],
        ] as const).map(([ruta, label, icon]) => (
          <NavLink end={ruta === ""} key={label} to={base + ruta}>
            <Icono nombre={icon} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
    </ContextoBiblioteca.Provider>
    </ContextoPagos.Provider>
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
  const pagos = usePagos();
  // El filtro vive en la dirección: al quitarlo no debe volver con la recarga
  // ni al reabrir la app instalada en esta pantalla.
  const [parametros, setParametros] = useSearchParams();
  const soloPagos = parametros.get("pagos") === "pendientes";
  const setSoloPagos = (activo: boolean) => {
    const siguientes = new URLSearchParams(parametros);
    if (activo) siguientes.set("pagos", "pendientes");
    else siguientes.delete("pagos");
    setParametros(siguientes, { replace: true });
  };
  const conPagoPendiente = clientes.filter((c) => pagoPendiente(pagos.porCliente.get(c.perfil.id)));
  const visibles = (pagos.disponibles && soloPagos ? conPagoPendiente : clientes).filter((c) =>
    c.perfil.nombre
      .toLocaleLowerCase("es")
      .includes(q.trim().toLocaleLowerCase("es")),
  );
  return (
    <>
      <Cabecera
        titulo="Clientes"
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
      {pagos.disponibles && conPagoPendiente.length > 0 && (
        <button className="sfm-chip" aria-pressed={soloPagos} onClick={() => setSoloPagos(!soloPagos)}>
          Pagos pendientes ({conPagoPendiente.length})
        </button>
      )}
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
          <button className="sfm-text-button" onClick={() => { setQ(""); setSoloPagos(false); }}>
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
  const { ejercicios } = useBiblioteca();
  const c = clientes.find((c) => c.perfil.id === clienteId);
  const [seccion, setSeccion] = useState(() => {
    const pedida = new URLSearchParams(location.search).get("seccion");
    return pedida === "actividad" || pedida === "suscripcion" ? pedida : "programa";
  });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [cambios, setCambios] = useState<Cambio[]>([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enlace, setEnlace] = useState("");
  const [tieneCuenta, setTieneCuenta] = useState<boolean | null>(null);
  const [confirmar, setConfirmar] = useState<"archivar" | "revocar" | null>(
    null,
  );
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const navegar = useNavigate();
  useEffect(() => {
    if (!clienteId) return;
    let vivo = true;
    void servicio.estadoCuenta(clienteId).then((estado) => {
      if (vivo) setTieneCuenta(estado.tieneCuenta);
    }).catch((e) => { if (vivo) setError((e as Error).message); });
    return () => { vivo = false; };
  }, [clienteId, servicio]);
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
    const siVisible = () => {
      if (!document.hidden) void f();
    };
    void f();
    const t = setInterval(siVisible, INTERVALO_PANEL_MS);
    document.addEventListener("visibilitychange", siVisible);
    return () => {
      vivo = false;
      clearInterval(t);
      document.removeEventListener("visibilitychange", siVisible);
    };
  }, [clienteId, servicio]);
  if (!c) return <Esqueleto etiqueta="Abriendo cliente" />;
  const cliente = c;
  const guardado = ultimos(cambios, "plan").find((v) => v.id === "borrador");
  // Publicar no borra el documento del borrador: deja de ofrecerse en cuanto su
  // contenido ya está publicado.
  const borrador =
    guardado && borradorPendiente(guardado.datos as Plan, c.plan)
      ? guardado
      : undefined;
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
        // La revisión es la del documento guardado, exista o no un borrador
        // pendiente: publicar no lo retira del historial.
        publicar ? cliente.revision : (guardado?.revision ?? 0),
        valor,
      );
      setPlan(null);
      setMensaje(
        publicar
          ? "Programa publicado. El cliente lo recibirá automáticamente."
          : "Borrador guardado. El programa actual no ha cambiado.",
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
  async function restablecerClave() {
    setOcupado(true);
    setError("");
    try { setEnlace(await servicio.restablecerClave(cliente.perfil.id)); }
    catch (e) { setError((e as Error).message); }
    finally { setOcupado(false); }
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
      <div className={`sfm-client-detail${plan ? " sfm-client-detail--editing" : ""}`}>
        <Cabecera
          titulo={c.perfil.nombre}
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
        <div className="sfm-segmentos sfm-segmentos--ajustar" aria-label="Ficha del cliente">
          {[
            ["programa", "Programa"],
            ["actividad", "Actividad"],
            ["suscripcion", "Pago"],
            ["perfil", "Perfil"],
          ].map(([key, label]) => (
            <button
              key={key}
              data-tour={`tab-${key}`} data-tour-action={key==='actividad'?'actividad-abierta':key==='perfil'?'perfil-abierto':key==='suscripcion'?'suscripcion-abierta':'programa-abierto'} aria-pressed={seccion === key}
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
                  <h2>Editar programa</h2>
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
                        {contarBloques(d.slots) !== d.slots.length &&
                          `${contarBloques(d.slots)} bloques · `}
                        {d.slots.length} ejercicios ·{" "}
                        {d.slots.reduce((n, s) => n + s.seriesObjetivo, 0)}{" "}
                        series
                      </p>
                      <Icono nombre="flecha" size={20} className="sfm-day-chevron" />
                    </button>
                  ))}
                </div>
                <button
                  className="sfm-primary" data-tour="preparar-plan" data-tour-action="preparar-plan"
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
                    <p>{tieneCuenta
                      ? "Si olvidó su contraseña, prepara un enlace de un solo uso válido por 24 horas."
                      : "La invitación se utiliza una vez para crear su cuenta."}</p>
                  </div>
                  <button
                    className="sfm-secondary"
                    disabled={ocupado || tieneCuenta === null}
                    data-tour="invitar" onClick={() => void (tieneCuenta ? restablecerClave() : invitar())}
                  >
                    {tieneCuenta ? "Preparar enlace para cambiar contraseña" : servicio.demo ? "Probar invitación" : "Preparar invitación"}
                  </button>
                  {servicio.demo && <p className="sfm-hint">Simulación: no da acceso real ni envía mensajes.</p>}
                  {enlace && (
                    <div className="sfm-invitation" data-tour="invitacion">
                      <p>{servicio.demo?"Simulación: no se crea ni se envía ninguna invitación.":"Lista para compartir personalmente."}</p>
                      <CopiarInvitacion enlace={enlace} />
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
        {seccion === "suscripcion" && (
          <SuscripcionCliente
            key={c.perfil.id}
            servicio={servicio.suscripciones}
            clienteId={c.perfil.id}
            alCambiar={() => void actualizar()}
          />
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
                  {ejercicios.map((e) => (
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
function ClienteCreado({ id }: { id: string }) {
  const ayuda = useAyuda();
  return ayuda?.completados.has(`creado:${id}`) ? <Consejo id={`creado:${id}`}><strong>Cliente creado. Su plan está listo.</strong></Consejo> : null;
}
