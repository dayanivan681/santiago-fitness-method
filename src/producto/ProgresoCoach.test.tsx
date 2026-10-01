import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import type { Cambio } from "../../shared/v2/contratos";
import { ResumenSesiones } from "./Progreso";

afterEach(cleanup);

const cambio = (tipo: Cambio["tipo"], datos: { id: string }, cursor: number): Cambio => ({
  cursor, tipo, id: datos.id, revision: 1, datos, eliminado: false, opId: crypto.randomUUID(), actor: "cliente:x",
});
const sesion = (id: string, fecha: string) => ({ id, participanteId: "x", plantillaDiaId: "d", fecha, completadaEn: `${fecha}T11:00:00.000Z` });
const serie = (id: string, sesionId: string, ejercicioId: string) => ({ id, sesionId, ejercicioId, numeroSerie: 1, pesoRegistradoLb: 30, repsRealizadas: 10, rir: 2 });

it("Actividad → Por ejercicio se abre en el último entrenado y conserva los chips en orden", () => {
  const cambios = [
    cambio("entrenamiento", sesion("s1", "2026-09-15"), 1),
    cambio("serie", serie("a1", "s1", "press-banca-barra"), 2),
    cambio("entrenamiento", sesion("s2", "2026-09-29"), 3),
    cambio("serie", serie("z1", "s2", "zancadas-mancuernas"), 4),
  ];
  render(<ResumenSesiones cambios={cambios} cliente="x" />);
  fireEvent.click(screen.getByRole("button", { name: /ejercicio/i }));
  const nav = screen.getByRole("navigation", { name: "Ejercicio del historial" });
  const chips = within(nav).getAllByRole("button");
  expect(chips.map((b) => b.textContent)).toEqual(["Press de banca plano con barra", "Zancadas con mancuernas"]);
  expect(within(nav).getByRole("button", { pressed: true })).toHaveTextContent("Zancadas con mancuernas");
  fireEvent.click(chips[0]);
  expect(within(nav).getByRole("button", { pressed: true })).toHaveTextContent("Press de banca plano con barra");
});
