import "fake-indexeddb/auto";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import { Coach } from "./Coach";
import { planBase, ServicioCoach } from "./servicio";

afterEach(cleanup);

it("la lista de clientes cuenta las sesiones del programa, no los días del perfil", async () => {
  const servicio = new ServicioCoach(true);
  const [alicia] = servicio.clientes;
  alicia.plan = { ...planBase(alicia.perfil.id, 5), estado: "publicado", revisado: true };
  expect(alicia.perfil.frecuenciaEntrenamiento).toBe(4);
  render(
    <MemoryRouter initialEntries={["/clientes"]}>
      <Coach servicio={servicio} base="/demo/coach" preview={vi.fn()} entrenar={vi.fn()} />
    </MemoryRouter>,
  );
  const filaDe = async (nombre: string) =>
    (await screen.findAllByText(nombre)).map((e) => e.closest("a.sfm-row")).find(Boolean)!;
  const fila = await filaDe("Alicia Rivera");
  expect(fila).toHaveTextContent("5 sesiones · Programa publicado");
  expect(fila).not.toHaveTextContent("4 días");
  expect(await filaDe("Marcos Vega")).toHaveTextContent("4 sesiones · Programa publicado");
});
