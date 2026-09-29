import "fake-indexeddb/auto";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { App } from "../App";

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  window.history.replaceState({}, "", "/demo/coach/nuevo");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function hastaDias() {
  render(<App />);
  await screen.findByRole("heading", { name: "Datos del cliente" });
  fireEvent.change(screen.getByPlaceholderText("Nombre y apellido"), { target: { value: "Ana Prueba" } });
  fireEvent.change(screen.getByPlaceholderText("Por ejemplo: ganar fuerza"), { target: { value: "Glúteos" } });
  fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
  await screen.findByRole("heading", { name: "Días y limitaciones" });
}
const frecuencia = (n: number) =>
  fireEvent.click(within(document.querySelector('[data-tour="alta-frecuencia"]') as HTMLElement).getByRole("button", { name: String(n) }));
const sesiones = () =>
  within(screen.getByLabelText("Sesión del programa")).getAllByRole("button").map((b) => b.textContent);
const aRevision = async () => {
  fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
  await screen.findByRole("heading", { name: "Revisa el plan" });
};

it("con 5 días la revisión trae 5 sesiones Lower–Upper–Lower–Upper–Lower", async () => {
  await hastaDias();
  frecuencia(5);
  await aRevision();
  expect(sesiones()).toEqual(["Lower A", "Upper A", "Lower B", "Upper B", "Lower C"]);
});

it("volver a 4 devuelve las 4 sesiones de siempre", async () => {
  await hastaDias();
  frecuencia(5);
  frecuencia(4);
  await aRevision();
  expect(sesiones()).toEqual(["Upper A", "Lower A", "Upper B", "Lower B"]);
});

it("si el coach ya editó el plan, cambiar la frecuencia no lo pisa", async () => {
  await hastaDias();
  await aRevision();
  fireEvent.change(screen.getByLabelText("Nombre de la sesión"), { target: { value: "Upper A · Ana" } });
  const paso2 = document.querySelector('.sfm-stepper button:nth-child(2)') as HTMLElement;
  fireEvent.click(paso2);
  await screen.findByRole("heading", { name: "Días y limitaciones" });
  frecuencia(5);
  await aRevision();
  expect(sesiones()).toEqual(["Upper A · Ana", "Lower A", "Upper B", "Lower B"]);
});
