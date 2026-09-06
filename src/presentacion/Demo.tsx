import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCapa } from "../aplicacion/useCapa";
import { DIAS_DEMO, BIBLIOTECA_DEMO } from "./datos";
import { ProveedorDescanso } from "../aplicacion/ProveedorDescanso";
import { useControlDescanso } from "../aplicacion/contextoDescanso";
import { Cabecera } from "../componentes/Cabecera";
import { Descanso } from "../componentes/Descanso";
import {
  IconoHoy,
  IconoBiblioteca,
  IconoHistorial,
  IconoPerfil,
} from "../componentes/IconosNavegacion";
import { CuerpoEjercicio } from "../pantallas/EntrenamientoHoy/CuerpoEjercicio";
import { HojaEjercicio } from "../pantallas/Biblioteca/HojaEjercicio";
import { NOMBRE_MUSCULO, etiquetaEquipo } from "../dominio/etiquetas";
import type { Ejercicio, SerieRegistrada } from "../dominio/tipos";
import type { NuevaSerie } from "../aplicacion/useEntrenamiento";
import { aplicarCorreccion, deshacerCorreccion } from "../logica/correccion";

const TABS = [
  { id: "hoy", nombre: "Hoy", Icono: IconoHoy },
  { id: "biblioteca", nombre: "Biblioteca", Icono: IconoBiblioteca },
  { id: "historial", nombre: "Historial", Icono: IconoHistorial },
  { id: "perfil", nombre: "Perfil", Icono: IconoPerfil },
] as const;

export function Demo() {
  return (
    <ProveedorDescanso>
      <DemoCliente />
    </ProveedorDescanso>
  );
}

