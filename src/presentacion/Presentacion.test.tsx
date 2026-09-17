import 'fake-indexeddb/auto';
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Presentacion } from "./Presentacion";
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

  it("explica el acceso privado, sincronización y demo compartida", () => {
    const { container } = render(<Presentacion />);
    expect(container.textContent).toContain("pulsa Entrar");
    expect(container.textContent).toContain("correo autorizado");
    expect(container.textContent).toContain("se sincronizan cuando vuelves");
    expect(container.textContent).not.toMatch(
      /\bkg\b|Copia de seguridad|vídeo|sincronización entre dispositivos|Press militar/,
    );
    expect(screen.getByRole("link",{name:"Explorar Coach"})).toHaveAttribute("href","/demo/coach");
    expect(container.querySelector("iframe")).toHaveAttribute("src", "/demo/cliente");
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

});
