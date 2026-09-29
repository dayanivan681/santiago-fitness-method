// Genera shared/biblioteca-santiago.ts desde la Biblioteca Maestra de Santiago (mensaje 02).
// Uso: node scripts/generar-biblioteca-santiago.mjs
import { writeFile } from "node:fs/promises";
import { fichasDeSantiago, ORIGEN } from "./biblioteca-santiago.mjs";

const DESTINO = "shared/biblioteca-santiago.ts";
const { fichas, importables, yaExisten, duplicados } = fichasDeSantiago();
const lineas = fichas.map((f) => `  ${JSON.stringify(f)},`).join("\n");
await writeFile(
  DESTINO,
  `/**
 * Biblioteca Maestra de Santiago (mensaje 02): ${fichas.length} filas de su lista.
 *
 * GENERADO por scripts/generar-biblioteca-santiago.mjs desde ${ORIGEN}. No editar a mano.
 * Cada fila tiene \`id\` (se importa como ejercicio suyo), \`yaExiste\` (id de la ficha
 * fija con el mismo nombre) o \`duplicadoDe\` (referencia de la fila que sí se importa).
 */
import type { EjercicioCoachNuevo } from './v2/biblioteca'

export type FilaBibliotecaSantiago = EjercicioCoachNuevo & {
  readonly referenciaCatalogo: string
  readonly id?: string
  readonly yaExiste?: string
  readonly duplicadoDe?: string
}

export const BIBLIOTECA_SANTIAGO: readonly FilaBibliotecaSantiago[] = [
${lineas}
]
`,
);
console.log(`${fichas.length} filas → ${DESTINO}`);
console.log(`Importables: ${importables.length} · ya existen: ${yaExisten.length} · duplicados: ${duplicados.length}`);
for (const f of yaExisten) console.log(`  ya existe: ${f.referenciaCatalogo} «${f.nombre}» → ${f.yaExiste}`);
for (const f of duplicados) console.log(`  duplicado: ${f.referenciaCatalogo} «${f.nombre}» → ${f.duplicadoDe}`);
