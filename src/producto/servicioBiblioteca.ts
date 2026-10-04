import type { EjercicioCoach, EjercicioCoachCambio, EjercicioCoachNuevo } from "../../shared/v2/biblioteca";
import { ClienteApi, subirArchivo } from "../nube/cloud";

/**
 * Ejercicios que el coach añade a su biblioteca. La rama demo los guarda en
 * memoria (la foto es sólo un enlace local del navegador, no se sube); la real
 * habla con `/admin/api/v2/biblioteca`. Nunca se borra: se archiva.
 */
export class ServicioBiblioteca {
  readonly demo: boolean;
  private demoLista: EjercicioCoach[] = [];
  private demoFotos = new Map<string, string>();
  private demoAnimaciones = new Map<string, string>();

  constructor(demo = false) {
    this.demo = demo;
  }

  async listar(): Promise<EjercicioCoach[]> {
    if (this.demo) return this.demoLista.filter((e) => e.activo);
    return (await new ClienteApi(true).pedir<{ ejercicios: EjercicioCoach[] }>("/biblioteca")).ejercicios;
  }

  async crear(datos: EjercicioCoachNuevo): Promise<EjercicioCoach> {
    if (this.demo) {
      const ahora = Date.now();
      const nuevo: EjercicioCoach = { ...datos, id: `coach-ej-${crypto.randomUUID()}`, tieneFoto: false, tieneAnimacion: false, activo: true, creadoEn: ahora, actualizadoEn: ahora };
      this.demoLista = [...this.demoLista, nuevo];
      return nuevo;
    }
    return (await new ClienteApi(true).pedir<{ ejercicio: EjercicioCoach }>("/biblioteca", datos)).ejercicio;
  }

  async editar(id: string, cambio: EjercicioCoachCambio): Promise<EjercicioCoach> {
    if (this.demo) return this.cambiarDemo(id, (e) => ({ ...e, ...cambio }));
    return (await new ClienteApi(true).pedir<{ ejercicio: EjercicioCoach }>(`/biblioteca/${id}`, cambio, "PATCH")).ejercicio;
  }

  async archivar(id: string): Promise<void> {
    await this.editar(id, { activo: false });
  }

  /** La foto se sube aparte: si falla, el ejercicio ya existe y sólo se reintenta la foto. */
  async subirFoto(id: string, foto: Blob): Promise<EjercicioCoach> {
    if (this.demo) {
      this.demoFotos.set(id, URL.createObjectURL(foto));
      return this.cambiarDemo(id, (e) => ({ ...e, tieneFoto: true }));
    }
    return (await subirArchivo<{ ejercicio: EjercicioCoach }>(`/biblioteca/${id}/foto`, foto, true)).ejercicio;
  }

  /** El GIF va aparte de la foto fija: la foto sirve para listas y miniaturas, el GIF sólo para la ficha. */
  async subirAnimacion(id: string, gif: Blob): Promise<EjercicioCoach> {
    if (this.demo) {
      this.demoAnimaciones.set(id, URL.createObjectURL(gif));
      return this.cambiarDemo(id, (e) => ({ ...e, tieneAnimacion: true }));
    }
    return (await subirArchivo<{ ejercicio: EjercicioCoach }>(`/biblioteca/${id}/animacion`, gif, true)).ejercicio;
  }

  async quitarAnimacion(id: string): Promise<EjercicioCoach> {
    if (this.demo) {
      this.demoAnimaciones.delete(id);
      return this.cambiarDemo(id, (e) => ({ ...e, tieneAnimacion: false }));
    }
    return (await new ClienteApi(true).pedir<{ ejercicio: EjercicioCoach }>(`/biblioteca/${id}/animacion`, undefined, "DELETE")).ejercicio;
  }

  private cambiarDemo(id: string, cambiar: (e: EjercicioCoach) => EjercicioCoach): EjercicioCoach {
    const actual = this.demoLista.find((e) => e.id === id);
    if (!actual) throw Error("Ejercicio no disponible.");
    const editado = { ...cambiar(actual), actualizadoEn: Date.now() };
    this.demoLista = this.demoLista.map((e) => (e.id === id ? editado : e));
    return editado;
  }

  /** Dónde ver la foto desde el panel del coach; `v` evita que la caché sirva una foto reemplazada. */
  urlDeFoto = (e: EjercicioCoach): string | null =>
    this.demo ? (this.demoFotos.get(e.id) ?? null) : `/admin/api/v2/biblioteca/${e.id}/foto?v=${e.actualizadoEn}`;

  urlDeAnimacion = (e: EjercicioCoach): string | null =>
    !e.tieneAnimacion
      ? null
      : this.demo
        ? (this.demoAnimaciones.get(e.id) ?? null)
        : `/admin/api/v2/biblioteca/${e.id}/animacion?v=${e.actualizadoEn}`;
}
