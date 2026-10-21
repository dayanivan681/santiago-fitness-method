import "fake-indexeddb/auto";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

it("Ver todos los clientes también quita el filtro de pagos después de una búsqueda vacía", async () => {
  render(
    <MemoryRouter initialEntries={["/clientes"]}>
      <Coach servicio={new ServicioCoach(true)} base="/demo/coach" preview={vi.fn()} entrenar={vi.fn()} />
    </MemoryRouter>,
  );
  const pagos = await screen.findByRole("button", { name: "Pagos pendientes (2)" });
  fireEvent.click(pagos);
  expect(screen.queryByText("Alicia Rivera")).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole("textbox", { name: "Buscar cliente" }), { target: { value: "Alicia" } });
  expect(screen.getByRole("heading", { name: "No encontramos esa persona" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Ver todos los clientes" }));
  expect(screen.getByText("Alicia Rivera")).toBeInTheDocument();
  expect(screen.getByText("Marcos Vega")).toBeInTheDocument();
  expect(pagos).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("textbox", { name: "Buscar cliente" })).toHaveValue("");
});
