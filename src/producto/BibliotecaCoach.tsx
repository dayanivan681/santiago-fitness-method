import { useState } from "react";
import { useBiblioteca } from "./contextoBiblioteca";
import { HojaEjercicio as FormularioEjercicio } from "./HojaEjercicio";
import { HojaEjercicio as Ficha } from "../pantallas/Biblioteca/HojaEjercicio";
import { ListaBiblioteca } from "../pantallas/Biblioteca/ListaBiblioteca";
import { Cabecera, ErrorVisible, Hoja, Icono } from "./ui";
import type { Ejercicio } from "../dominio/tipos";
import type { EjercicioCoach } from "../../shared/v2/biblioteca";

/**
 * Lo que hay abierto encima de la lista. La ficha se guarda por id: tras editar
 * se vuelve a leer de la biblioteca recargada y enseña los datos nuevos.
 */
type HojaAbierta =
  | { tipo: "ficha"; id: string }
  | { tipo: "anadir" }
  | { tipo: "editar"; ejercicio: EjercicioCoach }
  | { tipo: "archivar"; ejercicio: EjercicioCoach };

/**
 * Biblioteca del método: las fichas fijas y las que el coach añade («Tuyo»).
 *
 * La misma lista y la misma ficha que ve el cliente. Editar y archivar viven
 * sólo dentro de la ficha de un ejercicio propio: en la lista quedaban al
 * alcance de un toque accidental.
 */
export function BibliotecaCoach() {
  const { ejercicios, propios, servicio, error: errorDeCarga, recargar } = useBiblioteca();
  const [hoja, setHoja] = useState<HojaAbierta | null>(null);
  const [error, setError] = useState("");
  const esPropio = (e: Ejercicio) => propios.has(e.id);
  const ficha = hoja?.tipo === "ficha" ? ejercicios.find((e) => e.id === hoja.id) : undefined;
  const abrir = (e: Ejercicio) => setHoja({ tipo: "ficha", id: e.id });

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
      <ListaBiblioteca
        ejercicios={ejercicios}
        alAbrir={abrir}
        esPropio={esPropio}
        insignias={(e) => {
          const propio = propios.get(e.id);
          if (!propio) return null;
          return (
            <>
              <span className="sfm-insignia-tuyo">Tuyo</span>
              {propio.tieneAnimacion && <span className="sfm-insignia-gif">GIF</span>}
            </>
          );
        }}
        detalleSinResultados="Revisa cómo está escrito o crea uno con «Añadir ejercicio»."
      />
      {ficha && (
        <Ficha
          ejercicio={ficha}
          biblioteca={ejercicios}
          onElegir={abrir}
          onCerrar={() => setHoja(null)}
          acciones={<AccionesDeFicha propio={propios.get(ficha.id)} abrir={setHoja} />}
        />
      )}
      {hoja?.tipo === "anadir" && <FormularioEjercicio cerrar={() => setHoja(null)} />}
      {hoja?.tipo === "editar" && (
        <FormularioEjercicio
          editando={hoja.ejercicio}
          // Guardar o volver: se regresa a la ficha, ya con los datos nuevos.
          cerrar={() => setHoja({ tipo: "ficha", id: hoja.ejercicio.id })}
        />
      )}
      {hoja?.tipo === "archivar" && (
        <Hoja titulo="Archivar ejercicio" cerrar={() => setHoja({ tipo: "ficha", id: hoja.ejercicio.id })}>
          <p>
            «{hoja.ejercicio.nombre}» dejará de aparecer para elegirlo en programas nuevos. Sus registros y los programas que
            ya lo usan se conservan.
          </p>
          <button className="sfm-primary" onClick={() => void archivar(hoja.ejercicio)}>
            Archivar
          </button>
          <button className="sfm-secondary" onClick={() => setHoja({ tipo: "ficha", id: hoja.ejercicio.id })}>
            Volver
          </button>
        </Hoja>
      )}
    </>
  );
}

/** Editar y archivar sólo en lo propio; las fichas del método explican por qué no. */
function AccionesDeFicha({ propio, abrir }: { propio?: EjercicioCoach; abrir: (hoja: HojaAbierta) => void }) {
  if (!propio) {
    return (
      <p className="nota">
        Ficha del método: no se puede editar. Si quieres otra versión, crea una con «Añadir ejercicio».
      </p>
    );
  }
  return (
    <>
      <button className="sfm-secondary" onClick={() => abrir({ tipo: "editar", ejercicio: propio })}>
        Editar
      </button>
      <button className="sfm-text-button sfm-text-button--peligro" onClick={() => abrir({ tipo: "archivar", ejercicio: propio })}>
        Archivar
      </button>
    </>
  );
}
