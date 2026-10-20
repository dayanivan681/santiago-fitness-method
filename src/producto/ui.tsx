import { useEffect, useId, useRef, type ReactNode } from "react";
import { usePresencia } from "../aplicacion/usePresencia";
import { useArrastrarParaCerrar } from "../aplicacion/gestos";
import { Link } from "react-router";
import {
  ArrowUpRight,
  ChartLine,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CloudCheck,
  Dumbbell,
  Ellipsis,
  House,
  Link2,
  LogOut,
  Plus,
  Search,
  Timer,
  Users,
  X,
} from "lucide-react";
/**
 * Un solo juego de iconos para toda la app (Lucide, línea fina). Antes había
 * cuatro estilos mezclados y flechas de texto que cambiaban con la fuente.
 */
const ICONOS = {
  hoy: House,
  clientes: Users,
  biblioteca: Dumbbell,
  progreso: ChartLine,
  volver: ChevronLeft,
  flecha: ChevronRight,
  arriba: ChevronUp,
  abajo: ChevronDown,
  mas: Plus,
  eslabon: Link2,
  check: Check,
  cerrar: X,
  tiempo: Timer,
  salir: LogOut,
  nube: CloudCheck,
  opciones: Ellipsis,
  abrir: ArrowUpRight,
  buscar: Search,
} as const;
export type NombreIcono = keyof typeof ICONOS;
export function Icono({
  nombre,
  size = 22,
  className,
}: {
  nombre: NombreIcono;
  size?: number;
  className?: string;
}) {
  const Forma = ICONOS[nombre] ?? ChevronRight;
  return <Forma size={size} strokeWidth={1.75} className={className} aria-hidden="true" focusable="false" />;
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
        <Link className="sfm-icon-button" data-tour="volver-clientes" data-tour-action="lista-clientes" to={volver} aria-label="Volver">
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
  // Sale animada (180 ms) y sólo entonces avisa a `cerrar`, que la desmonta.
  const { saliendo, salir, alTerminarAnimacion } = usePresencia(cerrar);
  // Arrastrada hacia abajo ya sale animada: se desmonta sin repetir la salida.
  useArrastrarParaCerrar(dialog, cerrar);
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
      className={`sfm-hoja ${saliendo ? "sfm-hoja--saliendo" : ""} ${clase}`}
      aria-labelledby={tituloId}
      onCancel={(e) => {
        // Cancelar el selector de archivos también emite «cancel» y se propaga.
        // Sólo la cancelación del propio diálogo debe cerrar esta hoja, y no
        // de golpe: se evita el cierre nativo para que pinte su salida.
        if (e.target === e.currentTarget) {
          e.preventDefault();
          salir();
        }
      }}
      onAnimationEnd={(e) => {
        // Las animaciones de dentro también suben: sólo cuenta la del diálogo.
        if (e.target === e.currentTarget) alTerminarAnimacion();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            salir();
        }
      }}
    >
      <span className="sfm-asa" aria-hidden="true" />
      <header>
        <h2 id={tituloId}>{titulo}</h2>
        <button
          className="sfm-icon-button"
          aria-label="Cerrar"
          onClick={salir}
        >
          <Icono nombre="cerrar" size={20} />
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
