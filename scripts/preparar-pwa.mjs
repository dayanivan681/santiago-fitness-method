import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
// Únicamente código, fuentes e iconos públicos. Nunca respuestas autenticadas.
const assets = ["/icono-192.png", "/icono-512.png"];
for (const dir of ["assets", "fuentes", "icons"]) {
  for (const entry of await readdir(`dist/${dir}`, {
    withFileTypes: true,
  }).catch(() => [])) {
    if (entry.isFile()) assets.push(`/${dir}/${entry.name}`);
  }
}
const version = createHash("sha256")
  .update(assets.sort().join("\n"))
  .digest("hex")
  .slice(0, 16);
const plantilla = await readFile("public/sw.js", "utf8");
await writeFile(
  "dist/sw.js",
  plantilla
    .replace("__SFM_BUILD__", version)
    .replace(
      "/*__SFM_ASSETS__*/",
      assets.map((v) => JSON.stringify(v)).join(","),
    ),
);
console.log(
  `PWA: ${assets.length} recursos públicos disponibles sin conexión.`,
);
