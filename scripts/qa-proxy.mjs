import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
createServer(async (req, res) => {
  try {
    const acceso = JSON.parse(
      await readFile(".qa-local/acceso-local.json", "utf8"),
    );
    if (acceso.entorno !== "local" || !acceso.jwt)
      throw Error("Sólo se permite la identidad firmada del entorno local.");
    if (req.url === "/qa/cliente") {
      res.writeHead(302, {
        "Set-Cookie": `sfm_sesion=${acceso.cookie}; HttpOnly; SameSite=Lax; Path=/`,
        Location: "/",
        "Cache-Control": "no-store",
      });
      res.end();
      return;
    }
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers))
      if (v && !["host", "connection", "content-length"].includes(k))
        headers.set(k, Array.isArray(v) ? v.join(",") : v);
    if (req.url.startsWith("/admin"))
      headers.set("Cf-Access-Jwt-Assertion", acceso.jwt);
    if (headers.has("origin")) headers.set("Origin", "http://localhost:8788");
    const partes = [];
    for await (const p of req) partes.push(p);
    const respuesta = await fetch("http://localhost:8788" + req.url, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method)
        ? undefined
        : Buffer.concat(partes),
      redirect: "manual",
    });
    const h = {};
    for (const [k, v] of respuesta.headers)
      if (
        !["content-encoding", "content-length", "transfer-encoding"].includes(k)
      )
        h[k] = v;
    res.writeHead(respuesta.status, h);
    res.end(Buffer.from(await respuesta.arrayBuffer()));
  } catch {
    res.writeHead(502);
    res.end("Inicia el entorno local de Pages para continuar.");
  }
}).listen(8789, "127.0.0.1", () =>
  console.log("QA local: http://127.0.0.1:8789 · /admin · /qa/cliente"),
);
