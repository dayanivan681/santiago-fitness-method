import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cpSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Second build: no shared chunks or publicDir copy can expose the private app.
export default defineConfig({
  base: "/",
  publicDir: false,
  plugins: [
    react(),
    {
      name: "presentation-public-media",
      enforce: "pre",
      transform(source, id) {
        if (id.endsWith("/src/index.css")) {
          const fonts = readFileSync(
            resolve("src/estilos/fuentes.css"),
            "utf8",
          ).replaceAll("/fuentes/", "../public/fuentes/");
          return source.replace("@import './estilos/fuentes.css';", fonts);
        }
      },
      generateBundle(_options, bundle) {
        for (const asset of Object.values(bundle)) {
          if (asset.type === "asset" && asset.fileName.endsWith(".css")) {
            asset.source = String(asset.source).replaceAll(
              "/fuentes/",
              "/presentacion/media/fuentes/",
            );
          }
        }
      },
      closeBundle() {
        const destination = resolve("dist/presentacion/media");
        mkdirSync(destination, { recursive: true });
        for (const folder of ["ejercicios", "fuentes"]) {
          cpSync(resolve("public", folder), resolve(destination, folder), {
            recursive: true,
          });
        }
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    assetsDir: "presentacion/assets",
    rolldownOptions: { input: resolve("presentacion/index.html") },
  },
});
