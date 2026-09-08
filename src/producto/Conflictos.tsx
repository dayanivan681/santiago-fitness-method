import { useState } from "react";
import { useLiveQuery } from "../nube/eventos";
import type { ConexionCloud } from "../nube/cloud";
import { BIBLIOTECA_INICIAL } from "../datos/semilla/biblioteca";
import { ErrorVisible, Hoja } from "./ui";
import { describirRegistro } from "./descripcionRegistro";

export function Conflictos({
  conexion,
  cerrar,
}: {
  conexion: ConexionCloud;
  cerrar: () => void;
}) {
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const registros = useLiveQuery(async () => {
    const conflictos = await conexion.db.cola
      .where("estado")
      .equals("conflicto")
      .toArray();
    return Promise.all(
      conflictos.map(async (o) => {
        const todas = await conexion.db.cola
          .where("clave")
          .equals(o.clave)
          .sortBy("secuencia");
        return {
          o,
          local: todas.at(-1) ?? o,
          versiones: todas.length,
          cuenta: await conexion.db.documentos.get(o.clave),
        };
      }),
    );
  }, [conexion]);
  async function resolver(
    id: string,
    eleccion: "conservar-cloud" | "aplicar-local",
    revision: number,
  ) {
    setOcupado(true);
    setError("");
    try {
      await conexion.resolver(id, eleccion, revision);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }
  return (
    <Hoja titulo="Revisar dos versiones" cerrar={cerrar}>
      <p>
        Otro dispositivo cambió estos registros. Elige qué debe quedar en tu
        cuenta. Ambas propuestas y su revisión se conservarán.
      </p>
      <ErrorVisible error={error} />
      {registros?.length === 0 ? (
        <>
          <p className="sfm-success">Todos tus cambios están revisados.</p>
          <button className="sfm-primary" onClick={cerrar}>
            Continuar
          </button>
        </>
      ) : (
        registros?.map(({ o, local, versiones, cuenta }) => {
          const ejercicioId = (local.datos as { ejercicioId?: string })
            ?.ejercicioId;
          const nombre = BIBLIOTECA_INICIAL.find(
            (e) => e.id === ejercicioId,
          )?.nombre;
          return (
            <article className="sfm-conflict" key={o.opId}>
              <h3>
                {nombre ??
                  (o.tipo === "borrador"
                    ? "Serie a medio registrar"
                    : "Registro de progreso")}
              </h3>
              <dl className="sfm-profile-data">
                <div>
                  <dt>
                    Tu propuesta
                    {versiones > 1 ? ` · ${versiones} cambios guardados` : ""}
                  </dt>
                  <dd>
                    {local.eliminado
                      ? "Quitar este registro"
                      : describirRegistro(local.datos)}
                  </dd>
                </div>
                <div>
                  <dt>En tu cuenta</dt>
                  <dd>
                    {cuenta?.eliminado
                      ? "Registro retirado"
                      : describirRegistro(cuenta?.datos)}
                  </dd>
                </div>
              </dl>
              <ErrorVisible error={o.error ?? ""} />
              <button
                className="sfm-primary"
                disabled={ocupado}
                onClick={() =>
                  void resolver(o.opId, "aplicar-local", cuenta?.revision ?? 0)
                }
              >
                Usar mi propuesta
              </button>
              <button
                className="sfm-secondary"
                disabled={ocupado}
                onClick={() =>
                  void resolver(
                    o.opId,
                    "conservar-cloud",
                    cuenta?.revision ?? 0,
                  )
                }
              >
                Conservar lo que está en mi cuenta
              </button>
            </article>
          );
        })
      )}
    </Hoja>
  );
}
