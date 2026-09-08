import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { App } from "./App";
import { estadoCambiar } from "./nube/cloud";
vi.mock("./producto/Coach", () => ({
  Coach: () => <p>Nota privada del cliente de prueba</p>,
}));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  estadoCambiar({ bloqueado: false });
});
it.each(["401", "redirect"])(
  "desmonta los datos del Coach al detectar revocación %s",
  async (modo) => {
    window.history.replaceState({}, "", "/admin");
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    let validar: (() => void) | undefined;
    const intervaloOriginal = globalThis.setInterval;
    vi.spyOn(globalThis, "setInterval").mockImplementation(((
      cb: () => void,
      demora: number,
    ) => {
      if (demora === 4000) {
        validar = cb;
        return 1;
      }
      return intervaloOriginal(cb, demora);
    }) as typeof setInterval);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    let revocado = false;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const respuesta = new Response(
          JSON.stringify(revocado ? { error: "Privado" } : { rol: "coach" }),
          { status: revocado && modo === "401" ? 401 : 200 },
        );
        if (revocado && modo === "redirect")
          Object.defineProperty(respuesta, "type", { value: "opaqueredirect" });
        return respuesta;
      }),
    );
    render(<App />);
    expect(
      await screen.findByText("Nota privada del cliente de prueba"),
    ).toBeInTheDocument();
    revocado = true;
    await act(async () => {
      validar?.();
    });
    await waitFor(() =>
      expect(
        screen.queryByText("Nota privada del cliente de prueba"),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("link", { name: "Entrar al Coach" }),
    ).toHaveAttribute("href", "/admin");
  },
);
