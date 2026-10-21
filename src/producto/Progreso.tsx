import { Esqueleto } from "../componentes/Esqueleto";
import { useEffect, useState } from "react";
import { segunCantidad } from "../logica/plural";
import type { Cambio } from "../../shared/v2/contratos";
import type { Repositorio } from "../datos/repositorio";
import { fechaDeHoy } from "../datos/repositorio";
import type {
  RegistroDeProgreso,
  SerieRegistrada,
  Sesion,
} from "../dominio/tipos";
import { useLiveQuery } from "../nube/eventos";
import { ClienteApi, type ConexionCloud } from "../nube/cloud";
import { useBiblioteca } from "./contextoBiblioteca";
import { GraficaProgreso } from "../componentes/GraficaProgreso";
import { ejercicioMasReciente, puntosDeProgreso } from "../logica/progresoGrafica";
import { Historial } from "../pantallas/Historial/Historial";
import { Cabecera, ErrorVisible, FechaBonita, Hoja, Icono, Vacio } from "./ui";
import { ultimos } from "./servicio";
import { ETIQUETA_CARGA, etiquetaCarga } from "../dominio/etiquetas";
import { Importaciones } from "./Importaciones";
export function ProgresoCliente({
  repo,
  conexion,
  conCabecera = true,
}: {
  repo: Repositorio;
  conexion?: ConexionCloud;
  conCabecera?: boolean;
}) {
  const [seccion, setSeccion] = useState("historial");
  const [agregar, setAgregar] = useState(false);
  const [peso, setPeso] = useState("");
  const [cintura, setCintura] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [porEjercicio, setPorEjercicio] = useState(false);
  const datos = useLiveQuery(async () => {
    const p = await repo.participanteActual();
    if (!p) return null;
    const [sesiones, medidas] = await Promise.all([
      repo.listarSesiones(p.id),
      repo.listarProgreso(p.id),
    ]);
    return { p, sesiones, medidas };
  }, [repo]);
  if (!datos) return <Esqueleto etiqueta="Preparando tu progreso" />;
  async function guardar() {
    if (!datos) return;
    setOcupado(true);
    try {
      const medidas = {
        ...(peso ? { pesoCorporalLb: Number(peso) } : {}),
        ...(cintura ? { cinturaPulgadas: Number(cintura) } : {}),
      };
      if (
        !Object.keys(medidas).length ||
        Object.values(medidas).some(
          (v) => !Number.isFinite(v) || v <= 0 || v > 1000,
        )
      )
        throw Error("Indica al menos una medida válida.");
      await repo.guardarProgreso({
        id: crypto.randomUUID(),
        participanteId: datos.p.id,
        fecha: fechaDeHoy(),
        medidas,
        tieneFoto: false,
      });
      setAgregar(false);
      setPeso("");
      setCintura("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }
  return (
    <>
      {conCabecera && <Cabecera titulo="Progreso" />}
      {conexion && <Importaciones api={conexion.api} />}
      <div className="sfm-metrics sfm-metrics--two">
        <div>
          <strong>{datos.sesiones.filter((s) => s.completadaEn).length}</strong>
          <span>
            {segunCantidad(
              datos.sesiones.filter((s) => s.completadaEn).length,
              "Entrenamiento completado",
              "Entrenamientos completados",
            )}
          </span>
        </div>
        <div>
          <strong>{datos.medidas.length}</strong>
          <span>{segunCantidad(datos.medidas.length, "Registro de medidas", "Registros de medidas")}</span>
        </div>
      </div>
      <div className="sfm-segmentos">
        {[
          ["historial", "Historial"],
          ["medidas", "Medidas"],
          ["fotos", "Fotos"],
        ].map(([id, t]) => (
          <button
            key={id}
            aria-pressed={id === seccion}
            onClick={() => setSeccion(id)}
          >
            {t}
          </button>
        ))}
      </div>
      {seccion === "historial" && (
        <>
          <div className="sfm-section-heading">
            <h2>{porEjercicio ? "Por ejercicio" : "Tu recorrido"}</h2>
            <button
              className="sfm-text-button"
              onClick={() => setPorEjercicio(!porEjercicio)}
            >
              {porEjercicio ? "Ver sesiones" : "Por ejercicio"}
            </button>
          </div>
          {porEjercicio ? (
            <Historial repositorio={repo} />
          ) : (
            <ListaSesiones
              sesiones={datos.sesiones}
              obtenerSeries={(id) => repo.listarSeriesDeSesion(id)}
            />
          )}
        </>
      )}
      {seccion === "medidas" && (
        <>
          <div className="sfm-section-heading">
            <h2>Un punto de referencia</h2>
            <button
              className="sfm-icon-button"
              aria-label="Añadir medidas"
              onClick={() => setAgregar(true)}
            >
              <Icono nombre="mas" />
            </button>
          </div>
          {!datos.medidas.length ? (
            <Vacio
              titulo="El progreso tiene muchas formas"
              detalle="Registra las medidas que quieras seguir. Cada dato es opcional."
              accion={
                <button
                  className="sfm-secondary"
                  onClick={() => setAgregar(true)}
                >
                  Añadir primer registro
                </button>
              }
            />
          ) : (
            <ListaMedidas registros={datos.medidas} />
          )}
        </>
      )}
      {seccion === "fotos" && (
        <Fotos conexion={conexion} cliente={datos.p.id} />
      )}
      {agregar && (
        <Hoja titulo="Registrar medidas" cerrar={() => setAgregar(false)}>
          <p className="sfm-hint">Anota sólo lo que mediste hoy.</p>
          <label className="sfm-field">
            <span>Peso corporal · lb</span>
            <input
              inputMode="decimal"
              type="number"
              min="1"
              max="1000"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />
          </label>
          <label className="sfm-field">
            <span>Cintura · pulgadas</span>
            <input
              inputMode="decimal"
              type="number"
              min="1"
              max="200"
              value={cintura}
              onChange={(e) => setCintura(e.target.value)}
            />
          </label>
          <ErrorVisible error={error} />
          <button
            className="sfm-primary"
            disabled={ocupado}
            onClick={() => void guardar()}
          >
            {ocupado ? "Guardando…" : "Guardar medidas"}
          </button>
        </Hoja>
      )}
    </>
  );
}
export function ListaMedidas({
  registros,
}: {
  registros: RegistroDeProgreso[];
}) {
  const labels: Record<string, string> = {
    pesoCorporalLb: "Peso · lb",
    cinturaPulgadas: "Cintura · pulg",
    pechoPulgadas: "Pecho · pulg",
    brazoPulgadas: "Brazo · pulg",
    musloPulgadas: "Muslo · pulg",
  };
  return (
    <div className="sfm-list">
      {[...registros]
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
        .map((r) => (
          <article className="sfm-measure-row" key={r.id}>
            <time>
              <FechaBonita fecha={r.fecha} />
            </time>
            <div>
              {Object.entries(r.medidas).map(([k, v]) => (
                <span key={k}>
                  <small>{labels[k]}</small>
                  <strong>{v}</strong>
                </span>
              ))}
            </div>
          </article>
        ))}
    </div>
  );
}
export function ResumenSesiones({
  cambios,
  cliente,
  api,
}: {
  cambios: Cambio[];
  cliente: string;
  api?: ClienteApi;
}) {
  const [seccion, setSeccion] = useState("sesiones");
  const sesiones = ultimos(cambios, "entrenamiento").map(
    (c) => c.datos as Sesion,
  );
  const series = ultimos(cambios, "serie").map(
    (c) => c.datos as SerieRegistrada,
  );
  const medidas = ultimos(cambios, "progreso").map(
    (c) => c.datos as RegistroDeProgreso,
  );
  return (
    <>
      <div className="sfm-section-heading">
        <h2>Su historia de progreso</h2>
      </div>
      <div className="sfm-segmentos sfm-segmentos--ajustar">
        {["sesiones", "ejercicios", "medidas", "fotos"].map((id) => (
          <button
            key={id}
            aria-pressed={seccion === id}
            onClick={() => setSeccion(id)}
          >
            {id === "sesiones"
              ? "Sesiones"
              : id === "ejercicios"
                ? "Por ejercicio"
              : id === "medidas"
                ? "Medidas"
                : "Fotos compartidas"}
          </button>
        ))}
      </div>
      {seccion === "ejercicios" && <ProgresoPorEjercicioCoach key={cliente} sesiones={sesiones} series={series} />}
      {seccion === "sesiones" && (
        <ListaSesiones
          sesiones={sesiones}
          obtenerSeries={async (id) => series.filter((s) => s.sesionId === id)}
        />
      )}{" "}
      {seccion === "medidas" &&
        (medidas.length ? (
          <ListaMedidas registros={medidas} />
        ) : (
          <Vacio
            titulo="Aún no hay medidas"
            detalle="Los registros del cliente aparecerán aquí cuando se sincronicen."
          />
        ))}
      {seccion === "fotos" && <Fotos cliente={cliente} apiCoach={api} />}
      {api && <Importaciones api={api} />}
    </>
  );
}
/** El coach recibe el historial sincronizado; no necesita abrir una sesión de cliente. */
function ProgresoPorEjercicioCoach({ sesiones, series }: { sesiones: Sesion[]; series: SerieRegistrada[] }) {
  const { ejercicios } = useBiblioteca();
  const [elegido, elegir] = useState<string | null>(null);
  const entrenados = ejercicios.filter(e => series.some(s => s.ejercicioId === e.id)).sort((a,b) => a.nombre.localeCompare(b.nombre, 'es'));
  // Sin elección, el último entrenado: la fecha de su sesión y, en empate, la serie más tardía.
  const fechaDe = new Map(sesiones.map(s => [s.id, s.fecha]));
  const reciente = ejercicioMasReciente(series.map(s => ({ ...s, fecha: fechaDe.get(s.sesionId) ?? '' })));
  const ejercicio = entrenados.find(e => e.id === (elegido ?? reciente)) ?? entrenados[0];
  if (!ejercicio) return <p className="aviso">Todavía no hay entrenamientos registrados.</p>;
  const sesionesDelEjercicio = sesiones.map(s => ({
    fecha: s.fecha, dia: s.prescripcion?.nombre, sinTerminar: !s.completadaEn,
    series: series.filter(serie => serie.sesionId === s.id && serie.ejercicioId === ejercicio.id).map(serie => ({...serie, fecha:s.fecha})),
  })).filter(s => s.series.length > 0);
  return <>
    <nav className="filtros" aria-label="Ejercicio del historial">
      {entrenados.map(e => <button key={e.id} type="button" className={e.id === ejercicio.id ? 'filtro filtro--activo' : 'filtro'} aria-pressed={e.id === ejercicio.id} onClick={() => elegir(e.id)}>{e.nombre}</button>)}
    </nav>
    <GraficaProgreso key={ejercicio.id} puntos={puntosDeProgreso(sesionesDelEjercicio, ejercicio)} />
    <ListaSesiones sesiones={sesiones.filter(s => sesionesDelEjercicio.some(h => h.series.some(serie => serie.sesionId === s.id)))} obtenerSeries={async id => series.filter(s => s.sesionId === id && s.ejercicioId === ejercicio.id)} />
  </>;
}

function ListaSesiones({
  sesiones,
  obtenerSeries,
}: {
  sesiones: Sesion[];
  obtenerSeries: (id: string) => Promise<SerieRegistrada[]>;
}) {
  const { ejercicios } = useBiblioteca();
  const equipoDe = (id: string) => ejercicios.find((e) => e.id === id)?.equipo;
  const [detalle, setDetalle] = useState<{
    sesion: Sesion;
    series: SerieRegistrada[];
  } | null>(null);
  return (
    <>
      {!sesiones.length ? (
        <Vacio
          titulo="Todavía no ha entrenado"
          detalle="Cuando registre su primera sesión, aparecerá aquí con cada serie y sus correcciones."
        />
      ) : (
        <div className="sfm-list">
          {[...sesiones]
            .sort((a, b) => b.fecha.localeCompare(a.fecha))
            .map((s) => (
              <button
                data-tour="sesion-historial" className="sfm-row sfm-history-row"
                key={s.id}
                onClick={() =>
                  void obtenerSeries(s.id).then((series) =>
                    {setDetalle({ sesion: s, series });},
                  )
                }
              >
                <span className="sfm-date-tile">
                  <strong>{Number(s.fecha.slice(-2))}</strong>
                  <small>
                    {new Date(s.fecha + "T12:00:00").toLocaleDateString("es", {
                      month: "short",
                    })}
                  </small>
                </span>
                <span className="sfm-row-body">
                  <strong>{s.prescripcion?.nombre ?? "Entrenamiento"}</strong>
                  <small>
                    {s.completadaEn ? "Completado" : "En curso"} ·{" "}
                    {s.fecha.slice(0, 4)}
                  </small>
                </span>
                <Icono nombre="flecha" />
              </button>
            ))}
        </div>
      )}
      {detalle && (
        <Hoja
          titulo={detalle.sesion.prescripcion?.nombre ?? "Entrenamiento"}
          cerrar={() => {setDetalle(null);}}
        >
          <p className="sfm-hint" data-tour="detalle-historial">
            <FechaBonita fecha={detalle.sesion.fecha} /> ·{" "}
            {detalle.series.filter((s) => !s.esCalentamiento).length} series de
            trabajo
          </p>
          {[...new Set(detalle.series.map((s) => s.ejercicioId))].map((id) => (
            <section className="sfm-session-exercise" key={id}>
              <h3>
                {ejercicios.find((e) => e.id === id)?.nombre ??
                  "Variante histórica"}
              </h3>
              {detalle.series
                .filter((s) => s.ejercicioId === id)
                .sort((a, b) => a.numeroSerie - b.numeroSerie)
                .map((s) => (
                  <div className="sfm-set-history" key={s.id}>
                    <span>{s.numeroSerie}</span>
                    <strong>
                      {s.pesoRegistradoLb}{" "}
                      <small>
                        {s.carga?.tipoCarga === "porLado" ? "lb/lado" : "lb"}
                      </small>{" "}
                      × {s.repsRealizadas}
                    </strong>
                    <small>
                      RIR {s.rir}
                      {s.esCalentamiento ? " · Calent." : ""}
                      {s.carga ? ` · ${equipoDe(id) ? etiquetaCarga(s.carga.tipoCarga, equipoDe(id)!) : ETIQUETA_CARGA[s.carga.tipoCarga]}` : ""}
                    </small>
                    {s.correcciones?.length ? (
                      <details>
                        <summary>
                          {s.correcciones.length} corrección(es)
                        </summary>
                        {s.correcciones.map((c, i) => (
                          <p key={i}>
                            {c.pesoRegistradoLb}{" "}
                            {s.carga?.tipoCarga === "porLado"
                              ? "lb/lado"
                              : "lb"}{" "}
                            × {c.repsRealizadas} · RIR {c.rir} ·{" "}
                            {new Date(c.corregidaEn).toLocaleDateString("es")}
                          </p>
                        ))}
                      </details>
                    ) : null}
                  </div>
                ))}
            </section>
          ))}
          <p className="sfm-hint">
            Para corregir una serie, abre el historial por ejercicio. Cada
            corrección conserva los valores anteriores.
          </p>
        </Hoja>
      )}
    </>
  );
}
type Medio = {
  id: string;
  registro_id: string;
  tipo: string;
  compartido_coach: number;
  creado_en: number;
};
export function Fotos({
  conexion,
  cliente,
  apiCoach: apiCoachProp,
  tipo = "progreso",
}: {
  conexion?: ConexionCloud;
  cliente: string;
  apiCoach?: ClienteApi;
  tipo?: "perfil" | "progreso";
}) {
  // Acompañar un entrenamiento conserva el rol Coach y sus permisos de lectura.
  const apiCoach = apiCoachProp ?? (conexion?.ctx.rol === "coach" ? conexion.api : undefined);
  const [fotos, setFotos] = useState<Medio[]>([]);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [consentir, setConsentir] = useState(false);
  const [compartir, setCompartir] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const habilitado = conexion?.ctx.medios || !!apiCoach;
  useEffect(() => {
    if (!habilitado) return;
    const api = apiCoach ?? conexion!.api;
    let vivo = true;
    const cargar = () => {
      if (!document.hidden)
        void api
          .pedir<{ medios: Medio[] }>("/medios")
          .then((r) => {
            if (vivo)
              setFotos(
                r.medios
                  .filter((f) => f.tipo === tipo)
                  .sort((a, b) => b.creado_en - a.creado_en),
              );
          })
          .catch((e) => {
            if (vivo) setError(e.message);
          });
    };
    cargar();
    const timer = setInterval(cargar, 4000);
    return () => {
      vivo = false;
      clearInterval(timer);
    };
  }, [habilitado, apiCoach, conexion, mensaje, tipo]);
  async function subir() {
    if (!archivo || !conexion || !consentir) return;
    setOcupado(true);
    setError("");
    try {
      await conexion.encolarFoto(archivo, compartir, {
        tipo,
        ...(tipo === "perfil" ? { registro: cliente } : {}),
      });
      setMensaje(
        "Foto guardada. Se subirá de forma privada cuando haya conexión.",
      );
      setArchivo(null);
      setConsentir(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }
  return (
    <>
      <p className="sfm-hint">
        {apiCoach
          ? "Sólo se muestran las fotografías que esta persona ha elegido compartir contigo."
          : "Tus fotos son privadas. Tú eliges si las compartes con tu coach."}
      </p>
      <ErrorVisible error={error} />
      {mensaje && (
        <p className="sfm-success" role="status">
          {mensaje}
        </p>
      )}
      <div className="sfm-photos">
        {(tipo === "perfil" ? fotos.slice(0, 1) : fotos).map((f) => (
          <figure key={f.id}>
            <img
              src={`${apiCoach ? "/admin/api/v2" : "/api/v2"}/medios/${f.id}${apiCoach ? "?cliente=" + encodeURIComponent(cliente) : ""}`}
              alt={
                tipo === "perfil"
                  ? "Tu foto de perfil"
                  : "Fotografía de progreso"
              }
              loading="lazy"
            />
            {!apiCoach && (
              <label className="sfm-check">
                <input
                  type="checkbox"
                  checked={!!f.compartido_coach}
                  onChange={(e) => {
                    const v = e.target.checked;
                    void conexion!.api
                      .pedir(`/medios/${f.id}`, { compartido: v }, "PATCH")
                      .then(() =>
                        setFotos(
                          fotos.map((m) =>
                            m.id === f.id
                              ? { ...m, compartido_coach: v ? 1 : 0 }
                              : m,
                          ),
                        ),
                      )
                      .catch((e) => setError(e.message));
                  }}
                />
                <span>Compartir con mi coach</span>
              </label>
            )}
          </figure>
        ))}
      </div>
      {!fotos.length && (
        <Vacio
          titulo={
            apiCoach
              ? "Sin fotos compartidas"
              : "Un registro visual, a tu ritmo"
          }
          detalle={
            apiCoach
              ? "Aparecerán aquí sólo cuando el cliente lo autorice."
              : "Puedes acompañar tus medidas con fotografías privadas."
          }
        />
      )}
      {!apiCoach && (
        <>
          {habilitado ? (
            <>
              <label className="sfm-secondary sfm-file">
                Elegir fotografía
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    setArchivo(e.target.files?.[0] ?? null);
                    setError("");
                  }}
                />
              </label>
              {archivo && (
                <div className="sfm-callout">
                  <strong>{archivo.name}</strong>
                  <label className="sfm-check">
                    <input
                      type="checkbox"
                      checked={consentir}
                      onChange={(e) => setConsentir(e.target.checked)}
                    />
                    <span>
                      Guardar esta foto en mi cuenta privada en la nube.
                    </span>
                  </label>
                  <label className="sfm-check">
                    <input
                      type="checkbox"
                      checked={compartir}
                      onChange={(e) => setCompartir(e.target.checked)}
                    />
                    <span>Compartir también con mi coach.</span>
                  </label>
                  <button
                    className="sfm-primary"
                    disabled={!consentir || ocupado}
                    onClick={() => void subir()}
                  >
                    Guardar fotografía
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="sfm-hint">
              {conexion
                ? "Tu almacenamiento privado todavía no está disponible."
                : "La demo no guarda fotografías personales. En tu cuenta privada podrás añadirlas y elegir con quién compartirlas."}
            </p>
          )}
        </>
      )}
    </>
  );
}
