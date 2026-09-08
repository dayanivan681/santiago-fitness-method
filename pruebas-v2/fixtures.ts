import { PLANTILLAS_BASE } from "../shared/plantillas-base";
import type { Perfil, Plan, Contexto, Operacion } from "../shared/v2/contratos";
export const perfil: Perfil = {
  id: "test-a",
  nombre: "Persona de prueba",
  sexo: null,
  edad: null,
  estaturaCm: null,
  pesoCorporalLb: null,
  objetivo: "Ganar fuerza",
  frecuenciaEntrenamiento: 4,
  limitaciones: "",
  notas: "Nota privada",
  ejerciciosEvitados: [],
};
export const plan: Plan = {
  id: "programa",
  estado: "publicado",
  revisado: true,
  dias: PLANTILLAS_BASE.map((d) => ({
    id: `test-a-${d.slug}`,
    participanteId: "test-a",
    nombre: d.nombre,
    orden: d.orden,
    slots: d.slots.map((s) => ({ ...s })),
  })),
};
export const contexto = (): Contexto => ({
  rol: "cliente",
  identidad: "test-a",
  nombre: perfil.nombre,
  validadoEn: Date.now(),
  expiraEn: Date.now() + 86400000,
  entorno: "local",
  medios: false,
});
export const operacion = (
  tipo: Operacion["tipo"],
  id: string,
  datos: unknown,
  revision = 0,
): Operacion => ({
  opId: crypto.randomUUID(),
  tipo,
  id,
  datos,
  revision,
  eliminado: false,
});
export const entrenamiento = {
  id: "test-entreno",
  participanteId: "test-a",
  plantillaDiaId: plan.dias[0].id,
  fecha: "2026-09-07",
  prescripcion: plan.dias[0],
  cargas: {},
  planRevision: 1,
  procedencia: "app" as const,
};
export const serie = {
  id: "test-serie",
  sesionId: entrenamiento.id,
  ejercicioId: plan.dias[0].slots[0].ejercicioId,
  numeroSerie: 1,
  pesoRegistradoLb: 25,
  repsRealizadas: 5,
  rir: 2,
};
export function personas(db: { ejecutar: (s: string) => unknown }) {
  db.ejecutar(
    "INSERT INTO clientes(id,nombre,creado_en,actualizado_en) VALUES('test-a','Prueba A',unixepoch(),unixepoch()),('test-b','Prueba B',unixepoch(),unixepoch())",
  );
}
