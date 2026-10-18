import {
  Entrenamiento,
  Perfil,
  Plan,
  PlanHistorico,
  Serie,
  validarOperacion,
  type Cambio,
  type Contexto,
  type Operacion,
  type Tipo,
} from "../../../shared/v2/contratos";
import { listarPerfiles, listarRutinas, obtenerPerfil } from "../roles";
import { idsDeCoachNoDisponibles } from "./bibliotecaDatos";
import { resumen } from "../cripto";
import { canonico } from "../../../shared/v2/importacion";
export type FilaCambio = {
  cursor: number;
  cliente_id: string;
  tipo: Tipo;
  documento_id: string;
  revision: number;
  datos_json: string;
  eliminado: number;
  operacion_id: string;
  hash: string;
  actor: string;
};
export function cambio(f: FilaCambio): Cambio {
  return {
    cursor: f.cursor,
    tipo: f.tipo,
    id: f.documento_id,
    revision: f.revision,
    datos: JSON.parse(f.datos_json),
    eliminado: !!f.eliminado,
    opId: f.operacion_id,
    actor: f.actor,
  };
}
export async function actual(
  db: D1Database,
  cliente: string,
  tipo: Tipo,
  id: string,
) {
  return db
    .prepare(
      "SELECT * FROM cambios WHERE cliente_id=? AND tipo=? AND documento_id=? ORDER BY revision DESC LIMIT 1",
    )
    .bind(cliente, tipo, id)
    .first<FilaCambio>();
}
export async function perfilActual(
  db: D1Database,
  id: string,
): Promise<Perfil | null> {
  const v2 = await actual(db, id, "perfil", id);
  if (v2) return Perfil.parse(JSON.parse(v2.datos_json));
  const legado = await obtenerPerfil(db, id);
  return legado
    ? Perfil.parse({
        ...legado,
        sexo: ["femenino", "masculino"].includes(legado.sexo)
          ? legado.sexo
          : null,
        edad: legado.edad || null,
        estaturaCm: legado.estaturaCm || null,
        pesoCorporalLb: legado.pesoCorporalLb || null,
      })
    : null;
}
export async function planActual(db: D1Database, id: string) {
  const v2 = await actual(db, id, "plan", "programa");
  if (v2)
    return {
      plan: PlanHistorico.parse(JSON.parse(v2.datos_json)),
      revision: v2.revision,
    };
  const dias = (await listarRutinas(db, id)).map((d) => ({
    id: d.id,
    participanteId: id,
    nombre: d.nombre,
    orden: d.orden,
    slots: d.slots,
  }));
  // La programación existente se conserva incluso incompleta; no la "repara" la migración.
  return {
    plan: {
      id: "programa",
      estado: "publicado" as const,
      dias,
      revisado: false,
    },
    revision: 0,
  };
}
/** Lunes de esta semana (AAAA-MM-DD): la actividad «esta semana» depende de él. */
function inicioDeSemana() {
  const semana = new Date();
  semana.setDate(semana.getDate() - ((semana.getDay() + 6) % 7));
  return semana.toISOString().slice(0, 10);
}
/**
 * Huella de la cartera en una sola consulta barata. El panel del coach
 * pregunta a menudo; si nada cambió responde 304 sin releer el historial.
 * `cambios.cursor` es la clave primaria (MAX en una fila); clientes y rutinas
 * son tablas pequeñas y su `actualizado_en` cambia al editar o archivar.
 */
