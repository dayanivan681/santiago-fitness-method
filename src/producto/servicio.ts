import type {
  Alta,
  Cambio,
  Perfil,
  Plan,
  Tipo,
} from "../../shared/v2/contratos";
import { ClienteApi } from "../nube/cloud";
import { PLANTILLAS_BASE } from "../../shared/plantillas-base";
import { BIBLIOTECA_INICIAL } from "../datos/semilla/biblioteca";
import { RepositorioMemoria } from "../nube/memoria";
import type { Participante, Sesion } from "../dominio/tipos";
export type Cliente = {
  perfil: Perfil;
  plan: Plan;
  revision: number;
  actividad?: { semana: number; total: number; ultima: Sesion | null };
};
// La misma interfaz alimenta ambos modos. La rama demo conserva todo en
// memoria; ninguna acción de demostración puede caer en la API por omisión.
export class ServicioCoach {
  demo: boolean;
  clientes: Cliente[] = [];
  registros = new Map<string, Cambio[]>();
  repos = new Map<string, RepositorioMemoria>();
  constructor(demo = false) {
    this.demo = demo;
    if (demo) {
      for (const [i, nombre] of [
        "Alicia Rivera",
        "Marcos Vega",
        "Nora Díaz",
      ].entries()) {
        const id = `demo-persona-${i + 1}`;
        const perfil: Perfil = {
          id,
          nombre,
          sexo: null,
          edad: null,
          estaturaCm: null,
          pesoCorporalLb: null,
          objetivo:
            i === 0
              ? "Ganar fuerza y entrenar con constancia"
              : i === 1
                ? "Recuperar una rutina de entrenamiento"
                : "Mejorar fuerza y movilidad",
          frecuenciaEntrenamiento: 4,
          limitaciones:
            i === 2
              ? "Evitar movimientos que provoquen molestias en el hombro."
              : "",
          notas: "",
          ejerciciosEvitados: [],
        };
        const plan = {
          ...planBase(id),
          estado: "publicado" as Plan["estado"],
          revisado: true,
        };
        if (i === 2) {
          plan.estado = "borrador";
          plan.revisado = false;
        }
        this.clientes.push({ perfil, plan, revision: 1 });
      }
    }
  }
  async escenarioDemo(origen:string):Promise<string> {
    if(!this.demo) throw Error("La práctica sólo está disponible en la demo.");
    const c=this.clientes.find(c=>c.perfil.id===origen);
    if(!c)throw Error("No encontramos esta persona de la demo.");
    const id="demo-practica-"+crypto.randomUUID();
    const perfil={...structuredClone(c.perfil),id,nombre:c.perfil.nombre.split(" · práctica")[0]+" · práctica "+(this.clientes.length-2)};
    const plan={...structuredClone(c.plan),dias:c.plan.dias.map(d=>({...structuredClone(d),id:crypto.randomUUID(),participanteId:id}))};
    this.clientes.push({perfil,plan,revision:1});
    return id;
  }
  async listar(): Promise<Cliente[]> {
    if (this.demo) {
      for (const c of this.clientes) {
        const repo = await this.repoDemo(c.perfil.id);
        const sesiones = await repo.listarSesiones(c.perfil.id);
        const semana = new Date();
        semana.setDate(semana.getDate() - ((semana.getDay() + 6) % 7));
        c.actividad = {
          semana: sesiones.filter(
            (s) =>
              s.completadaEn && s.fecha >= semana.toISOString().slice(0, 10),
          ).length,
          total: sesiones.filter((s) => s.completadaEn).length,
          ultima:
            sesiones.sort((a, b) => b.fecha.localeCompare(a.fecha))[0] ?? null,
        };
      }
      return structuredClone(this.clientes);
    }
    return (
      await new ClienteApi(true).pedir<{ clientes: Cliente[] }>("/clientes")
    ).clientes;
  }
  // El cursor puede paginar un historial largo: no asumir que la primera
  // respuesta contiene todas las versiones al reconstruir la ficha.
  async cambios(cliente?: string): Promise<Cambio[]> {
    if (this.demo) {
      const cambios = structuredClone(
        this.registros.get(cliente ?? "coach") ?? [],
      );
      if (cliente) {
        const repo = await this.repoDemo(cliente);
        for (const [tipo, registros] of [
          ["entrenamiento", repo.sesiones],
          ["serie", repo.series],
          ["progreso", repo.progreso],
        ] as const)
          for (const dato of registros.values())
            cambios.push({
              tipo,
              id: dato.id,
              datos: structuredClone(dato),
              revision: 1,
              cursor: cambios.length + 1,
              opId: "demo",
              actor: "cliente:demo",
              eliminado: false,
            });
      }
      return cambios;
    }
    const api = new ClienteApi(true, cliente);
    const all: Cambio[] = [];
    let cursor = 0,
      mas = true;
    while (mas) {
      const r = await api.pedir<{
        cambios: Cambio[];
        cursor: number;
        mas: boolean;
      }>(`/cambios?cursor=${cursor}`);
      all.push(...r.cambios);
      cursor = r.cursor;
      mas = r.mas;
    }
    return all;
  }
  async guardar(
    cliente: string | undefined,
    tipo: Tipo,
    id: string,
    revision: number,
    datos: unknown,
  ): Promise<Cambio> {
    if (this.demo) {
      const key = cliente ?? "coach";
      const anteriores = this.registros.get(key) ?? [];
      const actual = anteriores
        .filter((c) => c.tipo === tipo && c.id === id)
        .at(-1);
      if (
        (actual?.revision ?? 0) !== revision &&
        !(tipo === "plan" && revision === 1 && !actual)
      )
        throw Error("El registro cambió. Recarga antes de guardar.");
      const c: Cambio = {
        cursor: anteriores.length + 1,
        tipo,
        id,
        revision: revision + 1,
        datos: structuredClone(datos),
        eliminado: false,
        opId: crypto.randomUUID(),
        actor: "coach:demo",
      };
      this.registros.set(key, [...anteriores, c]);
      const persona = this.clientes.find((c) => c.perfil.id === cliente);
      if (persona && tipo === "plan" && id === "programa") {
        persona.plan = datos as Plan;
        persona.revision = c.revision;
        const repo = this.repos.get(cliente!);
        if (repo) {
          repo.plantillas.clear();
          for (const d of persona.plan.dias) await repo.guardarPlantilla(d);
        }
      }
      if (persona && tipo === "perfil") {
        persona.perfil = datos as Perfil;
        await this.repos
          .get(cliente!)
          ?.guardarParticipante(persona.perfil as unknown as Participante);
      }
      return c;
    }
    const r = await new ClienteApi(true, cliente).pedir<{
      resultados: { confirmacion?: Cambio; conflicto?: unknown }[];
    }>("/sincronizar", {
      operaciones: [
        {
          tipo,
          id,
          revision,
          datos,
          opId: crypto.randomUUID(),
          eliminado: false,
        },
      ],
    });
    const c = r.resultados[0].confirmacion;
    if (!c)
      throw Error(
        "Hay otra versión de este registro. Tu propuesta quedó conservada para revisión.",
      );
    return c;
  }
  async crear(alta: Alta, revision: number) {
    if (this.demo) {
      if (!this.clientes.some((c) => c.perfil.id === alta.perfil.id))
        this.clientes.push({
          perfil: alta.perfil,
          plan: { ...alta.plan, id: "programa" },
          revision: 1,
        });
      await this.guardar(undefined, "alta", alta.id, revision, {
        ...alta,
        completado: true,
      });
      return alta.perfil.id;
    }
    return (
      await new ClienteApi(true).pedir<{ id: string }>("/crear-cliente", {
        borradorId: alta.id,
        revision,
      })
    ).id;
  }
  async invitar(id: string) {
    if (this.demo)
      return "En la cuenta real, aquí aparecerá la invitación privada de un solo uso.";
    return (
      await new ClienteApi(true, id).pedir<{ enlace: string }>("/invitar", {})
    ).enlace;
  }
  async estadoCuenta(id: string): Promise<{ tieneCuenta: boolean; email: string | null }> {
    if (this.demo) return { tieneCuenta: false, email: null };
    return new ClienteApi(true, id).pedir("/estado-cuenta");
  }
  async restablecerClave(id: string) {
    if (this.demo) return "Simulación: enlace para cambiar contraseña.";
    return (await new ClienteApi(true, id).pedir<{ enlace: string }>("/restablecer-clave", {})).enlace;
  }
  async accion(id: string, accion: "archivar" | "revocar") {
    if (this.demo) {
      if (accion === "archivar")
        this.clientes = this.clientes.filter((c) => c.perfil.id !== id);
      return;
    }
    await new ClienteApi(true, id).pedir("/" + accion, {});
  }
  // Coach y Cliente de demo comparten esta instancia por persona. Cambiar de
  // rol muestra el mismo proceso, y recargar elimina toda la simulación.
  async repoDemo(id: string) {
    const existente = this.repos.get(id);
    if (existente) return existente;
    const cliente = this.clientes.find((c) => c.perfil.id === id);
    if (!cliente) throw Error("Cliente no disponible");
    const repo = new RepositorioMemoria(id);
    await repo.guardarParticipante(cliente.perfil as unknown as Participante);
    for (const e of BIBLIOTECA_INICIAL) await repo.guardarEjercicio(e);
    for (const d of cliente.plan.dias) await repo.guardarPlantilla(d);
    if (id === "demo-persona-1") {
      const fecha = new Date(Date.now() - 3 * 86400000)
        .toISOString()
        .slice(0, 10);
      const sesion = {
        id: "demo-entreno-anterior",
        participanteId: id,
        plantillaDiaId: cliente.plan.dias[0].id,
        fecha,
        prescripcion: cliente.plan.dias[0],
        completadaEn: fecha + "T18:45:00.000Z",
      };
      await repo.crearSesion(sesion);
      for (const d of cliente.plan.dias[0].slots)
        for (let n = 1; n <= d.seriesObjetivo; n++)
          await repo.registrarSerie({
            id: `demo-serie-${d.orden}-${n}`,
            sesionId: sesion.id,
            ejercicioId: d.ejercicioId,
            numeroSerie: n,
            pesoRegistradoLb: d.orden === 1 ? 25 : 30,
            repsRealizadas: d.repMax,
            rir: 2,
            tecnica: "buena",
          });
    }
    this.repos.set(id, repo);
    return repo;
  }
}
export function planBase(cliente: string): Plan {
  return {
    id: "programa",
    estado: "borrador",
    revisado: false,
    dias: PLANTILLAS_BASE.map((d) => ({
      id: `${cliente}-${d.slug}`,
      participanteId: cliente,
      nombre: d.nombre,
      orden: d.orden,
      slots: d.slots.map((s) => ({ ...s })),
    })),
  };
}
export function ultimos(cambios: Cambio[], tipo: Tipo) {
  const porId = new Map<string, Cambio>();
  for (const c of cambios) if (c.tipo === tipo) porId.set(c.id, c);
  return [...porId.values()].filter((c) => !c.eliminado);
}
