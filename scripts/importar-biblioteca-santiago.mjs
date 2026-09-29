#!/usr/bin/env node
/**
 * Importa la Biblioteca Maestra de Santiago (mensaje 02) como ejercicios suyos
 * en `ejercicios_coach`. Por defecto sólo respalda y ensaya; `--aplicar` escribe.
 *
 * Idempotente: id determinista por referencia (M02-nnn) e `INSERT … WHERE NOT
 * EXISTS` por id o por nombre activo, así que nunca pisa lo que Santiago haya
 * creado a mano ni duplica al repetirse.
 *
 * Uso: node scripts/importar-biblioteca-santiago.mjs --local|--staging|--produccion [--aplicar]
 */
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile, chmod } from "node:fs/promises";
import assert from "node:assert/strict";
import { fichasDeSantiago } from "./biblioteca-santiago.mjs";

const modo = process.argv[2];
assert.ok(["--local", "--staging", "--produccion"].includes(modo), "Usa --local, --staging o --produccion [--aplicar].");
assert.ok(process.argv.slice(3).every((a) => a === "--aplicar"), "Argumento desconocido.");
const aplicar = process.argv.includes("--aplicar");
const local = modo === "--local";
const produccion = modo === "--produccion";
const DESTINOS = {
  "--local": { nombre: "sfm-local", id: "00000000-0000-4000-8000-000000000001", ambiente: "local", config: "wrangler.local.toml" },
  "--staging": { nombre: "santiago-staging", id: "747a9348-369c-462d-83ba-37ae9bdaad48", ambiente: "staging", config: "wrangler.toml" },
  "--produccion": { nombre: "santiago-acceso", id: "7cb38489-4054-45e9-94d9-aad9c9f533f5", ambiente: "production", config: "wrangler.toml" },
};
const { nombre, id, ambiente, config } = DESTINOS[modo];
const texto = await readFile(config, "utf8");
const seccion = local ? texto : produccion ? texto.split("[env.preview.vars]")[0] : texto.split("[[env.preview.d1_databases]]")[1];
assert.ok(seccion?.includes(`database_id = "${id}"`) && (local || seccion.includes(`database_name = "${nombre}"`)), "Binding distinto del recurso revisado.");

