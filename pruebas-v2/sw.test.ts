// @vitest-environment node
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el service worker cachea la foto fija de la biblioteca pero no el GIF de la animación", () => {
  const sw = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
  const inicio = sw.indexOf("/^\\/api\\/v2\\/biblioteca");
  const fin = sw.indexOf("$/.test(u.pathname)", inicio);
  expect(inicio).toBeGreaterThan(0);
  const patron = new RegExp(sw.slice(inicio + 1, fin + 1));
  const id = "coach-ej-3f2b8c1e-9d4a-4b7e-8a51-0c6d2e9f1a77";
  expect(patron.test(`/api/v2/biblioteca/${id}/foto`)).toBe(true);
  expect(patron.test(`/api/v2/biblioteca/${id}/animacion`)).toBe(false);
});
