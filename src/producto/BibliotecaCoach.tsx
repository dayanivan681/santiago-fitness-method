import { useState } from "react";
import { useBiblioteca } from "./contextoBiblioteca";
import { ETIQUETA_EQUIPO, ETIQUETA_MUSCULO } from "./etiquetasBiblioteca";
import { useMemoria } from "../aplicacion/memoria";
import { normalizarBusqueda } from "../logica/busqueda";
import type { Equipo, Musculo } from "../dominio/tipos";
import { HojaEjercicio } from "./HojaEjercicio";
import { Cabecera, ErrorVisible, Hoja, Icono } from "./ui";
import type { EjercicioCoach } from "../../shared/v2/biblioteca";

const TODOS = "todos" as const;

type HojaAbierta = { tipo: "anadir" } | { tipo: "editar"; ejercicio: EjercicioCoach } | { tipo: "archivar"; ejercicio: EjercicioCoach };

/** Biblioteca del método: las fichas fijas y las que el coach añade («Tuyo»). */
export function BibliotecaCoach() {
  const { ejercicios, propios, servicio, error: errorDeCarga, recargar } = useBiblioteca();
  const [q, setQ] = useState("");
  const [hoja, setHoja] = useState<HojaAbierta | null>(null);
  const [error, setError] = useState("");
  const { valor: musculo, recordar: setMusculo } = useMemoria<Musculo | typeof TODOS>(TODOS);
  const { valor: equipo, recordar: setEquipo } = useMemoria<Equipo | typeof TODOS>(TODOS);
  const musculos = [...new Set(ejercicios.map((e) => e.musculoPrimario))].sort((a, b) =>
    ETIQUETA_MUSCULO[a].localeCompare(ETIQUETA_MUSCULO[b], "es"),
  );
  const equipos = [...new Set(ejercicios.map((e) => e.equipo))].sort((a, b) =>
    ETIQUETA_EQUIPO[a].localeCompare(ETIQUETA_EQUIPO[b], "es"),
  );
  const termino = normalizarBusqueda(q);
  // Como en la biblioteca del cliente: quien escribe busca en todo; los filtros son para explorar.
  const visibles = termino
    ? ejercicios.filter((e) => normalizarBusqueda(e.nombre).includes(termino))
    : ejercicios.filter(
        (e) => (musculo === TODOS || e.musculoPrimario === musculo) && (equipo === TODOS || e.equipo === equipo),
      );

  async function archivar(e: EjercicioCoach) {
    try {
      await servicio?.archivar(e.id);
      await recargar();
      setHoja(null);
    } catch (falla) {
      setError((falla as Error).message);
    }
  }

  return (
    <>
      <Cabecera titulo="Conoce cada variante." kicker="Biblioteca del método" />
      <ErrorVisible error={error || errorDeCarga} />
      <button className="sfm-primary" onClick={() => setHoja({ tipo: "anadir" })}>
        <Icono nombre="mas" /> Añadir ejercicio
      </button>
      <input
        className="sfm-search"
        aria-label="Buscar en biblioteca"
        placeholder="Buscar ejercicio"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <nav
        className={termino ? "filtros filtro--en-pausa" : "filtros"}
        aria-label="Filtrar por músculo"
        aria-disabled={termino ? true : undefined}
      >
        {([TODOS, ...musculos] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={musculo === m ? "filtro filtro--activo" : "filtro"}
            aria-pressed={musculo === m}
            onClick={() => setMusculo(m)}
          >
            {m === TODOS ? "Todos" : ETIQUETA_MUSCULO[m]}
          </button>
        ))}
      </nav>
      <label className={termino ? "filtro-equipo filtro--en-pausa" : "filtro-equipo"} aria-disabled={termino ? true : undefined}>
        <span>Equipo</span>
        <select value={equipo} onChange={(e) => setEquipo(e.target.value as Equipo | typeof TODOS)}>
          <option value={TODOS}>Todos</option>
          {equipos.map((e) => (
            <option key={e} value={e}>
              {ETIQUETA_EQUIPO[e]}
            </option>
          ))}
        </select>
      </label>
      {termino && <p className="aviso-busqueda">Buscando en toda la biblioteca</p>}
      <p className="sfm-hint">{visibles.length} ejercicios</p>
      <div className="sfm-catalog-grid">
        {visibles.map((e) => {
          const propio = propios.get(e.id);
          return (
            <article className="sfm-exercise-card" key={e.id}>
              <img src={e.imagen} alt="" loading="lazy" />
              <div>
                <small>
                  {propio && <span className="sfm-insignia-tuyo">Tuyo</span>}
                  {ETIQUETA_EQUIPO[e.equipo]}
                </small>
                <h2>{e.nombre}</h2>
                <p>{e.explicacionCorta}</p>
                {propio && (
                  <div className="sfm-card-actions">
                    <button className="sfm-text-button" onClick={() => setHoja({ tipo: "editar", ejercicio: propio })}>
                      Editar
                    </button>
                    <button className="sfm-text-button" onClick={() => setHoja({ tipo: "archivar", ejercicio: propio })}>
                      Archivar
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {hoja?.tipo === "anadir" && <HojaEjercicio cerrar={() => setHoja(null)} />}
      {hoja?.tipo === "editar" && <HojaEjercicio editando={hoja.ejercicio} cerrar={() => setHoja(null)} />}
      {hoja?.tipo === "archivar" && (
        <Hoja titulo="Archivar ejercicio" cerrar={() => setHoja(null)}>
          <p>
            «{hoja.ejercicio.nombre}» dejará de aparecer para elegirlo en programas nuevos. Sus registros y los programas que
            ya lo usan se conservan.
          </p>
          <button className="sfm-primary" onClick={() => void archivar(hoja.ejercicio)}>
            Archivar
          </button>
          <button className="sfm-secondary" onClick={() => setHoja(null)}>
            Volver
          </button>
        </Hoja>
      )}
    </>
  );
}
