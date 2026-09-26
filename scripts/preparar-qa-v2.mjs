import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes, createHash, randomUUID } from "node:crypto";
import ts from "typescript";
import { generateKeyPair, exportJWK, SignJWT } from "jose";
const modo = process.argv[2];
if (!["--local", "--staging"].includes(modo))
  throw Error("Usa --local o --staging. Este programa no admite producción.");
const remoto = modo === "--staging";
const id = remoto
  ? "747a9348-369c-462d-83ba-37ae9bdaad48"
  : "00000000-0000-4000-8000-000000000001";
const config = remoto ? "wrangler.toml" : "wrangler.local.toml";
const texto = await readFile(config, "utf8");
const parte = remoto ? texto.split("[[env.preview.d1_databases]]")[1] : texto;
if (!parte?.includes(`database_id = "${id}"`))
  throw Error("La configuración no coincide con la base aislada de QA.");
const NOMBRE_QA = "Lucía · QA aislado";
const literalQA = "'" + NOMBRE_QA.replaceAll("'", "''") + "'";
await mkdir(".qa-local", { recursive: true, mode: 0o700 });
function ejecutar(args) {
  const salida = execFileSync(
    "npx",
    [
      "--no-install",
      "wrangler",
      "d1",
      "execute",
      remoto ? "santiago-staging" : "sfm-local",
      remoto ? "--remote" : "--local",
      "--config",
      config,
      ...(remoto
        ? ["--env", "preview"]
        : ["--persist-to", ".qa-local/v2-runtime"]),
      "--json",
      ...args,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  const inicio = salida.search(/\[\s*\{/);
  if (inicio < 0)
    throw Error(
      "Wrangler no devolvió un resultado verificable. Revisa el entorno antes de continuar.",
    );
  return JSON.parse(salida.slice(inicio));
}
const roles = (await readFile("migrations/0002_role_split.sql", "utf8")).split(
  "-- Se crean sólo",
)[0];
if (roles.includes("INSERT"))
  throw Error("El esquema de QA no puede contener semillas de personas.");
await writeFile(".qa-local/schema-roles.sql", roles, { mode: 0o600 });
for (const archivo of [
  "migrations/0001_acceso.sql",
  ".qa-local/schema-roles.sql",
  "migrations/0008_coaching_cloud.sql",
  "migrations/0010_cuentas.sql",
])
  ejecutar(["--file", archivo]);
const entorno = remoto ? "staging" : "local";
ejecutar([
  "--command",
  `INSERT OR IGNORE INTO entorno_sfm VALUES(1,'${entorno}')`,
]);
const nombre = ejecutar([
  "--command",
  "SELECT nombre FROM entorno_sfm WHERE id=1",
])[0]?.results?.[0]?.nombre;
if (nombre !== entorno)
  throw Error("La base pertenece a otro entorno. No se sembró QA.");

// Cada preparación deja una sola ficha de QA. Sin esto se acumulaban «Lucía ·
// QA aislado» duplicadas en la lista del Coach, una por ejecución. Sólo en
// local: en staging vive evidencia de QA que no es nuestra.
if (!remoto) {
  const tablas = (
    ejecutar(["--command", "SELECT name FROM sqlite_master WHERE type='table'"])[0]
      ?.results ?? []
  ).map((t) => t.name);
  // Primero las hijas: hay claves foráneas hacia clientes(id).
  const hijas = [
    "restablecimientos",
    "cuentas",
    "sesiones",
    "invitaciones",
    "entrenamientos",
    "medios",
    "importaciones_partidas",
    "importaciones_revisiones",
    "importaciones",
    "conflictos",
    "cambios",
    "rutinas",
  ].filter((t) => tablas.includes(t));
  const deQA = `cliente_id IN (SELECT id FROM clientes WHERE nombre=${literalQA})`;
  await writeFile(
    ".qa-local/limpieza-local.sql",
    [
      ...hijas.map((t) => `DELETE FROM ${t} WHERE ${deQA};`),
      `DELETE FROM clientes WHERE nombre=${literalQA};`,
    ].join("\n"),
    { mode: 0o600 },
  );
  ejecutar(["--file", ".qa-local/limpieza-local.sql"]);
}
// Transpila exclusivamente el módulo canónico sin dependencias del catálogo.
const fuente = ts.transpileModule(
  await readFile("shared/plantillas-base.ts", "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
const { PLANTILLAS_BASE } = await import(
  "data:text/javascript;base64," + Buffer.from(fuente).toString("base64")
);
const cliente = "sfm-qa-" + randomUUID().replaceAll("-", "");
const perfil = {
  id: cliente,
  nombre: NOMBRE_QA,
  sexo: null,
  edad: null,
  estaturaCm: null,
  pesoCorporalLb: null,
  objetivo: "Entrenar con constancia",
  frecuenciaEntrenamiento: 4,
  limitaciones: "",
  notas: "Nota privada de QA: no debe verla el cliente.",
  ejerciciosEvitados: [],
};
const plan = {
  id: "programa",
  estado: "publicado",
  revisado: true,
  dias: PLANTILLAS_BASE.map((d) => ({
    id: `${cliente}-${d.slug}`,
    participanteId: cliente,
    nombre: d.nombre,
    orden: d.orden,
    slots: d.slots,
  })),
};
const literal = (v) => "'" + String(v).replaceAll("'", "''") + "'";
const token = randomBytes(32).toString("base64url");
const cookie = randomBytes(32).toString("base64url");
const hash = (v) => createHash("sha256").update(v).digest("hex");
const ahora = Math.floor(Date.now() / 1000);
const sql = `INSERT INTO clientes(id,nombre,creado_en,actualizado_en) VALUES(${literal(cliente)},${literal(perfil.nombre)},${ahora},${ahora});
INSERT INTO cambios(cliente_id,tipo,documento_id,revision,datos_json,operacion_id,hash,actor,creado_en) VALUES(${literal(cliente)},'perfil',${literal(cliente)},1,${literal(JSON.stringify(perfil))},${literal(randomUUID())},'fixture','qa',${ahora * 1000}),(${literal(cliente)},'plan','programa',1,${literal(JSON.stringify(plan))},${literal(randomUUID())},'fixture','qa',${ahora * 1000});
INSERT INTO invitaciones(token_hash,cliente_id,creada_en,expira_en) VALUES(${literal(hash(token))},${literal(cliente)},${ahora},${ahora + 86400});
INSERT INTO sesiones(id,cliente_id,invitacion,creada_en,expira_en) VALUES(${literal(hash(cookie))},${literal(cliente)},${literal(hash(token))},${ahora},${ahora + 86400});`;
const archivo = `.qa-local/fixture-${entorno}.sql`;
await writeFile(archivo, sql, { mode: 0o600 });
ejecutar(["--file", archivo]);
const acceso = { entorno, cliente, cookie, token, creadoEn: ahora };
if (!remoto) {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const key = {
    ...(await exportJWK(publicKey)),
    kid: "qa-local",
    alg: "RS256",
  };
  await writeFile(
    ".dev.vars",
    `LOCAL_ACCESS_JWKS='${JSON.stringify({ keys: [key] })}'\n`,
    { mode: 0o600 },
  );
  acceso.jwt = await new SignJWT({ email: "coach@sfm.invalid" })
    .setProtectedHeader({ alg: "RS256", kid: "qa-local" })
    .setSubject("qa-local")
    .setIssuedAt()
    .setIssuer("https://sfm-qa.cloudflareaccess.com")
    .setAudience("sfm-local-tests")
    .setExpirationTime("24h")
    .sign(privateKey);
}
await writeFile(`.qa-local/acceso-${entorno}.json`, JSON.stringify(acceso), {
  mode: 0o600,
});
console.log(
  `QA ${entorno} preparado en su base aislada. Accesos guardados en el directorio privado de pruebas.`,
);
