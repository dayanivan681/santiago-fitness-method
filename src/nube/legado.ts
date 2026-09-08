import { RespaldoV1 } from "../../shared/v2/importacion";
export type Legado = {
  propietarios: {
    id: string;
    nombre: string;
    sesiones: number;
    series: number;
    fotos: number;
    desde: string;
    hasta: string;
  }[];
  leer: (id: string) => Promise<RespaldoV1>;
  fotos: (
    id: string,
  ) => { registro: string; tipo: "perfil" | "progreso"; imagen: Blob }[];
  sinPropietario: number;
};
/** Abre SIN versión y sólo transacciones readonly: jamás ejecuta upgrades Dexie. */
export async function detectarLegado(): Promise<Legado | null> {
  if (!("databases" in indexedDB)) return null;
  const nombres = await indexedDB.databases();
  if (!nombres.some((d) => d.name === "santiago-fitness-method")) return null;
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open("santiago-fitness-method");
    r.onupgradeneeded = () => {
      r.transaction?.abort();
      reject(Error("Base anterior no disponible"));
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  try {
    const tablas = [
      "participantes",
      "plantillas",
      "sesiones",
      "series",
      "sustituciones",
      "progreso",
      "borradores",
      "ejercicios",
      "fotos",
      "fotosDePerfil",
    ];
    const datos: Record<string, Record<string, unknown>[]> = {};
    await Promise.all(
      tablas.map(async (t) => {
        datos[t] = !db.objectStoreNames.contains(t)
          ? []
          : await new Promise((resolve, reject) => {
              const r = db.transaction(t, "readonly").objectStore(t).getAll();
              r.onsuccess = () => resolve(r.result);
              r.onerror = () => reject(r.error);
            });
      }),
    );
    const propietarios = datos.participantes.map((p) => {
      const sesiones = datos.sesiones.filter((s) => s.participanteId === p.id);
      const ids = new Set(sesiones.map((s) => s.id));
      const fechas = sesiones.map((s) => String(s.fecha)).sort();
      return {
        id: String(p.id),
        nombre: String(p.nombre ?? "Propietario sin confirmar"),
        sesiones: sesiones.length,
        series: datos.series.filter((s) => ids.has(s.sesionId)).length,
        fotos: datos.fotos.filter((f) =>
          datos.progreso.some(
            (p2) => p2.id === f.id && p2.participanteId === p.id,
          ),
        ).length,
        desde: fechas[0] ?? "",
        hasta: fechas.at(-1) ?? "",
      };
    });
    return {
      propietarios,
      fotos: (id) => [
        ...datos.fotos
          .filter((f) =>
            datos.progreso.some(
              (p) => p.id === f.id && p.participanteId === id,
            ),
          )
          .map((f) => ({
            registro: String(f.id),
            tipo: "progreso" as const,
            imagen: f.imagen as Blob,
          })),
        ...datos.fotosDePerfil
          .filter((f) => f.id === id)
          .map((f) => ({
            registro: id,
            tipo: "perfil" as const,
            imagen: f.imagen as Blob,
          })),
      ],
      sinPropietario: datos.sesiones.filter(
        (s) => !datos.participantes.some((p) => p.id === s.participanteId),
      ).length,
      leer: async (id: string) => {
        const participante = datos.participantes.find((p) => p.id === id);
        const sesiones = datos.sesiones.filter((s) => s.participanteId === id);
        const ids = new Set(sesiones.map((s) => s.id));
        return RespaldoV1.parse({
          version: 1,
          exportadoEn: new Date().toISOString(),
          participante,
          plantillas: datos.plantillas.filter((p) => p.participanteId === id),
          sesiones,
          series: datos.series.filter((s) => ids.has(s.sesionId)),
          progreso: datos.progreso.filter((s) => s.participanteId === id),
          sustituciones: datos.sustituciones.filter(
            (s) => s.participanteId === id,
          ),
          borradores: datos.borradores.filter((s) => s.participanteId === id),
          calibraciones: datos.ejercicios.map((e) => ({
            id: e.id,
            tipoCarga: e.tipoCarga,
            incrementoMinimoLb: e.incrementoMinimoLb,
            pesoBaseMaquinaLb: e.pesoBaseMaquinaLb,
          })),
          fotos: [],
        });
      },
    };
  } finally {
    db.close();
  }
}
