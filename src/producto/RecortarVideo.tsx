import { useEffect, useState } from "react";
import { abrirVideo, ErrorVideo, GIF_DURACION_MAX_S, tramoValido, videoAGif, type Velocidad } from "../datos/videoAGif";
import { ErrorVisible } from "./ui";

const DURACIONES = [2, 3, GIF_DURACION_MAX_S] as const;

/**
 * Elegir el tramo de un vídeo y convertirlo en GIF sin salir de la app.
 * Pensado para una persona mayor: tres decisiones con valores ya puestos
 * (dónde empieza, cuánto dura, normal o lenta) y un botón.
 */
export function RecortarVideo({
  archivo,
  listo,
  cancelar,
}: {
  archivo: Blob;
  listo: (resultado: { gif: Blob; fija: Blob }) => void;
  cancelar: () => void;
}) {
  const [url, setUrl] = useState("");
  const [duracionVideo, setDuracionVideo] = useState<number | null>(null);
  const [inicio, setInicio] = useState(0);
  const [duracion, setDuracion] = useState(3);
  const [velocidad, setVelocidad] = useState<Velocidad>("normal");
  const [progreso, setProgreso] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const u = URL.createObjectURL(archivo);
    // oxlint-disable-next-line react/set-state-in-effect
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [archivo]);

  const tramo = duracionVideo ? tramoValido(inicio, duracion, duracionVideo) : { inicio, duracion };
  const maxInicio = duracionVideo ? Math.max(0, duracionVideo - tramo.duracion) : 0;

  async function crear() {
    setError("");
    setProgreso(0);
    let cerrar = () => {};
    try {
      const abierto = await abrirVideo(archivo);
      cerrar = abierto.cerrar;
      const resultado = await videoAGif(abierto.video, { ...tramo, velocidad }, setProgreso);
      listo(resultado);
    } catch (e) {
      setError(
        e instanceof ErrorVideo
          ? `${e.message} Prueba con otro vídeo grabado con la cámara del teléfono.`
          : "No pudimos crear el GIF. Prueba con otro vídeo.",
      );
      setProgreso(null);
    } finally {
      cerrar();
    }
  }

  const creando = progreso !== null;
  return (
    <div className="sfm-recortar-video">
      <ErrorVisible error={error} />
      {url && (
        <video
          className="sfm-recortar-video__vista"
          // «#t=0.001»: Safari de iOS enseña el primer cuadro en vez de un recuadro negro.
          src={`${url}#t=0.001`}
          muted
          playsInline
          controls
          preload="metadata"
          aria-label="Vídeo elegido"
          onLoadedMetadata={(e) => setDuracionVideo(e.currentTarget.duration || null)}
        />
      )}
      <label className="sfm-field">
        <span>Empieza en el segundo {tramo.inicio.toFixed(1)}</span>
        <input
          type="range"
          min={0}
          max={maxInicio}
          step={0.1}
          value={tramo.inicio}
          disabled={creando || !maxInicio}
          onChange={(e) => {
            setInicio(Number(e.target.value));
            const vista = e.currentTarget.closest(".sfm-recortar-video")?.querySelector("video");
            if (vista) vista.currentTime = Number(e.target.value);
          }}
        />
      </label>
      <fieldset className="sfm-field">
        <legend>Duración</legend>
        <div className="sfm-segmentos">
          {DURACIONES.map((d) => (
            <button key={d} type="button" aria-pressed={duracion === d} disabled={creando} onClick={() => setDuracion(d)}>
              {d} s
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="sfm-field">
        <legend>Velocidad</legend>
        <div className="sfm-segmentos">
          {(["normal", "lenta"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={velocidad === v} disabled={creando} onClick={() => setVelocidad(v)}>
              {v === "normal" ? "Normal" : "Lenta"}
            </button>
          ))}
        </div>
      </fieldset>
      {creando && (
        <p className="sfm-hint" role="status">
          Creando GIF… {Math.round((progreso ?? 0) * 100)} %
        </p>
      )}
      <button type="button" className="sfm-primary" disabled={creando} onClick={() => void crear()}>
        Crear GIF
      </button>
      <button type="button" className="sfm-secondary" disabled={creando} onClick={cancelar}>
        Cancelar
      </button>
    </div>
  );
}