export async function etiquetaDeClientes(db: D1Database): Promise<string> {
  const f = await db
    .prepare(
      `SELECT (SELECT COALESCE(MAX(cursor),0) FROM cambios) AS cambios,
              (SELECT COUNT(*) || '.' || COALESCE(SUM(activo),0) || '.' || COALESCE(MAX(actualizado_en),0) FROM clientes) AS clientes,
              (SELECT COUNT(*) || '.' || COALESCE(MAX(actualizado_en),0) FROM rutinas) AS rutinas`,
    )
    .first<{ cambios: number; clientes: string; rutinas: string }>();
  return `"cl-${f?.cambios ?? 0}-${f?.clientes ?? ""}-${f?.rutinas ?? ""}-${inicioDeSemana()}"`;
}
export async function clientesActuales(db: D1Database) {
  // Tres consultas para toda la cartera: el coste no crece por cada cliente.
  const [perfiles, versiones, rutinas] = await Promise.all([
    listarPerfiles(db),
    db.prepare("SELECT * FROM cambios c WHERE tipo IN ('perfil','plan','entrenamiento') AND revision=(SELECT MAX(revision) FROM cambios v WHERE v.cliente_id=c.cliente_id AND v.tipo=c.tipo AND v.documento_id=c.documento_id) AND eliminado=0").all<FilaCambio>(),
    db.prepare("SELECT id,cliente_id,nombre,orden,slots_json FROM rutinas ORDER BY orden").all<{id:string;cliente_id:string;nombre:string;orden:number;slots_json:string}>(),
  ]);
  const desde = inicioDeSemana();
  return perfiles.filter(p=>p.id!=="dayan-test").map(p=>{
    const registros=versiones.results.filter(v=>v.cliente_id===p.id);
    const pv=registros.find(v=>v.tipo==="perfil"&&v.documento_id===p.id);
    const plan=registros.find(v=>v.tipo==="plan"&&v.documento_id==="programa");
    const sesiones=registros.filter(v=>v.tipo==="entrenamiento").map(v=>Entrenamiento.parse(JSON.parse(v.datos_json))).sort((a,b)=>b.fecha.localeCompare(a.fecha));
    return {
      perfil:Perfil.parse(pv?JSON.parse(pv.datos_json):{...p,sexo:["femenino","masculino"].includes(p.sexo)?p.sexo:null,edad:p.edad||null,estaturaCm:p.estaturaCm||null,pesoCorporalLb:p.pesoCorporalLb||null}),
      plan:PlanHistorico.parse(plan?JSON.parse(plan.datos_json):{id:"programa",estado:"publicado",revisado:false,dias:rutinas.results.filter(r=>r.cliente_id===p.id).map(r=>({id:r.id,participanteId:p.id,nombre:r.nombre,orden:r.orden,slots:JSON.parse(r.slots_json)}))}),
      revision:plan?.revision??0,
      actividad:{semana:sesiones.filter(s=>s.completadaEn&&s.fecha>=desde).length,total:sesiones.filter(s=>s.completadaEn).length,ultima:sesiones[0]??null},
    };
  });
}
export async function leerCambios(
  db: D1Database,
  cliente: string,
  cursor: number,
  rol: Contexto["rol"],
) {
  const { results } = await db
    .prepare(
      "SELECT * FROM cambios WHERE cliente_id=? AND cursor>? ORDER BY cursor LIMIT 500",
    )
    .bind(cliente, cursor)
    .all<FilaCambio>();
  const visibles = results
    .filter(
      (f) =>
        rol === "coach" ||
        (f.tipo !== "alta" &&
          (f.tipo !== "plan" || f.documento_id === "programa")),
    )
    .map((f) => {
      const c = cambio(f);
      if (rol === "cliente" && c.tipo === "perfil")
        c.datos = { ...(c.datos as Perfil), notas: "" };
      return c;
    });
  return {
    cambios: visibles,
    cursor: results.at(-1)?.cursor ?? cursor,
    mas: results.length === 500,
  };
}
export class ErrorApi extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
export async function aplicar(
  db: D1Database,
  cliente: string,
  ctx: Contexto,
  entrada: Operacion,
  opciones: { importacion?: boolean } = {},
): Promise<{
  confirmacion?: Cambio;
  conflicto?: { operacion: Operacion; actual: Cambio | null };
}> {
  const op = validarOperacion(entrada);
  const hash = await resumen(canonico(op));
  const repetida = await db
    .prepare("SELECT * FROM cambios WHERE cliente_id=? AND operacion_id=?")
    .bind(cliente, op.opId)
    .first<FilaCambio>();
  if (repetida) {
    if (
      repetida.hash !== hash ||
      repetida.actor !== `${ctx.rol}:${ctx.identidad}`
    )
      throw new ErrorApi("La operación ya existe con otro contenido.", 409);
    return { confirmacion: cambio(repetida) };
  }
  if (ctx.rol === "cliente" && ["perfil", "plan", "alta"].includes(op.tipo))
    throw new ErrorApi("Sólo tu coach puede cambiar tu programa.", 403);
  if (
    op.eliminado &&
    !["borrador", "sustitucion", "progreso", "alta"].includes(op.tipo)
  )
    throw new ErrorApi("El historial se conserva; utiliza una corrección.");
  const vigente = await actual(db, cliente, op.tipo, op.id);
  async function conflicto() {
    const actualizada = await actual(db, cliente, op.tipo, op.id);
    await db
      .prepare(
        "INSERT OR IGNORE INTO conflictos(id,cliente_id,operacion_json,actual_json,actor,creado_en) VALUES(?,?,?,?,?,?)",
      )
      .bind(
        op.opId,
        cliente,
        JSON.stringify(op),
        JSON.stringify(actualizada ? cambio(actualizada) : null),
        `${ctx.rol}:${ctx.identidad}`,
        Date.now(),
      )
      .run();
    return {
      conflicto: {
        operacion: op,
        actual: actualizada ? cambio(actualizada) : null,
      },
    };
  }
  if ((vigente?.revision ?? 0) !== op.revision) return conflicto();
  if (op.tipo === "alta" && vigente && JSON.parse(vigente.datos_json).completado)
    throw new ErrorApi("Este onboarding ya se completó. Continúa desde la ficha del cliente.",409);
  if (!op.eliminado) {
    const datos = op.datos as Record<string, unknown>;
    if (datos.id !== op.id)
      throw new ErrorApi("Identidad de registro incorrecta.");
    if ("participanteId" in datos && datos.participanteId !== cliente)
      throw new ErrorApi("Registro de otra cuenta.", 403);
    if (op.tipo === "perfil" && op.id !== cliente)
      throw new ErrorApi("Perfil de otra cuenta.", 403);
    if (op.tipo === "plan") {
      const plan = Plan.parse(op.datos);
      if (plan.dias.some((d) => d.participanteId !== cliente))
        throw new ErrorApi("Programa de otra cuenta.", 403);
      if (op.id === "programa" && plan.estado !== "publicado")
        throw new ErrorApi("El programa activo debe estar publicado.");
      const inexistentes = await idsDeCoachNoDisponibles(
        db,
        plan.dias.flatMap((d) => d.slots.map((s) => s.ejercicioId)),
      );
      if (inexistentes.length)
        throw new ErrorApi("Hay ejercicios que ya no están disponibles en tu biblioteca. Quítalos o restáuralos.");
    }
    if (op.tipo === "entrenamiento") {
      const e = Entrenamiento.parse(op.datos);
      if (e.procedencia === "importacion" && !opciones.importacion && !vigente)
        throw new ErrorApi(
          "Utiliza la recuperación de historial para importar registros.",
          403,
        );
      if (op.revision === 0 && !opciones.importacion) {
        const activo = await planActual(db, cliente);
        let plan = activo.plan;
        if (e.planRevision && e.planRevision !== activo.revision) {
          const version = await db
            .prepare(
              "SELECT datos_json FROM cambios WHERE cliente_id=? AND tipo='plan' AND documento_id='programa' AND revision=?",
            )
            .bind(cliente, e.planRevision)
            .first<{ datos_json: string }>();
          if (!version)
            throw new ErrorApi(
              "No se encontró la versión de tu programa.",
              409,
            );
          plan = JSON.parse(version.datos_json);
        }
        if (
          !e.prescripcion ||
          !plan.dias.some((d) => canonico(d) === canonico(e.prescripcion))
        )
          throw new ErrorApi(
            "La prescripción no coincide con una versión de tu programa.",
            409,
          );
      }
      if (vigente) {
        const anterior = Entrenamiento.parse(JSON.parse(vigente.datos_json));
        if (
          e.fecha !== anterior.fecha ||
          e.plantillaDiaId !== anterior.plantillaDiaId ||
          e.planRevision !== anterior.planRevision ||
          e.procedencia !== anterior.procedencia
        )
          throw new ErrorApi(
            "La identidad histórica del entrenamiento es inmutable.",
            409,
          );
      }
      const previo = await db
        .prepare(
          "SELECT cliente_id,prescripcion_json,cargas_json FROM entrenamientos WHERE id=?",
        )
        .bind(e.id)
        .first<{
          cliente_id: string;
          prescripcion_json: string;
          cargas_json: string;
        }>();
      if (
        previo &&
        (previo.cliente_id !== cliente ||
          canonico(JSON.parse(previo.prescripcion_json)) !==
            canonico(e.prescripcion ?? {}) ||
          canonico(JSON.parse(previo.cargas_json)) !== canonico(e.cargas ?? {}))
      )
        throw new ErrorApi("La prescripción histórica es inmutable.", 409);
    }
    if (op.tipo === "serie") {
      const serie = Serie.parse(op.datos);
      const padre = await db
        .prepare("SELECT cliente_id FROM entrenamientos WHERE id=?")
        .bind(serie.sesionId)
        .first<{ cliente_id: string }>();
      if (!padre || padre.cliente_id !== cliente)
        throw new ErrorApi("Entrenamiento no disponible en esta cuenta.", 409);
      const previo = await actual(db, cliente, "serie", serie.id);
      if (previo) {
        const anterior = Serie.parse(JSON.parse(previo.datos_json));
        if (
          serie.sesionId !== anterior.sesionId ||
          serie.ejercicioId !== anterior.ejercicioId ||
          serie.numeroSerie !== anterior.numeroSerie
        )
          throw new ErrorApi("No se puede reinterpretar una serie.", 409);
        const audit = serie.correcciones ?? [];
        const old = anterior.correcciones ?? [];
        if (
          audit.length !== old.length + 1 ||
          canonico(audit.slice(0, old.length)) !== canonico(old)
        )
          throw new ErrorApi("La corrección debe conservar su auditoría.", 409);
        const ultima = audit.at(-1)!;
        if (
          [
            "pesoRegistradoLb",
            "repsRealizadas",
            "rir",
            "tecnica",
            "esCalentamiento",
            "nota",
          ].some(
            (k) =>
              ultima[k as keyof typeof ultima] !==
              anterior[k as keyof typeof anterior],
          )
        )
          throw new ErrorApi(
            "La auditoría debe conservar los valores anteriores.",
            409,
          );
        if (canonico(serie.carga) !== canonico(anterior.carga))
          throw new ErrorApi(
            "El significado de la carga histórica es inmutable.",
            409,
          );
      }
    }
  }
  const actor = `${ctx.rol}:${ctx.identidad}`;
  const sentencia = db
    .prepare(
      `INSERT INTO cambios(cliente_id,tipo,documento_id,revision,datos_json,eliminado,operacion_id,hash,actor,creado_en)
    SELECT ?1,?2,?3,?4+1,?5,?6,?7,?8,?9,?10
    WHERE COALESCE((SELECT MAX(revision) FROM cambios WHERE cliente_id=?1 AND tipo=?2 AND documento_id=?3),0)=?4
    AND NOT EXISTS(SELECT 1 FROM cambios WHERE cliente_id=?1 AND operacion_id=?7)`,
    )
    .bind(
      cliente,
      op.tipo,
      op.id,
      op.revision,
      JSON.stringify(op.datos),
      op.eliminado ? 1 : 0,
      op.opId,
      hash,
      actor,
      Date.now(),
    );
  const lote = [sentencia];
  if (op.tipo === "entrenamiento" && !op.eliminado) {
    const e = Entrenamiento.parse(op.datos);
    lote.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO entrenamientos(id,cliente_id,prescripcion_json,cargas_json,fecha,actor,creado_en)
      SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM cambios WHERE cliente_id=? AND operacion_id=?)`,
        )
        .bind(
          e.id,
          cliente,
          JSON.stringify(e.prescripcion ?? {}),
          JSON.stringify(e.cargas ?? {}),
          e.fecha,
          actor,
          Date.now(),
          cliente,
          op.opId,
        ),
    );
  }
  await db.batch(lote);
  const guardada = await db
    .prepare("SELECT * FROM cambios WHERE cliente_id=? AND operacion_id=?")
    .bind(cliente, op.opId)
    .first<FilaCambio>();
  if (guardada) {
    if (guardada.hash !== hash || guardada.actor !== actor)
      throw new ErrorApi("La operación ya existe con otro contenido.", 409);
    return { confirmacion: cambio(guardada) };
  }
  return conflicto();
}
