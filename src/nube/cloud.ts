import { BaseDatosSantiago } from "../datos/esquema";
import { RepositorioLocal } from "../datos/repositorioLocal";
import { sembrar } from "../datos/semilla";
import type { Repositorio } from "../datos/repositorio";
import {
  validarOperacion,
  type Cambio,
  type Contexto,
  type Operacion,
  type Perfil,
  type Plan,
  type Tipo,
} from "../../shared/v2/contratos";
import type { Participante, PlantillaDia, Sesion } from "../dominio/tipos";
import { notificar } from "./eventos";
export type Pendiente = Operacion & {
  secuencia?: number;
  clave: string;
  estado: "pendiente" | "conflicto";
  error?: string;
};
export type Inicio = {
  contexto: Contexto;
  perfil: Perfil | null;
  plan: Plan;
  revision: number;
};
export let estadoNube = {
  pendientes: 0,
  conflictos: 0,
  mensaje: "",
  bloqueado: false,
  conectado: true,
};
export function estadoCambiar(parcial: Partial<typeof estadoNube>) {
  estadoNube = { ...estadoNube, ...parcial };
  notificar();
}
export class ClienteApi {
  base: string;
  cliente?: string;
  constructor(coach = false, cliente?: string) {
    this.base = coach ? "/admin/api/v2" : "/api/v2";
    this.cliente = cliente;
  }
  async pedir<T>(
    ruta: string,
    body?: unknown,
    method = body === undefined ? "GET" : "POST",
  ): Promise<T> {
    const url = new URL(this.base + ruta, location.origin);
    if (this.cliente) url.searchParams.set("cliente", this.cliente);
    const r = await fetch(url, {
      method,
      credentials: "same-origin",
      redirect: "manual",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    // Access redirige al login antes de llegar a Functions. No seguir ese
    // redirect como si fuera un fallo de red: también invalida datos visibles.
    if (r.status === 401 || r.type === "opaqueredirect") {
      estadoCambiar({
        bloqueado: true,
        mensaje: "Tu acceso caducó. Vuelve a entrar; lo pendiente se conserva.",
      });
      throw new ErrorAcceso();
    }
    const d = (await r.json()) as {
      error?: string;
      resultados?: unknown;
      recibo?: unknown;
    };
    if (!r.ok && !(r.status === 409 && (d.resultados || d.recibo)))
      throw new ErrorRespuesta(
        d.error ?? "No se pudo conectar. Inténtalo de nuevo.",
        r.status,
      );
    return d as T;
  }
}
export class ErrorRespuesta extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
export class ErrorAcceso extends Error {
  constructor() {
    super("Acceso privado requerido");
  }
}
const MUTACIONES: Partial<
  Record<keyof Repositorio, { tipo: Tipo; borrar?: boolean }>
> = {
  guardarParticipante: { tipo: "perfil" },
  guardarPlantilla: { tipo: "plan" },
  crearSesion: { tipo: "entrenamiento" },
  actualizarSesion: { tipo: "entrenamiento" },
  registrarSerie: { tipo: "serie" },
  corregirSerie: { tipo: "serie" },
  guardarBorrador: { tipo: "borrador" },
  borrarBorrador: { tipo: "borrador", borrar: true },
  guardarSustitucion: { tipo: "sustitucion" },
  quitarSustitucion: { tipo: "sustitucion", borrar: true },
  guardarProgreso: { tipo: "progreso" },
  borrarProgreso: { tipo: "progreso", borrar: true },
  guardarEjercicio: { tipo: "calibracion" },
};
const TABLAS: Partial<Record<Tipo, string>> = {
  perfil: "participantes",
  entrenamiento: "sesiones",
  serie: "series",
  borrador: "borradores",
  sustitucion: "sustituciones",
  progreso: "progreso",
};
export class ConexionCloud {
  db: BaseDatosSantiago;
  api: ClienteApi;
  ctx: Contexto;
  local: RepositorioLocal;
  repositorio: Repositorio;
  ocupado = false;
  timer?: ReturnType<typeof setInterval>;
  cerrada = false;
  constructor(ctx: Contexto, cliente = ctx.identidad) {
    this.ctx = ctx;
    this.api = new ClienteApi(
      ctx.rol === "coach",
      ctx.rol === "coach" ? cliente : undefined,
    );
    this.db = new BaseDatosSantiago(
      `sfm-v2:${location.host}:${ctx.entorno}:${ctx.rol}:${ctx.identidad}:${cliente}`,
    );
    this.local = new RepositorioLocal(this.db, cliente);
    this.repositorio = new Proxy(this.local, {
      get: (target, nombre) => {
        const original = Reflect.get(target, nombre);
        if (typeof original !== "function") return original;
        const mutacion = MUTACIONES[nombre as keyof Repositorio];
        if (!mutacion) return original.bind(target);
        return async (...args: unknown[]) => {
          this.comprobarAcceso();
          const { tipo, borrar } = mutacion;
          if (tipo === "perfil" || tipo === "plan")
            throw Error("Tu coach prepara tu perfil y programa.");
          const id = borrar
            ? String(args[0])
            : String((args[0] as { id: string }).id);
          let datos = borrar ? null : args[0];
          if (nombre === "crearSesion") {
            const s = args[0] as Sesion;
            const p = await this.db.plantillas.get(s.plantillaDiaId);
            const cargas = Object.fromEntries(
              (await this.db.ejercicios.toArray()).map((e) => [
                e.id,
                {
                  tipoCarga: e.tipoCarga,
                  incrementoMinimoLb: e.incrementoMinimoLb,
                  ...(e.pesoBaseMaquinaLb === undefined
                    ? {}
                    : { pesoBaseMaquinaLb: e.pesoBaseMaquinaLb }),
                },
              ]),
            );
            datos = {
              ...s,
              prescripcion: p,
              cargas,
              planRevision:
                (await this.db.meta.get("planRevision"))?.valor ?? 0,
              procedencia: "app",
            };
            args[0] = datos;
          }
          if (tipo === "serie" && !borrar) {
            const s = args[0] as { ejercicioId: string; sesionId: string };
            const padre = await this.db.sesiones.get(s.sesionId);
            const e = await this.db.ejercicios.get(s.ejercicioId);
            datos = {
              ...(args[0] as object),
              carga:
                padre?.cargas?.[s.ejercicioId] ??
                (e
                  ? {
                      tipoCarga: e.tipoCarga,
                      incrementoMinimoLb: e.incrementoMinimoLb,
                      pesoBaseMaquinaLb: e.pesoBaseMaquinaLb,
                    }
                  : undefined),
            };
            args[0] = datos;
          }
          if (tipo === "calibracion") {
            const e = args[0] as {
              id: string;
              tipoCarga: string;
              incrementoMinimoLb: number;
              pesoBaseMaquinaLb?: number;
            };
            datos = {
              id: e.id,
              tipoCarga: e.tipoCarga,
              incrementoMinimoLb: e.incrementoMinimoLb,
              pesoBaseMaquinaLb: e.pesoBaseMaquinaLb,
            };
          }
          if (nombre === "guardarProgreso" && args[1])
            throw Error(
              "Añade la foto desde Progreso y confirma su almacenamiento privado.",
            );
          validarOperacion({
            tipo,
            id,
            datos,
            eliminado: !!borrar,
            opId: crypto.randomUUID(),
            revision: 0,
          });
          // Confirmar en pantalla sólo después de persistir registro y cola
          // juntos: cerrar la app entre ambas escrituras no puede perder actividad.
          await this.db.transaction("rw", this.db.tables, async () => {
            await original.apply(target, args);
            await this.encolar(tipo, id, datos, !!borrar);
          });
          void this.sincronizar();
        };
      },
    });
  }
  comprobarAcceso() {
    if (
      estadoNube.bloqueado ||
      Date.now() > Math.min(this.ctx.expiraEn, this.ctx.validadoEn + 86400000)
    )
      throw new ErrorAcceso();
  }
  async encolar(tipo: Tipo, id: string, datos: unknown, eliminado = false) {
    const clave = `${tipo}:${id}`;
    const doc = await this.db.documentos.get(clave);
    const cola = await this.db.cola.where("clave").equals(clave).toArray();
    // Cada edición offline reserva la revisión posterior de su documento;
    // conservar el opId permite reintentar sin duplicar la confirmación remota.
    const revision = Math.max(
      doc?.revision ?? 0,
      ...cola.map((o) => o.revision + 1),
    );
    const secuencia =
      Number((await this.db.meta.get("secuencia"))?.valor ?? 0) + 1;
    await this.db.meta.put({ id: "secuencia", valor: secuencia });
    await this.db.cola.add({
      opId: crypto.randomUUID(),
      tipo,
      id,
      datos,
      eliminado,
      revision,
      clave,
      secuencia,
      estado: "pendiente",
    });
  }
  async encolarFoto(
    imagen: Blob,
    compartir: boolean,
    referencia: {
      id?: string;
      registro?: string;
      tipo?: "perfil" | "progreso";
    } = {},
  ) {
    this.comprobarAcceso();
    if (!this.ctx.medios)
      throw Error("El almacenamiento de fotografías aún no está habilitado.");
    if (imagen.size > 5242880) throw Error("Máximo 5 MB por foto.");
    const id = referencia.id ?? crypto.randomUUID();
    await this.db.meta.put({
      id: `foto-pendiente:${id}`,
      valor: {
        id,
        imagen,
        compartir,
        registro: referencia.registro ?? id,
        tipo: referencia.tipo ?? "progreso",
      },
    });
    void this.sincronizar();
  }
  async preparar(inicio?: Inicio) {
    // Sólo catálogo en la base aislada de esta identidad. Nunca se adopta un
    // participante del piloto; su recuperación exige confirmar pertenencia.
    await sembrar(this.local);
    if (inicio) {
      if (inicio.perfil)
        await this.local.guardarParticipante(
          inicio.perfil as unknown as Participante,
        );
      const anteriores = await this.local.listarPlantillas(
        this.api.cliente ?? this.ctx.identidad,
      );
      await this.db.transaction(
        "rw",
        this.db.plantillas,
        this.db.meta,
        async () => {
          await this.db.plantillas.bulkDelete(
            anteriores
              .filter((p) => !inicio.plan.dias.some((d) => d.id === p.id))
              .map((p) => p.id),
          );
          await this.db.plantillas.bulkPut(inicio.plan.dias as PlantillaDia[]);
          await this.db.meta.put({
            id: "planRevision",
            valor: inicio.revision,
          });
        },
      );
    }
    await this.sincronizar();
    const f = () => {
      if (!document.hidden) void this.sincronizar();
    };
    window.addEventListener("online", f);
    document.addEventListener("visibilitychange", f);
    this.timer = setInterval(f, 4000);
    this.limpiar = () => {
      window.removeEventListener("online", f);
      document.removeEventListener("visibilitychange", f);
      clearInterval(this.timer);
      this.cerrada = true;
      this.db.close();
    };
  }
  limpiar = () => {};
  async aplicarCambio(c: Cambio) {
    const clave = `${c.tipo}:${c.id}`;
    const anterior = await this.db.documentos.get(clave);
    if (anterior && anterior.revision > c.revision) return;
    await this.db.documentos.put({ ...c, clave });
    // Se conoce la versión cloud, pero el borrador visible sigue siendo del
    // usuario hasta que se confirme o resuelva su cola; no sobrescribirlo.
    if (await this.db.cola.where("clave").equals(clave).count()) return;
    const tabla = TABLAS[c.tipo];
    if (tabla) {
      if (c.eliminado) await this.db.table(tabla).delete(c.id);
      else await this.db.table(tabla).put(c.datos);
    }
    if (c.tipo === "plan" && c.id === "programa" && !c.eliminado) {
      const plan = c.datos as Plan;
      await this.db.plantillas.clear();
      await this.db.plantillas.bulkPut(plan.dias as PlantillaDia[]);
      await this.db.meta.put({ id: "planRevision", valor: c.revision });
    }
    if (c.tipo === "calibracion" && !c.eliminado)
      await this.db.ejercicios.update(c.id, c.datos as object);
  }
  async sincronizar() {
    if (this.ocupado || this.cerrada || estadoNube.bloqueado) return;
    this.ocupado = true;
    try {
      this.comprobarAcceso();
      const contexto = await this.api.pedir<Contexto>("/contexto");
      if (
        contexto.identidad !== this.ctx.identidad ||
        contexto.rol !== this.ctx.rol ||
        contexto.entorno !== this.ctx.entorno
      )
        throw new ErrorAcceso();
      this.ctx = contexto;
      if (contexto.rol === "cliente")
        localStorage.setItem("sfm-v2-contexto", JSON.stringify(contexto));
      const cola = await this.db.cola.orderBy("secuencia").toArray();
      // Un conflicto detiene sólo ese documento. Los demás pueden sincronizar
      // sin descartar ninguna de las propuestas que necesitan revisión.
      const bloqueadas = new Set(
        cola.filter((o) => o.estado === "conflicto").map((o) => o.clave),
      );
      for (const o of cola) {
        if (bloqueadas.has(o.clave)) continue;
        const { resultados } = await this.api.pedir<{
          resultados: { confirmacion?: Cambio; conflicto?: unknown }[];
        }>("/sincronizar", {
          operaciones: [
            {
              opId: o.opId,
              tipo: o.tipo,
              id: o.id,
              revision: o.revision,
              datos: o.datos,
              eliminado: o.eliminado,
            },
          ],
        });
        const r = resultados[0];
        await this.db.transaction("rw", this.db.tables, async () => {
          if (r.confirmacion) {
            await this.db.cola.delete(o.opId);
            await this.aplicarCambio(r.confirmacion);
          } else {
            await this.db.cola.update(o.opId, { estado: "conflicto" });
            bloqueadas.add(o.clave);
          }
        });
      }
      let mas = true;
      while (mas) {
        const cursor = Number((await this.db.meta.get("cursor"))?.valor ?? 0);
        const r = await this.api.pedir<{
          cambios: Cambio[];
          cursor: number;
          mas: boolean;
        }>(`/cambios?cursor=${cursor}`);
        await this.db.transaction("rw", this.db.tables, async () => {
          for (const c of r.cambios) await this.aplicarCambio(c);
          await this.db.meta.put({ id: "cursor", valor: r.cursor });
        });
        mas = r.mas;
      }
      for (const fila of await this.db.meta
        .where("id")
        .startsWith("foto-pendiente:")
        .toArray()) {
        const f = fila.valor as {
          id: string;
          imagen: Blob;
          registro: string;
          compartir: boolean;
          tipo?: "perfil" | "progreso";
        };
        const r = await fetch(
          `${this.api.base}/medios/${f.id}?tipo=${f.tipo ?? "progreso"}&registro=${encodeURIComponent(f.registro)}`,
          {
            method: "PUT",
            credentials: "same-origin",
            redirect: "manual",
            headers: {
              "X-SFM-Consentimiento": "subir",
              "Content-Type": f.imagen.type,
            },
            body: f.imagen,
          },
        );
        if (r.status === 401) throw new ErrorAcceso();
        if (!r.ok)
          throw Error(
            "La foto está pendiente de sincronizar. Se conserva en este dispositivo.",
          );
        if (f.compartir)
          await this.api.pedir(
            `/medios/${f.id}`,
            { compartido: true },
            "PATCH",
          );
        await this.db.meta.delete(fila.id);
      }
      estadoCambiar({ conectado: true, mensaje: "" });
    } catch (e) {
      if (e instanceof ErrorAcceso) {
        estadoCambiar({ bloqueado: true });
        localStorage.removeItem("sfm-v2-contexto");
      } else
        estadoCambiar({
          conectado: false,
          mensaje: e instanceof Error ? e.message : "Pendiente de conexión",
        });
    } finally {
      if (!this.cerrada)
        estadoCambiar({
          pendientes:
            (await this.db.cola.count()) +
            (await this.db.meta
              .where("id")
              .startsWith("foto-pendiente:")
              .count()),
          conflictos: await this.db.cola
            .where("estado")
            .equals("conflicto")
            .count(),
        });
      this.ocupado = false;
    }
  }
  async resolver(
    opId: string,
    eleccion: "conservar-cloud" | "aplicar-local",
    revisionCloud: number,
  ) {
    const op = await this.db.cola.get(opId);
    if (!op) return;
    const propuestas = (
      await this.db.cola.where("clave").equals(op.clave).sortBy("secuencia")
    ).map(({ opId, tipo, id, revision, datos, eliminado }) => ({
      opId,
      tipo,
      id,
      revision,
      datos,
      eliminado,
    }));
    const anterior = await this.db.meta.get(`resolucion:${opId}`);
    const entrada = anterior?.valor ?? {
      id: opId,
      eleccion,
      revisionCloud,
      propuestas,
      resolucionId: crypto.randomUUID(),
    };
    await this.db.meta.put({ id: `resolucion:${opId}`, valor: entrada });
    try {
      await this.api.pedir("/resolver", entrada);
    } catch (e) {
      if (e instanceof ErrorRespuesta && e.status < 500)
        await this.db.meta.delete(`resolucion:${opId}`);
      await this.sincronizar();
      throw e;
    }
    await this.db.transaction("rw", this.db.tables, async () => {
      await this.db.cola.bulkDelete(propuestas.map((p) => p.opId));
      await this.db.meta.delete(`resolucion:${opId}`);
      const c = await this.db.documentos.get(op.clave);
      if (c) await this.aplicarCambio(c);
      await this.db.meta.put({ id: "cursor", valor: 0 });
    });
    await this.sincronizar();
  }
}
