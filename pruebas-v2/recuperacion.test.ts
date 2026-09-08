// @vitest-environment node
import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { sqliteD1 } from "./d1";
import {
  perfil,
  plan,
  contexto,
  operacion,
  entrenamiento,
  serie,
  personas,
} from "./fixtures";
import { aplicar, actual, planActual } from "../functions/lib/v2/datos";
import { importar } from "../functions/lib/v2/importar";
import { revisarImportaciones } from "../functions/lib/v2/revisarImportaciones";
import { medios } from "../functions/lib/v2/medios";
import { RespaldoV1, canonico } from "../shared/v2/importacion";
import { crearInvitacion } from "../functions/lib/invitacion";
import { entrarConInvitacion } from "../functions/lib/sesion";
import type { EntornoV2 } from "../functions/lib/v2/seguridad";
let local: ReturnType<typeof sqliteD1>;
const ctx = contexto();
const respaldo = () => ({
  version: 1 as const,
  exportadoEn: new Date().toISOString(),
  participante: perfil,
  plantillas: plan.dias,
  sesiones: [entrenamiento],
  series: [
    {
      ...serie,
      nota: "Apoyo estable",
      correcciones: [
        {
          pesoRegistradoLb: 20,
          repsRealizadas: 5,
          rir: 2,
          corregidaEn: new Date().toISOString(),
        },
      ],
    },
  ],
  progreso: [],
  sustituciones: [],
  borradores: [],
  calibraciones: [],
});
const peticion = (r: unknown, confirmoPertenencia = true) =>
  new Request("http://localhost/api/v2/importar", {
    method: "POST",
    headers: { Origin: "http://localhost", "Content-Type": "application/json" },
    body: JSON.stringify({ respaldo: r, confirmoPertenencia }),
  });
