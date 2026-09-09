import { useEffect, useId, useRef, type ReactNode } from "react";
import { Link } from "react-router";
export function Icono({
  nombre,
  size = 22,
}: {
  nombre: string;
  size?: number;
}) {
  const formas: Record<string, ReactNode> = {
    hoy: (
      <>
        <path d="M3 11 12 3l9 8v10h-6v-7H9v7H3Z" />
      </>
    ),
    clientes: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M2 21v-3a7 7 0 0 1 14 0v3M17 4a4 4 0 0 1 0 8M20 21v-3a7 7 0 0 0-3-6" />
      </>
    ),
    biblioteca: (
      <>
        <path d="M3 5v14M7 8v8M17 8v8M21 5v14M7 12h10" />
      </>
    ),
    progreso: (
      <>
        <path d="M4 20V4M4 20h17M7 14l5-5 4 3 5-8" />
      </>
    ),
    volver: <path d="m14 5-7 7 7 7" />,
    mas: <path d="M12 5v14M5 12h14" />,
    check: <path d="m5 12 4 4L20 5" />,
    flecha: <path d="m9 5 7 7-7 7" />,
    tiempo: (
      <>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v5l3 2M9 2h6" />
      </>
    ),
    salir: (
      <>
        <path d="M9 3H3v18h6M9 12h12m-5-5 5 5-5 5" />
      </>
    ),
    nube: (
      <path d="M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1 0 11M9 15l3 3 5-6" />
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {formas[nombre] ?? formas.flecha}
    </svg>
  );
}
export function Marca() {
  return (
    <span className="sfm-marca">
      SANTIAGO<span>FITNESS METHOD</span>
    </span>
  );
}
export function Cabecera({
  titulo,
  kicker,
  accion,
  volver,
}: {
  titulo: string;
  kicker?: string;
  accion?: ReactNode;
  volver?: string;
}) {
  return (
    <header className="sfm-cabecera">
      {volver && (
        <Link className="sfm-icon-button" to={volver} aria-label="Volver">
          <Icono nombre="volver" />
        </Link>
      )}
      <div>
        {kicker && <p className="sfm-eyebrow">{kicker}</p>}
        <h1>{titulo}</h1>
      </div>
      {accion && <div className="sfm-cabecera-accion">{accion}</div>}
    </header>
  );
}
export function Avatar({ nombre }: { nombre: string }) {
  return (
    <span className="sfm-avatar" aria-hidden="true">
      {nombre
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}
export function Vacio({
  titulo,
  detalle,
  accion,
}: {
  titulo: string;
  detalle: string;
  accion?: ReactNode;
}) {
  return (
    <div className="sfm-vacio">
      <span className="sfm-empty-mark">
        <Icono nombre="biblioteca" size={32} />
      </span>
      <h2>{titulo}</h2>
      <p>{detalle}</p>
      {accion}
    </div>
  );
}
export function ErrorVisible({ error }: { error: string }) {
  return error ? (
    <p className="sfm-error" role="alert">
      {error}
    </p>
  ) : null;
}
export function Hoja({
  titulo,
  children,
  cerrar,
  clase = "",
}: {
  titulo: string;
  children: ReactNode;
  cerrar: () => void;
  clase?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const tituloId = useId();
  useEffect(() => {
    const elemento = dialog.current;
    const origen = document.activeElement;
    elemento?.showModal();
    return () => {
      elemento?.close();
      if (origen instanceof HTMLElement && origen.isConnected) origen.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`sfm-hoja ${clase}`}
      aria-labelledby={tituloId}
      onCancel={cerrar}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            cerrar();
        }
      }}
    >
      <header>
        <h2 id={tituloId}>{titulo}</h2>
        <button
          className="sfm-icon-button"
          aria-label="Cerrar"
          onClick={cerrar}
        >
          ×
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function FechaBonita({ fecha }: { fecha: string }) {
  return (
    <>
      {new Date(fecha + "T12:00:00").toLocaleDateString("es", {
        day: "numeric",
        month: "short",
      })}
    </>
  );
}
