import type { Novedad } from "./notas-novedades";
import { Hoja } from "./ui";

/** Hoja de novedades tras una actualización; ver `useNovedades`. */
export function AvisoNovedades({ novedades, cerrar }: { novedades: readonly Novedad[]; cerrar: () => void }) {
  return (
    <Hoja titulo="Novedades" cerrar={cerrar} clase="sfm-novedades">
      {novedades.map((n) => (
        <section key={n.id} className="sfm-novedad">
          <h3>{n.titulo}</h3>
          <ul>
            {n.puntos.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </section>
      ))}
      <button className="sfm-primary" onClick={cerrar}>Entendido</button>
    </Hoja>
  );
}
