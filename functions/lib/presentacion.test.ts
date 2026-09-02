import { describe, expect, it, vi } from "vitest";
import { esRutaPresentacion, servirPresentacion } from "./presentacion";

describe("Frontera pública de presentación", () => {
  it.each([
    "/presentacion",
    "/presentacion/",
    "/presentacion/assets/index-123.js",
    "/presentacion/media/ejercicios/prensa.jpg",
  ])("permite sólo el namespace público: %s", (path) =>
    expect(esRutaPresentacion(path)).toBe(true),
  );
  it.each([
    "/",
    "/assets/index.js",
    "/ejercicios/prensa.jpg",
    "/api/cliente",
    "/admin/",
    "/presentacion/index.html",
    "/presentacion-privada",
    "/presentacion/api/cliente",
    "/presentacion/assets%2findex.js",
  ])("mantiene protegido %s", (path) =>
    expect(esRutaPresentacion(path)).toBe(false),
  );
  it("no reenvía cookies; la página pública no abre conexiones ni formularios", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(
          '<html><script src="/presentacion/assets/index.js"></script></html>',
          {
            headers: {
              "Content-Type": "text/html",
              "Set-Cookie": "never=forward",
            },
          },
        ),
      );
    const response = await servirPresentacion(
      new Request("https://app.test/presentacion?demo=1", {
        headers: { Cookie: "private=session" },
      }),
      { fetch } as unknown as Fetcher,
    );
    expect(fetch.mock.calls[0][0].headers.get("Cookie")).toBeNull();
    expect(response.headers.get("Set-Cookie")).toBeNull();
    expect(response.headers.get("Content-Security-Policy")).toContain(
      "connect-src 'none'",
    );
    expect(response.headers.get("Content-Security-Policy")).toContain(
      "form-action 'none'",
    );
  });
  it("rechaza el fallback HTML de un asset inexistente y los POST", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response("<html>private app</html>", {
          headers: { "Content-Type": "text/html" },
        }),
      );
    const assets = { fetch } as unknown as Fetcher;
    expect(
      (
        await servirPresentacion(
          new Request("https://app.test/presentacion/assets/missing.js"),
          assets,
        )
      ).status,
    ).toBe(404);
    expect(
      (
        await servirPresentacion(
          new Request("https://app.test/presentacion", { method: "POST" }),
          assets,
        )
      ).status,
    ).toBe(405);
  });
});
