import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import { ContextoAyuda, useAyuda } from "./ayuda-contexto";
import "./guia-demo.css";
import type { Contexto } from "../../shared/v2/contratos";
import type { Repositorio } from "../datos/repositorio";

/** Sólo preferencias de ayuda. Nunca guarda datos de perfil ni entrenamiento. */
export function ProveedorAyudaReal({ contexto, repo, children }: {
  contexto: Contexto;
  repo?: Repositorio;
  children: ReactNode;
}) {
  const clave = `sfm-ayuda:v1:${contexto.entorno}:${contexto.rol}:${contexto.identidad}`;
  // El propietario monta este proveedor con key por identidad/entorno/rol.
  const [cerrados, setCerrados] = useState<ReadonlySet<string>>(() => {
    try {
      const valor: unknown = JSON.parse(localStorage.getItem(clave) ?? "[]");
      return new Set(Array.isArray(valor) ? valor.filter((v): v is string => typeof v === "string") : []);
    } catch { return new Set(); }
  });
  const [completados, setCompletados] = useState<ReadonlySet<string>>(() => new Set());
  const [actividad, setActividad] = useState<boolean | undefined>(repo ? undefined : false);
  const esCliente = contexto.rol === "cliente";
  const clienteId = esCliente ? contexto.identidad : "";
  const cerrar = useCallback((id: string) => {
    setCerrados(prev => prev.has(id) ? prev : new Set([...prev, id]));
  }, []);
  useEffect(() => {
    try { localStorage.setItem(clave, JSON.stringify([...cerrados])); }
    catch { /* Ayuda utilizable aunque el navegador no permita persistir. */ }
  }, [clave, cerrados]);
  useEffect(() => {
    if (!repo) return;
    let vivo = true;
    void (async () => {
      const sesiones = await repo.listarSesiones(clienteId);
      for (const sesion of sesiones) {
        if (sesion.completadaEn || (await repo.listarSeriesDeSesion(sesion.id)).length) {
          if (vivo) setActividad(true);
          return;
        }
      }
      if (vivo) setActividad(false);
    })().catch(() => {
      // No interrumpir con consejos de primer uso si no se pudo verificar el historial.
      if (vivo) setActividad(true);
    });
    return () => { vivo = false; };
  }, [repo, clienteId]);
  const confirmarCliente = useCallback((id: string) => {
    setCompletados(prev => new Set([...prev, `creado:${id}`]));
    cerrar("bienvenida:coach");
  }, [cerrar]);
  const confirmarSerie = useCallback(() => {
    if (!esCliente || actividad) return;
    setCompletados(prev => new Set([...prev, `serie:${clienteId}`]));
    setCerrados(prev => new Set([...prev, `bienvenida:${clienteId}`, `hoy:${clienteId}`, `registro:${clienteId}`]));
  }, [esCliente, actividad, clienteId]);
  return <ContextoAyuda value={{ demo: false, preparada: actividad !== undefined,
    tieneActividad: actividad === true, clienteId, esCliente, cerrados, completados,
    cerrar, confirmarCliente, confirmarSerie }}>{children}</ContextoAyuda>;
}

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
    <ContextoAyuda
      value={{
        demo: true,
        preparada: true,
        tieneActividad: false,
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
    </ContextoAyuda>
  );
}

export function Consejo({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const ayuda = useAyuda();
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
  const ayuda = useAyuda();
  if (!ayuda?.esCliente || !ayuda.preparada || ayuda.tieneActividad) return null;
  const guardada = ayuda.completados.has(`serie:${ayuda.clienteId}`);
  if (guardada)
    return entrenando ? (
      <Consejo id={`guardada:${ayuda.clienteId}`}>
        <strong>Serie guardada.</strong>
        <p>Puedes corregirla con Editar. El descanso indicado por tu Coach empieza al guardar una serie nueva.</p>
      </Consejo>
    ) : null;
  return (
    <Consejo id={`${entrenando ? "registro" : "hoy"}:${ayuda.clienteId}`}>
      <p>
        {entrenando
          ? "Introduce el peso y las repeticiones. Después, toca Completar serie."
          : "Aquí tienes el entrenamiento de hoy."}
      </p>
    </Consejo>
  );
}
