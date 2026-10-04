// @vitest-environment jsdom
import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { webcrypto } from "node:crypto";
import { waitFor } from "@testing-library/react";
import { ConexionCloud, estadoCambiar, estadoNube } from "../src/nube/cloud";
import { sqliteD1 } from "./d1";
import { perfil, plan, contexto, operacion, serie, personas } from "./fixtures";
import { aplicar } from "../functions/lib/v2/datos";
import { api } from "../functions/lib/v2/api";
import { crearInvitacion } from "../functions/lib/invitacion";
import { entrarConInvitacion } from "../functions/lib/sesion";
import { RepositorioMemoria } from "../src/nube/memoria";
import { ServicioCoach } from "../src/producto/servicio";
import type { EntornoV2 } from "../functions/lib/v2/seguridad";
let local: ReturnType<typeof sqliteD1>;
let conexiones: ConexionCloud[] = [];
let cookie = "";
let red = true;
let perderConfirmacion = false;
let revocada = false;
let conStripe = false;
const ctx = () => ({ ...contexto(), medios: false });
async function conexion(dispositivo: string) {
  vi.stubGlobal("location", { host: dispositivo, origin: "http://localhost" });
  const c = new ConexionCloud(ctx());
  conexiones.push(c);
  await c.preparar({ contexto: ctx(), perfil, plan, revision: 1 });
  return c;
}
const crear = (c: ConexionCloud) =>
  c.repositorio.crearSesion({
    id: "test-entreno",
    participanteId: perfil.id,
    plantillaDiaId: plan.dias[0].id,
    fecha: "2026-09-07",
  });
async function quieta(c: ConexionCloud) {
  await waitFor(() => expect(c.ocupado).toBe(false));
  await c.sincronizar();
}
beforeEach(async () => {
  vi.stubGlobal("crypto", webcrypto);
  local = sqliteD1();
  personas(local);
  red = true;
  perderConfirmacion = false;
  revocada = false;
  conStripe = false;
  estadoCambiar({
    bloqueado: false,
    pendientes: 0,
    conflictos: 0,
    conectado: true,
  });
  await aplicar(
    local.db,
    perfil.id,
    { ...ctx(), rol: "coach" },
    operacion("perfil", perfil.id, perfil),
  );
  await aplicar(
    local.db,
    perfil.id,
    { ...ctx(), rol: "coach" },
    operacion("plan", "programa", plan),
  );
  const inv = await crearInvitacion(local.db, perfil.id);
  cookie = (await entrarConInvitacion(local.db, inv.token))!.cookie;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string | URL, init?: RequestInit) => {
      if (!red) throw TypeError("Sin red");
      if (revocada)
        return new Response(JSON.stringify({ error: "Revocado" }), {
          status: 401,
        });
      const req = new Request(String(url), {
        ...init,
        headers: {
          ...init?.headers,
          Cookie: `sfm_sesion=${cookie}`,
          Origin: "http://localhost",
        },
      });
      const respuesta = await api(req, {
        ACCESO: local.db,
        SFM_ENV: "local",
        ...(conStripe ? { STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: "whsec_x" } : {}),
      } as EntornoV2);
      if (perderConfirmacion && String(url).includes("/sincronizar")) {
        perderConfirmacion = false;
        throw TypeError("Confirmación perdida");
      }
      return respuesta;
    }),
  );
});
afterEach(async () => {
  for (const c of conexiones) {
    await waitFor(() => expect(c.ocupado).toBe(false));
    c.limpiar();
    await c.db.delete();
  }
  conexiones = [];
  local.cerrar();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});
