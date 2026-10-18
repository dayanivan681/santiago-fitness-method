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
const entradaSinGoogle = await codigo(await pedir('/entrar'), 200, 'Entrada disponible sin secretos de Google');
assert.ok(!(await entradaSinGoogle.text()).includes('Continuar con Google'));
checks++;
await codigo(await pedir('/auth/google?origen=entrar'), 401, 'Google falla cerrado sin secretos');
// El coach con Access vigente (cookie CF_Authorization) no ve el login de clientes.
const destino = (r) => r.headers.get("location");
const coachCookie = { Cookie: `CF_Authorization=${acceso.jwt}` };
assert.equal(destino(await codigo(await pedir("/", coachCookie), 302, "Coach con Access en /")), "/admin/");
assert.equal(destino(await codigo(await pedir("/entrar", coachCookie), 302, "Coach con Access en /entrar")), "/admin/");
assert.equal(destino(await codigo(await pedir("/", { Cookie: "CF_Authorization=inventado" }), 302, "Cookie de Access falsificada en /")), "/entrar");
await codigo(await pedir("/entrar", { Cookie: "CF_Authorization=inventado" }), 200, "Cookie de Access falsificada en /entrar");
assert.equal(destino(await codigo(await pedir("/"), 302, "Sin cookies, / va al login")), "/entrar");
await codigo(await pedir('/auth/google/retorno'), 401, 'Retorno de Google falla cerrado sin estado');
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
const email = `qa-${id}@example.test`;
const clave = `Qa-${crypto.randomUUID()}!`;
const aceptar = (invitacionUrl = enlace) =>
  fetch(new URL("/access", base), {
    method: "POST",
    redirect: "manual",
    headers: {
      Origin: base.origin,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ t: invitacionUrl.searchParams.get("t"), email, clave }),
  });
await codigo(await pedir(enlace.pathname + enlace.search), 200, "Formulario de cuenta sin consumir invitación");
const entrar = await aceptar();
await codigo(entrar, 302, "Invitación de un uso");
const cookie = entrar.headers.get("set-cookie").split(";")[0];
const cliente = { Cookie: cookie };
// La sesión del cliente dura 90 días y, con ella, «/» sirve la app aunque llegue también la cookie del coach.
assert.match(entrar.headers.get("set-cookie"), /Max-Age=7776000/);
checks++;
await codigo(await pedir("/", { Cookie: `${cookie}; CF_Authorization=${acceso.jwt}` }), 200, "Cliente con sesión en / ve la app");
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
// Suscripción: sin claves de Stripe todo falla cerrado y nadie toca lo ajeno.
await codigo(
  await fetch(new URL("/api/stripe/webhook", base), { method: "POST", body: "{}", redirect: "manual" }),
  404,
  "Webhook de Stripe cerrado sin configuración",
);
const miSuscripcion = await (
  await codigo(await pedir("/api/v2/suscripcion?cliente=otro-cliente", cliente), 200, "Cliente ve su suscripción")
).json();
assert.equal(miSuscripcion.clienteId, id, "El parámetro cliente no cambia la identidad");
assert.equal(miSuscripcion.acceso.estado, "sin_suscripcion");
assert.equal(miSuscripcion.pagosDisponibles, false);
checks += 3;
await codigo(await pedir("/api/v2/suscripcion/pagar", cliente, {}), 503, "Pagar falla cerrado sin Stripe");
await codigo(await pedir("/api/v2/suscripcion/exento", cliente, { exento: true }), 404, "Cliente no se marca exento");
await codigo(await pedir(cbase + "/suscripcion/exento", coach, { exento: true }), 400, "Coach debe elegir cliente");
await codigo(await pedir(cbase + "/suscripcion/exento?cliente=" + id, coach, { exento: true }), 200, "Coach marca exento");
const exenta = await (await codigo(await pedir("/api/v2/suscripcion", cliente), 200, "Cliente exento")).json();
assert.equal(exenta.acceso.estado, "exenta");
checks++;
const todas = await (await codigo(await pedir(cbase + "/suscripciones", coach), 200, "Coach ve suscripciones")).json();
assert.ok(todas.suscripciones.some((s) => s.clienteId === id && s.exento));
checks++;
// Biblioteca del coach: crea, sube foto, el cliente lee y un plan la usa.
const bytesFoto = (firma) => new Uint8Array([...firma, ...new Uint8Array(64)]);
const pedirBytes = (ruta, headers, bytes) =>
  fetch(new URL(ruta, base), { method: "PUT", redirect: "manual", headers: { Origin: base.origin, ...headers }, body: bytes });
