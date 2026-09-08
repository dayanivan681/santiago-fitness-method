// @vitest-environment node
import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { SignJWT, generateKeyPair, exportJWK } from "jose";
import { sqliteD1 } from "./d1";
import { aplicar, actual, leerCambios } from "../functions/lib/v2/datos";
import { api } from "../functions/lib/v2/api";
import {
  verificarCoach,
  origenSeguro,
  type EntornoV2,
} from "../functions/lib/v2/seguridad";
import { crearSesion } from "../functions/lib/sesion";
import { crearInvitacion } from "../functions/lib/invitacion";
import { resumen } from "../functions/lib/cripto";
import { planBase } from "../src/producto/servicio";
import { Plan } from "../shared/v2/contratos";
import type { Contexto, Operacion } from "../shared/v2/contratos";
let local: ReturnType<typeof sqliteD1>;
const ctx: Contexto = {
  rol: "cliente",
  identidad: "test-a",
  nombre: "Prueba A",
  validadoEn: Date.now(),
  expiraEn: Date.now() + 86400000,
  entorno: "local",
  medios: false,
};
const plan = {
  ...planBase("test-a"),
  estado: "publicado" as const,
  revisado: true,
};
const entrenamiento = {
  id: "test-entreno",
  participanteId: "test-a",
  plantillaDiaId: plan.dias[0].id,
  fecha: "2026-09-07",
  prescripcion: plan.dias[0],
  cargas: {},
  planRevision: 1,
  procedencia: "app" as const,
};
const serie = {
  id: "test-serie",
  sesionId: "test-entreno",
  ejercicioId: plan.dias[0].slots[0].ejercicioId,
  numeroSerie: 1,
  pesoRegistradoLb: 25,
  repsRealizadas: 5,
  rir: 2,
};
function op(
  tipo: Operacion["tipo"],
  id: string,
  datos: unknown,
  revision = 0,
): Operacion {
  return {
    opId: crypto.randomUUID(),
    tipo,
    id,
    datos,
    revision,
    eliminado: false,
  };
}
beforeEach(async () => {
  local = sqliteD1();
  local.ejecutar(
    "INSERT INTO clientes(id,nombre,creado_en,actualizado_en) VALUES('test-a','Prueba A',unixepoch(),unixepoch()),('test-b','Prueba B',unixepoch(),unixepoch())",
  );
  await aplicar(
    local.db,
    "test-a",
    { ...ctx, rol: "coach", identidad: "coach@test.invalid" },
    op("plan", "programa", plan),
  );
});
afterEach(() => local.cerrar());
describe("persistencia real con SQL transaccional", () => {
  it("confirma y repite sin duplicar entrenamientos ni series", async () => {
    const e = op("entrenamiento", entrenamiento.id, entrenamiento);
    const s = op("serie", serie.id, serie);
    await aplicar(local.db, "test-a", ctx, e);
    await aplicar(local.db, "test-a", ctx, s);
    await aplicar(local.db, "test-a", ctx, e);
    await aplicar(local.db, "test-a", ctx, s);
    expect(
      (await leerCambios(local.db, "test-a", 0, "cliente")).cambios,
    ).toHaveLength(3);
    expect(
      await local.db
        .prepare("SELECT COUNT(*) n FROM entrenamientos")
        .first("n"),
    ).toBe(1);
  });
  it("conserva ambas versiones de una corrección concurrente", async () => {
    await aplicar(
      local.db,
      "test-a",
      ctx,
      op("entrenamiento", entrenamiento.id, entrenamiento),
    );
    await aplicar(local.db, "test-a", ctx, op("serie", serie.id, serie));
    const audit = {
      pesoRegistradoLb: 25,
      repsRealizadas: 5,
      rir: 2,
      corregidaEn: new Date().toISOString(),
    };
    const a = op(
      "serie",
      serie.id,
      { ...serie, pesoRegistradoLb: 30, correcciones: [audit] },
      1,
    );
    const b = op(
      "serie",
      serie.id,
      { ...serie, pesoRegistradoLb: 35, correcciones: [audit] },
      1,
    );
    expect(
      (await aplicar(local.db, "test-a", ctx, a)).confirmacion?.revision,
    ).toBe(2);
    expect((await aplicar(local.db, "test-a", ctx, b)).conflicto).toBeTruthy();
    expect(
      JSON.parse(
        (await actual(local.db, "test-a", "serie", serie.id))!.datos_json,
      ).pesoRegistradoLb,
    ).toBe(30);
    expect(
      await local.db.prepare("SELECT COUNT(*) n FROM conflictos").first("n"),
    ).toBe(1);
  });
  it("rechaza referencias cruzadas y escrituras de perfil de cliente", async () => {
    await aplicar(
      local.db,
      "test-a",
      ctx,
      op("entrenamiento", entrenamiento.id, entrenamiento),
    );
    await expect(
      aplicar(
        local.db,
        "test-b",
        { ...ctx, identidad: "test-b" },
        op("serie", serie.id, serie),
      ),
    ).rejects.toThrow("cuenta");
    await expect(
      aplicar(
        local.db,
        "test-a",
        ctx,
        op("perfil", "test-a", { id: "test-a" }),
      ),
    ).rejects.toThrow();
  });
  it("no reinterpreta el entrenamiento cuando el coach publica otro plan", async () => {
    await aplicar(
      local.db,
      "test-a",
      ctx,
      op("entrenamiento", entrenamiento.id, entrenamiento),
    );
    const nuevo = structuredClone(plan);
    nuevo.dias[0].slots[0].seriesObjetivo = 2;
    await aplicar(
      local.db,
      "test-a",
      { ...ctx, rol: "coach" },
      op("plan", "programa", nuevo, 1),
    );
    await expect(
      aplicar(
        local.db,
        "test-a",
        ctx,
        op(
          "entrenamiento",
          entrenamiento.id,
          { ...entrenamiento, prescripcion: nuevo.dias[0] },
          1,
        ),
      ),
    ).rejects.toThrow("inmutable");
    expect(
      JSON.parse(
        (await local.db
          .prepare("SELECT prescripcion_json FROM entrenamientos")
          .first<{ prescripcion_json: string }>())!.prescripcion_json,
      ).slots[0].seriesObjetivo,
    ).toBe(4);
  });
  it("no permite reciclar un recibo con valores distintos", async () => {
    const e = op("entrenamiento", entrenamiento.id, entrenamiento);
    await aplicar(local.db, "test-a", ctx, e);
    await expect(
      aplicar(local.db, "test-a", ctx, {
        ...e,
        datos: { ...entrenamiento, fecha: "2026-09-08" },
      }),
    ).rejects.toThrow("otro contenido");
  });
  it("el pull del cliente excluye borradores de programa y notas privadas", async () => {
    const perfil = {
      id: "test-a",
      nombre: "Prueba",
      sexo: null,
      edad: null,
      estaturaCm: null,
      pesoCorporalLb: null,
      objetivo: "Fuerza",
      frecuenciaEntrenamiento: 4,
      limitaciones: "",
      notas: "privado",
      ejerciciosEvitados: [],
    };
    await aplicar(
      local.db,
      "test-a",
      { ...ctx, rol: "coach" },
      op("perfil", "test-a", perfil),
    );
    await aplicar(
      local.db,
      "test-a",
      { ...ctx, rol: "coach" },
      op("plan", "borrador", { ...plan, id: "borrador", estado: "borrador" }),
    );
    const r = await leerCambios(local.db, "test-a", 0, "cliente");
    expect(r.cambios.some((c) => c.id === "borrador")).toBe(false);
    expect(JSON.stringify(r)).not.toContain("privado");
  });
  it("publica únicamente sesiones revisadas con 5–8 ejercicios", () => {
    expect(Plan.safeParse(plan).success).toBe(true);
    expect(Plan.safeParse({ ...plan, revisado: false }).success).toBe(false);
    expect(
      Plan.safeParse({
        ...plan,
        dias: [{ ...plan.dias[0], slots: plan.dias[0].slots.slice(0, 4) }],
      }).success,
    ).toBe(false);
  });
});
describe("fronteras de acceso", () => {
  it("el cliente no puede leer ni resolver conflictos privados del Coach", async () => {
    const coach = {
      ...ctx,
      rol: "coach" as const,
      identidad: "coach@test.invalid",
    };
    const borrador = op("plan", "borrador", {
      ...plan,
      id: "borrador",
      estado: "borrador",
    });
    await aplicar(local.db, "test-a", coach, borrador);
    const resultado = await aplicar(local.db, "test-a", coach, {
      ...borrador,
      opId: crypto.randomUUID(),
    });
    expect(resultado.conflicto).toBeTruthy();
    const row = await local.db
      .prepare("SELECT id FROM conflictos")
      .first<{ id: string }>();
    const inv = await crearInvitacion(local.db, "test-a");
    const sesion = await crearSesion(
      local.db,
      "test-a",
      await resumen(inv.token),
    );
    const headers = {
      Cookie: "sfm_sesion=" + sesion.cookie,
      Origin: "http://localhost",
    };
    const env = { ACCESO: local.db, SFM_ENV: "local" } as EntornoV2;
    const listado = await api(
      new Request("http://localhost/api/v2/conflictos", { headers }),
      env,
    );
    expect(await listado.json()).toEqual({ conflictos: [] });
    const resolucion = await api(
      new Request("http://localhost/api/v2/resolver", {
        method: "POST",
        headers,
        body: JSON.stringify({
          id: row!.id,
          resolucionId: crypto.randomUUID(),
          eleccion: "conservar-cloud",
          revisionCloud: 1,
          propuestas: [borrador],
        }),
      }),
      env,
    );
    expect(resolucion.status).toBe(404);
    expect(
      await local.db
        .prepare("SELECT resuelto_en FROM conflictos")
        .first("resuelto_en"),
    ).toBeNull();
  });
  it("rechaza solicitudes desde otros sitios", () => {
    expect(
      origenSeguro(
        new Request("https://sfm.test/api/v2/sincronizar", {
          method: "POST",
          headers: { Origin: "https://evil.test" },
        }),
      ),
    ).toBe(false);
    expect(
      origenSeguro(
        new Request("https://sfm.test/api/v2/sincronizar", {
          method: "POST",
          headers: { Origin: "https://sfm.test" },
        }),
      ),
    ).toBe(true);
  });
  it("valida firma, audiencia, emisor y expiración de Access", async () => {
    const { privateKey, publicKey } = await generateKeyPair("RS256");
    const env = {
      ACCESS_ISSUER: "https://sfm-qa.cloudflareaccess.com",
      ACCESS_AUD: "test",
    };
    const firmar = (
      aud = "test",
      iss = env.ACCESS_ISSUER,
      exp = Math.floor(Date.now() / 1000) + 60,
    ) =>
      new SignJWT({ email: "coach@test.invalid" })
        .setProtectedHeader({ alg: "RS256" })
        .setSubject("coach")
        .setIssuedAt()
        .setIssuer(iss)
        .setAudience(aud)
        .setExpirationTime(exp)
        .sign(privateKey);
    for (const token of [
      "inventado",
      await firmar("otro"),
      await firmar("test", "https://evil.test"),
      await firmar("test", env.ACCESS_ISSUER, 1),
    ])
      expect(
        await verificarCoach(
          new Request("http://localhost/admin", {
            headers: { "Cf-Access-Jwt-Assertion": token },
          }),
          env,
          async () => publicKey,
        ),
      ).toBeNull();
    expect(
      (
        await verificarCoach(
          new Request("http://localhost/admin", {
            headers: { "Cf-Access-Jwt-Assertion": await firmar() },
          }),
          env,
          async () => publicKey,
        )
      )?.identidad,
    ).toBe("coach@test.invalid");
  });
  it("las sesiones de previews antiguos y las revocadas no abren datos", async () => {
    const env = { ACCESO: local.db, SFM_ENV: "local" } as EntornoV2;
    const antigua = await crearSesion(local.db, "test-a", null);
    let r = await api(
      new Request("http://localhost/api/v2/inicio", {
        headers: { Cookie: "sfm_sesion=" + antigua.cookie },
      }),
      env,
    );
    expect(r.status).toBe(401);
    const inv = await crearInvitacion(local.db, "test-a");
    const real = await crearSesion(
      local.db,
      "test-a",
      await resumen(inv.token),
    );
    r = await api(
      new Request("http://localhost/api/v2/inicio", {
        headers: { Cookie: "sfm_sesion=" + real.cookie },
      }),
      env,
    );
    expect(r.status).toBe(200);
    local.ejecutar("UPDATE sesiones SET revocada_en=unixepoch()");
    expect(
      (
        await api(
          new Request("http://localhost/api/v2/inicio", {
            headers: { Cookie: "sfm_sesion=" + real.cookie },
          }),
          env,
        )
      ).status,
    ).toBe(401);
  });
  it("el QA local no se puede habilitar en producción con una clave de pruebas", async () => {
    const { privateKey, publicKey } = await generateKeyPair("RS256");
    const jwk = await exportJWK(publicKey);
    const env = {
      ACCESS_ISSUER: "https://sfm-qa.cloudflareaccess.com",
      ACCESS_AUD: "test",
      LOCAL_ACCESS_JWKS: JSON.stringify({ keys: [jwk] }),
      SFM_ENV: "production",
    };
    const token = await new SignJWT({ email: "coach@test.invalid" })
      .setProtectedHeader({ alg: "RS256" })
      .setSubject("coach")
      .setIssuedAt()
      .setIssuer(env.ACCESS_ISSUER)
      .setAudience("test")
      .setExpirationTime("1h")
      .sign(privateKey);
    expect(
      await verificarCoach(
        new Request("http://localhost/admin", {
          headers: { "Cf-Access-Jwt-Assertion": token },
        }),
        env,
      ),
    ).toBeNull();
  });
});
