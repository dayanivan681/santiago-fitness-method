import "fake-indexeddb/auto";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { App } from "./App";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("entrena y cambia entre ambos roles sin red privada ni persistencia de navegador", async () => {
  window.history.replaceState({}, "", "/demo/cliente");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const abrir = vi.spyOn(indexedDB, "open");
  const persistir = vi.spyOn(Storage.prototype, "setItem");
  const red = vi.fn(() =>
    Promise.reject(new Error("La demo no necesita una API")),
  );
  vi.stubGlobal("fetch", red);
  render(<App />);
  await screen.findByRole("button", { name: "Comenzar entrenamiento" });
  fireEvent.click(screen.getByRole("button", { name: "Upper A" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Comenzar entrenamiento" }),
  );
  const guardar = await screen.findByRole("button", {
    name: "Guardar la serie 1 de Press inclinado bajo (15°) en Smith",
  });
  fireEvent.click(guardar);
  await screen.findByRole("button", {
    name: "Editar la serie 1 de Press inclinado bajo (15°) en Smith",
  });
  fireEvent.click(screen.getByRole("link", { name: "Ver Coach" }));
  await screen.findByText("Tu coaching, hoy.");
  fireEvent.click(screen.getByRole("link", { name: "Ver Cliente" }));
  await screen.findByRole("heading", { name: "Vamos, Alicia." });
  expect(abrir).not.toHaveBeenCalled();
  expect(persistir).not.toHaveBeenCalled();
  expect(red).not.toHaveBeenCalled();
});
