#!/usr/bin/env node
/** Migración aditiva. Por defecto sólo respalda y ensaya; --aplicar es explícito. */
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile, chmod } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const entorno = process.argv[2];
assert.ok(
  ["--produccion", "--staging"].includes(entorno),
  "Usa --produccion o --staging [--aplicar].",
);
assert.ok(
  process.argv.slice(3).every((a) => a === "--aplicar"),
  "Argumento desconocido.",
);
const produccion = entorno === "--produccion";
const nombre = produccion ? "santiago-acceso" : "santiago-staging";
const id = produccion
  ? "7cb38489-4054-45e9-94d9-aad9c9f533f5"
  : "747a9348-369c-462d-83ba-37ae9bdaad48";
const ambiente = produccion ? "production" : "staging";
const config = await readFile("wrangler.toml", "utf8");
const seccion = produccion
  ? config.split("[env.preview.vars]")[0]
  : config.split("[[env.preview.d1_databases]]")[1];
assert.ok(
  seccion?.includes(`database_id = "${id}"`) &&
    seccion.includes(`database_name = "${nombre}"`),
  "Binding distinto del recurso revisado.",
);
const carpeta = `.recovery/migracion-${ambiente}-${Date.now()}`;
await mkdir(carpeta, { recursive: true, mode: 0o700 });
const ejecutar = (args) =>
  execFileSync(
    "npx",
    [
      "--no-install",
      "wrangler",
      ...args,
      "--config",
      "wrangler.toml",
      ...(!produccion ? ["--env", "preview"] : []),
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
const consulta = (sql) => {
  const texto = ejecutar([
    "d1",
    "execute",
    nombre,
    "--remote",
    "--json",
    "--command",
    sql,
  ]);
  const inicio = texto.search(/\[\s*\{/);
  assert.ok(inicio >= 0, "Respuesta D1 no verificable.");
  return JSON.parse(texto.slice(inicio))[0].results;
};
const tablas = ["clientes", "rutinas", "sesiones", "invitaciones"];
const huella = (filas) =>
  createHash("sha256")
    .update(
      JSON.stringify(
        filas
          .map((f) => Object.fromEntries(Object.entries(f).sort()))
          .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
      ),
    )
    .digest("hex");
const inventario = () =>
  Object.fromEntries(
    tablas.map((t) => {
      const filas = consulta(`SELECT * FROM ${t}`);
      return [t, { registros: filas.length, sha256: huella(filas) }];
    }),
  );
const marcaExiste = consulta(
  "SELECT name FROM sqlite_master WHERE type='table' AND name='entorno_sfm'",
).length;
if (marcaExiste)
  assert.equal(
    consulta("SELECT nombre FROM entorno_sfm WHERE id=1")[0]?.nombre,
    ambiente,
    "Marcador de entorno incompatible.",
  );
console.log(
  "Respaldando y ensayando restauración en una base local protegida…",
);
ejecutar([
  "d1",
  "export",
  nombre,
  "--remote",
  "--output",
  `${carpeta}/original.sql`,
]);
await chmod(`${carpeta}/original.sql`, 0o600);
const antes = inventario();
const sql =
  (
    await Promise.all(
      ["0008_coaching_cloud.sql", "0009_versiones_originales.sql", "0010_cuentas.sql"].map((f) =>
        readFile(`migrations/${f}`, "utf8"),
      ),
    )
  ).join("\n") +
  `\nINSERT OR IGNORE INTO entorno_sfm VALUES(1,'${ambiente}');\n`;
await writeFile(`${carpeta}/aditiva.sql`, sql, { mode: 0o600 });
// Un ensayo repetido debe conservar exactamente las cuatro tablas originales.
// La restauración usa una base nueva; nunca restaura sobre un recurso remoto.
const ensayo = execFileSync(
  "python3",
  [
    "-c",
    `
import sqlite3,sys,json,hashlib
from pathlib import Path
p=Path(sys.argv[1]); db=sqlite3.connect(p/'ensayo.sqlite')
db.executescript((p/'original.sql').read_text())
tablas=['clientes','rutinas','sesiones','invitaciones']
def original():
 return {t: sorted(db.execute('SELECT * FROM '+t).fetchall(), key=repr) for t in tablas}
antes=original()
for _ in range(2):
 db.executescript((p/'aditiva.sql').read_text())
 assert original()==antes, 'Se alteró una tabla original'
assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
assert not db.execute('PRAGMA foreign_key_check').fetchall()
print(json.dumps({'restauracion':'ok','repeticion':'ok','originalesConservados':True,'versiones':db.execute('SELECT count(*) FROM cambios').fetchone()[0]}))
`,
    carpeta,
  ],
  { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
);
await chmod(`${carpeta}/ensayo.sqlite`, 0o600);
assert.deepEqual(
  inventario(),
  antes,
  "La base cambió durante el respaldo: repite antes de aplicar.",
);
const manifest = {
  entorno: ambiente,
  base: id,
  fecha: new Date().toISOString(),
  originalSha256: createHash("sha256")
    .update(await readFile(`${carpeta}/original.sql`))
    .digest("hex"),
  tablas: antes,
  ensayo: JSON.parse(ensayo),
  aplicado: false,
};
await writeFile(`${carpeta}/manifest.json`, JSON.stringify(manifest, null, 2), {
  mode: 0o600,
});
if (process.argv.includes("--aplicar")) {
  // Sólo estas migraciones revisadas: nunca se recorre el directorio de semillas.
  ejecutar([
    "d1",
    "execute",
    nombre,
    "--remote",
    "--file",
    `${carpeta}/aditiva.sql`,
  ]);
  assert.deepEqual(
    inventario(),
    antes,
    "Cambios concurrentes o diferencias: revisar el manifiesto; no restaurar automáticamente.",
  );
  assert.equal(
    consulta("SELECT nombre FROM entorno_sfm WHERE id=1")[0]?.nombre,
    ambiente,
  );
  assert.equal(
    consulta("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('cuentas','restablecimientos','intentos_de_acceso')").length,
    3,
    "Faltan tablas de cuentas tras la migración.",
  );
  manifest.aplicado = true;
  await writeFile(
    `${carpeta}/manifest.json`,
    JSON.stringify(manifest, null, 2),
    { mode: 0o600 },
  );
  console.log("Migraciones aditivas aplicadas. Tablas originales conservadas.");
} else
  console.log(
    "Ensayo aprobado. No se modificó D1. Añade --aplicar sólo durante el rollout revisado.",
  );
console.log(`Evidencia protegida: ${carpeta}/manifest.json`);
