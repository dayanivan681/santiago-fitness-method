import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ConsejoCliente, ProveedorAyudaDemo, ProveedorAyudaReal } from "./producto/Ayuda";
import { Consejo } from "./producto/Ayuda";
import type { Contexto } from "../shared/v2/contratos";
import type { Repositorio } from "./datos/repositorio";

/**
 * La ayuda de las cuentas reales.
 *
 * La demo olvida todo al recargar, así que su proveedor no necesita memoria. El
 * de las cuentas sí: recuerda en este dispositivo qué consejos se cerraron. Eso
 * abre tres formas de hacer daño que aquí se cierran —mezclar preferencias entre
 * cuentas, romperse si el almacenamiento está inservible, e insistir con
 * consejos de primera vez a quien lleva meses entrenando—, y una cuarta que es
 * de aislamiento: Vista previa y Entrenar juntos se montan dentro del proveedor
 * del Coach, y no deben enseñar los consejos del Cliente.
 */

function contexto(identidad: string, rol: Contexto["rol"] = "cliente"): Contexto {
  return {
    rol,
    identidad,
    nombre: "Cuenta de prueba",
    expiraEn: 0,
    validadoEn: 0,
    entorno: "local",
    medios: false,
  };
}

/** Sólo lo que consulta el proveedor para saber si ya hay actividad. */
function repositorio(conHistorial: boolean): Repositorio {
  return {
    listarSesiones: async () =>
      conHistorial ? [{ id: "s1", completadaEn: Date.now() }] : [],
    listarSeriesDeSesion: async () => [],
  } as unknown as Repositorio;
}

const CONSEJO_HOY = "Aquí tienes el entrenamiento de hoy.";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("recuerda lo que ya se leyó, por cuenta", () => {
  it("un consejo cerrado no vuelve en el siguiente montaje", async () => {
    const pintar = () =>
      render(
        <ProveedorAyudaReal contexto={contexto("ana")} repo={repositorio(false)}>
          <ConsejoCliente />
        </ProveedorAyudaReal>,
      );

    pintar();
    await userEvent.click(await screen.findByRole("button", { name: "Cerrar consejo" }));
    cleanup();
    pintar();

    // Un momento para que el efecto de lectura resuelva antes de afirmar la ausencia.
    await waitFor(() => expect(screen.queryByText(CONSEJO_HOY)).not.toBeInTheDocument());
  });

  it("otra cuenta en el mismo dispositivo empieza de cero", async () => {
    render(
      <ProveedorAyudaReal contexto={contexto("ana")} repo={repositorio(false)}>
        <ConsejoCliente />
      </ProveedorAyudaReal>,
    );
    await userEvent.click(await screen.findByRole("button", { name: "Cerrar consejo" }));
    cleanup();

    render(
      <ProveedorAyudaReal contexto={contexto("bruno")} repo={repositorio(false)}>
        <ConsejoCliente />
      </ProveedorAyudaReal>,
    );

    expect(await screen.findByText(CONSEJO_HOY)).toBeInTheDocument();
  });
});

describe("no depende de que el navegador colabore", () => {
  it("sigue en pie con preferencias corruptas guardadas", async () => {
    localStorage.setItem("sfm-ayuda:v1:local:cliente:ana", "{esto no es JSON");

    render(
      <ProveedorAyudaReal contexto={contexto("ana")} repo={repositorio(false)}>
        <ConsejoCliente />
      </ProveedorAyudaReal>,
    );

    expect(await screen.findByText(CONSEJO_HOY)).toBeInTheDocument();
  });

  it("si no puede guardar, la ayuda sigue siendo usable en esta visita", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("almacenamiento bloqueado");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("almacenamiento bloqueado");
    });

    render(
      <ProveedorAyudaReal contexto={contexto("ana")} repo={repositorio(false)}>
        <ConsejoCliente />
      </ProveedorAyudaReal>,
    );
    await userEvent.click(await screen.findByRole("button", { name: "Cerrar consejo" }));

    expect(screen.queryByText(CONSEJO_HOY)).not.toBeInTheDocument();
  });
});

describe("no trata de novato a quien no lo es", () => {
  it("con entrenamientos previos no aparece el consejo de primera vez", async () => {
    render(
      <ProveedorAyudaReal contexto={contexto("ana")} repo={repositorio(true)}>
        <ConsejoCliente />
      </ProveedorAyudaReal>,
    );

    await waitFor(() => expect(screen.queryByText(CONSEJO_HOY)).not.toBeInTheDocument());
  });

  it("mientras no sepa si hay historial, se calla", () => {
    // El repositorio no resuelve: la ayuda no debe adelantarse a la respuesta.
    const enEspera = {
      listarSesiones: () => new Promise<never>(() => {}),
      listarSeriesDeSesion: async () => [],
    } as unknown as Repositorio;

    render(
      <ProveedorAyudaReal contexto={contexto("ana")} repo={enEspera}>
        <ConsejoCliente />
      </ProveedorAyudaReal>,
    );

    expect(screen.queryByText(CONSEJO_HOY)).not.toBeInTheDocument();
  });
});

describe("fronteras", () => {
  it("Vista previa y Entrenar juntos no enseñan los consejos del Cliente", async () => {
    // Ambos modos se montan dentro del proveedor del Coach.
    render(
      <ProveedorAyudaReal contexto={contexto("coach@sfm", "coach")}>
        <ConsejoCliente />
      </ProveedorAyudaReal>,
    );

    await waitFor(() => expect(screen.queryByText(CONSEJO_HOY)).not.toBeInTheDocument());
  });

  it("la demo no escribe preferencias en el dispositivo", async () => {
    const persistir = vi.spyOn(Storage.prototype, "setItem");

    render(
      <MemoryRouter initialEntries={["/demo/cliente"]}>
        <ProveedorAyudaDemo>
          <Consejo id="cualquiera">
            <p>Un consejo de demostración</p>
          </Consejo>
        </ProveedorAyudaDemo>
      </MemoryRouter>,
    );
    await userEvent.click(await screen.findByRole("button", { name: "Cerrar consejo" }));

    expect(screen.queryByText("Un consejo de demostración")).not.toBeInTheDocument();
    expect(persistir).not.toHaveBeenCalled();
  });
});
