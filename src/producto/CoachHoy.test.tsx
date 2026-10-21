import "fake-indexeddb/auto";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import { Coach } from "./Coach";
import { ServicioCoach } from "./servicio";

afterEach(cleanup);

function renderHoy() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Coach servicio={new ServicioCoach(true)} base="/demo/coach" preview={vi.fn()} entrenar={vi.fn()} />
    </MemoryRouter>,
  );
}

it("la tarjeta de revisión ofrece un solo enlace al programa, no dos con el mismo destino", async () => {
  renderHoy();
  const seccion = await screen.findByRole("region", { name: "Revisión de programas" });
  const enlaces = within(seccion).getAllByRole("link");
  expect(enlaces).toHaveLength(1);
  expect(enlaces[0]).toHaveTextContent("Revisar programa");
  expect(enlaces[0]).toHaveAttribute("href", expect.stringContaining("/demo/coach/clientes/"));
  expect(within(seccion).getByText("Programa por revisar")).toBeInTheDocument();
});

it("el resumen del coaching no usa aria-label sobre un párrafo sin rol", async () => {
  renderHoy();
  const resumen = (await screen.findByText(/clientes?$/, { selector: "span" })).closest("p")!;
  expect(resumen).toHaveClass("sfm-coach-summary");
  expect(resumen).not.toHaveAttribute("aria-label");
  expect(resumen).toHaveTextContent(/sesiones? esta semana/);
});
