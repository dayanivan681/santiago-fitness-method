import { useCallback, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import { ContextoAyudaDemo, useAyudaDemo } from "./ayuda-demo-contexto";
import "./guia-demo.css";

export function ProveedorAyudaDemo({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const esCliente = pathname.startsWith("/demo/cliente");
  const [clienteId, setClienteId] = useState("demo-persona-1");
  const [cerrados, setCerrados] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [completados, setCompletados] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const cerrar = useCallback((id: string) => {
    setCerrados((prev) => (prev.has(id) ? prev : new Set([...prev, id])));
  }, []);
  const confirmarCliente = useCallback((id: string) => {
    setClienteId(id);
    setCompletados((prev) => new Set([...prev, `creado:${id}`]));
  }, []);
  const confirmarSerie = useCallback(() => {
    // Vista previa y Entrenar juntos no completan la primera tarea del Cliente.
    if (!esCliente) return;
    setCompletados((prev) =>
      prev.has(`serie:${clienteId}`)
        ? prev
        : new Set([...prev, `serie:${clienteId}`]),
    );
  }, [esCliente, clienteId]);
  return (
    <ContextoAyudaDemo
      value={{
        clienteId,
        esCliente,
        cerrados,
        completados,
        cerrar,
        confirmarCliente,
        confirmarSerie,
      }}
    >
      {children}
    </ContextoAyudaDemo>
  );
}

export function ConsejoDemo({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const ayuda = useAyudaDemo();
  if (!ayuda || ayuda.cerrados.has(id)) return null;
  return (
    <aside className="sfm-context-help" aria-label="Consejo">
      <div role="status">{children}</div>
      <button
        type="button"
        aria-label="Cerrar consejo"
        onClick={() => ayuda.cerrar(id)}
      >
        ×
      </button>
    </aside>
  );
}

export function ConsejoCliente({
  entrenando = false,
}: {
  entrenando?: boolean;
}) {
  const ayuda = useAyudaDemo();
  if (!ayuda?.esCliente) return null;
  const guardada = ayuda.completados.has(`serie:${ayuda.clienteId}`);
  if (guardada)
    return entrenando ? (
      <ConsejoDemo id={`guardada:${ayuda.clienteId}`}>
        <strong>Serie guardada.</strong>
        <p>Puedes descansar o seguir con la siguiente.</p>
      </ConsejoDemo>
    ) : null;
  return (
    <ConsejoDemo id={`${entrenando ? "registro" : "hoy"}:${ayuda.clienteId}`}>
      <p>
        {entrenando
          ? "Introduce el peso y las repeticiones. Después, toca Completar serie."
          : "Aquí tienes el entrenamiento de hoy."}
      </p>
    </ConsejoDemo>
  );
}
