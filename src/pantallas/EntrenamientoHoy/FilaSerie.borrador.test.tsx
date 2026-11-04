import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ESPERA_BORRADOR_MS, FilaSerie } from "./FilaSerie";
import { RepositorioMemoria } from "../../nube/memoria";
import { BIBLIOTECA_INICIAL } from "../../datos/semilla/biblioteca";
afterEach(cleanup);
it("no reescribe el borrador por refrescos cloud con una clave equivalente", async () => {
  const repo = new RepositorioMemoria();
  const recuperar = vi.spyOn(repo, "obtenerBorrador");
  const guardar = vi.spyOn(repo, "guardarBorrador");
  const ejercicio = BIBLIOTECA_INICIAL[0];
  const props = {
    numeroSerie: 1,
    ejercicio,
    repMin: 1,
    conEtiquetas: true,
    repositorio: repo,
    onGuardar: vi.fn(),
    onCorregir: vi.fn(),
  };
  const clave = {
    participanteId: "qa-borrador",
    fecha: "2026-09-09",
    plantillaDiaId: "upper-a",
    orden: 1,
  };
  const { rerender } = render(
    <FilaSerie {...props} claveDeBorrador={{ ...clave }} />,
  );
  await waitFor(() => expect(recuperar).toHaveBeenCalled());
  fireEvent.click(
    screen.getByRole("button", {
      name: `Subir peso de la serie 1 de ${ejercicio.nombre}`,
    }),
  );
  await waitFor(() => expect(guardar).toHaveBeenCalledTimes(1));
  for (let i = 0; i < 5; i++)
    rerender(<FilaSerie {...props} claveDeBorrador={{ ...clave }} />);
  expect(guardar).toHaveBeenCalledTimes(1);
  fireEvent.click(
    screen.getByRole("button", {
      name: `Subir reps de la serie 1 de ${ejercicio.nombre}`,
    }),
  );
  await waitFor(() => expect(guardar).toHaveBeenCalledTimes(2));
});

it("agrupa los toques seguidos en un solo guardado y guarda lo pendiente al salir", async () => {
  const repo = new RepositorioMemoria();
  const guardar = vi.spyOn(repo, "guardarBorrador");
  const ejercicio = BIBLIOTECA_INICIAL[0];
  const recuperar = vi.spyOn(repo, "obtenerBorrador");
  const { unmount } = render(
    <FilaSerie
      numeroSerie={1}
      ejercicio={ejercicio}
      repMin={1}
      conEtiquetas
      repositorio={repo}
      onGuardar={vi.fn()}
      onCorregir={vi.fn()}
      claveDeBorrador={{ participanteId: "qa-borrador", fecha: "2026-09-09", plantillaDiaId: "upper-a", orden: 1 }}
    />,
  );
  await waitFor(() => expect(recuperar).toHaveBeenCalled());
  const subir = screen.getByRole("button", { name: `Subir peso de la serie 1 de ${ejercicio.nombre}` });
  for (let i = 0; i < 4; i++) fireEvent.click(subir);
  await waitFor(() => expect(guardar).toHaveBeenCalledTimes(1), { timeout: ESPERA_BORRADOR_MS + 1000 });
  fireEvent.click(subir);
  unmount();
  expect(guardar).toHaveBeenCalledTimes(2);
});
it("Guardar descarta el borrador pendiente: ni el temporizador ni salir de la fila lo reescriben", async () => {
  const repo = new RepositorioMemoria();
  const recuperar = vi.spyOn(repo, "obtenerBorrador");
  const guardar = vi.spyOn(repo, "guardarBorrador");
  const borrar = vi.spyOn(repo, "borrarBorrador");
  const ejercicio = BIBLIOTECA_INICIAL[0];
  const { unmount } = render(
    <FilaSerie
      numeroSerie={1}
      ejercicio={ejercicio}
      repMin={1}
      conEtiquetas
      repositorio={repo}
      onGuardar={vi.fn().mockResolvedValue(undefined)}
      onCorregir={vi.fn()}
      claveDeBorrador={{ participanteId: "qa-borrador", fecha: "2026-09-09", plantillaDiaId: "upper-a", orden: 1 }}
    />,
  );
  await waitFor(() => expect(recuperar).toHaveBeenCalled());
  fireEvent.click(screen.getByRole("button", { name: `Subir peso de la serie 1 de ${ejercicio.nombre}` }));
  fireEvent.click(screen.getByRole("button", { name: `Guardar la serie 1 de ${ejercicio.nombre}` }));
  await waitFor(() => expect(borrar).toHaveBeenCalledTimes(1));
  unmount();
  await new Promise((r) => setTimeout(r, ESPERA_BORRADOR_MS + 200));
  expect(guardar).not.toHaveBeenCalled();
});
