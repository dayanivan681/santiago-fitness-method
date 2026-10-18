import { ServicioSuscripciones } from "./servicioSuscripciones";
import { ServicioBiblioteca } from "./servicioBiblioteca";
import { aEjercicioDominio } from "../nube/biblioteca";
import type {
  Alta,
  Cambio,
  Perfil,
  Plan,
  Tipo,
} from "../../shared/v2/contratos";
import { ClienteApi, pedirSiCambio } from "../nube/cloud";
import { PLANTILLAS_5_DIAS, PLANTILLAS_BASE } from "../../shared/plantillas-base";
import { BIBLIOTECA_INICIAL } from "../datos/semilla/biblioteca";
import { RepositorioMemoria } from "../nube/memoria";
import type { Participante, Sesion } from "../dominio/tipos";
import { unir } from "../../shared/superseries";
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
  // El panel pregunta a menudo. Guardar lo recibido evita releer en D1 la
  // cartera y el historial completos en cada vuelta (límite diario de lecturas).
  private etiquetaClientes: string | null = null;
  private clientesRecibidos: Cliente[] = [];
  private historiales = new Map<string, { cambios: Cambio[]; cursor: number }>();
  readonly suscripciones: ServicioSuscripciones;
  readonly biblioteca: ServicioBiblioteca;
  constructor(demo = false) {
    this.demo = demo;
    this.suscripciones = new ServicioSuscripciones(demo);
    this.biblioteca = new ServicioBiblioteca(demo);
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
          ...(i === 0 ? conBiSerieDeDemo(planBase(id)) : planBase(id)),
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
    const r = await pedirSiCambio<{ clientes: Cliente[] }>(
      "/admin/api/v2",
      "/clientes",
      this.etiquetaClientes,
    );
    if (r.cambio) {
      this.clientesRecibidos = r.datos.clientes;
      this.etiquetaClientes = r.etiqueta;
    }
    return structuredClone(this.clientesRecibidos);
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
    // `cambios` sólo crece: basta pedir lo posterior al último cursor recibido.
    const clave = cliente ?? "";
    const previo = this.historiales.get(clave) ?? { cambios: [], cursor: 0 };
    const api = new ClienteApi(true, cliente);
    let { cambios, cursor } = previo;
    let mas = true;
    while (mas) {
      const r = await api.pedir<{
        cambios: Cambio[];
        cursor: number;
        mas: boolean;
      }>(`/cambios?cursor=${cursor}`);
      cambios = [...cambios, ...r.cambios];
      cursor = r.cursor;
      mas = r.mas;
    }
    this.historiales.set(clave, { cambios, cursor });
    return structuredClone(cambios);
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
  /** Los ejercicios que el coach creó en la demo también los ve el cliente de la demo. */
  private async sumarEjerciciosDelCoach(repo: RepositorioMemoria) {
    for (const e of await this.biblioteca.listar())
      await repo.guardarEjercicio(aEjercicioDominio(e, this.biblioteca.urlDeFoto, this.biblioteca.urlDeAnimacion));
    return repo;
  }
  async repoDemo(id: string) {
    const existente = this.repos.get(id);
    if (existente) return this.sumarEjerciciosDelCoach(existente);
    const cliente = this.clientes.find((c) => c.perfil.id === id);
    if (!cliente) throw Error("Cliente no disponible");
    const repo = new RepositorioMemoria(id);
    await repo.guardarParticipante(cliente.perfil as unknown as Participante);
    for (const e of BIBLIOTECA_INICIAL) await repo.guardarEjercicio(e);
    await this.sumarEjerciciosDelCoach(repo);
    for (const d of cliente.plan.dias) await repo.guardarPlantilla(d);
    if (id === "demo-persona-1") {
      // Hace 31, 10 y 3 días: entre la primera y la segunda hay una pausa de
      // tres semanas, para que la gráfica de progreso de la demo la enseñe.
      const DIAS_ATRAS: Record<number, number> = { 2: 31, 1: 10, 0: 3 };
      for (const anterior of [2, 1, 0]) {
        const fecha = new Date(Date.now() - DIAS_ATRAS[anterior] * 86400000)
          .toISOString()
          .slice(0, 10);
        const sesion = {
          id: anterior === 0 ? "demo-entreno-anterior" : `demo-entreno-anterior-${anterior}`,
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
              id: `demo-serie-${anterior}-${d.orden}-${n}`,
              sesionId: sesion.id,
              ejercicioId: d.ejercicioId,
              numeroSerie: n,
              pesoRegistradoLb: (d.orden === 1 ? 25 : 30) - anterior * 2.5,
              repsRealizadas: d.repMax,
              // La primera, con más reserva: el titular compara el esfuerzo.
              rir: anterior === 2 ? 3 : 2,
              tecnica: "buena",
            });
      }
    }
    this.repos.set(id, repo);
    return repo;
  }
}
/**
 * Sólo para la demo: Upper B con una bi-serie de bíceps y tríceps y un curl
 * martillo al final, para enseñar cómo se ven y se entrenan. Los clientes
 * reales reciben las plantillas base sin grupos.
 */
function conBiSerieDeDemo(plan: Plan): Plan {
  return {
    ...plan,
    dias: plan.dias.map((d) => {
      if (!d.id.endsWith("-upper-b")) return d;
      const curl = d.slots.find((s) => s.ejercicioId === "curl-mancuernas")!;
      const slots = unir(
        [...d.slots, { ...curl, ejercicioId: "curl-martillo" }],
        d.slots.indexOf(curl),
      );
      return { ...d, slots: slots.map((s, n) => ({ ...s, orden: n + 1 })) };
    }),
  };
}
/** Programa inicial según la frecuencia del alta: con 5 días, Lower–Upper–Lower–Upper–Lower; si no, los 4 de siempre. */
export function planBase(cliente: string, frecuencia = 4): Plan {
  const plantillas = frecuencia === 5 ? PLANTILLAS_5_DIAS : PLANTILLAS_BASE;
  return {
    id: "programa",
    estado: "borrador",
    revisado: false,
    dias: plantillas.map((d) => ({
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