const ejercicioNuevo = {
  referenciaCatalogo: "C012", nombre: "Jalón neutro QA", equipo: "cable", movimiento: "jalon-vertical",
  musculoPrimario: "espalda", musculosSecundarios: ["biceps"], tipoCarga: "pesoMaquina",
  incrementoMinimoLb: 5, explicacionCorta: "Tira hacia el pecho.",
};
await codigo(await pedir("/api/v2/biblioteca"), 401, "Biblioteca privada sin sesión");
await codigo(await pedir("/api/v2/biblioteca", cliente, ejercicioNuevo), 403, "Cliente no crea ejercicios");
const creado = await (await codigo(await pedir(cbase + "/biblioteca", coach, ejercicioNuevo), 201, "Coach crea ejercicio")).json();
const ejId = creado.ejercicio.id;
assert.match(ejId, /^coach-ej-[0-9a-f-]{36}$/);
checks++;
await codigo(await pedirBytes(`/api/v2/biblioteca/${ejId}/foto`, cliente, bytesFoto([255, 216, 255])), 403, "Cliente no sube fotos");
await codigo(await pedirBytes(`${cbase}/biblioteca/${ejId}/foto`, coach, bytesFoto([71, 73, 70])), 400, "Foto con firma inválida");
await codigo(await pedirBytes(`${cbase}/biblioteca/${ejId}/foto`, coach, bytesFoto([255, 216, 255])), 200, "Coach sube la foto");
const listaCliente = await (await codigo(await pedir("/api/v2/biblioteca", cliente), 200, "Cliente lee la biblioteca")).json();
assert.ok(listaCliente.ejercicios.some((x) => x.id === ejId && x.tieneFoto));
checks++;
const fotoCliente = await codigo(await pedir(`/api/v2/biblioteca/${ejId}/foto`, cliente), 200, "Foto llega al cliente");
assert.equal(fotoCliente.headers.get("content-type"), "image/jpeg");
checks++;
// Animación (GIF): sólo el coach la sube o la quita; ambos roles la leen.
const gifQA = new Uint8Array([71, 73, 70, 56, 57, 97, ...new Uint8Array(64)]);
await codigo(await pedir(`/api/v2/biblioteca/${ejId}/animacion`), 401, "Animación privada sin sesión");
await codigo(await pedirBytes(`/api/v2/biblioteca/${ejId}/animacion`, cliente, gifQA), 403, "Cliente no sube animaciones");
await codigo(await pedirBytes(`${cbase}/biblioteca/${ejId}/animacion`, coach, bytesFoto([255, 216, 255])), 400, "JPEG disfrazado de GIF da 400");
await codigo(await pedirBytes(`${cbase}/biblioteca/${ejId}/animacion`, coach, gifQA), 200, "Coach sube el GIF");
const conGif = await (await pedir("/api/v2/biblioteca", cliente)).json();
assert.ok(conGif.ejercicios.some((x) => x.id === ejId && x.tieneAnimacion && x.tieneFoto));
const gifCliente = await codigo(await pedir(`/api/v2/biblioteca/${ejId}/animacion`, cliente), 200, "GIF llega al cliente");
assert.equal(gifCliente.headers.get("content-type"), "image/gif");
checks += 2;
await codigo(await pedir(`/api/v2/biblioteca/${ejId}/animacion`, cliente, undefined, "DELETE"), 403, "Cliente no borra animaciones");
await codigo(await pedir(`${cbase}/biblioteca/${ejId}/animacion`, coach, undefined, "DELETE"), 200, "Coach quita el GIF");
await codigo(await pedir(`/api/v2/biblioteca/${ejId}/animacion`, cliente), 404, "Sin GIF tras quitarlo");
const planConCoach = {
  ...plan,
  dias: plan.dias.map((d, i) => (i === 0 ? { ...d, slots: d.slots.map((sl, j) => (j === 0 ? { ...sl, ejercicioId: ejId } : sl)) } : d)),
};
const inventado = "coach-ej-00000000-0000-0000-0000-000000000000";
const planInventado = { ...planConCoach, dias: planConCoach.dias.map((d, i) => (i === 0 ? { ...d, slots: d.slots.map((sl, j) => (j === 0 ? { ...sl, ejercicioId: inventado } : sl)) } : d)) };
const revisionPlan = (await (await pedir(cbase + "/inicio?cliente=" + id, coach)).json()).revision;
await codigo(await pedir(cbase + "/sincronizar?cliente=" + id, coach, { operaciones: [op("plan", "programa", planInventado, revisionPlan)] }), 400, "Plan con id inventado da 400");
await codigo(await pedir(cbase + "/sincronizar?cliente=" + id, coach, { operaciones: [op("plan", "programa", planConCoach, revisionPlan)] }), 200, "Plan con ejercicio del coach se publica");
// Lista condicional: con el ETag de la respuesta, sin cambios da 304 y sin cuerpo.
const listaConEtag = await codigo(await pedir("/api/v2/biblioteca", cliente), 200, "Lista con ETag");
const etag = listaConEtag.headers.get("etag");
assert.ok(etag, "La lista trae ETag");
const sinCambios = await codigo(await pedir("/api/v2/biblioteca", { ...cliente, "If-None-Match": etag }), 304, "Biblioteca sin cambios da 304");
assert.equal(await sinCambios.text(), "");
checks += 2;
// Biblioteca Maestra de Santiago: sólo si se importó antes (npm run biblioteca:santiago -- --local --aplicar).
const m02 = (await listaConEtag.json()).ejercicios.filter((x) => x.referenciaCatalogo?.startsWith("M02-"));
if (m02.length) {
  assert.equal(m02.length, 279, "El import local deja las 279 fichas de Santiago");
  const planM02 = { ...planConCoach, dias: planConCoach.dias.map((d, i) => (i === 1 ? { ...d, slots: d.slots.map((sl, j) => (j === 0 ? { ...sl, ejercicioId: m02[0].id } : sl)) } : d)) };
  const rev = (await (await pedir(cbase + "/inicio?cliente=" + id, coach)).json()).revision;
  await codigo(await pedir(cbase + "/sincronizar?cliente=" + id, coach, { operaciones: [op("plan", "programa", planM02, rev)] }), 200, "Plan con un ejercicio M02 importado se publica");
  checks++;
} else console.log("Biblioteca de Santiago sin importar en local: se omiten sus comprobaciones.");
// Split de 5 días: Lower–Upper–Lower–Upper–Lower (los 4 días del cliente más Lower C).
{
  const [ua, la, ub, lb] = plan.dias;
  const lowerC = { ...la, id: id + "-dia-lower-c", nombre: "Lower C" };
  const cinco = { ...plan, dias: [la, ua, lb, ub, lowerC].map((d, i) => ({ ...d, orden: i + 1 })) };
  const rev = (await (await pedir(cbase + "/inicio?cliente=" + id, coach)).json()).revision;
  await codigo(await pedir(cbase + "/sincronizar?cliente=" + id, coach, { operaciones: [op("plan", "programa", cinco, rev)] }), 200, "Plan de 5 días se publica");
  const leido = await (await codigo(await pedir("/api/v2/inicio", cliente), 200, "Cliente lee el plan de 5 días")).json();
  assert.equal(leido.plan.dias.length, 5);
  assert.equal(leido.plan.dias[4].nombre, "Lower C");
  checks++;
}
// Bi-series: una sesión con 6 ejercicios y los dos primeros en la bi-serie A (5 bloques).
{
  const conGrupo = (grupoSegundo) => ({
    ...plan,
    dias: plan.dias.map((d, i) => {
      if (i !== 0) return d;
      const slots = [...d.slots, { ...d.slots.at(-1) }].map((sl, j) => ({ ...sl, orden: j + 1 }));
      slots[0] = { ...slots[0], grupo: "A", seriesObjetivo: 3, descansoSegundos: 0 };
      slots[1] = { ...slots[1], seriesObjetivo: 3, ...(grupoSegundo ? { grupo: "A" } : {}) };
      return { ...d, slots };
    }),
  });
  let rev = (await (await pedir(cbase + "/inicio?cliente=" + id, coach)).json()).revision;
  await codigo(await pedir(cbase + "/sincronizar?cliente=" + id, coach, { operaciones: [op("plan", "programa", conGrupo(true), rev)] }), 200, "Plan con bi-serie se publica");
  const leido = await (await codigo(await pedir("/api/v2/inicio", cliente), 200, "Cliente lee el plan con bi-serie")).json();
  assert.deepEqual(leido.plan.dias[0].slots.slice(0, 3).map((sl) => sl.grupo ?? null), ["A", "A", null], "El grupo se conserva al releer");
  rev = (await (await pedir(cbase + "/inicio?cliente=" + id, coach)).json()).revision;
  await codigo(await pedir(cbase + "/sincronizar?cliente=" + id, coach, { operaciones: [op("plan", "programa", conGrupo(false), rev)] }), 400, "Grupo de un solo ejercicio da 400");
  checks++;
}
await codigo(await pedir(`${cbase}/biblioteca/${ejId}`, coach, { activo: false }, "PATCH"), 200, "Coach archiva el ejercicio");
const tras = await (await pedir("/api/v2/biblioteca", cliente)).json();
assert.ok(!tras.ejercicios.some((x) => x.id === ejId), "Archivado no se distribuye");
checks++;
await codigo(await pedir(cbase + "/sincronizar?cliente=" + id, coach, { operaciones: [op("plan", "programa", planConCoach, (await (await pedir(cbase + "/inicio?cliente=" + id, coach)).json()).revision)] }), 400, "Plan con ejercicio archivado da 400");
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
// Otro dispositivo usa email y contraseña: la invitación original sigue gastada.
const entrar2 = await codigo(
  await fetch(new URL('/entrar', base), { method: 'POST', redirect: 'manual',
    headers: { Origin: base.origin, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email, clave }) }),
  302,
  "Acceso independiente con contraseña",
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
const pedirFormulario = (ruta, campos) => fetch(new URL(ruta, base), {
  method: 'POST', redirect: 'manual',
  headers: { Origin: base.origin, 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams(campos),
});
const enlaceClave = await (await codigo(
  await pedir(cbase + '/restablecer-clave?cliente=' + id, coach, {}), 200,
  'Coach prepara recuperación',
)).json();
const urlClave = new URL(enlaceClave.enlace);
await codigo(await pedir(urlClave.pathname + urlClave.search), 200, 'El enlace de recuperación abre sin gastarse');
const claveNueva = `Nueva-${crypto.randomUUID()}!`;
await codigo(await pedirFormulario('/restablecer', { t: urlClave.searchParams.get('t'), clave: claveNueva }),
  200, 'Recuperación de un solo uso');
await codigo(await pedirFormulario('/restablecer', { t: urlClave.searchParams.get('t'), clave: claveNueva }),
  400, 'Recuperación gastada');
await codigo(await pedir('/api/v2/inicio', cliente), 401, 'Recuperación revoca sesión anterior');
await codigo(await pedirFormulario('/entrar', { email, clave }), 401, 'Contraseña anterior rechazada');
const entrar3 = await codigo(await pedirFormulario('/entrar', { email, clave: claveNueva }),
  302, 'Contraseña nueva aceptada');
const dispositivo3 = { Cookie: entrar3.headers.get('set-cookie').split(';')[0] };
for (let i = 0; i < 5; i++) await codigo(await pedirFormulario('/entrar',
  { email: `desconocido-${id}@example.test`, clave: 'Incorrecta-123' }), 401, 'Fallo de acceso limitado');
await codigo(await pedirFormulario('/entrar',
  { email: `desconocido-${id}@example.test`, clave: 'Incorrecta-123' }), 401, 'Límite de intentos activo');
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
await codigo(await pedir('/api/v2/inicio', dispositivo3), 401, 'Revocación tras recuperar contraseña');
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