describe("caché y cola durable", () => {
  it("guarda datos y operación en una sola transacción, y revierte ambos si falla la cola", async () => {
    const c = await conexion("atomic");
    red = false;
    await crear(c);
    await quieta(c);
    const fallo = vi
      .spyOn(c.db.cola, "add")
      .mockRejectedValueOnce(Error("Disco lleno"));
    await expect(c.repositorio.registrarSerie(serie)).rejects.toThrow(
      "Disco lleno",
    );
    expect(await c.db.series.count()).toBe(0);
    expect(await c.db.cola.count()).toBe(1);
    fallo.mockRestore();
  });
  it("cierra offline y recupera los mismos registros pendientes al volver a abrir", async () => {
    const c = await conexion("offline");
    red = false;
    await crear(c);
    await c.repositorio.registrarSerie(serie);
    await quieta(c);
    const nombre = c.db.name;
    c.limpiar();
    const nueva = new ConexionCloud(ctx());
    expect(nueva.db.name).toBe(nombre);
    conexiones.push(nueva);
    await nueva.preparar();
    expect(await nueva.db.series.count()).toBe(1);
    expect(await nueva.db.cola.count()).toBe(2);
    red = true;
    await quieta(nueva);
    expect(await nueva.db.cola.count()).toBe(0);
    expect(
      await local.db
        .prepare("SELECT COUNT(*) n FROM cambios WHERE tipo='serie'")
        .first("n"),
    ).toBe(1);
  });
  it("sin suscripción conserva lo registrado, sigue recibiendo cambios y lo envía al renovar", async () => {
    conStripe = true;
    const c = await conexion("suscripcion");
    await crear(c);
    await c.repositorio.registrarSerie(serie);
    await quieta(c);
    expect(await c.db.cola.count()).toBe(2);
    expect(estadoNube.suscripcionInactiva).toBe(true);
    expect(estadoNube.conectado).toBe(true);
    const pedidas = vi.mocked(fetch).mock.calls.map(([u]) => String(u));
    expect(pedidas.findLastIndex((u) => u.includes("/cambios"))).toBeGreaterThan(
      pedidas.findLastIndex((u) => u.includes("/sincronizar")),
    );
    await local.db
      .prepare("INSERT INTO suscripciones (cliente_id, exento, actualizado_en) VALUES (?, 1, 1)")
      .bind(perfil.id)
      .run();
    await quieta(c);
    expect(await c.db.cola.count()).toBe(0);
    expect(estadoNube.suscripcionInactiva).toBe(false);
  });
  it("reintenta una confirmación perdida sin duplicar el entrenamiento", async () => {
    const c = await conexion("retry");
    perderConfirmacion = true;
    await crear(c);
    await waitFor(() => expect(c.ocupado).toBe(false));
    expect(await c.db.cola.count()).toBe(1);
    await c.sincronizar();
    expect(await c.db.cola.count()).toBe(0);
    expect(
      await local.db
        .prepare("SELECT COUNT(*) n FROM entrenamientos")
        .first("n"),
    ).toBe(1);
  });
  it("dos dispositivos reflejan series y cambios del coach sin reinterpretar el workout", async () => {
    const a = await conexion("device-a");
    const b = await conexion("device-b");
    await crear(a);
    await a.repositorio.registrarSerie(serie);
    await quieta(a);
    await quieta(b);
    expect((await b.db.series.get(serie.id))?.pesoRegistradoLb).toBe(25);
    const nuevo = structuredClone(plan);
    nuevo.dias[0].nombre = "Nuevo plan";
    nuevo.dias[0].slots[0].seriesObjetivo = 2;
    await aplicar(
      local.db,
      perfil.id,
      { ...ctx(), rol: "coach" },
      operacion("plan", "programa", nuevo, 1),
    );
    await quieta(a);
    expect((await a.db.plantillas.get(plan.dias[0].id))?.nombre).toBe(
      "Nuevo plan",
    );
    expect(
      (await a.db.sesiones.get("test-entreno"))?.prescripcion?.nombre,
    ).toBe(plan.dias[0].nombre);
  });
  it("una revocación bloquea lecturas futuras y escrituras sin perder lo pendiente", async () => {
    const c = await conexion("revoked");
    red = false;
    await crear(c);
    await quieta(c);
    red = true;
    revocada = true;
    await c.sincronizar();
    expect(estadoNube.bloqueado).toBe(true);
    await expect(c.repositorio.registrarSerie(serie)).rejects.toThrow("Acceso");
    expect(await c.db.cola.count()).toBe(1);
  });
  it("el acceso offline vence al cumplir 24 horas y no sobrepasa la sesión", async () => {
    const c = await conexion("expiry");
    c.ctx = { ...c.ctx, validadoEn: Date.now() - 86400001 };
    await expect(crear(c)).rejects.toThrow("Acceso");
    c.ctx = { ...c.ctx, validadoEn: Date.now(), expiraEn: Date.now() - 1 };
    await expect(crear(c)).rejects.toThrow("Acceso");
  });
  it("identidad y entorno separan físicamente las cachés", () => {
    vi.stubGlobal("location", { host: "sfm.test", origin: "https://sfm.test" });
    const a = new ConexionCloud(ctx());
    const b = new ConexionCloud({ ...ctx(), identidad: "test-b" });
    const staging = new ConexionCloud({ ...ctx(), entorno: "staging" });
    expect(new Set([a.db.name, b.db.name, staging.db.name]).size).toBe(3);
    a.db.close();
    b.db.close();
    staging.db.close();
  });
  it("la demo comparte actividad entre roles sin red, IndexedDB ni storage", async () => {
    const abrir = vi.spyOn(indexedDB, "open");
    const storage = vi.spyOn(Storage.prototype, "setItem");
    const red = vi.mocked(fetch);
    red.mockClear();
    const servicio = new ServicioCoach(true);
    const repo = await servicio.repoDemo("demo-persona-1");
    expect(repo).toBeInstanceOf(RepositorioMemoria);
    const p = (await repo.listarPlantillas("demo-persona-1"))[0];
    await repo.crearSesion({
      id: "demo-nueva",
      participanteId: "demo-persona-1",
      plantillaDiaId: p.id,
      fecha: "2026-09-07",
      prescripcion: p,
    });
    const cambios = await servicio.cambios("demo-persona-1");
    expect(cambios.some((c) => c.id === "demo-nueva")).toBe(true);
    expect(abrir).not.toHaveBeenCalled();
    expect(storage).not.toHaveBeenCalled();
    expect(red).not.toHaveBeenCalled();
  });
});

