import {
  cp,
  mkdir,
  readFile,
  writeFile,
  symlink,
  readlink,
} from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
await mkdir(".qa-local/runtime", { recursive: true, mode: 0o700 });
const config = await readFile("wrangler.local.toml", "utf8");
if (!config.includes('SFM_ENV = "local"'))
  throw Error("El servidor de QA requiere configuración local.");
await writeFile(".qa-local/runtime/wrangler.toml", config);
// Wrangler ubica su worker temporal desde el package.json más cercano. Un
// proyecto propio evita que vuelva a leer la configuración productiva del repo.
await writeFile(
  ".qa-local/runtime/package.json",
  JSON.stringify({ name: "sfm-local-runtime", private: true, type: "module" }),
);
await writeFile(".qa-local/runtime/.dev.vars", await readFile(".dev.vars"), {
  mode: 0o600,
});
try {
  await symlink("../../functions", ".qa-local/runtime/functions", "dir");
} catch (e) {
  if (
    e.code !== "EEXIST" ||
    (await readlink(".qa-local/runtime/functions")) !== "../../functions"
  )
    throw e;
}
await cp("dist", ".qa-local/runtime/dist", { recursive: true });
const proceso = spawn(
  "npx",
  [
    "--no-install",
    "wrangler",
    "--cwd",
    resolve(".qa-local/runtime"),
    "pages",
    "dev",
    "dist",
    "--persist-to",
    "../v2-runtime",
    "--port",
    "8788",
  ],
  { cwd: ".qa-local/runtime", stdio: "inherit" },
);
proceso.on("exit", (codigo) => process.exit(codigo ?? 1));
