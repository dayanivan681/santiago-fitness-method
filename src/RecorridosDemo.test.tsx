import "fake-indexeddb/auto";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { Onboarding } from "./producto/Onboarding";
import { App } from "./App";
import { ServicioCoach } from "./producto/servicio";
import { RepositorioMemoria } from "./nube/memoria";
const tocar = async (nombre: string) =>
  fireEvent.click(await screen.findByRole("button", { name: nombre }));
const ancla = (id: string) =>
  document.querySelector<HTMLElement>(`[data-tour="${id}"]`)!;
beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function alta() {
  window.history.replaceState({}, "", "/demo/coach");
  render(<App />);
  await tocar("Crear cliente");
  await screen.findByRole("heading", { name: "Datos del cliente" });
  fireEvent.change(screen.getByLabelText("Nombre"), {
    target: { value: "Elena práctica" },
  });
  fireEvent.change(screen.getByLabelText("Objetivo"), {
    target: { value: "Ganar fuerza" },
  });
  await tocar("Continuar");
  await screen.findByRole("heading", { name: "Días y limitaciones" });
  expect(screen.getByLabelText("Limitaciones (opcional)")).toHaveValue("");
  expect(screen.getByLabelText("Notas privadas (opcional)")).toHaveValue("");
  await tocar("Continuar");
  await screen.findByRole("heading", { name: "Revisa el plan" });
}
it("crea con revisión explícita, permite explorar, conserva persona y aísla Vista previa", async () => {
  const red = vi.fn();
  vi.stubGlobal("fetch", red);
  const abrir = vi.spyOn(indexedDB, "open"),
    persistir = vi.spyOn(Storage.prototype, "setItem");
  await alta();
  expect(
    screen.getByRole("button", { name: "Crear cliente y publicar plan" }),
  ).toBeDisabled();
  const rueda = new WheelEvent("wheel", {
    bubbles: true,
    cancelable: true,
    deltaY: 300,
  });
  document.body.dispatchEvent(rueda);
  expect(rueda.defaultPrevented).toBe(false);
  const tecla = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key: "PageDown",
  });
  document.body.dispatchEvent(tecla);
  expect(tecla.defaultPrevented).toBe(false);
  expect(document.documentElement).not.toHaveClass("sfm-tour-locked");
  expect(
    screen.queryByRole("region", { name: "Práctica guiada" }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByLabelText("He revisado el plan y sus limitaciones."),
  );
  await tocar("Crear cliente y publicar plan");
  await screen.findByText("Cliente creado. Su plan está listo.");
  await tocar("Probar invitación");
  await screen.findByText(/Simulación: no se crea/);
  const id = window.location.pathname.split("/").at(-1)!;
  await tocar("Vista previa");
  await screen.findByText("Vista previa · Simulación sin guardar");
  await tocar("Comenzar entrenamiento");
  await waitFor(() => expect(ancla("guardar-serie")).toBeTruthy());
  fireEvent.click(ancla("guardar-serie"));
  await waitFor(() => expect(ancla("editar-serie")).toBeTruthy());
  expect(screen.queryByText("Serie guardada.")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Volver al Coach" }));
  await screen.findByRole("heading", { name: "Elena práctica" });
  fireEvent.click(ancla("tab-actividad"));
  expect(screen.queryByText(/Completado ·/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Ver Cliente" }));
  await tocar("Ver mi entrenamiento");
  await screen.findByRole("heading", { name: "Vamos, Elena." });
  expect(
    screen.getByText("Aquí tienes el entrenamiento de hoy."),
  ).toBeInTheDocument();
  const s = vi.spyOn(ServicioCoach.prototype, "repoDemo");
  fireEvent.click(screen.getByRole("link", { name: "Ver Coach" }));
  fireEvent.click(screen.getByRole("link", { name: "Ver Cliente" }));
  await screen.findByRole("heading", { name: "Vamos, Elena." });
  expect(s).toHaveBeenCalledWith(id);
  expect(red).not.toHaveBeenCalled();
  expect(abrir).not.toHaveBeenCalled();
  expect(persistir).not.toHaveBeenCalled();
}, 20000);
it("un error de publicación conserva el formulario sin confirmar éxito", async () => {
  const real = ServicioCoach.prototype.crear;
  const crear = vi
    .spyOn(ServicioCoach.prototype, "crear")
    .mockRejectedValue(new Error("Fallo de prueba"));
  await alta();
  fireEvent.click(
    screen.getByLabelText("He revisado el plan y sus limitaciones."),
  );
  await tocar("Crear cliente y publicar plan");
  await screen.findByText("Fallo de prueba");
  expect(
    screen.queryByText("Cliente creado. Su plan está listo."),
  ).not.toBeInTheDocument();
  expect(window.location.pathname).toBe("/demo/coach/nuevo");
  crear.mockImplementation(real);
  await tocar("Crear cliente y publicar plan");
  await screen.findByText("Cliente creado. Su plan está listo.");
});
it("sólo confirma la primera serie guardada y cerrar ayuda no borra ni repite la tarea", async () => {
  window.history.replaceState({}, "", "/demo/cliente");
  render(<App />);
  await tocar("Ver mi entrenamiento");
  await tocar("Comenzar entrenamiento");
  await screen.findByText(/Introduce el peso y las repeticiones/);
  await waitFor(() => expect(ancla("guardar-serie")).toBeTruthy());
  const real = RepositorioMemoria.prototype.registrarSerie;
  const guardar = vi
    .spyOn(RepositorioMemoria.prototype, "registrarSerie")
    .mockRejectedValue(new Error("No se pudo registrar"));
  fireEvent.click(ancla("guardar-serie"));
  await screen.findByText("No se pudo registrar");
  expect(screen.queryByText("Serie guardada.")).not.toBeInTheDocument();
  guardar.mockImplementation(real);
  fireEvent.click(ancla("guardar-serie"));
  await screen.findByText("Serie guardada.");
  expect(
    screen.queryByText(/Introduce el peso y las repeticiones/),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await tocar("Cerrar consejo");
  fireEvent.click(screen.getByRole("link", { name: "Ver Coach" }));
  await tocar("Explorar");
  fireEvent.click(screen.getByRole("link", { name: "Ver Cliente" }));
  await screen.findByRole("heading", { name: "Vamos, Alicia." });
  expect(
    screen.queryByText("Aquí tienes el entrenamiento de hoy."),
  ).not.toBeInTheDocument();
});

it("guarda y retoma el alta sin perder los datos al cerrar ayuda o navegar", async () => {
  window.history.replaceState({}, "", "/demo/coach/nuevo");
  render(<App />);
  fireEvent.change(await screen.findByLabelText("Nombre"), {
    target: { value: "Lucía borrador" },
  });
  fireEvent.change(screen.getByLabelText("Objetivo"), {
    target: { value: "Ganar fuerza" },
  });
  await tocar("Cerrar consejo");
  fireEvent.click(
    screen.getByRole("link", { name: "Guardar y continuar después" }),
  );
  fireEvent.click(await screen.findByRole("link", { name: /Lucía borrador/ }));
  expect(await screen.findByLabelText("Nombre")).toHaveValue("Lucía borrador");
  expect(screen.getByLabelText("Objetivo")).toHaveValue("Ganar fuerza");
  expect(
    screen.queryByRole("complementary", { name: "Consejo" }),
  ).not.toBeInTheDocument();
});
it("el alta de cuentas reales conserva su presentación y no incorpora ayuda de demo", async () => {
  const servicio = new ServicioCoach();
  vi.spyOn(servicio, "cambios").mockResolvedValue([]);
  render(
    <MemoryRouter initialEntries={["/admin/nuevo"]}>
      <Onboarding servicio={servicio} base="/admin" />
    </MemoryRouter>,
  );
  await screen.findByRole("heading", { name: "Conocer a la persona" });
  expect(screen.getByLabelText("Objetivo compartido")).toBeInTheDocument();
  expect(
    screen.queryByRole("complementary", { name: "Consejo" }),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
