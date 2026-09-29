import { useState } from "react";
import { useBiblioteca } from "./contextoBiblioteca";
import { HojaEjercicio } from "./HojaEjercicio";
import { Cabecera, ErrorVisible, Hoja, Icono } from "./ui";
import type { EjercicioCoach } from "../../shared/v2/biblioteca";

type HojaAbierta = { tipo: "anadir" } | { tipo: "editar"; ejercicio: EjercicioCoach } | { tipo: "archivar"; ejercicio: EjercicioCoach };

/** Biblioteca del método: las fichas fijas y las que el coach añade («Tuyo»). */
export function BibliotecaCoach() {
  const { ejercicios, propios, servicio, error: errorDeCarga, recargar } = useBiblioteca();
  const [q, setQ] = useState("");
  const [hoja, setHoja] = useState<HojaAbierta | null>(null);
  const [error, setError] = useState("");
  const visibles = ejercicios.filter((e) => e.nombre.toLowerCase().includes(q.toLowerCase()));

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
      <div className="sfm-catalog-grid">
        {visibles.map((e) => {
          const propio = propios.get(e.id);
          return (
            <article className="sfm-exercise-card" key={e.id}>
              <img src={e.imagen} alt="" loading="lazy" />
              <div>
                <small>
                  {propio && <span className="sfm-insignia-tuyo">Tuyo</span>}
                  {e.equipo}
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
