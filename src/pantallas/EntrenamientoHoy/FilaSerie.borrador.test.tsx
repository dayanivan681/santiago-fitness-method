import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { FilaSerie } from "./FilaSerie";
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
