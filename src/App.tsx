import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import {
  BrowserRouter,
  Navigate,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import type { Contexto } from "../shared/v2/contratos";
import {
  ClienteApi,
  ConexionCloud,
  ErrorAcceso,
  estadoCambiar,
  estadoNube,
  type Inicio,
} from "./nube/cloud";
import { RepositorioMemoria } from "./nube/memoria";
import { instalarRepositorio } from "./aplicacion/repositorio";
import { BIBLIOTECA_INICIAL } from "./datos/semilla/biblioteca";
import { detectarLegado } from "./nube/legado";
import { useRevision } from "./nube/eventos";
const Coach = lazy(() =>
  import("./producto/Coach").then((m) => ({ default: m.Coach })),
);
const ClienteApp = lazy(() =>
  import("./producto/Cliente").then((m) => ({ default: m.ClienteApp })),
);
import { Marca, Icono, ErrorVisible } from "./producto/ui";
import { ServicioCoach, ultimos } from "./producto/servicio";
import type {
  Participante,
  SerieRegistrada,
  Sesion,
  RegistroDeProgreso,
  Sustitucion,
  BorradorDeSerie,
} from "./dominio/tipos";
import "./producto/producto.css";
export function App() {
  return (
    <RecuperarPantalla>
      <BrowserRouter>
        <InicioDePantalla />
        <Suspense
          fallback={
            <div className="sfm-launch">
              <Marca />
              <p role="status">Preparando tu espacio…</p>
            </div>
          }
        >
          <Routes>
            <Route path="/demo/*" element={<Demo />} />
            <Route path="/admin/*" element={<CoachReal />} />
            <Route path="*" element={<ClienteReal />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </RecuperarPantalla>
  );
}
function InicioDePantalla() {
  const { pathname } = useLocation();
  useLayoutEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, [pathname]);
  return null;
}
function Puerta({ error = "" }: { error?: string }) {
  return (
    <div className="sfm-door">
      <Marca />
      <span className="sfm-door-rule" />
      <p className="sfm-eyebrow">Tu entrenamiento. Tu proceso.</p>
      <h1>
        El siguiente paso
        <br />
        es tuyo.
      </h1>
      <p>
        Entra con la invitación privada de tu coach para continuar tu programa.
      </p>
      <ErrorVisible error={error} />
      <Link className="sfm-primary" to="/demo">
        Explorar el método <Icono nombre="flecha" />
      </Link>
      <a className="sfm-text-button" href="/admin">
        Acceso del Coach
      </a>
      <a className="sfm-door-about" href="/presentacion">
        Conoce Santiago Fitness Method
      </a>
    </div>
  );
}
function ClienteReal() {
  const [conexion, setConexion] = useState<ConexionCloud | null>(null);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState("");
  useRevision();
  useEffect(() => {
    let vivo = true;
    let actual: ConexionCloud | undefined;
    void (async () => {
      try {
        const inicio = await new ClienteApi().pedir<Inicio>("/inicio");
        if (!inicio.perfil) throw Error("Tu coach está preparando tu perfil.");
        if (!vivo) return;
        await detectarLegado();
        estadoCambiar({ bloqueado: false });
        actual = new ConexionCloud(inicio.contexto);
        await actual.preparar(inicio);
        if (vivo) {
          instalarRepositorio(actual.repositorio);
          setConexion(actual);
        } else actual.limpiar();
      } catch (e) {
        if (!(e instanceof ErrorAcceso) && !navigator.onLine) {
          try {
            const ctx = JSON.parse(
              localStorage.getItem("sfm-v2-contexto") ?? "null",
            ) as Contexto | null;
            if (
              ctx &&
              ctx.rol === "cliente" &&
              Date.now() < Math.min(ctx.expiraEn, ctx.validadoEn + 86400000)
            ) {
              estadoCambiar({ bloqueado: false });
              actual = new ConexionCloud(ctx);
              await actual.preparar();
              if (vivo) {
                instalarRepositorio(actual.repositorio);
                setConexion(actual);
              } else actual.limpiar();
            }
          } catch {
            setError("No se pudo recuperar la cuenta en este dispositivo.");
          }
        } else if (!(e instanceof ErrorAcceso)) setError((e as Error).message);
      } finally {
        if (vivo) setListo(true);
      }
    })();
    return () => {
      vivo = false;
      actual?.limpiar();
    };
  }, []);
  if (!listo)
    return (
      <div className="sfm-launch">
        <Marca />
        <p role="status">Preparando tu espacio…</p>
      </div>
    );
  if (!conexion || estadoNube.bloqueado) return <Puerta error={error} />;
  return <ClienteApp repo={conexion.repositorio} base="" conexion={conexion} />;
}
function CoachReal() {
  const [servicio] = useState(() => new ServicioCoach());
  const nav = useNavigate();
  return (
    <Routes>
      <Route
        path="vista/:clienteId/*"
        element={<ClienteDesdeCoach servicio={servicio} baseCoach="/admin" />}
      />
      <Route
        path="acompanar/:clienteId/*"
        element={
          <ClienteDesdeCoach servicio={servicio} baseCoach="/admin" real />
        }
      />
      <Route
        path="*"
        element={
          <Coach
            servicio={servicio}
            base="/admin"
            preview={(c) => nav(`/admin/vista/${c.perfil.id}`)}
            entrenar={(c) => nav(`/admin/acompanar/${c.perfil.id}`)}
          />
        }
      />
    </Routes>
  );
}
function Demo() {
  const [servicio] = useState(() => new ServicioCoach(true));
  const loc = useLocation();
  const nav = useNavigate();
  const coach = loc.pathname.includes("/coach");
  return (
    <>
      <aside className="sfm-demo-banner">
        <strong>DEMO</strong>
        <span>Datos ficticios · Nada se guarda</span>
        <Link to={coach ? "/demo/cliente" : "/demo/coach"}>
          {coach ? "Ver Cliente" : "Ver Coach"}{" "}
          <Icono nombre="flecha" size={14} />
        </Link>
      </aside>
      <Routes>
        <Route index element={<Navigate to="/demo/cliente" replace />} />
        <Route
          path="coach/vista/:clienteId/*"
          element={
            <ClienteDesdeCoach servicio={servicio} baseCoach="/demo/coach" />
          }
        />
        <Route
          path="coach/acompanar/:clienteId/*"
          element={
            <ClienteDesdeCoach
              servicio={servicio}
              baseCoach="/demo/coach"
              real
            />
          }
        />
        <Route
          path="coach/*"
          element={
            <Coach
              servicio={servicio}
              base="/demo/coach"
              preview={(c) => nav(`/demo/coach/vista/${c.perfil.id}`)}
              entrenar={(c) => nav(`/demo/coach/acompanar/${c.perfil.id}`)}
            />
          }
        />
        <Route path="cliente/*" element={<ClienteDemo servicio={servicio} />} />
        <Route path="*" element={<ClienteDemo servicio={servicio} />} />
      </Routes>
    </>
  );
}
function ClienteDemo({ servicio }: { servicio: ServicioCoach }) {
  const [repo, setRepo] = useState<RepositorioMemoria | null>(null);
  useEffect(() => {
    let vivo = true;
    void servicio.repoDemo("demo-persona-1").then((r) => {
      if (vivo) {
        instalarRepositorio(r);
        setRepo(r);
      }
    });
    return () => {
      vivo = false;
    };
  }, [servicio]);
  return repo ? (
    <ClienteApp repo={repo} base="/demo/cliente" modo="demo" />
  ) : (
    <p className="sfm-loading">Preparando la demo…</p>
  );
}
function ClienteDesdeCoach({
  servicio,
  baseCoach,
  real = false,
}: {
  servicio: ServicioCoach;
  baseCoach: string;
  real?: boolean;
}) {
  const { clienteId } = useParams();
  const [repo, setRepo] = useState<RepositorioMemoria | ConexionCloud | null>(
    null,
  );
  const [error, setError] = useState("");
  const base = `${baseCoach}/${real ? "acompanar" : "vista"}/${clienteId}`;
  useEffect(() => {
    let vivo = true;
    let cloud: ConexionCloud | undefined;
    void (async () => {
      if (real && !servicio.demo) {
        const api = new ClienteApi(true, clienteId);
        const inicio = await api.pedir<Inicio>("/inicio");
        estadoCambiar({ bloqueado: false });
        cloud = new ConexionCloud(inicio.contexto, clienteId);
        await cloud.preparar(inicio);
        if (vivo) {
          instalarRepositorio(cloud.repositorio);
          setRepo(cloud);
        } else cloud.limpiar();
        return;
      }
      const cliente = (await servicio.listar()).find(
        (c) => c.perfil.id === clienteId,
      );
      if (!cliente) throw Error("Cliente no disponible");
      if (real && servicio.demo) {
        const memoria = await servicio.repoDemo(cliente.perfil.id);
        if (vivo) {
          instalarRepositorio(memoria);
          setRepo(memoria);
        }
        return;
      }
      const r = new RepositorioMemoria(cliente.perfil.id);
      await r.guardarParticipante({
        ...cliente.perfil,
        notas: "",
      } as unknown as Participante);
      for (const e of BIBLIOTECA_INICIAL) await r.guardarEjercicio(e);
      for (const d of cliente.plan.dias) await r.guardarPlantilla(d);
      const cambios = await servicio.cambios(clienteId);
      for (const s of ultimos(cambios, "entrenamiento"))
        await r.crearSesion(s.datos as Sesion);
      for (const s of ultimos(cambios, "serie"))
        await r.registrarSerie(s.datos as SerieRegistrada);
      for (const s of ultimos(cambios, "progreso"))
        await r.guardarProgreso(s.datos as RegistroDeProgreso);
      for (const s of ultimos(cambios, "sustitucion"))
        await r.guardarSustitucion(s.datos as Sustitucion);
      for (const s of ultimos(cambios, "borrador"))
        await r.guardarBorrador(s.datos as BorradorDeSerie);
      for (const s of ultimos(cambios, "calibracion")) {
        const e = await r.obtenerEjercicio(s.id);
        if (e) await r.guardarEjercicio({ ...e, ...(s.datos as object) });
      }
      if (vivo) {
        instalarRepositorio(r);
        setRepo(r);
      }
    })().catch((e) => setError(e.message));
    return () => {
      vivo = false;
      cloud?.limpiar();
    };
  }, [servicio, clienteId, real]);
  if (error)
    return (
      <div className="sfm-shell">
        <ErrorVisible error={error} />
        <Link to={baseCoach}>Volver al Coach</Link>
      </div>
    );
  return repo ? (
    <ClienteApp
      repo={repo instanceof ConexionCloud ? repo.repositorio : repo}
      base={base}
      conexion={repo instanceof ConexionCloud ? repo : undefined}
      modo={real ? (servicio.demo ? "demo" : "acompanar") : "preview"}
      volver={`${baseCoach}/clientes/${clienteId}`}
    />
  ) : (
    <p className="sfm-loading">Preparando la vista del cliente…</p>
  );
}

class RecuperarPantalla extends Component<
  { children: ReactNode },
  { fallo: boolean }
> {
  state = { fallo: false };
  static getDerivedStateFromError() {
    return { fallo: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("SFM render", error.message, info.componentStack);
  }
  render() {
    return this.state.fallo ? (
      <div className="sfm-door">
        <Marca />
        <h1>Volvamos a tu espacio.</h1>
        <p>
          No se pudo abrir esta pantalla. Tus registros guardados y los cambios
          pendientes se conservan.
        </p>
        <button className="sfm-primary" onClick={() => location.reload()}>
          Volver a abrir
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
