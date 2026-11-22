import "fake-indexeddb/auto";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { App } from "../App";

/**
 * QA del 20 de noviembre, fallo 5: al pasar de Datos → Días → Plan la página
 * se quedaba a media altura y el título del paso nuevo no se veía.
 */
let scrollTo: { mock: { calls: unknown[][] } };
beforeEach(() => {
  scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  window.history.replaceState({}, "", "/demo/coach/nuevo");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const arriba = () =>
  scrollTo.mock.calls.filter(([opciones]) => (opciones as ScrollToOptions | undefined)?.top === 0).length;

it("cada cambio de paso del alta vuelve arriba, también al volver atrás", async () => {
  render(<App />);
  await screen.findByRole("heading", { name: "Datos del cliente" });
  const alEntrar = arriba();

  fireEvent.change(screen.getByPlaceholderText("Nombre y apellido"), { target: { value: "Ana Prueba" } });
  fireEvent.change(screen.getByPlaceholderText("Por ejemplo: ganar fuerza"), { target: { value: "Glúteos" } });
  fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
  await screen.findByRole("heading", { name: "Días y limitaciones" });
  expect(arriba()).toBe(alEntrar + 1);

  fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
  await screen.findByRole("heading", { name: "Revisa el plan" });
  expect(arriba()).toBe(alEntrar + 2);

  fireEvent.click(document.querySelector(".sfm-stepper button:nth-child(1)") as HTMLElement);
  await screen.findByRole("heading", { name: "Datos del cliente" });
  expect(arriba()).toBe(alEntrar + 3);
});

it("un error de validación no mueve la página: no se cambió de paso", async () => {
  render(<App />);
  await screen.findByRole("heading", { name: "Datos del cliente" });
  const alEntrar = arriba();

  fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
  await screen.findByText("Añade su nombre y el objetivo que van a trabajar.");
  expect(arriba()).toBe(alEntrar);
});
