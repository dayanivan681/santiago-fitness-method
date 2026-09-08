import type { Repositorio } from "../datos/repositorio";
import type {
  Participante,
  Ejercicio,
  PlantillaDia,
  Sesion,
  SerieRegistrada,
  Sustitucion,
  BorradorDeSerie,
  RegistroDeProgreso,
} from "../dominio/tipos";
import type { IdentidadCatalogo } from "../../shared/catalogo-maestro";
import { notificar } from "./eventos";
/** Ni IndexedDB, ni localStorage, ni transporte de red. Instancia por simulación. */
export class RepositorioMemoria implements Repositorio {
  participantes = new Map<string, Participante>();
  ejercicios = new Map<string, Ejercicio>();
  plantillas = new Map<string, PlantillaDia>();
  sesiones = new Map<string, Sesion>();
  series = new Map<string, SerieRegistrada>();
  sustituciones = new Map<string, Sustitucion>();
  borradores = new Map<string, BorradorDeSerie>();
  progreso = new Map<string, RegistroDeProgreso>();
  identidades = new Map<string, IdentidadCatalogo>();
  fotos = new Map<string, Blob>();
  avatares = new Map<string, Blob>();
  identidad: string;
  constructor(identidad = "") {
    this.identidad = identidad;
  }
  private async poner<T extends { id: string }>(tabla: Map<string, T>, v: T) {
    tabla.set(v.id, structuredClone(v));
    notificar();
  }
  private async quitar<T>(tabla: Map<string, T>, id: string) {
    tabla.delete(id);
    notificar();
  }
  async obtenerParticipante(id: string) {
    return this.participantes.get(id);
  }
  guardarParticipante(p: Participante) {
    return this.poner(this.participantes, p);
  }
  async participanteActual() {
    return this.participantes.get(this.identidad);
  }
  async obtenerFotoDePerfil(id: string) {
    return this.avatares.get(id);
  }
  async guardarFotoDePerfil(id: string, b: Blob) {
    this.avatares.set(id, b);
    notificar();
  }
  borrarFotoDePerfil(id: string) {
    return this.quitar(this.avatares, id);
  }
  async listarEjercicios() {
    return [...this.ejercicios.values()];
  }
  async obtenerEjercicio(id: string) {
    return this.ejercicios.get(id);
  }
  guardarEjercicio(e: Ejercicio) {
    return this.poner(this.ejercicios, e);
  }
  async listarIdentidadesCatalogo() {
    return [...this.identidades.values()];
  }
  async obtenerIdentidadCatalogo(id: string) {
    return this.identidades.get(id);
  }
  guardarIdentidadCatalogo(v: IdentidadCatalogo) {
    return this.poner(this.identidades, v);
  }
  async listarPlantillas(id: string) {
    return [...this.plantillas.values()]
      .filter((p) => p.participanteId === id)
      .sort((a, b) => a.orden - b.orden);
  }
  async obtenerPlantilla(id: string) {
    return this.plantillas.get(id);
  }
  guardarPlantilla(p: PlantillaDia) {
    return this.poner(this.plantillas, p);
  }
  async listarSesiones(id: string) {
    return [...this.sesiones.values()].filter((s) => s.participanteId === id);
  }
  async crearSesion(s: Sesion) {
    if (this.sesiones.has(s.id)) throw Error("Entrenamiento ya registrado");
    await this.poner(this.sesiones, s);
  }
  async actualizarSesion(s: Sesion) {
    if (!this.sesiones.has(s.id)) throw Error("Entrenamiento no encontrado");
    await this.poner(this.sesiones, s);
  }
  async listarSustituciones(id: string, fecha: string) {
    return [...this.sustituciones.values()].filter(
      (s) => s.participanteId === id && s.fecha === fecha,
    );
  }
  guardarSustitucion(s: Sustitucion) {
    return this.poner(this.sustituciones, s);
  }
  quitarSustitucion(id: string) {
    return this.quitar(this.sustituciones, id);
  }
  async registrarSerie(s: SerieRegistrada) {
    if (this.series.has(s.id)) throw Error("Serie ya registrada");
    await this.poner(this.series, s);
  }
  async corregirSerie(s: SerieRegistrada) {
    if (!this.series.has(s.id)) throw Error("Serie no encontrada");
    await this.poner(this.series, s);
  }
  async obtenerBorrador(id: string) {
    return this.borradores.get(id);
  }
  guardarBorrador(b: BorradorDeSerie) {
    return this.poner(this.borradores, b);
  }
  borrarBorrador(id: string) {
    return this.quitar(this.borradores, id);
  }
  async listarSeriesDeSesion(id: string) {
    return [...this.series.values()].filter((s) => s.sesionId === id);
  }
  async historialDeEjercicio(id: string, e: string) {
    const sesiones = new Map(
      (await this.listarSesiones(id)).map((s) => [s.id, s.fecha]),
    );
    return [...this.series.values()]
      .filter((s) => s.ejercicioId === e && sesiones.has(s.sesionId))
      .map((s) => ({ ...s, fecha: sesiones.get(s.sesionId)! }));
  }
  async historialDeEjercicios(id: string, ids: readonly string[]) {
    return new Map(
      await Promise.all(
        ids.map(
          async (e) => [e, await this.historialDeEjercicio(id, e)] as const,
        ),
      ),
    );
  }
  async idsDeEjerciciosConHistorial(id: string) {
    const s = new Set((await this.listarSesiones(id)).map((s) => s.id));
    return [
      ...new Set(
        [...this.series.values()]
          .filter((v) => s.has(v.sesionId))
          .map((v) => v.ejercicioId),
      ),
    ];
  }
  async listarProgreso(id: string) {
    return [...this.progreso.values()].filter((p) => p.participanteId === id);
  }
  async guardarProgreso(p: RegistroDeProgreso, b?: Blob) {
    await this.poner(this.progreso, p);
    if (b) this.fotos.set(p.id, b);
  }
  async obtenerFotoDeProgreso(id: string) {
    return this.fotos.get(id);
  }
  async borrarProgreso(id: string) {
    await this.quitar(this.progreso, id);
    this.fotos.delete(id);
  }
  async seriesEntreFechas(id: string, desde: string, hasta: string) {
    const ids = await this.idsDeEjerciciosConHistorial(id);
    return (await Promise.all(ids.map((e) => this.historialDeEjercicio(id, e))))
      .flat()
      .filter((s) => s.fecha >= desde && s.fecha <= hasta);
  }
}
