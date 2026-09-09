import "fake-indexeddb/auto";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { App } from "./App";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("guía al Coach, permite volver y practicar como Cliente sin persistencia", async () => {
  window.history.replaceState({}, "", "/demo/coach");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const persistir = vi.spyOn(Storage.prototype, "setItem");
  const abrir = vi.spyOn(indexedDB, "open");
  const red = vi.fn();
  vi.stubGlobal("fetch", red);
  render(<App />);
  const guia = await screen.findByRole("dialog", {
    name: "Bienvenido, Santiago",
  });
  expect(
    within(guia).getByText("Tu coaching. Un solo lugar."),
  ).toBeInTheDocument();
  fireEvent.click(
    within(guia).getByRole("button", { name: "Conocer mi espacio" }),
  );
  expect(within(guia).getByText("Empieza por la persona.")).toBeInTheDocument();
  fireEvent.click(within(guia).getByRole("button", { name: "Atrás" }));
  fireEvent.click(
    within(guia).getByRole("button", { name: "Conocer mi espacio" }),
  );
  fireEvent.click(within(guia).getByRole("button", { name: "Continuar" }));
  fireEvent.click(within(guia).getByRole("button", { name: "Continuar" }));
  fireEvent.click(
    within(guia).getByRole("button", { name: "Vivirlo como Cliente" }),
  );
  await screen.findByRole("heading", { name: "Vamos, Alicia." });
  fireEvent.click(screen.getByRole("link", { name: "Ver Coach" }));
  await screen.findByText("Tu coaching, hoy.");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Abrir guía de uso" }));
  const ayuda = screen.getByRole("dialog", { name: "Tu guía de uso" });
  fireEvent.click(within(ayuda).getByText("Crear el primer cliente"));
  fireEvent.click(
    within(ayuda).getByRole("button", {
      name: "Probar con un cliente ficticio",
    }),
  );
  await screen.findByRole("heading", { name: "Conocer a la persona" });
  expect(window.location.pathname).toBe("/demo/coach/nuevo");
  expect(persistir).not.toHaveBeenCalled();
  expect(abrir).not.toHaveBeenCalled();
  expect(red).not.toHaveBeenCalled();
});
it("puede omitir y reabrir la bienvenida desde la guía", async () => {
  window.history.replaceState({}, "", "/demo/coach");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(<App />);
  fireEvent.click(await screen.findByRole("button", { name: "Ahora no" }));
  const ayuda = screen.getByRole("button", { name: "Abrir guía de uso" });
  ayuda.focus();
  fireEvent.click(ayuda);
  fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
  expect(ayuda).toHaveFocus();
  fireEvent.click(ayuda);
  fireEvent.click(screen.getByRole("button", { name: /Ver la bienvenida/ }));
  expect(
    screen.getByRole("dialog", { name: "Bienvenido, Santiago" }),
  ).toBeInTheDocument();
});