beforeEach(async () => {
  local = sqliteD1();
  personas(local);
  await aplicar(
    local.db,
    perfil.id,
    { ...ctx, rol: "coach" },
    operacion("plan", "programa", plan),
  );
});
afterEach(() => local.cerrar());
describe("importación conservadora y repetible", () => {
  it("retoma un respaldo grande por partes dentro del presupuesto de consultas", async () => {
    const r = respaldo();
    r.series = Array.from({length:12},(_,i)=>({...r.series[0],id:`serie-anterior-${i}`,numeroSerie:i+1}));
    let completo = false, procesados = 0, vueltas = 0;
    while (!completo) {
      local.reiniciarConsultas();
      const respuesta = await importar(peticion(r),local.db,ctx);
      expect(local.consultas).toBeLessThan(40); // deja margen para autenticación y entorno
      const {recibo} = await respuesta.json() as {recibo:{completo:boolean;procesados:number}};
      expect(recibo.procesados).toBeGreaterThan(procesados);
      procesados=recibo.procesados;completo=recibo.completo;vueltas++;
      expect(vueltas).toBeLessThan(8);
    }
    expect(vueltas).toBeGreaterThan(1);
    expect(procesados).toBe(13);
    expect(await local.db.prepare("SELECT COUNT(*) n FROM cambios WHERE tipo='serie'").first("n")).toBe(12);
    const repetido = await importar(peticion(r),local.db,ctx);
    expect((await repetido.json() as {repetido:boolean}).repetido).toBe(true);
  });
  it("exige pertenencia incluso con la misma identidad", async () => {
    await expect(
      importar(peticion(respaldo(), false), local.db, ctx),
    ).rejects.toThrow();
    expect(await actual(local.db, perfil.id, "serie", serie.id)).toBeNull();
  });
  it("valida contenido completo, fechas, variantes y referencias", () => {
    const r = respaldo();
    expect(RespaldoV1.safeParse(r).success).toBe(true);
    for (const r2 of [
      { ...r, series: [{ ...serie, repsRealizadas: -2 }] },
      { ...r, series: [{ ...serie, sesionId: "sin-padre" }] },
      { ...r, series: [{ ...serie, ejercicioId: "catalogo-sin-aprobar" }] },
      { ...r, sesiones: [{ ...entrenamiento, fecha: "ayer" }] },
      { ...r, sesiones: [{ ...entrenamiento, participanteId: "test-b" }] },
    ])
      expect(RespaldoV1.safeParse(r2).success).toBe(false);
  });
  it("conserva series, correcciones y programa actual al repetir desde otro dispositivo", async () => {
    const r = respaldo();
    const primero = (await (
      await importar(peticion(r), local.db, ctx)
    ).json()) as { recibo: { verificados: number } };
    expect(primero.recibo.verificados).toBe(2);
    const copia = {
      ...r,
      exportadoEn: new Date(Date.now() + 1000).toISOString(),
    };
    const segundo = (await (
      await importar(peticion(copia), local.db, ctx)
    ).json()) as { repetido: boolean };
    expect(segundo.repetido).toBe(true);
    expect(
      await local.db
        .prepare("SELECT COUNT(*) n FROM entrenamientos")
        .first("n"),
    ).toBe(1);
    const actualSerie = JSON.parse(
      (await actual(local.db, perfil.id, "serie", serie.id))!.datos_json,
    );
    expect(actualSerie.nota).toBe("Apoyo estable");
    expect(actualSerie.correcciones).toEqual(r.series[0].correcciones);
    expect(canonico((await planActual(local.db, perfil.id)).plan)).toBe(
      canonico(plan),
    );
  });
  it("conserva en la nube los valores de un lote con conflictos, sin sobrescribir", async () => {
    await aplicar(
      local.db,
      perfil.id,
      ctx,
      operacion("entrenamiento", entrenamiento.id, entrenamiento),
    );
    await aplicar(
      local.db,
      perfil.id,
      ctx,
      operacion("serie", serie.id, serie),
    );
    const resultado = await importar(peticion(respaldo()), local.db, ctx);
    expect(resultado.status).toBe(207);
    expect(
      await local.db
        .prepare("SELECT COUNT(*) n FROM importaciones_partidas")
        .first("n"),
    ).toBe(2);
    expect(
      JSON.parse(
        (await actual(local.db, perfil.id, "serie", serie.id))!.datos_json,
      ).pesoRegistradoLb,
    ).toBe(25);
    const { recibo } = (await resultado.json()) as { recibo: { hash: string } };
    const detalle = await revisarImportaciones(
      new Request(`http://localhost/api/v2/importaciones?lote=${recibo.hash}`),
      local.db,
      ctx,
      perfil.id,
    );
    const { registros } = (await detalle.json()) as {
      registros: {
        tipo: string;
        id: string;
        revision: number;
        original: { nota?: string };
        actual: { nota?: string };
      }[];
    };
    const conflicto = registros.find((r) => r.tipo === "serie")!;
    expect(conflicto.original.nota).toBe("Apoyo estable");
    const revisar = (revision: number) =>
      new Request("http://localhost/api/v2/importaciones", {
        method: "POST",
        body: JSON.stringify({
          lote: recibo.hash,
          tipo: "serie",
          id: serie.id,
          revision,
          decision: "conservar-actual",
        }),
      });
    await expect(
      revisarImportaciones(revisar(0), local.db, ctx, perfil.id),
    ).rejects.toThrow("otro cambio");
    await revisarImportaciones(
      revisar(conflicto.revision),
      local.db,
      ctx,
      perfil.id,
    );
    await revisarImportaciones(
      revisar(conflicto.revision),
      local.db,
      ctx,
      perfil.id,
    );
    expect(
      await local.db
        .prepare("SELECT COUNT(*) n FROM importaciones_revisiones")
        .first("n"),
    ).toBe(1);
    expect(
      await local.db
        .prepare("SELECT COUNT(*) n FROM importaciones_partidas")
        .first("n"),
    ).toBe(2);
    await expect(
      revisarImportaciones(
        revisar(conflicto.revision),
        local.db,
        { ...ctx, identidad: "test-b" },
        "test-b",
      ),
    ).rejects.toThrow("no disponible");
  });
  it("un lote incompleto se retoma sin duplicar lo confirmado", async () => {
    const r = respaldo();
    await aplicar(
      local.db,
      perfil.id,
      ctx,
      operacion("entrenamiento", entrenamiento.id, {
        ...entrenamiento,
        procedencia: "importacion",
      }),
      { importacion: true },
    );
    const respuesta = await importar(peticion(r), local.db, ctx);
    expect(respuesta.status).toBe(200);
    expect(
      await local.db
        .prepare("SELECT COUNT(*) n FROM cambios WHERE tipo='entrenamiento'")
        .first("n"),
    ).toBe(1);
  });
  it("no permite subir fotos dentro de la importación sin consentimiento separado", async () => {
    await expect(
      importar(
        peticion({
          ...respaldo(),
          fotoDePerfil: { id: perfil.id, tipo: "image/png", datos: "aG9sYQ==" },
        }),
        local.db,
        ctx,
      ),
    ).rejects.toThrow("consentimiento");
  });
  it("una escritura ordinaria no se puede hacer pasar por importación", async () => {
    await expect(
      aplicar(
        local.db,
        perfil.id,
        ctx,
        operacion("entrenamiento", entrenamiento.id, {
          ...entrenamiento,
          procedencia: "importacion",
        }),
      ),
    ).rejects.toThrow("recuperación");
  });
  it("las copias iniciales son aditivas y sobreviven a migraciones repetidas", () => {
    const antes = local.ejecutar("SELECT * FROM clientes ORDER BY id");
    const sql = readFileSync(
      new URL("../migrations/0009_versiones_originales.sql", import.meta.url),
      "utf8",
    );
    local.ejecutar(sql);
    const primera = local.ejecutar("SELECT * FROM cambios ORDER BY cursor");
    local.ejecutar(sql);
    expect(local.ejecutar("SELECT * FROM cambios ORDER BY cursor")).toBe(
      primera,
    );
    expect(local.ejecutar("SELECT * FROM clientes ORDER BY id")).toBe(antes);
  });
  it("consumir una invitación y crear sesión es atómico y de un uso", async () => {
    const inv = await crearInvitacion(local.db, perfil.id);
    const entradas = await Promise.all([
      entrarConInvitacion(local.db, inv.token),
      entrarConInvitacion(local.db, inv.token),
    ]);
    expect(entradas.filter(Boolean)).toHaveLength(1);
    expect(
      await local.db.prepare("SELECT COUNT(*) n FROM sesiones").first("n"),
    ).toBe(1);
  });
});
describe("fotografías privadas y subidas recuperables", () => {
  const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  let objetos: Map<string, ArrayBuffer>;
  let interrumpir = false;
  let env: EntornoV2;
  beforeEach(() => {
    objetos = new Map();
    interrumpir = false;
    env = {
      ACCESO: local.db,
      SFM_ENV: "local",
      FOTOS: {
        put: async (k: string, v: ArrayBuffer) => {
          if (interrumpir) {
            interrumpir = false;
            throw Error("Interrupción de red");
          }
          objetos.set(k, v);
        },
        get: async (k: string) =>
          objetos.has(k) ? { body: objetos.get(k) } : null,
      } as unknown as R2Bucket,
    } as EntornoV2;
  });
  const subir = (id = "foto-qa", consentimiento = true) =>
    new Request(
      `http://localhost/api/v2/medios/${id}?tipo=progreso&registro=registro-qa`,
      {
        method: "PUT",
        headers: consentimiento ? { "X-SFM-Consentimiento": "subir" } : {},
        body: bytes,
      },
    );
  it("la foto sigue privada hasta que su propietario la comparte", async () => {
    await medios(subir(), env, ctx, perfil.id, "foto-qa");
    expect(
      (
        await medios(
          new Request("http://localhost/foto"),
          env,
          { ...ctx, rol: "coach" },
          perfil.id,
          "foto-qa",
        )
      ).status,
    ).toBe(404);
    expect(
      (
        await medios(
          new Request("http://localhost/foto"),
          env,
          { ...ctx, identidad: "test-b" },
          "test-b",
          "foto-qa",
        )
      ).status,
    ).toBe(404);
    await medios(
      new Request("http://localhost/foto", {
        method: "PATCH",
        body: JSON.stringify({ compartido: true }),
      }),
      env,
      ctx,
      perfil.id,
      "foto-qa",
    );
    expect(
      (
        await medios(
          new Request("http://localhost/foto"),
          env,
          { ...ctx, rol: "coach" },
          perfil.id,
          "foto-qa",
        )
      ).status,
    ).toBe(200);
  });
  it("retoma una subida interrumpida con el mismo objeto y metadatos", async () => {
    interrumpir = true;
    await expect(
      medios(subir(), env, ctx, perfil.id, "foto-qa"),
    ).rejects.toThrow("Interrupción");
    expect(
      await local.db.prepare("SELECT estado FROM medios").first("estado"),
    ).toBe("pendiente");
    await medios(subir(), env, ctx, perfil.id, "foto-qa");
    await medios(subir(), env, ctx, perfil.id, "foto-qa");
    expect(objetos.size).toBe(1);
    expect(
      await local.db.prepare("SELECT COUNT(*) n FROM medios").first("n"),
    ).toBe(1);
  });
  it("rechaza falta de consentimiento, tipos peligrosos y cuerpos que exceden el límite", async () => {
    await expect(
      medios(subir("foto-qa", false), env, ctx, perfil.id, "foto-qa"),
    ).rejects.toThrow("Confirma");
    await expect(
      medios(
        new Request("http://localhost/foto?tipo=progreso&registro=x", {
          method: "PUT",
          headers: { "X-SFM-Consentimiento": "subir" },
          body: "<svg/>",
        }),
        env,
        ctx,
        perfil.id,
        "foto-qa",
      ),
    ).rejects.toThrow("JPEG");
    await expect(
      medios(
        new Request("http://localhost/foto?tipo=progreso&registro=x", {
          method: "PUT",
          headers: { "X-SFM-Consentimiento": "subir" },
          body: new Uint8Array(5242881),
        }),
        env,
        ctx,
        perfil.id,
        "foto-qa",
      ),
    ).rejects.toThrow("5 MB");
  });
  it("un identificador existente no se puede reciclar para otro propietario", async () => {
    await medios(subir(), env, ctx, perfil.id, "foto-qa");
    await expect(
      medios(
        subir(),
        env,
        { ...ctx, identidad: "test-b" },
        "test-b",
        "foto-qa",
      ),
    ).rejects.toThrow("en uso");
  });
});
