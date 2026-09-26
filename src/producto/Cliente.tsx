import { GuiaAyuda } from "./GuiaAyuda";
import { ProveedorAyudaReal } from "./Ayuda";
import { ConsejoCliente } from "./Ayuda";
import { useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router";
import type { Repositorio } from "../datos/repositorio";
import { useLiveQuery } from "../nube/eventos";
import { useMemoria } from "../aplicacion/memoria";
import { EntrenamientoHoy } from "../pantallas/EntrenamientoHoy/EntrenamientoHoy";
import { Entrenamiento } from "../pantallas/EntrenamientoHoy/Entrenamiento";
import { Biblioteca } from "../pantallas/Biblioteca/Biblioteca";
import { ProveedorDescanso } from "../aplicacion/ProveedorDescanso";
import { Descanso } from "../componentes/Descanso";
import type { Musculo } from "../dominio/tipos";
import { ConexionCloud, estadoNube } from "../nube/cloud";
import { Cabecera, Icono, Marca } from "./ui";
import { ProgresoCliente, Fotos } from "./Progreso";
import { AvatarCuenta } from "./AvatarCuenta";
import { Recuperacion } from "./Recuperacion";
import { Conflictos } from "./Conflictos";
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
  const comenzar = () => {
    setRetomar(true);

    navegar(`${base}/entrenar`);
  };
  const dia = useMemoria<string | null>(null);
  const ejercicio = useMemoria(0);
  const filtro = useMemoria<Musculo | "todos">("todos");
  const [conflictos, setConflictos] = useState(false);
  const participante = useLiveQuery(() => repo.participanteActual(), [repo]);
  if (!participante)
    return <p className="sfm-loading">Preparando tu entrenamiento…</p>;
  return (
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
        <div className="sfm-brandbar">
          <Marca />
          <div className="sfm-brand-actions">
          {modo === "real" && <GuiaAyuda base={base} />}
          <Link data-tour="perfil-cliente" data-tour-action="perfil-cliente-abierto" to={`${base}/perfil`} aria-label="Mi perfil">
            <AvatarCuenta nombre={participante.nombre} conexion={conexion} />
          </Link>
          </div>
        </div>
        {conexion && (
          <button
            className={`sfm-sync-state ${estadoNube.conflictos ? "sfm-sync-state--warning" : ""}`}
            onClick={() =>
              estadoNube.conflictos
                ? setConflictos(true)
                : void conexion.sincronizar()
            }
          >
            <Icono nombre="nube" size={15} />
            <span>
              {estadoNube.conflictos
                ? `${estadoNube.conflictos} cambio(s) por revisar`
                : estadoNube.pendientes
                  ? `${estadoNube.pendientes} pendiente(s) de sincronizar`
                  : estadoNube.conectado
                    ? "Guardado en tu cuenta"
                    : "Sin conexión · Guardado en este dispositivo"}
            </span>
          </button>
        )}
        <main className="sfm-main sfm-main--client">
          {conexion && modo === "real" && (
            <Recuperacion conexion={conexion} compacto />
          )}
          <Routes>
            <Route
              index
              element={
                <>
                  <Cabecera
                    titulo={`Vamos, ${participante.nombre.split(" ")[0]}.`}
                    kicker={new Date().toLocaleDateString("es", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  />
                  {(modo === "demo" || modo === "real") && <ConsejoCliente />}
                  <EntrenamientoHoy
                    repositorio={repo}
                    memoriaDia={dia}
                    onComenzar={comenzar}
                  />
                </>
              }
            />
            <Route
              path="entrenar"
              element={
                <>
                {(modo === "demo" || modo === "real") && <ConsejoCliente entrenando />}
                <Entrenamiento
                  repositorio={repo}
                  memoriaDia={dia}
                  memoriaAbierta={ejercicio}
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
              element={<Biblioteca repositorio={repo} memoriaFiltro={filtro} />}
            />
            <Route
              path="progreso"
              element={<ProgresoCliente repo={repo} conexion={conexion} />}
            />
            <Route
              path="historial"
              element={<ProgresoCliente repo={repo} conexion={conexion} />}
            />
            <Route
              path="perfil"
              element={
                <>
                  <Cabecera
                    titulo={participante.nombre}
                    kicker="Tu cuenta"
                    volver={base || "/"}
                  />
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
                      <Recuperacion conexion={conexion} />
                      {conexion.ctx.googleDisponible && <a className="sfm-secondary" href="/auth/google?origen=enlazar">
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
            {[
              ["", "Hoy", "hoy"],
              ["/biblioteca", "Biblioteca", "biblioteca"],
              ["/progreso", "Progreso", "progreso"],
            ].map(([ruta, label, icon]) => (
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
  );
}
