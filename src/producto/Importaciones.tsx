import { useEffect, useState } from "react";
import type { ClienteApi } from "../nube/cloud";
import { useBiblioteca } from "./contextoBiblioteca";
import { describirRegistro } from "./descripcionRegistro";
import { ErrorVisible, FechaBonita, Hoja } from "./ui";
type Recibo = {
  hash: string;
  fecha: number;
  nombre: string;
  verificados: number;
  esperados: number;
  pendientes: number;
  completo: boolean;
};
type Registro = {
  tipo: string;
  id: string;
  original: unknown;
  actual: unknown;
  revision: number;
  revisado: boolean;
};

export function Importaciones({ api }: { api: ClienteApi }) {
  const { ejercicios } = useBiblioteca();
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [abierto, setAbierto] = useState<Recibo | null>(null);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  useEffect(() => {
    let vivo = true;
    void api
      .pedir<{ importaciones: Recibo[] }>("/importaciones")
      .then((r) => {
        if (vivo) setRecibos(r.importaciones);
      })
      .catch((e) => {
        if (vivo) setError(e.message);
      });
    return () => {
      vivo = false;
    };
  }, [api, abierto]);
  async function abrir(r: Recibo) {
    setError("");
    setOcupado(true);
    try {
      const v = await api.pedir<{ registros: Registro[] }>(
        `/importaciones?lote=${r.hash}`,
      );
      setRegistros(v.registros);
      setAbierto(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }
  async function conservar(r: Registro) {
    if (!abierto) return;
    setOcupado(true);
    setError("");
    try {
      await api.pedir("/importaciones", {
        lote: abierto.hash,
        tipo: r.tipo,
        id: r.id,
        revision: r.revision,
        decision: "conservar-actual",
      });
      setRegistros((v) =>
        v.map((a) =>
          a.id === r.id && a.tipo === r.tipo ? { ...a, revisado: true } : a,
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }
  return (
    <>
      <ErrorVisible error={abierto ? "" : error} />
      {!!recibos.length && (
        <section className="sfm-section">
          <h2>Historial recuperado</h2>
          <p className="sfm-hint">
            Los originales permanecen archivados en tu cuenta.
          </p>
          {recibos.map((r) => (
            <button
              className="sfm-row"
              key={r.hash}
              disabled={ocupado}
              onClick={() => void abrir(r)}
            >
              <span className="sfm-row-body">
                <strong>{r.nombre}</strong>
                <small>
                  <FechaBonita
                    fecha={new Date(r.fecha).toISOString().slice(0, 10)}
                  />{" "}
                  · {r.verificados}/{r.esperados} coincidencias verificadas
                </small>
                <small>
                  {!r.completo ? "Importación pendiente · Retómala desde tu perfil" : r.pendientes
                    ? `${r.pendientes} registros por revisar`
                    : "Revisión completa"}
                </small>
              </span>
            </button>
          ))}
        </section>
      )}
      {abierto && (
        <Hoja
          titulo="Revisar el historial recuperado"
          cerrar={() => setAbierto(null)}
        >
          <p>
            Compara el respaldo con tu cuenta. Si necesitas corregir una serie,
            hazlo desde el historial por ejercicio: conservará los valores
            anteriores. La revisión nunca elimina el respaldo.
          </p>
          <ErrorVisible error={error} />
          {registros.length === 0 && (
            <p className="sfm-success">
              Todos los registros coinciden con la copia conservada.
            </p>
          )}
          {registros.map((r) => {
            const d = r.original as { ejercicioId?: string; fecha?: string };
            const ejercicio = ejercicios.find(
              (e) =>
                e.id ===
                (d.ejercicioId ?? (r.tipo === "calibracion" ? r.id : "")),
            );
            return (
              <article className="sfm-conflict" key={r.tipo + r.id}>
                <h3>
                  {ejercicio?.nombre ??
                    (r.tipo === "entrenamiento"
                      ? "Entrenamiento anterior"
                      : "Registro anterior")}
                </h3>
                <dl className="sfm-profile-data">
                  <div>
                    <dt>En el respaldo</dt>
                    <dd>{describirRegistro(r.original)}</dd>
                  </div>
                  <div>
                    <dt>En la cuenta</dt>
                    <dd>{describirRegistro(r.actual)}</dd>
                  </div>
                </dl>
                {r.revisado ? (
                  <p className="sfm-success">
                    Revisado · Original conservado en la nube
                  </p>
                ) : (
                  <button
                    className="sfm-secondary"
                    disabled={ocupado}
                    onClick={() => void conservar(r)}
                  >
                    {r.actual
                      ? "Conservar la versión actual"
                      : "Conservar sólo en el archivo original"}
                  </button>
                )}
              </article>
            );
          })}
        </Hoja>
      )}
    </>
  );
}
