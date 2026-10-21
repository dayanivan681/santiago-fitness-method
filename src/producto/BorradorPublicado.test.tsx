import "fake-indexeddb/auto";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import { Coach } from "./Coach";
import { ServicioCoach } from "./servicio";

afterEach(cleanup);

function Ruta() {
  const { search } = useLocation();
  return <span data-testid="busqueda">{search}</span>;
}

function abrirCoach(servicio: ServicioCoach, ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Coach servicio={servicio} base="/demo/coach" preview={vi.fn()} entrenar={vi.fn()} />
      <Ruta />
    </MemoryRouter>,
  );
}

it("publicar el borrador retira la invitación a retomarlo", async () => {
  const servicio = new ServicioCoach(true);
  const nora = servicio.clientes.at(-1)!;
  abrirCoach(servicio, `/clientes/${nora.perfil.id}`);

  fireEvent.click(await screen.findByRole("button", { name: "Preparar cambios" }));
  fireEvent.change(screen.getByRole("textbox", { name: /Nombre de la sesión/ }), {
    target: { value: "Empuje A" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Guardar borrador" }));
  const retomar = await screen.findByRole("button", { name: /Retomar programación/ });

  fireEvent.click(retomar);
  fireEvent.click(await screen.findByRole("button", { name: /Publicar programa/ }));

  expect(
    await screen.findByText("Programa publicado. El cliente lo recibirá automáticamente."),
  ).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: /Retomar programación/ })).not.toBeInTheDocument(),
  );
});

it("un borrador con cambios sin publicar se sigue ofreciendo", async () => {
  const servicio = new ServicioCoach(true);
  const nora = servicio.clientes.at(-1)!;
  abrirCoach(servicio, `/clientes/${nora.perfil.id}`);

  fireEvent.click(await screen.findByRole("button", { name: "Preparar cambios" }));
  fireEvent.change(screen.getByRole("textbox", { name: /Nombre de la sesión/ }), {
    target: { value: "Empuje A" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Guardar borrador" }));

  expect(await screen.findByRole("button", { name: /Retomar programación/ })).toBeInTheDocument();
});

it("quitar el filtro de pagos también lo quita de la dirección, para que no vuelva al recargar", async () => {
  abrirCoach(new ServicioCoach(true), "/clientes?pagos=pendientes");

  const chip = await screen.findByRole("button", { name: "Pagos pendientes (2)" });
  expect(screen.queryByText("Alicia Rivera")).not.toBeInTheDocument();

  fireEvent.click(chip);

  expect(screen.getByText("Alicia Rivera")).toBeInTheDocument();
  expect(chip).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByTestId("busqueda").textContent).toBe("");
});

it("«Ver todos los clientes» deja la dirección sin filtro", async () => {
  abrirCoach(new ServicioCoach(true), "/clientes?pagos=pendientes");

  await screen.findByRole("button", { name: "Pagos pendientes (2)" });
  fireEvent.change(screen.getByRole("textbox", { name: "Buscar cliente" }), {
    target: { value: "zzz" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Ver todos los clientes" }));

  expect(screen.getByText("Alicia Rivera")).toBeInTheDocument();
  expect(screen.getByTestId("busqueda").textContent).toBe("");
});