function DemoCliente() {
  const [tab, setTab] = useState("hoy");
  const [dia, setDia] = useState(0);
  const [ficha, setFicha] = useState<Ejercicio | null>(null);
  const [filtro, setFiltro] = useState("todos");
  const [series, setSeries] = useState<SerieRegistrada[]>([]);
  const [terminados, setTerminados] = useState<string[]>([]);
  const [variantes, setVariantes] = useState<Record<string, string>>({});
  const [cambiando, setCambiando] = useState<number | null>(null);
  const { arrancar, declararBarraDeSesion } = useControlDescanso();
  const actual = DIAS_DEMO[dia];
  const idsVisibles = actual.ejercicios.map(({ ejercicio }, index) => variantes[`${actual.slug}:${index}`] ?? ejercicio.id);
  const hechas = series.filter((serie) => serie.sesionId === actual.slug && idsVisibles.includes(serie.ejercicioId));
  const total = actual.slots.reduce(
    (sum, slot) => sum + slot.seriesObjetivo,
    0,
  );
  const enCurso = hechas.length > 0 && !terminados.includes(actual.slug);
  const barra = enCurso && tab === "hoy";
  useEffect(() => {
    declararBarraDeSesion(barra);
  }, [barra, declararBarraDeSesion]);

  async function guardar(
    ejercicioId: string,
    numeroSerie: number,
    valores: NuevaSerie,
    descanso: number,
  ) {
    const id = `${actual.slug}:${ejercicioId}:${numeroSerie}`;
    setSeries((prev) =>
      prev.some((s) => s.id === id)
        ? prev
        : [
            ...prev,
            {
              ...valores,
              id,
              sesionId: actual.slug,
              ejercicioId,
              numeroSerie,
            },
          ],
    );
    if (!valores.esCalentamiento) arrancar(ejercicioId, descanso);
  }

  return (
    <div className="app demo-app">
      <p className="demo-indicator">
        Datos de demostración · se borran al recargar
      </p>
      {/* Keeping these panels mounted preserves drafts without any persistent storage. */}
      <section hidden={tab !== "hoy"}>
        <Cabecera
          kicker={actual.nombre}
          titulo="Entrenamiento de hoy"
          meta={`${hechas.length}/${total} series`}
        />
        <div className={barra ? "contenido contenido--con-barra" : "contenido"}>
          <nav className="filtros" aria-label="Día de entrenamiento">
            {DIAS_DEMO.map((day, index) => (
              <button
                key={day.slug}
                className={`filtro ${index === dia ? "filtro--activo" : ""}`}
                aria-pressed={index === dia}
                onClick={() => {
                  setDia(index);
                }}
              >
                {day.nombre}
              </button>
            ))}
          </nav>
          <div className="portada portada--compacta" style={{ marginTop: 12 }}>
            <div className="portada__pie">
              <div className="portada__dia">{actual.nombre}</div>
              <div className="portada__lema">Disciplina = Resultados</div>
            </div>
          </div>
          <div className="pila" style={{ marginTop: 12 }}>
            {/* La app enseña un ejercicio a la vez desde M2, y la presentación
                tiene que parecerse a la app: aquí se muestra el primero. */}
            {actual.ejercicios.slice(0, 1).map(({ slot, ejercicio: asignado }, index) => {
              const ejercicio =
                BIBLIOTECA_DEMO.find(
                  (e) => e.id === variantes[`${actual.slug}:${index}`],
                ) ?? asignado;
              const equivalentes = BIBLIOTECA_DEMO.filter(
                (e) => e.movimiento === ejercicio.movimiento,
              );
              return (
                <CuerpoEjercicio
                  key={`${actual.slug}:${ejercicio.id}`}
                  item={{
                    slot,
                    ejercicio,
                    rango: { min: slot.repMin, max: slot.repMax },
                    referencias: {
                      ejercicioId: ejercicio.id,
                      ultimaSesion: [],
                    },
                    sugerencia: { tipo: "sinReferencia" },
                    seriesDeHoy: hechas.filter(
                      (s) => s.ejercicioId === ejercicio.id,
                    ),
                    variantes: equivalentes,
                    soloHoy: ejercicio.id !== asignado.id,
                    ejercicioDeLaPlantillaId: asignado.id,
                  }}
                  onAbrirFicha={() => setFicha(ejercicio)}
                  onAbrirVariantes={() => setCambiando(index)}
                  onDescansar={() =>
                    arrancar(ejercicio.id, slot.descansoSegundos)
                  }
                  onGuardarSerie={(id, numero, valores) =>
                    guardar(id, numero, valores, slot.descansoSegundos)
                  }
                  onCorregirSerie={async (serie, valores) => {
                    setSeries((prev) =>
                      prev.map((s) =>
                        s.id === serie.id ? aplicarCorreccion(s, valores) : s,
                      ),
                    );
                  }}
                  onDeshacerCorreccion={async (serie) => {
                    setSeries((prev) =>
                      prev.map((s) =>
                        s.id === serie.id ? deshacerCorreccion(s) : s,
                      ),
                    );
                  }}
                />
              );
            })}
          </div>
          {terminados.includes(actual.slug) && (
            <p className="nota nota--hecho">
              Sesión terminada. Lo registrado ya está en el historial de esta
              demo.
            </p>
          )}
          <p className="nota">
            La app no impone el peso. Ajusta lo que realmente hiciste antes de
            guardar.
          </p>
        </div>
      </section>
      <section hidden={tab !== "biblioteca"}>
        <Cabecera
          kicker="Ejercicios del método"
          titulo="Biblioteca"
          meta={`${BIBLIOTECA_DEMO.length} ejercicios`}
        />
        <div className="contenido">
          <nav className="filtros" aria-label="Filtrar por músculo">
            {[
              "todos",
              ...new Set(BIBLIOTECA_DEMO.map((e) => e.musculoPrimario)),
            ].map((m) => (
              <button
                key={m}
                className={`filtro ${filtro === m ? "filtro--activo" : ""}`}
                aria-pressed={filtro === m}
                onClick={() => setFiltro(m)}
              >
                {m === "todos"
                  ? "Todos"
                  : NOMBRE_MUSCULO[m as keyof typeof NOMBRE_MUSCULO]}
              </button>
            ))}
          </nav>
          <div className="rejilla" style={{ marginTop: 12 }}>
            {BIBLIOTECA_DEMO.filter(
              (e) => filtro === "todos" || e.musculoPrimario === filtro,
            )
              .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
              .map((e) => (
                <button
                  className="ficha"
                  key={e.id}
                  onClick={() => setFicha(e)}
                >
                  <img
                    className="ficha__imagen"
                    src={e.imagen}
                    alt=""
                    loading="lazy"
                  />
                  <div className="ficha__cuerpo">
                    <h2 className="ficha__nombre">{e.nombre}</h2>
                    <span className="ficha__equipo">
                      {etiquetaEquipo(e.equipo)}
                    </span>
                    <p className="ficha__pista">{e.explicacionCorta}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </section>
      <section hidden={tab !== "historial"}>
        <Cabecera kicker="Historial por variante" titulo="Progreso" />
        <div className="contenido">
          <p className="nota">
            Este resumen contiene sólo las series que guardes en la
            demostración. No incluye entrenamientos anteriores.
          </p>
          {series.length === 0 ? (
            <p className="aviso">Todavía no hay entrenamientos registrados.</p>
          ) : (
            DIAS_DEMO.filter((day) =>
              series.some((s) => s.sesionId === day.slug),
            ).map((day) => (
              <article className="demo-history" key={day.slug}>
                <h2>{day.nombre}</h2>
                <p>
                  {terminados.includes(day.slug)
                    ? "Sesión terminada"
                    : "En curso"}{" "}
                  · Hoy, en esta demo
                </p>
                {series
                  .filter((s) => s.sesionId === day.slug)
                  .map((s) => {
                    const e = BIBLIOTECA_DEMO.find(
                      (item) => item.id === s.ejercicioId,
                    )!;
                    return (
                      <p key={s.id}>
                        {e.nombre}
                        <br />
                        <strong>
                          Serie {s.numeroSerie} · {s.pesoRegistradoLb} lb
                          {e.tipoCarga === "porLado" ? "/lado" : ""} ×{" "}
                          {s.repsRealizadas} · RIR {s.rir === 5 ? "5+" : s.rir}
                        </strong>
                        {s.esCalentamiento && " · Calentamiento"}
                      </p>
                    );
                  })}
              </article>
            ))
          )}
        </div>
      </section>
      <section hidden={tab !== "perfil"}>
        <Cabecera kicker="Tu perfil" titulo="Perfil" />
        <div className="contenido">
          <div className="demo-history">
            <h2>Datos de demostración</h2>
            <p>
              El perfil real muestra los datos, objetivo, frecuencia,
              limitaciones y notas configurados por el coach.
            </p>
            <p>
              También permite registrar medidas y fotos de progreso, y consultar
              el volumen semanal.
            </p>
            <p>Consulta la captura real de Perfil en la presentación.</p>
            <a className="demo-access" href="/" target="_top">
              Ir al acceso real
            </a>
          </div>
          <p className="nota">Esta demo no inicia ni cierra una sesión real.</p>
        </div>
      </section>
      {barra && (
        <div
          className="progreso-sesion"
          role="group"
          aria-label="Progreso de la sesión y cierre"
        >
          <div
            className="progreso-sesion__medidor"
            role="progressbar"
            aria-label="Progreso de la sesión"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={hechas.length}
          >
            <span
              className="progreso-sesion__relleno"
              style={{ width: `${(hechas.length / total) * 100}%` }}
            />
            <span className="progreso-sesion__texto">
              {hechas.length} de {total} series
            </span>
          </div>
          <button
            className="progreso-sesion__terminar"
            onClick={() =>
              setTerminados((prev) => [...new Set([...prev, actual.slug])])
            }
          >
            Terminar sesión
          </button>
        </div>
      )}
      <nav className="pestanas" aria-label="Secciones">
        {TABS.map(({ id, nombre, Icono }) => (
          <button
            key={id}
            className={`pestanas__boton ${tab === id ? "pestanas__boton--activo" : ""}`}
            aria-current={tab === id ? "page" : undefined}
            onClick={() => setTab(id)}
          >
            <Icono className="pestanas__icono" />
            <span className="pestanas__etiqueta">{nombre}</span>
          </button>
        ))}
      </nav>
      <Descanso />
      {ficha && (
        <HojaEjercicio
          ejercicio={ficha}
          biblioteca={BIBLIOTECA_DEMO}
          onElegir={setFicha}
          onCerrar={() => setFicha(null)}
        />
      )}
      {cambiando !== null && (
        <HojaDemo onCerrar={() => setCambiando(null)}>
            <p className="nota">
              Cambio temporal dentro de esta demo. Cada variante conserva sus
              series.
            </p>
            {BIBLIOTECA_DEMO.filter(
              (e) =>
                e.movimiento ===
                actual.ejercicios[cambiando].ejercicio.movimiento,
            ).map((e) => (
              <button
                className="variante"
                key={e.id}
                onClick={() => {
                  setVariantes((prev) => ({
                    ...prev,
                    [`${actual.slug}:${cambiando}`]: e.id,
                  }));
                  setCambiando(null);
                }}
              >
                {e.nombre}
              </button>
            ))}
        </HojaDemo>
      )}
    </div>
  );
}

function HojaDemo({ onCerrar, children }: { onCerrar: () => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const cerrar = useCapa(true, onCerrar, panel);
  return <div className="hoja" role="dialog" aria-modal="true" aria-label="Variantes de demostración">
    <button className="hoja__fondo" aria-label="Cerrar tocando fuera" onClick={cerrar} />
    <div className="hoja__panel" ref={panel} tabIndex={-1}>
      <div className="hoja__cabecera"><h2 className="hoja__titulo">Cambiar variante · Sólo hoy</h2><button className="hoja__cerrar" onClick={cerrar}>Cerrar</button></div>
      {children}
    </div>
  </div>;
}
