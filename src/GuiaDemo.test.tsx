import "fake-indexeddb/auto";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { App } from "./App";
beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("ofrece una bienvenida por rol, ayuda opcional y no escribe fuera de la demo", async () => {
  window.history.replaceState({}, "", "/demo/coach");
  const persistir = vi.spyOn(Storage.prototype, "setItem");
  const abrir = vi.spyOn(indexedDB, "open");
  const red = vi.fn();
  vi.stubGlobal("fetch", red);
  render(<App />);
  const bienvenida = await screen.findByRole("dialog", {
    name: "Crea tu primer cliente",
  });
  expect(within(bienvenida).getByText(/Añade sus datos/)).toBeInTheDocument();
  fireEvent.click(within(bienvenida).getByRole("button", { name: "Explorar" }));
  fireEvent.click(screen.getByRole("link", { name: "Ver Cliente" }));
  await screen.findByRole("dialog", { name: "Prueba tu primera serie" });
  fireEvent.click(
    await screen.findByRole("button", { name: "Ver mi entrenamiento" }),
  );
  await screen.findByRole("heading", { name: "Vamos, Alicia." });
  fireEvent.click(screen.getByRole("button", { name: "Cerrar consejo" }));
  fireEvent.click(screen.getByRole("link", { name: "Ver Coach" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Abrir ayuda" }));
  const ayuda = screen.getByRole("dialog", { name: "Ayuda para el Coach" });
  fireEvent.click(within(ayuda).getByText("Invitar a un cliente"));
  expect(within(ayuda).getByText(/no da acceso real/)).toBeInTheDocument();
  fireEvent.click(within(ayuda).getByRole("button", { name: "Cerrar" }));
  fireEvent.click(screen.getByRole("link", { name: "Ver Cliente" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("complementary", { name: "Consejo" }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Abrir ayuda" }));
  expect(
    screen.getByRole("dialog", { name: "Ayuda para entrenar" }),
  ).toBeInTheDocument();
  expect(screen.queryByText("Cambiar un plan")).not.toBeInTheDocument();
  expect(persistir).not.toHaveBeenCalled();
  expect(abrir).not.toHaveBeenCalled();
  expect(red).not.toHaveBeenCalled();
});
it("restaura el foco al cerrar ayuda, permite repasar la bienvenida y reinicia sólo al recargar", async () => {
  window.history.replaceState({}, "", "/demo/coach");
  render(<App />);
  fireEvent.click(await screen.findByRole("button", { name: "Explorar" }));
  const ayuda = screen.getByRole("button", { name: "Abrir ayuda" });
  ayuda.focus();
  fireEvent.click(ayuda);
  fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
  expect(ayuda).toHaveFocus();
  fireEvent.click(ayuda);
  fireEvent.click(screen.getByRole("button", { name: "Ver bienvenida" }));
  expect(
    screen.getByRole("dialog", { name: "Crea tu primer cliente" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Explorar" }));
  cleanup();
  render(<App />);
  expect(
    await screen.findByRole("dialog", { name: "Crea tu primer cliente" }),
  ).toBeInTheDocument();
});
it("una entrada profunda permite trabajar sin bienvenida", async () => {
  window.history.replaceState({}, "", "/demo/coach/nuevo");
  render(<App />);
  await screen.findByRole("heading", { name: "Datos del cliente" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
