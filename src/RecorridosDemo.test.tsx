import "fake-indexeddb/auto";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { App } from "./App";
import { ServicioCoach } from "./producto/servicio";
const guia = () => screen.getByRole("region", { name: "Práctica guiada" });
const paso = async (id: string) =>
  waitFor(() => expect(guia()).toHaveAttribute("data-tour-step", id));
const tocar = async (nombre: string) =>
  fireEvent.click(await screen.findByRole("button", { name: nombre }));
const ancla = (id: string) =>
  document.querySelector<HTMLElement>(`[data-tour="${id}"]`)!;
const click = (id: string) => fireEvent.click(ancla(id));
beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function comenzarCrear() {
  window.history.replaceState({}, "", "/demo/coach");
  render(<App />);
  await tocar("Conocer mi espacio");
  await tocar("Continuar");
  await tocar("Continuar");
  await tocar("Crear mi primer cliente con ayuda");
  await paso("crear-abrir");
  click("nuevo");
  await paso("crear-persona");
}
it("recorre alta, gestión y preview con eventos confirmados y sin nube ni almacenamiento", async () => {
  const red = vi.fn();
  vi.stubGlobal("fetch", red);
  const abrir = vi.spyOn(indexedDB, "open");
  const guardar = vi.spyOn(Storage.prototype, "setItem");
  await comenzarCrear();
  await tocar("Continuar");
  await screen.findByRole("alert");
  await paso("crear-persona");
  await tocar("Usar un ejemplo ficticio");
  await tocar("Continuar");
  await paso("crear-contexto");
  await tocar("Continuar");
  await paso("crear-plan");
  await tocar("Entendido, continuar →");
  await paso("crear-publicar");
  expect(
    screen.getByRole("button", { name: "Crear cliente y publicar plan" }),
  ).toBeDisabled();
  fireEvent.click(
    screen.getByLabelText("He revisado el plan y sus limitaciones."),
  );
  await tocar("Crear cliente y publicar plan");
  await paso("crear-volver");
  click("volver-clientes");
  await paso("crear-buscar");
  fireEvent.change(screen.getByLabelText("Buscar cliente"), {
    target: { value: "Elena" },
  });
  fireEvent.click(
    await screen.findByRole("link", { name: /Elena · práctica/ }),
  );
  await paso("fin");
  await tocar("Aprender a manejar este cliente →");
  await paso("gestionar-perfil");
  click("tab-perfil");
  await paso("gestionar-editar");
  click("editar-perfil");
  await paso("gestionar-objetivo");
  fireEvent.change(ancla("objetivo-perfil"), {
    target: { value: "Objetivo revisado en la práctica" },
  });
  await tocar("Guardar perfil");
  await paso("gestionar-programa");
  click("tab-programa");
  await paso("gestionar-preparar");
  click("preparar-plan");
  await paso("gestionar-ejercicio");
  click("editar-ejercicio");
  await paso("gestionar-prescripcion");
  fireEvent.change(screen.getByLabelText("Descanso · segundos"), {
    target: { value: 120 },
  });
  await tocar("Listo");
  await paso("gestionar-borrador");
  click("guardar-plan");
  await paso("gestionar-retomar");
  click("retomar-plan");
  await paso("gestionar-publicar");
  click("publicar-plan");
  await paso("gestionar-actividad");
  click("tab-actividad");
  await paso("gestionar-leer");
  await tocar("Entendido, continuar →");
  await paso("gestionar-acceso");
  click("tab-programa");
  await paso("gestionar-invitar");
  click("invitar");
  await paso("gestionar-invitacion");
  expect(screen.getByText(/Simulación: no se crea/)).toBeInTheDocument();
  await tocar("Entendido, continuar →");
  await paso("fin");
  await tocar("Aprender Vista previa →");
  await paso("preview-abrir");
  click("preview");
  await paso("preview-limite");
  expect(
    screen.queryByRole("dialog", { name: "Tu primera entrada" }),
  ).not.toBeInTheDocument();
  await tocar("Entendido, continuar →");
  await paso("preview-comenzar");
  await waitFor(() => expect(ancla("comenzar")).toBeTruthy());
  click("comenzar");
  await paso("preview-serie");
  await waitFor(() => expect(ancla("guardar-serie")).toBeTruthy());
  click("guardar-serie");
  await paso("preview-volver");
  click("volver-coach");
  await paso("preview-actividad");
  click("tab-actividad");
  await paso("preview-comprobar");
  await screen.findByText("✓ Historial comprobado: sin cambios.");
  expect(screen.queryByText(/Completado ·/)).not.toBeInTheDocument();
  expect(red).not.toHaveBeenCalled();
  expect(abrir).not.toHaveBeenCalled();
  expect(guardar).not.toHaveBeenCalled();
}, 20000);
it("primera entrada independiente, pausa por cambio de rol y reinicio al recargar", async () => {
  window.history.replaceState({}, "", "/demo/cliente");
  render(<App />);
  expect(
    await screen.findByRole("dialog", { name: "Tu primera entrada" }),
  ).toBeInTheDocument();
  await tocar("Ahora no");
  fireEvent.click(screen.getByRole("link", { name: /Ver Coach/ }));
  await screen.findByText("Tu coaching, hoy.");
  fireEvent.click(screen.getByRole("link", { name: /Ver Cliente/ }));
  expect(
    screen.queryByRole("dialog", { name: "Tu primera entrada" }),
  ).not.toBeInTheDocument();
  await tocar("Abrir guía de uso");
  await tocar("Practicar mi primera serie →");
  await paso("cliente-hoy");
  await tocar("Entendido, continuar →");
  await paso("cliente-comenzar");
  fireEvent.click(screen.getByRole("link", { name: /Ver Coach/ }));
  await screen.findByRole("heading", { name: "A tu ritmo." });
  fireEvent.click(within(guia()).getByRole("button", { name: "Continuar" }));
  await waitFor(() => expect(window.location.pathname).toBe("/demo/cliente"));
  await paso("cliente-comenzar");
  cleanup();
  render(<App />);
  expect(
    await screen.findByRole("dialog", { name: "Tu primera entrada" }),
  ).toBeInTheDocument();
});
it("fallar al guardar no confirma el paso ni crea un cliente", async () => {
  const real = ServicioCoach.prototype.crear;
  vi.spyOn(ServicioCoach.prototype, "crear").mockRejectedValue(
    new Error("Fallo de prueba"),
  );
  await comenzarCrear();
  await tocar("Usar un ejemplo ficticio");
  await tocar("Continuar");
  await paso("crear-contexto");
  await tocar("Continuar");
  await paso("crear-plan");
  await tocar("Entendido, continuar →");
  fireEvent.click(
    screen.getByLabelText("He revisado el plan y sus limitaciones."),
  );
  await tocar("Crear cliente y publicar plan");
  await screen.findByText("Fallo de prueba");
  await paso("crear-publicar");
  vi.mocked(ServicioCoach.prototype.crear).mockImplementation(real);
  await tocar("Crear cliente y publicar plan");
  await paso("crear-volver");
});
it("repetir prepara otra persona ficticia sin borrar la anterior; nunca opera en modo real", async () => {
  const s = new ServicioCoach(true);
  const r = await s.repoDemo("demo-persona-1");
  const perfil = await r.participanteActual();
  const nuevo = await s.escenarioDemo("demo-persona-1");
  expect(nuevo).not.toBe("demo-persona-1");
  expect(s.clientes).toHaveLength(4);
  expect((await s.repoDemo(nuevo)).sesiones.size).toBe(0);
  expect(await r.participanteActual()).toEqual(perfil);
  await expect(
    new ServicioCoach().escenarioDemo("demo-persona-1"),
  ).rejects.toThrow(/sólo.*demo/);
});
