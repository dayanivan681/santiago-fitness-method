/** Exact public boundary; never let Pages' SPA fallback serve the private shell. */
export function esRutaPresentacion(path: string): boolean {
  return (
    path === "/presentacion" ||
    path === "/presentacion/" ||
    /^\/presentacion\/(assets|media)\/[a-zA-Z0-9_./-]+$/.test(path)
  );
}

export async function servirPresentacion(
  request: Request,
  assets: Fetcher,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Método no permitido", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }
  const url = new URL(request.url);
  const document =
    url.pathname === "/presentacion" || url.pathname === "/presentacion/";
  if (document) url.pathname = "/presentacion/";
  url.search = "";
  // Do not forward client cookies or authentication headers to the asset request.
  const response = await assets.fetch(new Request(url, { method: "GET" }));
  const type = response.headers.get("Content-Type") ?? "";
  if (!response.ok || (!document && type.includes("text/html"))) {
    return new Response("No encontrado", { status: 404 });
  }
  const body = document ? await response.text() : response.body;
  if (
    document &&
    (typeof body !== "string" || !body.includes("/presentacion/assets/"))
  ) {
    return new Response("No encontrado", { status: 404 });
  }
  const headers = new Headers(response.headers);
  headers.delete("Set-Cookie");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set(
    "Content-Security-Policy",
    "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; frame-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'self'",
  );
  return new Response(request.method === "HEAD" ? null : body, {
    status: response.status,
    headers,
  });
}