const ejecutar = (args) =>
  execFileSync(
    "npx",
    [
      "--no-install", "wrangler", "d1", ...args, "--config", config,
      ...(local ? ["--local", "--persist-to", ".qa-local/v2-runtime"] : ["--remote"]),
      ...(modo === "--staging" ? ["--env", "preview"] : []),
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
const consulta = (sql) => {
  const salida = ejecutar(["execute", nombre, "--json", "--command", sql]);
  const inicio = salida.search(/\[\s*\{/);
  assert.ok(inicio >= 0, "Respuesta D1 no verificable.");
  return JSON.parse(salida.slice(inicio))[0].results;
};
const conteos = () =>
  consulta(
    "SELECT (SELECT COUNT(*) FROM ejercicios_coach) AS ejercicios, (SELECT COUNT(*) FROM ejercicios_coach WHERE referencia_catalogo LIKE 'M02-%') AS m02, (SELECT COUNT(*) FROM clientes) AS clientes, (SELECT COUNT(*) FROM rutinas) AS rutinas, (SELECT COUNT(*) FROM sesiones) AS sesiones",
  )[0];

assert.equal(consulta("SELECT nombre FROM entorno_sfm WHERE id=1")[0]?.nombre, ambiente, "Marcador de entorno incompatible.");

const texto2sql = (v) => (v === null ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replaceAll("'", "''")}'`);
const { importables, yaExisten, duplicados } = fichasDeSantiago();
const ahora = Date.now();
const sql = importables
  .map((f) => {
    const valores = [
      f.id, f.referenciaCatalogo, f.nombre, f.equipo, f.movimiento, f.musculoPrimario,
      JSON.stringify(f.musculosSecundarios), f.tipoCarga, f.incrementoMinimoLb, f.pesoBaseMaquinaLb,
      f.explicacionCorta, ahora, ahora,
    ].map(texto2sql);
    return `INSERT INTO ejercicios_coach (id, referencia_catalogo, nombre, equipo, movimiento, musculo_primario, musculos_secundarios_json, tipo_carga, incremento_lb, peso_base_lb, explicacion, creado_en, actualizado_en)
SELECT ${valores.join(", ")}
WHERE NOT EXISTS (SELECT 1 FROM ejercicios_coach WHERE id = ${texto2sql(f.id)})
  AND NOT EXISTS (SELECT 1 FROM ejercicios_coach WHERE activo = 1 AND lower(trim(nombre)) = lower(trim(${texto2sql(f.nombre)})));`;
  })
  .join("\n");

const carpeta = `.recovery/biblioteca-santiago-${ambiente}-${ahora}`;
await mkdir(carpeta, { recursive: true, mode: 0o700 });
await writeFile(`${carpeta}/importar.sql`, sql + "\n", { mode: 0o600 });
const antes = conteos();
console.log(`Fichas: ${importables.length} importables · ${yaExisten.length} ya existen · ${duplicados.length} duplicadas.`);
console.log("Antes:", JSON.stringify(antes));

let ensayo = null;
if (!local) {
  console.log("Respaldando y ensayando en una copia local…");
  ejecutar(["export", nombre, "--output", `${carpeta}/original.sql`]);
  await chmod(`${carpeta}/original.sql`, 0o600);
  ensayo = JSON.parse(
    execFileSync(
      "python3",
      [
        "-c",
        `
import sqlite3,sys,json
from pathlib import Path
p=Path(sys.argv[1]); db=sqlite3.connect(p/'ensayo.sqlite')
db.executescript((p/'original.sql').read_text())
fijas=lambda: [db.execute('SELECT COUNT(*) FROM '+t).fetchone()[0] for t in ('clientes','rutinas','sesiones','invitaciones')]
antes=fijas(); n0=db.execute('SELECT COUNT(*) FROM ejercicios_coach').fetchone()[0]
db.executescript((p/'importar.sql').read_text()); n1=db.execute('SELECT COUNT(*) FROM ejercicios_coach').fetchone()[0]
db.executescript((p/'importar.sql').read_text()); n2=db.execute('SELECT COUNT(*) FROM ejercicios_coach').fetchone()[0]
assert fijas()==antes, 'Se alteró una tabla original'
assert n2==n1, 'La segunda importación insertó filas'
assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
print(json.dumps({'insertaria':n1-n0,'repeticion':n2-n1,'originalesConservados':True}))
`,
        carpeta,
      ],
      { encoding: "utf8" },
    ),
  );
  await chmod(`${carpeta}/ensayo.sqlite`, 0o600);
  console.log("Ensayo:", JSON.stringify(ensayo));
}

const manifiesto = { entorno: ambiente, base: id, fecha: new Date(ahora).toISOString(), antes, ensayo, aplicado: false };
if (aplicar) {
  ejecutar(["execute", nombre, "--file", `${carpeta}/importar.sql`]);
  const despues = conteos();
  for (const t of ["clientes", "rutinas", "sesiones"]) assert.equal(despues[t], antes[t], `Cambió ${t}: revisar, no restaurar automáticamente.`);
  Object.assign(manifiesto, { aplicado: true, despues, insertadas: despues.ejercicios - antes.ejercicios });
  console.log("Después:", JSON.stringify(despues), `· insertadas: ${manifiesto.insertadas}`);
} else console.log("Ensayo aprobado. No se modificó D1. Añade --aplicar para escribir.");
await writeFile(`${carpeta}/manifest.json`, JSON.stringify(manifiesto, null, 2), { mode: 0o600 });
console.log(`Evidencia: ${carpeta}/manifest.json`);