describe("biblioteca del coach en el cliente", () => {
  const ID = "coach-ej-3f2b8c1e-9d4a-4b7e-8a51-0c6d2e9f1a77";
  const insertar = (extra = "") =>
    local.ejecutar(
      `INSERT INTO ejercicios_coach (id, referencia_catalogo, nombre, equipo, movimiento, musculo_primario, tipo_carga, incremento_lb, explicacion, foto_clave, creado_en, actualizado_en)
       VALUES ('${ID}','C012','Jalón neutro','cable','jalon-vertical','espalda','pesoMaquina',5,'Tira hacia el pecho.','biblioteca/${ID}',1,7)${extra}`,
    );
  const refrescar = async (c: ConexionCloud) => {
    c.ultimaBiblioteca = 0;
    await quieta(c);
  };

  it("guarda los ejercicios del coach en Dexie con la foto apuntando a la API", async () => {
    insertar();
    const c = await conexion("biblioteca");
    await quieta(c);
    expect(await c.db.ejercicios.get(ID)).toMatchObject({
      nombre: "Jalón neutro",
      equipo: "cable",
      movimiento: "jalon-vertical",
      musculoPrimario: "espalda",
      tipoCarga: "pesoMaquina",
      imagen: `/api/v2/biblioteca/${ID}/foto?v=7`,
    });
    expect((await c.db.ejercicios.get(ID))?.animacion).toBeUndefined();
    // Convive con las fichas fijas de la semilla.
    expect(await c.db.ejercicios.get("press-banca-barra")).toBeTruthy();
  });

  it("sin red conserva lo último recibido y al volver toma los cambios del coach", async () => {
    insertar();
    const c = await conexion("biblioteca-offline");
    await quieta(c);
    red = false;
    await refrescar(c);
    expect((await c.db.ejercicios.get(ID))?.nombre).toBe("Jalón neutro");
    red = true;
    local.ejecutar(`UPDATE ejercicios_coach SET nombre='Jalón agarre neutro', actualizado_en=9 WHERE id='${ID}'`);
    await refrescar(c);
    expect(await c.db.ejercicios.get(ID)).toMatchObject({ nombre: "Jalón agarre neutro", imagen: `/api/v2/biblioteca/${ID}/foto?v=9` });
  });

  it("no vuelve a pedir la biblioteca en cada sincronización, y respeta la calibración del cliente", async () => {
    insertar();
    const c = await conexion("biblioteca-calibrada");
    await quieta(c);
    const llamadas = () => (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.filter(([u]) => String(u).includes("/biblioteca")).length;
    const antes = llamadas();
    await quieta(c);
    expect(llamadas()).toBe(antes);

    const propio = (await c.db.ejercicios.get(ID))!;
    await c.repositorio.guardarEjercicio({ ...propio, incrementoMinimoLb: 2.5 });
    await quieta(c);
    local.ejecutar(`UPDATE ejercicios_coach SET incremento_lb=10, nombre='Nuevo nombre', actualizado_en=11 WHERE id='${ID}'`);
    await refrescar(c);
    expect(await c.db.ejercicios.get(ID)).toMatchObject({ nombre: "Nuevo nombre", incrementoMinimoLb: 2.5 });
  });

  it("si la biblioteca no cambió, el servidor responde 304 y el cliente no toca Dexie", async () => {
    insertar();
    const c = await conexion("biblioteca-304");
    await quieta(c);
    const guardar = vi.spyOn(c.db.ejercicios, "put");
    const respuestas: number[] = [];
    const original = fetch as unknown as ReturnType<typeof vi.fn>;
    const envolver = original.getMockImplementation() as (url: string | URL, init?: RequestInit) => Promise<Response>;
    original.mockImplementation(async (url: string | URL, init?: RequestInit) => {
      const r = await envolver(url, init);
      if (String(url).includes("/biblioteca")) respuestas.push(r.status);
      return r;
    });
    await refrescar(c);
    expect(respuestas).toEqual([304]);
    expect(guardar).not.toHaveBeenCalled();
    expect((await c.db.ejercicios.get(ID))?.nombre).toBe("Jalón neutro");
  });

  it("un ejercicio archivado deja de llegar pero se conserva por su historial", async () => {
    insertar();
    const c = await conexion("biblioteca-archivada");
    await quieta(c);
    local.ejecutar(`UPDATE ejercicios_coach SET activo=0 WHERE id='${ID}'`);
    await refrescar(c);
    expect(await c.db.ejercicios.get(ID)).toBeTruthy();
  });
});
