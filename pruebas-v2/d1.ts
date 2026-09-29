import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
function literal(v: unknown) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  return "'" + String(v).replaceAll("'", "''") + "'";
}
export function sqliteD1() {
  let consultas = 0;
  const directorio = mkdtempSync(join(tmpdir(), "sfm-v2-"));
  const archivo = join(directorio, "test.sqlite");
  function ejecutar(sql: string) {
    return execFileSync("/usr/bin/sqlite3", ["-json", archivo], {
      input: ".bail on\nPRAGMA foreign_keys=ON;\n" + sql + ";\n",
      encoding: "utf8",
    });
  }
  class Sentencia {
    sql: string;
    args: unknown[] = [];
    constructor(sql: string) {
      this.sql = sql;
    }
    bind(...args: unknown[]) {
      this.args = args;
      return this;
    }
    final() {
      let i = 0;
      return this.sql.replace(/\?(\d+)?/g, (_m, n) =>
        literal(this.args[n ? Number(n) - 1 : i++]),
      );
    }
    async first(col?: string) {
      consultas++;
      const filas = JSON.parse(ejecutar(this.final()) || "[]");
      return col ? (filas[0]?.[col] ?? null) : (filas[0] ?? null);
    }
    async all() {
      consultas++;
      return {
        results: JSON.parse(ejecutar(this.final()) || "[]"),
        success: true,
        meta: {},
      };
    }
    async run() {
      consultas++;
      ejecutar(this.final());
      return { success: true, results: [], meta: { changes: 1 } };
    }
  }
  const db = {
    prepare: (s: string) => new Sentencia(s),
    batch: async (ss: Sentencia[]) => {
      consultas += ss.length;
      ejecutar(
        "BEGIN IMMEDIATE;" + ss.map((s) => s.final()).join(";") + ";COMMIT",
      );
      return ss.map(() => ({ success: true, results: [], meta: {} }));
    },
    exec: async (s: string) => {
      ejecutar(s);
    },
  };
  for (const m of [
    "0001_acceso.sql",
    "0002_role_split.sql",
    "0008_coaching_cloud.sql",
    "0010_cuentas.sql",
    "0011_suscripciones.sql",
    "0012_biblioteca_coach.sql",
  ])
    ejecutar(
      readFileSync(new URL("../migrations/" + m, import.meta.url), "utf8"),
    );
  ejecutar("INSERT INTO entorno_sfm VALUES(1,'local')");
  return {
    get consultas() { return consultas; },
    reiniciarConsultas: () => { consultas = 0; },
    db: db as unknown as D1Database,
    ejecutar,
    cerrar: () => rmSync(directorio, { recursive: true, force: true }),
  };
}
