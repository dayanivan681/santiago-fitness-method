import { Esqueleto } from "../componentes/Esqueleto";
import { GuiaAyuda } from "./GuiaAyuda";
import { ProveedorAyudaReal } from "./Ayuda";
import { ConsejoCliente } from "./Ayuda";
import { useMemo, useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router";
import type { Repositorio } from "../datos/repositorio";
import { useLiveQuery } from "../nube/eventos";
import { BIBLIOTECA_INICIAL } from "../datos/semilla/biblioteca";
import { ContextoBiblioteca, type BibliotecaDelCoach } from "./contextoBiblioteca";
import { useMemoria } from "../aplicacion/memoria";
import { EntrenamientoHoy } from "../pantallas/EntrenamientoHoy/EntrenamientoHoy";
import { Entrenamiento } from "../pantallas/EntrenamientoHoy/Entrenamiento";
import { Biblioteca } from "../pantallas/Biblioteca/Biblioteca";
import { ProveedorDescanso } from "../aplicacion/ProveedorDescanso";
import { Descanso } from "../componentes/Descanso";
import type { Musculo } from "../dominio/tipos";
import { ConexionCloud, estadoNube } from "../nube/cloud";
import { Icono } from "./ui";
import { ProgresoCliente, Fotos } from "./Progreso";
import { AvatarCuenta } from "./AvatarCuenta";
import { Recuperacion } from "./Recuperacion";
import { Conflictos } from "./Conflictos";
import { AvisoSuscripcion, MiSuscripcion } from "./SuscripcionCuenta";
import { suscripcionBloquea, useSuscripcion } from "./useSuscripcion";
import "./cliente-ios.css";
export function ClienteApp(props: Parameters<typeof ContenidoCliente>[0]) {
  const { conexion, modo = "real", repo } = props;
  if (modo === "real" && conexion) {
    const ctx = conexion.ctx;
    return <ProveedorAyudaReal key={`${ctx.entorno}:${ctx.rol}:${ctx.identidad}`} contexto={ctx} repo={repo}><ContenidoCliente {...props} /></ProveedorAyudaReal>;
  }
  return <ContenidoCliente {...props} />;
}
function ContenidoCliente({
  repo,
  base,
  conexion,
  modo = "real",
  volver,
}: {
  repo: Repositorio;
  base: string;
  conexion?: ConexionCloud;
  modo?: "real" | "demo" | "preview" | "acompanar";
  volver?: string;
}) {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [retomar, setRetomar] = useState(() =>
    ubicacion.pathname.endsWith("/entrenar"),
  );
  const { resumen: suscripcion, volviendoDePago } = useSuscripcion(
    modo === "real" ? conexion?.api : undefined,
  );
  const bloqueada = suscripcionBloquea(suscripcion);
  const comenzar = () => {
    // Solo lectura: el aviso explica cómo renovar en vez de abrir la sesión.
    if (bloqueada) {
      document.getElementById("suscripcion-aviso")?.focus();
      return;
    }
    setRetomar(true);

    navegar(`${base}/entrenar`);
  };
  const dia = useMemoria<string | null>(null);
  const ejercicio = useMemoria(0);
  const filtro = useMemoria<Musculo | "todos">("todos");
  const [conflictos, setConflictos] = useState(false);
  const participante = useLiveQuery(() => repo.participanteActual(), [repo]);
  const ejerciciosLocales = useLiveQuery(() => repo.listarEjercicios(), [repo]);
  const biblioteca = useMemo<BibliotecaDelCoach>(
    () => ({ ejercicios: ejerciciosLocales?.length ? ejerciciosLocales : BIBLIOTECA_INICIAL, propios: new Map(), error: "", recargar: async () => {} }),
    [ejerciciosLocales],
  );
  if (!participante)
    return <Esqueleto etiqueta="Preparando tu entrenamiento" />;
  const titulo = ubicacion.pathname.endsWith("/biblioteca") ? "Biblioteca"
    : /\/(progreso|historial)$/.test(ubicacion.pathname) ? "Progreso"
    : ubicacion.pathname.endsWith("/perfil") ? "Mi perfil" : "Hoy";
  const atencionNube = Boolean(estadoNube.conflictos || estadoNube.pendientes || !estadoNube.conectado);
  const sincronizacion = conexion && (
    <button
      className={`sfm-sync-state ${atencionNube ? "sfm-sync-state--notice" : "sfm-sync-state--compact"} ${estadoNube.conflictos ? "sfm-sync-state--warning" : ""}`}
      title={!atencionNube ? "Guardado en tu cuenta · Sincronizar" : undefined}
      onClick={() => estadoNube.conflictos ? setConflictos(true) : void conexion.sincronizar()}
    >
      <Icono nombre="nube" size={20} />
      <span>{estadoNube.conflictos
        ? `${estadoNube.conflictos} cambio(s) por revisar`
        : estadoNube.pendientes && estadoNube.suscripcionInactiva
          ? `${estadoNube.pendientes} pendiente(s) · se enviarán al renovar`
          : estadoNube.pendientes ? `${estadoNube.pendientes} pendiente(s) de sincronizar`
            : estadoNube.conectado ? "Guardado en tu cuenta"
              : "Sin conexión · Guardado en este dispositivo"}</span>
    </button>
  );
  return (
    <ContextoBiblioteca.Provider value={biblioteca}>
    <ProveedorDescanso
      clavePersistencia={
        modo === "real" || modo === "acompanar"
          ? `sfm-descanso:${conexion?.ctx.identidad}:${participante.id}`
          : undefined
      }
    >
      <div className="sfm-shell sfm-shell--client">
        {(modo === "preview" || modo === "acompanar" || volver) && (
          <aside className="sfm-modebar" data-tour="modo-preview">
            <span>
              {modo === "preview"
                ? "Vista previa · Simulación sin guardar"
                : modo === "demo"
                  ? "Entrenando juntos · Simulación de demo"
                  : "Entrenando juntos · Registro real"}
            </span>
            <Link data-tour="volver-coach" data-tour-action="volver-coach" to={volver ?? "/admin"}>Volver al Coach</Link>
          </aside>
        )}
        <header className="sfm-client-header">
          <div>
            <h1>{titulo}</h1>
            <p className="sfm-client-wordmark">SANTIAGO FM</p>
          </div>
          <div className="sfm-brand-actions">
          {!atencionNube && sincronizacion}
          {modo === "real" && <GuiaAyuda base={base} permitirBienvenida={!bloqueada} />}
          <Link data-tour="perfil-cliente" data-tour-action="perfil-cliente-abierto" to={`${base}/perfil`} aria-label="Mi perfil">
            <AvatarCuenta nombre={participante.nombre} conexion={conexion} />
          </Link>
          </div>
        </header>
        {atencionNube && sincronizacion}
        <main className="sfm-main sfm-main--client">
          {conexion && modo === "real" && (
            <Recuperacion conexion={conexion} compacto />
          )}
          {conexion && modo === "real" && (
            <AvisoSuscripcion
              resumen={suscripcion}
              api={conexion.api}
              volviendoDePago={volviendoDePago}
            />
          )}
          <Routes>
            <Route
              index
              element={
                <>
                  <p className="sfm-client-greeting">
                    {new Date().toLocaleDateString("es", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })} · Vamos, {participante.nombre.split(" ")[0]}.
                  </p>
                  <EntrenamientoHoy
                    repositorio={repo}
                    memoriaDia={dia}
                    onComenzar={comenzar}
                    consejo={(modo === "demo" || modo === "real") && <ConsejoCliente />}
                  />
                </>
              }
            />
            <Route
              path="entrenar"
              element={
                bloqueada ? <Navigate to={base || "/"} replace /> : <>
                <Entrenamiento
                  repositorio={repo}
                  memoriaDia={dia}
                  memoriaAbierta={ejercicio}
                  consejo={(modo === "demo" || modo === "real") && <ConsejoCliente entrenando />}
                  onSalir={() => {
                    setRetomar(false);
                    navegar(base || "/");
                  }}
                />
                </>
              }
            />
            <Route
              path="biblioteca"
              element={<Biblioteca repositorio={repo} memoriaFiltro={filtro} conCabecera={false} />}
            />
            <Route
              path="progreso"
              element={<ProgresoCliente repo={repo} conexion={conexion} conCabecera={false} />}
            />
            <Route
              path="historial"
              element={<ProgresoCliente repo={repo} conexion={conexion} conCabecera={false} />}
            />
            <Route
              path="perfil"
              element={
                <>
                  <div className="sfm-client-profile">
                    <Link className="sfm-icon-button" to={base || "/"} aria-label="Volver a Hoy"><Icono nombre="volver" /></Link>
                    <h2>{participante.nombre}</h2>
                  </div>
                  <dl className="sfm-profile-data" data-tour="perfil-pagina">
                    <div>
                      <dt>Tu objetivo</dt>
                      <dd>
                        {participante.objetivo || "Por conversar con tu coach"}
                      </dd>
                    </div>
                    <div>
                      <dt>Tu semana</dt>
                      <dd>
                        {participante.frecuenciaEntrenamiento} días de
                        entrenamiento
                      </dd>
                    </div>
                    <div>
                      <dt>A tener en cuenta</dt>
                      <dd>
                        {participante.limitaciones ||
                          "No se han indicado limitaciones"}
                      </dd>
                    </div>
                  </dl>
                  {modo === "real" && conexion && (
                    <details className="sfm-callout">
                      <summary>Mi foto de perfil</summary>
                      <Fotos
                        conexion={conexion}
                        cliente={participante.id}
                        tipo="perfil"
                      />
                    </details>
                  )}
                  {conexion && modo === "real" && (
                    <>
                      <p className="sfm-hint">
                        Tu programa, entrenamientos y progreso se guardan en tu
                        cuenta. Los cambios sin conexión se sincronizan cuando
                        vuelves.
                      </p>
                      <MiSuscripcion resumen={suscripcion} api={conexion.api} />
                      <Recuperacion conexion={conexion} />
                      {conexion.ctx.googleDisponible && !conexion.ctx.googleVinculado && <a className="sfm-secondary" href="/auth/google?origen=enlazar">
                        Conectar Google con esta cuenta
                      </a>}
                      <form
                        method="post"
                        action="/salir"
                        onSubmit={() =>
                          localStorage.removeItem("sfm-v2-contexto")
                        }
                      >
                        <button className="sfm-secondary" type="submit">
                          <Icono nombre="salir" /> Cerrar sesión
                        </button>
                      </form>
                    </>
                  )}
                </>
              }
            />
            <Route
              path="*"
              element={
                <EntrenamientoHoy
                  repositorio={repo}
                  memoriaDia={dia}
                  onComenzar={comenzar}
                />
              }
            />
          </Routes>
        </main>
        <div className="sfm-bottom-composition">
          <Descanso />
          <nav className="sfm-tabbar" aria-label="Navegación del cliente">
            {([
              ["", "Hoy", "hoy"],
              ["/biblioteca", "Biblioteca", "biblioteca"],
              ["/progreso", "Progreso", "progreso"],
            ] as const).map(([ruta, label, icon]) => (
              <NavLink data-tour={ruta==="/progreso"?"nav-progreso":ruta==="/biblioteca"?"nav-biblioteca":undefined} data-tour-action={ruta==="/progreso"?"progreso-abierto":ruta==="/biblioteca"?"biblioteca-abierta":undefined}
                key={label}
                end={ruta === ""}
                to={
                  ruta === "" && retomar
                    ? `${base}/entrenar`
                    : base + ruta || "/"
                }
                className={({ isActive }) =>
                  isActive ||
                  (ruta === "" &&
                    [base || "/", `${base}/entrenar`].includes(
                      ubicacion.pathname,
                    ))
                    ? "active"
                    : ""
                }
              >
                <Icono nombre={icon} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        {conflictos && conexion && (
          <Conflictos conexion={conexion} cerrar={() => setConflictos(false)} />
        )}
      </div>
    </ProveedorDescanso>
    </ContextoBiblioteca.Provider>
  );
}
