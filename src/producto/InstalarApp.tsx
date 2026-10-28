import { useState } from "react";
import {
  avisarInstalacionDisponible,
  avisoInstalacion,
  enPantallaCompleta,
  plataformaInstalacion,
  type PlataformaInstalacion,
} from "../aplicacion/instalacion";

/** Cerrada una vez, no vuelve a salir en este dispositivo. */
const CLAVE_CERRADA = "sfm-instalar-app:cerrada";

function estabaCerrada(): boolean {
  try {
    return localStorage.getItem(CLAVE_CERRADA) === "1";
  } catch {
    return false;
  }
}

function recordarCerrada(): void {
  try {
    localStorage.setItem(CLAVE_CERRADA, "1");
  } catch {
    // Sin almacenamiento se cierra igual; volverá a salir en la próxima visita.
  }
}

function plataformaVisible(): PlataformaInstalacion | null {
  if (enPantallaCompleta() || estabaCerrada()) return null;
  return plataformaInstalacion(navigator.userAgent, navigator.maxTouchPoints ?? 0);
}

const NOMBRE: Record<PlataformaInstalacion, string> = { ios: "iPhone", android: "Android" };

/**
 * Guía para que el Cliente deje la app en la pantalla de inicio después de
 * abrir la invitación en el navegador. Sólo en teléfono y si aún no la instaló.
 */
export function InstalarApp() {
  const [plataforma, setPlataforma] = useState(plataformaVisible);
  if (!plataforma) return null;
  const aviso = plataforma === "android" ? avisoInstalacion() : null;
  const titulo = `Instala la app en tu ${NOMBRE[plataforma]}`;

  const cerrar = () => {
    recordarCerrada();
    setPlataforma(null);
  };
  const instalar = async () => {
    if (!aviso) return;
    await aviso.prompt();
    const { outcome } = await aviso.userChoice;
    // El aviso de Chrome sólo puede usarse una vez.
    avisarInstalacionDisponible(null);
    if (outcome === "accepted") cerrar();
    else setPlataforma(plataformaVisible);
  };

  return (
    <section className="sfm-instalar" aria-label={titulo}>
      <strong>{titulo}</strong>
      <p>Tendrás el icono de Santiago FM en tu pantalla de inicio y entrarás directo, sin buscar el enlace.</p>
      {plataforma === "ios" ? (
        <ol>
          <li>Toca el botón Compartir (el cuadrado con la flecha hacia arriba).</li>
          <li>Elige «Añadir a pantalla de inicio» y toca Añadir.</li>
        </ol>
      ) : aviso ? null : (
        <ol>
          <li>Toca el menú del navegador (los tres puntos, arriba a la derecha).</li>
          <li>Elige «Instalar app» o «Añadir a pantalla de inicio».</li>
        </ol>
      )}
      {plataforma === "ios" && (
        <p className="sfm-instalar-nota">Si no ves esa opción, copia el enlace de tu invitación y ábrelo en Safari.</p>
      )}
      <div className="sfm-instalar-acciones">
        {aviso && <button className="sfm-primary" onClick={() => void instalar()}>Instalar</button>}
        <button className="sfm-secondary" onClick={cerrar}>Ahora no</button>
      </div>
    </section>
  );
}
