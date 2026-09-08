import { useEffect, useState } from "react";
import { RespaldoV1 } from "../../shared/v2/importacion";
import { detectarLegado, type Legado } from "../nube/legado";
import type { ConexionCloud } from "../nube/cloud";
import { ErrorVisible, Hoja } from "./ui";
type FotoAnterior = {
  registro: string;
  tipo: "perfil" | "progreso";
  imagen: Blob;
};
export function Recuperacion({
  conexion,
  compacto = false,
}: {
  conexion: ConexionCloud;
  compacto?: boolean;
}) {
  const [legado, setLegado] = useState<Legado | null>(null);
  const [respaldo, setRespaldo] = useState<RespaldoV1 | null>(null);
  const [abrir, setAbrir] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [estado, setEstado] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [fotos, setFotos] = useState<FotoAnterior[]>([]);
  const [subirFotos, setSubirFotos] = useState(false);
  const [compartir, setCompartir] = useState(false);
  useEffect(() => {
    void detectarLegado()
      .then(setLegado)
      .catch(() => {});
  }, []);
  function seleccionar(r: RespaldoV1, imagenes: FotoAnterior[]) {
    setRespaldo(r);
    setFotos(imagenes);
    setConfirmar(false);
    setSubirFotos(false);
    setCompartir(false);
    setError("");
    setEstado("");
  }
  async function archivo(f: File) {
    setError("");
    try {
      if (f.size > 50_000_000)
        throw Error(
          "El respaldo supera los 50 MB. Conserva el original para revisión.",
        );
      const r = RespaldoV1.parse(JSON.parse(await f.text()));
      const imagenes: FotoAnterior[] = [];
      for (const foto of [
        ...(r.fotos ?? []),
        ...(r.fotoDePerfil ? [r.fotoDePerfil] : []),
      ]) {
        const bytes = Uint8Array.from(atob(foto.datos), (c) => c.charCodeAt(0));
        imagenes.push({
          registro: foto.id,
          tipo: foto === r.fotoDePerfil ? "perfil" : "progreso",
          imagen: new Blob([bytes], { type: foto.tipo }),
        });
      }
      seleccionar(r, imagenes);
    } catch {
      setError(
        "No se pudo validar el respaldo completo. El archivo original no se ha modificado.",
      );
    }
  }
  async function importar() {
    if (!respaldo || !confirmar) return;
    setOcupado(true);
    setError("");
    try {
      const { fotos: _fotos, fotoDePerfil: _perfil, ...sinFotos } = respaldo;
      type Recibo = { verificados:number; esperados:number; hash:string; conflictos:string[]; procesados:number; completo:boolean };
      let r: {recibo:Recibo};
      do {
        r = await conexion.api.pedir<{recibo:Recibo}>("/importar", { confirmoPertenencia:true, respaldo:sinFotos });
        setEstado(`Recuperando ${r.recibo.procesados} de ${r.recibo.esperados} registros… Puedes retomar si se interrumpe la conexión.`);
      } while (!r.recibo.completo);
      if (subirFotos) {
        for (const foto of fotos) {
          const bytes = await foto.imagen.arrayBuffer();
          const contenido = new Uint8Array(
            await crypto.subtle.digest("SHA-256", bytes),
          );
          const clave = new TextEncoder().encode(
            `${conexion.ctx.identidad}|${foto.registro}|${Array.from(contenido).join(",")}`,
          );
          const hash = Array.from(
            new Uint8Array(await crypto.subtle.digest("SHA-256", clave)),
            (n) => n.toString(16).padStart(2, "0"),
          ).join("");
          await conexion.encolarFoto(foto.imagen, compartir, {
            id: `anterior-${hash}`,
            registro:
              foto.tipo === "perfil" ? conexion.ctx.identidad : foto.registro,
            tipo: foto.tipo,
          });
        }
      }
      await conexion.sincronizar();
      await conexion.db.meta.put({ id: "recibo-importacion", valor: r.recibo });
      setEstado(
        `${r.recibo.verificados} de ${r.recibo.esperados} registros verificados en tu cuenta.${r.recibo.conflictos.length ? ` ${r.recibo.conflictos.length} tienen otra versión y se conservaron en la nube para revisar con tu coach.` : ""}${subirFotos ? ` ${fotos.length} fotos guardadas en la cola privada de subida.` : ""} Tu base anterior permanece intacta.`,
      );
      if (!r.recibo.conflictos.length) {
        setRespaldo(null);
        setConfirmar(false);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }
  const conDatos = legado?.propietarios.some(
    (p) => p.sesiones || p.series || p.fotos,
  );
  if (compacto && !conDatos) return null;
  return (
    <>
      <button
        className={compacto ? "sfm-recovery-banner" : "sfm-secondary"}
        onClick={() => setAbrir(true)}
      >
        {compacto
          ? "Hay datos anteriores en este dispositivo · Revisar"
          : "Recuperar datos anteriores"}
      </button>
      {abrir && (
        <Hoja titulo="Tu historial anterior" cerrar={() => setAbrir(false)}>
          <p>
            Las versiones anteriores podían registrar pruebas bajo nombres
            reales. Confirma qué datos te pertenecen antes de incorporarlos a tu
            cuenta.
          </p>
          {legado?.sinPropietario ? (
            <p className="sfm-error">
              Hay {legado.sinPropietario} registros sin propietario claro. Se
              conservan en este dispositivo para revisión con tu coach.
            </p>
          ) : null}
          {legado?.propietarios.map((p) => (
            <button
              key={p.id}
              className="sfm-row"
              onClick={() => {
                void legado
                  .leer(p.id)
                  .then((r) => seleccionar(r, legado.fotos(p.id)))
                  .catch(() =>
                    setError(
                      "Estos datos necesitan revisión antes de importarlos. La base anterior se conserva intacta.",
                    ),
                  );
              }}
            >
              <span className="sfm-row-body">
                <strong>{p.nombre}</strong>
                <small>
                  {p.sesiones} entrenamientos · {p.series} series · {p.fotos}{" "}
                  fotos
                </small>
                <small>{p.desde && `${p.desde} — ${p.hasta}`}</small>
              </span>
            </button>
          ))}
          <label className="sfm-secondary sfm-file">
            Abrir respaldo anterior
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void archivo(f);
              }}
            />
          </label>
          {respaldo && (
            <div className="sfm-callout">
              <h3>{respaldo.participante.nombre}</h3>
              <p>
                {respaldo.sesiones.length} entrenamientos ·{" "}
                {respaldo.series.length} series · {respaldo.progreso.length}{" "}
                medidas · {respaldo.calibraciones.length} ajustes de equipos.
              </p>
              <p>
                El perfil y la programación actuales no se reemplazan. Las
                versiones diferentes se conservan para revisión.
              </p>
              <label className="sfm-check">
                <input
                  type="checkbox"
                  checked={confirmar}
                  onChange={(e) => setConfirmar(e.target.checked)}
                />
                <span>
                  Estos entrenamientos y ajustes de equipos son míos. No son
                  pruebas ni vistas previas.
                </span>
              </label>
              {fotos.length > 0 && (
                <>
                  <label className="sfm-check">
                    <input
                      type="checkbox"
                      disabled={!conexion.ctx.medios}
                      checked={subirFotos}
                      onChange={(e) => setSubirFotos(e.target.checked)}
                    />
                    <span>
                      Autorizo subir también mis {fotos.length} fotos a mi
                      cuenta privada.
                    </span>
                  </label>
                  {!conexion.ctx.medios && (
                    <p className="sfm-hint">
                      Las fotos seguirán en su origen hasta que se active su
                      almacenamiento privado.
                    </p>
                  )}
                  {subirFotos && (
                    <label className="sfm-check">
                      <input
                        type="checkbox"
                        checked={compartir}
                        onChange={(e) => setCompartir(e.target.checked)}
                      />
                      <span>Quiero compartir estas fotos con mi coach.</span>
                    </label>
                  )}
                </>
              )}
              <button
                className="sfm-primary"
                disabled={!confirmar || ocupado}
                onClick={() => void importar()}
              >
                {ocupado
                  ? "Verificando e importando…"
                  : "Incorporar a mi cuenta"}
              </button>
            </div>
          )}
          <ErrorVisible error={error} />
          {estado && (
            <p className="sfm-success" role="status">
              {estado}
            </p>
          )}
        </Hoja>
      )}
    </>
  );
}
