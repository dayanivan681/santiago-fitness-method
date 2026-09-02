import 'fake-indexeddb/auto';
import { render, screen, fireEvent, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Presentacion } from "./Presentacion";
import { Demo } from "./Demo";
import { DIAS_DEMO, BIBLIOTECA_DEMO } from "./datos";
import { PLANTILLAS_BASE } from "../../shared/plantillas-base";
import { BIBLIOTECA_INICIAL } from "../datos/semilla/biblioteca";

afterEach(() => vi.restoreAllMocks());

describe("Presentación pública fiel", () => {
  it("deriva todos los slots y la biblioteca de sus fuentes canónicas", () => {
    expect(DIAS_DEMO.map(({ ejercicios: _ejercicios, ...dia }) => dia)).toEqual(
      PLANTILLAS_BASE,
    );
    expect(
      BIBLIOTECA_DEMO.map((e) => ({
        ...e,
        imagen: e.imagen.replace("/presentacion/media", ""),
      })),
    ).toEqual(BIBLIOTECA_INICIAL);
    for (const dia of DIAS_DEMO)
      for (const { slot, ejercicio } of dia.ejercicios)
        expect(ejercicio.id).toBe(slot.ejercicioId);
  });

  it("explica acceso, datos locales y capturas actuales sin claims inexistentes", () => {
    const { container } = render(<Presentacion />);
    expect(container.textContent).toContain("pulsa Entrar");
    expect(container.textContent).toContain("Cloudflare Access");
    expect(container.textContent).toContain("siguen locales en el dispositivo");
    expect(container.textContent).not.toMatch(
      /\bkg\b|Copia de seguridad|vídeo|sincronización entre dispositivos|Press militar/,
    );
    expect(screen.getAllByAltText(/Pantalla real de/)).toHaveLength(4);
    expect(container.querySelector("iframe")).toHaveAttribute("src", "/presentacion/?demo=1");
    expect(container.querySelector("iframe")).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(
      screen.getByRole("link", { name: /Abrir Santiago Fitness Method/ }),
    ).toHaveAttribute("href", "/");
  });

  it("abre el acceso del coach en una pestaña nueva", () => {
    const { container } = render(<Presentacion />);
    const coachLinks = container.querySelectorAll('a[href^="/admin/"]');

    expect(coachLinks.length).toBeGreaterThan(0);
    for (const link of coachLinks) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("guarda, arranca el timer, permite editar sin reiniciarlo y conserva al navegar", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const storageSpy = vi.spyOn(Storage.prototype, "setItem");
    const databaseSpy = vi.spyOn(indexedDB, "open");
    render(<Demo />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Subir peso de la serie 1 de Press banca 15° Smith",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Guardar la serie 1 de Press banca 15° Smith",
      }),
    );
    const timer = await screen.findByRole("status", {
      name: "Temporizador de descanso",
    });
    expect(within(timer).getByText("3:00")).toBeInTheDocument();
    fireEvent.click(within(timer).getByRole("button", { name: "+30s" }));
    expect(within(timer).getByText("3:30")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Editar la serie 1 de Press banca 15° Smith",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Guardar la serie 1 de Press banca 15° Smith",
      }),
    );
    expect(within(timer).getByText("3:30")).toBeInTheDocument();
    for (const tab of ["Biblioteca", "Historial", "Perfil", "Hoy"]) {
      fireEvent.click(screen.getByRole("button", { name: tab }));
      expect(
        screen.getByRole("status", { name: "Temporizador de descanso" }),
      ).toBeInTheDocument();
    }
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
    fireEvent.click(screen.getByRole("button", { name: "Terminar sesión" }));
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Historial" }));
    expect(
      screen.getByText("Sesión terminada · Hoy, en esta demo"),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(storageSpy).not.toHaveBeenCalled();
    expect(databaseSpy).not.toHaveBeenCalled();
  });

  it("un calentamiento no inicia el descanso ni aparece como Última vez", async () => {
    render(<Demo />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Marcar la serie 1 de Press banca 15° Smith como calentamiento",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Guardar la serie 1 de Press banca 15° Smith",
      }),
    );
    await screen.findByRole("button", {
      name: "Editar la serie 1 de Press banca 15° Smith",
    });
    expect(
      screen.queryByRole("status", { name: "Temporizador de descanso" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Sin historial")).toBeInTheDocument();
  });
});
