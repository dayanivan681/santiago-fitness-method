// Genera shared/catalogo-pdf.ts a partir del CSV del catálogo del PDF del cliente.
// Uso: node scripts/generar-catalogo-pdf.mjs
import { readFile, writeFile } from "node:fs/promises";

const ORIGEN = "docs/BIBLIOTECA-FASE-3A-CATALOGO.csv";
const DESTINO = "shared/catalogo-pdf.ts";

/** Equipo del PDF → `Equipo` del dominio. Lo que no encaja queda sin equipo y se elige a mano. */
const EQUIPO = {
  "cable/polea": "cable",
  "máquina": "maquinaTradicional",
  prensa: "maquinaTradicional",
  mancuernas: "mancuernas",
  "barra libre": "barraLibre",
  "barra EZ": "barraLibre",
  "landmine/T-bar": "barraLibre",
  Smith: "smith",
  "peso corporal (clase, no aparato)": "pesoCorporal",
  paralelas: "pesoCorporal",
  "silla romana": "pesoCorporal",
  pared: "pesoCorporal",
  "rueda abdominal": "pesoCorporal",
  banco: "pesoCorporal",
};

/** CSV con comillas dobles, saltos de línea dentro de campos y BOM. */
function leerCsv(texto) {
  const filas = [];
  let fila = [];
  let campo = "";
  let entrecomillado = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (entrecomillado) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') entrecomillado = false;
      else campo += c;
    } else if (c === '"') entrecomillado = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo); campo = "";
      if (fila.length > 1 || fila[0] !== "") filas.push(fila);
      fila = [];
    } else campo += c;
  }
  if (campo !== "" || fila.length) { fila.push(campo); filas.push(fila); }
  return filas;
}

const [cabecera, ...filas] = leerCsv((await readFile(ORIGEN, "utf8")).replace(/^﻿/, ""));
const col = (nombre) => cabecera.indexOf(nombre);
const fichas = filas.map((f) => {
  const equipos = JSON.parse(f[col("equipment")] || "[]");
  return {
    ref: f[col("canonical_ref")],
    // Algunas fichas del PDF sólo tienen nombre en inglés: se usa la etiqueta original.
    nombre: (f[col("canonical_name_es")] || f[col("canonical_label_source")]).trim(),
    equipo: EQUIPO[equipos[0]] ?? null,
  };
});

const lineas = fichas.map((x) => `  ${JSON.stringify(x)},`).join("\n");
await writeFile(
  DESTINO,
  `/**
 * Catálogo del PDF de Santiago (${fichas.length} fichas), sólo para que el coach elija una al añadir un
 * ejercicio: se rellenan el nombre y el equipo, el resto lo completa él.
 *
 * GENERADO por scripts/generar-catalogo-pdf.mjs desde ${ORIGEN}. No editar a mano.
 * \`equipo\` es null cuando el PDF habla de un aparato que la app no distingue (banda, fitball, disco).
 */
import type { EQUIPOS } from './v2/biblioteca'

export interface FichaCatalogoPdf {
  readonly ref: string
  readonly nombre: string
  readonly equipo: (typeof EQUIPOS)[number] | null
}

export const CATALOGO_PDF: readonly FichaCatalogoPdf[] = [
${lineas}
]
`,
);
console.log(`${fichas.length} fichas → ${DESTINO}`);
