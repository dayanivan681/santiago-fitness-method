import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AvisoNovedades } from "./Novedades";
import { useNovedades } from "./useNovedades";
import { NOVEDADES, novedadesPendientes, type Novedad } from "./notas-novedades";

const HOY = new Date("2026-10-21T12:00:00");
const LISTA: readonly Novedad[] = [
  { id: "c2", fecha: "2026-10-20", audiencia: "coach", titulo: "Coach nuevo", puntos: ["Uno"] },
  { id: "k1", fecha: "2026-10-19", audiencia: "cliente", titulo: "Cliente", puntos: ["Dos"] },
  { id: "c1", fecha: "2026-10-01", audiencia: "coach", titulo: "Coach viejo", puntos: ["Tres"] },
];

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("novedadesPendientes", () => {
  it("en un dispositivo sin registro muestra solo la novedad más reciente de su audiencia", () => {
    expect(novedadesPendientes(LISTA, "coach", null, HOY).map((n) => n.id)).toEqual(["c2"]);
  });

  it("en un dispositivo sin registro no muestra novedades antiguas", () => {
    expect(novedadesPendientes(LISTA, "coach", null, new Date("2026-12-01T12:00:00"))).toEqual([]);
  });

  it("con registro muestra todas las no vistas de su audiencia, de la más reciente a la más antigua", () => {
    expect(novedadesPendientes(LISTA, "coach", new Set(), HOY).map((n) => n.id)).toEqual(["c2", "c1"]);
    expect(novedadesPendientes(LISTA, "coach", new Set(["c2"]), HOY).map((n) => n.id)).toEqual(["c1"]);
    expect(novedadesPendientes(LISTA, "cliente", new Set(), HOY).map((n) => n.id)).toEqual(["k1"]);
  });
});

describe("NOVEDADES", () => {
  it("cada nota tiene id único, fecha válida, título y puntos, de la más reciente a la más antigua", () => {
    const ids = NOVEDADES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const n of NOVEDADES) {
      expect(n.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(n.fecha))).toBe(false);
      expect(n.titulo.trim()).not.toBe("");
      expect(n.puntos.length).toBeGreaterThan(0);
    }
    const fechas = NOVEDADES.map((n) => n.fecha);
    expect(fechas).toEqual([...fechas].sort().reverse());
  });
});

function Arnes({ activo = true }: { activo?: boolean }) {
  const { pendientes, marcarVistas } = useNovedades("coach", activo, { lista: LISTA, hoy: HOY });
  return pendientes.length > 0 ? <AvisoNovedades novedades={pendientes} cerrar={marcarVistas} /> : <p>Sin aviso</p>;
}

describe("AvisoNovedades", () => {
  it("aparece una vez y, al cerrarlo, queda recordado en este dispositivo", () => {
    const { unmount } = render(<Arnes />);
    expect(screen.getByRole("dialog", { name: "Novedades" })).toBeInTheDocument();
    expect(screen.getByText("Coach nuevo")).toBeInTheDocument();
    expect(screen.queryByText("Coach viejo")).not.toBeInTheDocument();
    act(() => fireEvent.click(screen.getByRole("button", { name: "Entendido" })));
    expect(screen.getByText("Sin aviso")).toBeInTheDocument();
    unmount();
    render(<Arnes />);
    expect(screen.getByText("Sin aviso")).toBeInTheDocument();
  });

  it("no aparece cuando está inactivo (demo)", () => {
    render(<Arnes activo={false} />);
    expect(screen.getByText("Sin aviso")).toBeInTheDocument();
  });

  it("sigue funcionando si el almacenamiento del navegador falla", () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("bloqueado");
    };
    try {
      render(<Arnes />);
      expect(screen.getByText("Coach nuevo")).toBeInTheDocument();
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});
