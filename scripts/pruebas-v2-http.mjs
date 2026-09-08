import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
const base = new URL(process.env.BASE_URL ?? "http://localhost:8788");
if (
  !["localhost", "127.0.0.1"].includes(base.hostname) ||
  base.protocol !== "http:"
)
  throw Error(
    "Las escrituras de este QA sólo se permiten en el runtime local aislado.",
  );
const acceso = JSON.parse(
  await readFile(".qa-local/acceso-local.json", "utf8"),
);
if (acceso.entorno !== "local") throw Error("Fixture de otro entorno.");
const coach = { "Cf-Access-Jwt-Assertion": acceso.jwt };
let checks = 0;
async function pedir(
  ruta,
  headers = {},
  body,
  method = body === undefined ? "GET" : "POST",
) {
  return fetch(new URL(ruta, base), {
    method,
    redirect: "manual",
    headers: {
      Origin: base.origin,
      ...headers,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
async function codigo(r, esperado, nombre) {
  assert.equal(r.status, esperado, nombre);
  checks++;
  return r;
}
const contexto = await (
  await codigo(
    await pedir("/admin/api/v2/contexto", coach),
    200,
    "Coach firmado",
  )
).json();
assert.equal(contexto.entorno, "local");
await codigo(await pedir("/api/v2/inicio"), 401, "Cliente privado");
await codigo(await pedir("/admin/api/v2/clientes"), 401, "Coach privado");
await codigo(
  await pedir("/admin/api/v2/clientes", {
    "Cf-Access-Jwt-Assertion": "inventado",
  }),
  401,
  "JWT falsificado",
);
await codigo(await pedir("/demo"), 200, "Demo pública");
await codigo(
  await pedir("/admin/api/clientes", coach),
  410,
  "API anterior retirada",
);
const origen = await (
  await codigo(
    await pedir("/admin/api/v2/inicio?cliente=" + acceso.cliente, coach),
    200,
    "Fixture autorizado",
  )
).json();
const id = "sfm-qa-" + crypto.randomUUID().replaceAll("-", "");
const perfil = {
  ...origen.perfil,
  id,
  nombre: "Persona de integración · QA",
  notas: "Nota privada de integración",
};
const plan = {
  ...origen.plan,
  dias: origen.plan.dias.map((d, i) => ({
    ...d,
    id: id + "-dia-" + i,
    participanteId: id,
  })),
};
const alta = {
  id: crypto.randomUUID(),
  perfil,
  plan,
  paso: 3,
  completado: false,
};
const op = (tipo, id, datos, revision = 0) => ({
  opId: crypto.randomUUID(),
  tipo,
  id,
  datos,
  revision,
  eliminado: false,
});
await codigo(
  await pedir("/admin/api/v2/sincronizar", coach, {
    operaciones: [op("alta", alta.id, alta)],
  }),
  200,
  "Borrador cloud",
);
await codigo(
  await pedir("/admin/api/v2/crear-cliente", coach, {
    borradorId: alta.id,
    revision: 1,
  }),
  201,
  "Alta atómica",
);
const cbase = "/admin/api/v2";
const invitacion = await (
  await codigo(
    await pedir(cbase + "/invitar?cliente=" + id, coach, {}),
    200,
    "Invitación después del plan",
  )
).json();
const enlace = new URL(invitacion.enlace);
const aceptar = (invitacionUrl = enlace) =>
  fetch(new URL("/access", base), {
    method: "POST",
    redirect: "manual",
    headers: {
      Origin: base.origin,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ t: invitacionUrl.searchParams.get("t") }),
  });
const entrar = await aceptar();
await codigo(entrar, 302, "Invitación de un uso");
const cookie = entrar.headers.get("set-cookie").split(";")[0];
const cliente = { Cookie: cookie };
const segundo = await aceptar();
assert.notEqual(segundo.status, 302, "No reutiliza invitación");
checks++;
const inicio = await (
  await codigo(
    await pedir("/api/v2/inicio", cliente),
    200,
    "Cliente con sesión",
  )
).json();
assert.equal(inicio.perfil.id, id);
assert.equal(inicio.perfil.notas, "");
checks += 2;
await codigo(
  await pedir("/admin/api/v2/clientes", cliente),
  401,
  "Cliente no entra al Coach",
);
await codigo(
  await pedir("/api/v2/sincronizar", cliente, {
    operaciones: [op("perfil", id, perfil, 1)],
  }),
  403,
  "Cliente no cambia programación/perfil",
);
await codigo(
  await pedir(
    "/api/v2/sincronizar",
    { ...cliente, Origin: "https://otro.invalid" },
    { operaciones: [op("perfil", id, perfil, 1)] },
  ),
  403,
  "Origen externo",
);
const e = {
  id: crypto.randomUUID(),
  participanteId: id,
  plantillaDiaId: plan.dias[0].id,
  fecha: new Date().toISOString().slice(0, 10),
  prescripcion: plan.dias[0],
  cargas: {},
  planRevision: 1,
  procedencia: "app",
};
const eo = op("entrenamiento", e.id, e);
await codigo(
  await pedir("/api/v2/sincronizar", cliente, { operaciones: [eo] }),
  200,
  "Entrenamiento y prescripción",
);
const s = {
  id: crypto.randomUUID(),
  sesionId: e.id,
  ejercicioId: plan.dias[0].slots[0].ejercicioId,
  numeroSerie: 1,
  pesoRegistradoLb: 25,
  repsRealizadas: 5,
  rir: 2,
};
const so = op("serie", s.id, s);
await codigo(
  await pedir("/api/v2/sincronizar", cliente, { operaciones: [so] }),
  200,
  "Serie cloud",
);
await codigo(
  await pedir("/api/v2/sincronizar", cliente, { operaciones: [so] }),
  200,
  "Reintento idempotente",
);
const cambios = await (await pedir("/api/v2/cambios", cliente)).json();
assert.equal(cambios.cambios.filter((c) => c.tipo === "serie").length, 1);
checks++;
assert.ok(!JSON.stringify(cambios).includes(perfil.notas));
checks++;
const otro = await (
  await pedir("/api/v2/inicio?cliente=" + acceso.cliente, cliente)
).json();
assert.equal(otro.perfil.id, id, "La URL no cambia la identidad");
checks++;
// Otro dispositivo tiene otra sesión y ninguna copia local del entrenamiento.
const invitacion2 = await (
  await codigo(
    await pedir(cbase + "/invitar?cliente=" + id, coach, {}),
    200,
    "Invitación para segundo dispositivo",
  )
).json();
const entrar2 = await codigo(
  await aceptar(new URL(invitacion2.enlace)),
  302,
  "Acceso independiente",
);
const dispositivo2 = {
  Cookie: entrar2.headers.get("set-cookie").split(";")[0],
};
assert.notEqual(dispositivo2.Cookie, cliente.Cookie);
checks++;
const desdeOtro = await (await pedir("/api/v2/cambios", dispositivo2)).json();
assert.deepEqual(
  desdeOtro.cambios.filter((c) => c.tipo === "serie"),
  cambios.cambios.filter((c) => c.tipo === "serie"),
);
checks++;
const previewAntes = await (await pedir("/api/v2/cambios", cliente)).json();
await codigo(
  await pedir("/admin/vista/" + id, coach),
  200,
  "Shell de vista previa",
);
await codigo(
  await pedir(cbase + "/cambios?cliente=" + id, coach),
  200,
  "Preview sólo lee cambios",
);
assert.equal(
  (await (await pedir("/api/v2/cambios", cliente)).json()).cursor,
  previewAntes.cursor,
);
checks++;
await codigo(
  await pedir(cbase + "/revocar?cliente=" + id, coach, {}),
  200,
  "Revocación",
);
await codigo(
  await pedir("/api/v2/inicio", cliente),
  401,
  "La sesión revocada se bloquea",
);
await codigo(
  await pedir("/api/v2/inicio", dispositivo2),
  401,
  "Revocación en el segundo dispositivo",
);
await codigo(
  await pedir(cbase + "/archivar?cliente=" + id, coach, {}),
  200,
  "Archivo del fixture sintético",
);
await writeFile(
  ".qa-local/resultado-http-v2.json",
  JSON.stringify(
    { checks, entorno: "local", fecha: new Date().toISOString() },
    null,
    2,
  ),
);
console.log(
  `${checks} comprobaciones HTTP PASS · runtime local y datos sintéticos.`,
);
