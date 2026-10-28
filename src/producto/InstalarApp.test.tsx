import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InstalarApp } from "./InstalarApp";
import { avisarInstalacionDisponible, plataformaInstalacion } from "../aplicacion/instalacion";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const IPAD = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36";
const ESCRITORIO = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";

function simularDispositivo(userAgent: string, { instalada = false, toques = 0 } = {}) {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);
  // jsdom no define maxTouchPoints.
  Object.defineProperty(navigator, "maxTouchPoints", { value: toques, configurable: true });
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: instalada && q.includes("standalone"),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  }));
}

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  avisarInstalacionDisponible(null);
});

describe("plataformaInstalacion", () => {
  it("distingue iPhone, iPad, Android y escritorio", () => {
    expect(plataformaInstalacion(IPHONE, 5)).toBe("ios");
    expect(plataformaInstalacion(IPAD, 5)).toBe("ios");
    expect(plataformaInstalacion(ANDROID, 5)).toBe("android");
    expect(plataformaInstalacion(ESCRITORIO, 0)).toBeNull();
    expect(plataformaInstalacion(IPAD, 0)).toBeNull();
  });
});

describe("InstalarApp", () => {
  it("en iPhone explica cómo añadirla a la pantalla de inicio desde Safari", () => {
    simularDispositivo(IPHONE, { toques: 5 });
    render(<InstalarApp />);
    expect(screen.getByRole("region", { name: "Instala la app en tu iPhone" })).toBeInTheDocument();
    expect(screen.getByText(/Añadir a pantalla de inicio/)).toBeInTheDocument();
    expect(screen.getByText(/ábrelo en Safari/)).toBeInTheDocument();
  });

  it("en Android sin instalación directa explica el menú del navegador", () => {
    simularDispositivo(ANDROID, { toques: 5 });
    render(<InstalarApp />);
    expect(screen.getByRole("region", { name: "Instala la app en tu Android" })).toBeInTheDocument();
    expect(screen.getByText(/Instalar app/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Instalar" })).not.toBeInTheDocument();
  });

  it("en Android con instalación directa ofrece el botón Instalar", async () => {
    simularDispositivo(ANDROID, { toques: 5 });
    const prompt = vi.fn().mockResolvedValue(undefined);
    avisarInstalacionDisponible({ prompt, userChoice: Promise.resolve({ outcome: "accepted" }) });
    render(<InstalarApp />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Instalar" })));
    expect(prompt).toHaveBeenCalledOnce();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("no aparece si la app ya está instalada ni en escritorio", () => {
    simularDispositivo(IPHONE, { toques: 5, instalada: true });
    const { unmount } = render(<InstalarApp />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    unmount();
    vi.restoreAllMocks();
    simularDispositivo(ESCRITORIO);
    render(<InstalarApp />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("al cerrarla queda recordado en este dispositivo", () => {
    simularDispositivo(IPHONE, { toques: 5 });
    const { unmount } = render(<InstalarApp />);
    fireEvent.click(screen.getByRole("button", { name: "Ahora no" }));
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    unmount();
    render(<InstalarApp />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("sin almacenamiento disponible se puede cerrar igualmente", () => {
    simularDispositivo(IPHONE, { toques: 5 });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("bloqueado"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("bloqueado"); });
    render(<InstalarApp />);
    fireEvent.click(screen.getByRole("button", { name: "Ahora no" }));
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });
});
