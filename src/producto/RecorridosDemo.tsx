import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router";
import { ContextoRecorrido, type Capitulo } from "./recorrido-contexto";
import { recorridos, titulos, type PasoRecorrido } from "./recorridos";
import type { ServicioCoach } from "./servicio";
import "./recorridos.css";
type Recorrido = {
  capitulo: Capitulo;
  indice: number;
  cliente: string;
  pausa: boolean;
  regreso: string;
  confirmacion: number;
  desvio?: boolean;
  borrador?: string;
};
const visible = (e: HTMLElement) => e.getClientRects().length > 0;
function destino(p: PasoRecorrido, id: string) {
  if (p.ruta === "coach") return "/demo/coach";
  if (p.ruta === "alta") return "/demo/coach/nuevo";
  if (p.ruta === "lista") return "/demo/coach/clientes";
  if (p.ruta === "ficha") return `/demo/coach/clientes/${id}`;
  if (p.ruta === "preview")
    return (
      `/demo/coach/vista/${id}` +
      (["preview-serie", "preview-volver"].includes(p.id) ? "/entrenar" : "")
    );
  if (
    ["cliente-historial", "cliente-detalle", "cliente-biblioteca"].includes(
      p.id,
    )
  )
    return "/demo/cliente/progreso";
  if (p.id === "cliente-perfil") return "/demo/cliente/biblioteca";
  if (p.id === "cliente-privacidad") return "/demo/cliente/perfil";
  if (!["cliente-hoy", "cliente-comenzar", "cliente-progreso"].includes(p.id))
    return "/demo/cliente/entrenar";
  return "/demo/cliente";
}
export function ProveedorRecorridos({
  servicio,
  children,
}: {
  servicio: ServicioCoach;
  children: ReactNode;
}) {
  const loc = useLocation(),
    nav = useNavigate();
  const [actual, setActual] = useState<Recorrido | null>(null);
  const [clienteId, setClienteId] = useState("demo-persona-1");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [previewVerificada, setPreviewVerificada] = useState(false);
  const antesPreview = useRef("");
  const iniciando = useRef(false);
  const repeticiones = useRef(new Set<string>());
  const actualRef = useRef(actual);
  actualRef.current = actual;
  const paso = actual ? recorridos[actual.capitulo][actual.indice] : undefined;
  const emitir = useCallback((evento: string, id?: string) => {
    setActual((a) => {
      if (!a) return a;
      if (evento === "borrador-guardado" && a.capitulo === "crear")
        return { ...a, borrador: id };
      if (a.pausa) return a;
      const p = recorridos[a.capitulo][a.indice];
      if (!p || (p.evento ?? `entendido:${p.id}`) !== evento) return a;
      if (evento === "abrir-cliente" && id !== a.cliente)
        return { ...a, pausa: true, desvio: true };
      const cliente = evento === "cliente-creado" && id ? id : a.cliente;
      return {
        ...a,
        cliente,
        indice: a.indice + 1,
        confirmacion: a.confirmacion + 1,
      };
    });
  }, []);
  useEffect(() => {
    if (actual?.cliente) setClienteId(actual.cliente);
  }, [actual?.cliente]);
  const pausar = useCallback(
    () => setActual((a) => (a ? { ...a, pausa: true } : a)),
    [],
  );
  const desviar = () =>
    setActual((a) => (a ? { ...a, pausa: true, desvio: true } : a));
  async function huella(id: string) {
    const r = await servicio.repoDemo(id);
    return JSON.stringify({ sesiones: [...r.sesiones], series: [...r.series] });
  }
  async function iniciar(capitulo: Capitulo, id?: string) {
    if (iniciando.current) return;
    iniciando.current = true;
    setOcupado(true);
    setError("");
    try {
      let elegido = id ?? clienteId;
      const clave = `${capitulo}:${elegido}`;
      if (
        capitulo !== "crear" &&
        (repeticiones.current.has(clave) ||
          (capitulo === "cliente" &&
            (await servicio.repoDemo(elegido)).sesiones.size > 0))
      ) {
        elegido = await servicio.escenarioDemo(elegido);
      }
      repeticiones.current.add(`${capitulo}:${elegido}`);
      if (capitulo === "preview") {
        antesPreview.current = await huella(elegido);
        setPreviewVerificada(false);
      }
      setClienteId(elegido);
      const ruta = destino(recorridos[capitulo][0], elegido);
      setActual({
        capitulo,
        indice: 0,
        cliente: elegido,
        pausa: false,
        regreso: ruta,
        confirmacion: 0,
      });
      nav(ruta);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      iniciando.current = false;
      setOcupado(false);
    }
  }
  // Las rutas ajenas al paso pausan. Un cambio de rol nunca arrastra un tutorial.
  useEffect(() => {
    setActual((a) => {
      if (!a || a.pausa) return a;
      const p = recorridos[a.capitulo][a.indice];
      if (!p) return a;
      const ruta = destino(p, a.cliente);
      const valida =
        p.ruta === "alta"
          ? loc.pathname.startsWith(ruta)
          : loc.pathname === ruta;
      return valida
        ? { ...a, regreso: loc.pathname + loc.search }
        : { ...a, pausa: true, desvio: true };
    });
  }, [loc.pathname, loc.search]);
  useEffect(() => {
    if (paso?.id !== "preview-comprobar" || !actual) return;
    let vivo = true;
    void huella(actual.cliente)
      .then((h) => {
        if (vivo) {
          setPreviewVerificada(h === antesPreview.current);
          if (h !== antesPreview.current)
            setError(
              "La práctica cambió el historial. No damos esta comprobación por aprobada.",
            );
        }
      })
      .catch((e) => {
        if (vivo) setError(e.message);
      });
    return () => {
      vivo = false;
    };
    // La huella se captura sólo al entrar y al terminar la preview.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso?.id, actual?.cliente]);
  const salir = () => {
    const p = actual ? recorridos[actual.capitulo][actual.indice] : undefined;
    const objetivo = p
      ? Array.from(
          document.querySelectorAll<HTMLElement>(`[data-tour="${p.ancla}"]`),
        ).find(visible)
      : null;
    setActual(null);
    setError("");
    const control = objetivo?.matches("button,a,input,textarea,select")
      ? objetivo
      : objetivo?.querySelector<HTMLElement>("button,a,input,textarea,select");
    control?.focus({ preventScroll: true });
  };
  const seguir = () => {
    if (!actual) return;
    let indice = actual.indice,
      ruta = actual.regreso;
    if (actual.desvio) {
      if (actual.capitulo === "crear") {
        if (indice < 5 && actual.borrador)
          ruta = `/demo/coach/nuevo/${actual.borrador}`;
        else if (indice < 5) {
          indice = 0;
          ruta = "/demo/coach";
        }
      } else if (actual.capitulo === "gestionar") {
        indice =
          indice <= 2
            ? 0
            : indice <= 6
              ? 3
              : indice <= 9
                ? 8
                : indice <= 11
                  ? 10
                  : 12;
        ruta = `/demo/coach/clientes/${actual.cliente}?guia=${crypto.randomUUID()}`;
      } else if (actual.capitulo === "preview") {
        indice = 0;
        ruta = `/demo/coach/clientes/${actual.cliente}?guia=${crypto.randomUUID()}`;
      } else {
        if (indice === 8) indice = 7;
        if (indice === 10) indice = 9;
        if (indice === 12) indice = 13;
        if (indice === 15) indice = 14;
        ruta = destino(
          recorridos.cliente[Math.min(indice, recorridos.cliente.length - 1)],
          actual.cliente,
        );
      }
    }
    setActual({
      ...actual,
      indice,
      regreso: ruta,
      pausa: false,
      desvio: false,
    });
    nav(ruta);
  };
  const activa = Boolean(actual && !actual.pausa && paso);
  return (
    <ContextoRecorrido.Provider
      value={{
        paso: activa ? paso!.id : null,
        activo: Boolean(actual),
        clienteId,
        nombreEjemplo: `Elena · práctica ${servicio.clientes.length - 2}`,
        emitir,
        iniciar,
        pausar,
      }}
    >
      <div
        className="sfm-demo-guided"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const el = target.closest<HTMLElement>("[data-tour-action]");
          if (el && !el.matches(":disabled")) {
            const a = actualRef.current;
            const esperado = a
              ? recorridos[a.capitulo][a.indice]?.evento
              : undefined;
            if (
              a &&
              !a.pausa &&
              el.dataset.tourAction !== esperado &&
              (el.matches("a[href]") || el.dataset.tour?.startsWith("tab-"))
            )
              desviar();
            else emitir(el.dataset.tourAction!, el.dataset.tourClient);
          } else if (
            target.closest("a[href]") &&
            actualRef.current &&
            !actualRef.current.pausa
          )
            desviar();
        }}
      >
        {children}
      </div>
      {actual && (
        <FocoRecorrido
          paso={paso}
          pausa={actual.pausa}
          confirmacion={actual.confirmacion}
          titulo={titulos[actual.capitulo]}
          numero={actual.indice + 1}
          total={recorridos[actual.capitulo].length}
          salir={salir}
          pausar={pausar}
          seguir={seguir}
        >
          {error ? <p role="alert">{error}</p> : null}
          {actual.pausa ? (
            <p>
              Tu práctica está en pausa. Si saliste de una pantalla de edición,
              retomamos desde su entrada. Lo guardado permanece.
            </p>
          ) : paso ? (
            <>
              <p>{paso.texto}</p>
              {paso.id === "preview-comprobar" && (
                <small role="status">
                  {previewVerificada
                    ? "✓ Historial comprobado: sin cambios."
                    : "Comprobando el historial…"}
                </small>
              )}
              {!paso.evento && (
                <button
                  disabled={
                    paso.id === "preview-comprobar" && !previewVerificada
                  }
                  onClick={() => emitir(`entendido:${paso.id}`)}
                >
                  Entendido, continuar →
                </button>
              )}
            </>
          ) : (
            <>
              <p>
                {actual.capitulo === "crear"
                  ? "Ya creaste su espacio. Ahora vamos a acompañar su proceso."
                  : actual.capitulo === "cliente"
                    ? "Tu primera práctica ya forma parte del historial de esta demo."
                    : "Ya sabes cómo funciona este lado de su proceso."}
              </p>
              <div className="sfm-tour-next">
                {actual.capitulo === "crear" && (
                  <button
                    disabled={ocupado}
                    onClick={() => void iniciar("gestionar", actual.cliente)}
                  >
                    Aprender a manejar este cliente →
                  </button>
                )}
                {actual.capitulo === "gestionar" && (
                  <button
                    disabled={ocupado}
                    onClick={() => void iniciar("preview", actual.cliente)}
                  >
                    Aprender Vista previa →
                  </button>
                )}
                {actual.capitulo === "preview" && (
                  <button
                    disabled={ocupado}
                    onClick={() => void iniciar("cliente", actual.cliente)}
                  >
                    Probar la primera entrada de este cliente →
                  </button>
                )}
                {actual.capitulo === "cliente" && (
                  <button
                    onClick={() => {
                      nav(
                        `/demo/coach/clientes/${actual.cliente}?seccion=actividad`,
                      );
                      salir();
                    }}
                  >
                    Ver esta actividad como Coach →
                  </button>
                )}
                <button onClick={salir}>Explorar por mi cuenta</button>
              </div>
            </>
          )}
        </FocoRecorrido>
      )}
      {!actual && error && <p role="alert">{error}</p>}
    </ContextoRecorrido.Provider>
  );
}
function FocoRecorrido({
  paso,
  pausa,
  titulo,
  numero,
  total,
  confirmacion,
  children,
  salir,
  pausar,
  seguir,
}: {
  paso?: PasoRecorrido;
  pausa: boolean;
  titulo: string;
  numero: number;
  total: number;
  confirmacion: number;
  children: ReactNode;
  salir: () => void;
  pausar: () => void;
  seguir: () => void;
}) {
  const tarjeta = useRef<HTMLDivElement>(null);
  const teclado = useRef(false);
  const [host, setHost] = useState<HTMLElement>(document.body);
  const [rect, setRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [ventana, setVentana] = useState({ top: 0, compacta: false });
  const [encontrado, setEncontrado] = useState(false);
  const [repaso, setRepaso] = useState(false);
  const [anterior, setAnterior] = useState<PasoRecorrido | undefined>(
    undefined,
  );
  const [actualPaso, setActualPaso] = useState(paso);
  if (actualPaso !== paso) {
    setAnterior(actualPaso);
    setActualPaso(paso);
    setRepaso(false);
  }
  useLayoutEffect(() => {
    let frame = 0,
      ultimo: HTMLElement | null = null;
    const medir = () => {
      const dialog = Array.from(
        document.querySelectorAll<HTMLDialogElement>("dialog[open]"),
      ).at(-1);
      const lugar = dialog ?? document.body;
      setHost((h) => (h === lugar ? h : lugar));
      const v = window.visualViewport;
      const top = v?.offsetTop ?? 0,
        alto = v?.height ?? window.innerHeight;
      setVentana((a) =>
        a.top === top && a.compacta === alto < 480
          ? a
          : { top, compacta: alto < 480 },
      );
      const panel = tarjeta.current?.getBoundingClientRect();
      document.documentElement.style.setProperty(
        "--tour-space",
        `${panel?.height ?? 180}px`,
      );
      const candidatos =
        paso && !pausa
          ? Array.from(
              document.querySelectorAll<HTMLElement>(
                `[data-tour="${paso.ancla}"]`,
              ),
            )
          : [];
      const objetivo =
        candidatos.find((e) => visible(e) && (!dialog || dialog.contains(e))) ??
        null;
      setEncontrado(Boolean(objetivo));
      if (objetivo) {
        objetivo.setAttribute("aria-describedby", "sfm-tour-instruccion");
        const r = objetivo.getBoundingClientRect();
        if (ultimo !== objetivo) {
          ultimo?.removeAttribute("aria-describedby");
          ultimo = objetivo;
          if (teclado.current) {
            const control = objetivo.matches("button,a,input,textarea,select")
              ? objetivo
              : objetivo.querySelector<HTMLElement>(
                  "button,a,input,textarea,select",
                );
            control?.focus({ preventScroll: true });
          }
          if (
            r.top < top + (panel?.height ?? 180) + 12 ||
            r.bottom > top + alto - 110
          )
            objetivo.scrollIntoView({ block: "center", behavior: "instant" });
        }
        const b = objetivo.getBoundingClientRect();
        const y = Math.max(top + (panel?.height ?? 180) + 16, b.top - 5);
        const nuevo = {
          x: Math.max(4, b.left - 5),
          y,
          w: Math.min(window.innerWidth - 8, b.width + 10),
          h: Math.max(0, Math.min(b.bottom + 5, top + alto) - y),
        };
        setRect((a) =>
          a &&
          Object.keys(nuevo).every(
            (k) => a[k as keyof typeof a] === nuevo[k as keyof typeof nuevo],
          )
            ? a
            : nuevo,
        );
      } else setRect(null);
    };
    const solicitar = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(medir);
    };
    const observer = new MutationObserver(solicitar);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open", "data-tour", "aria-pressed"],
    });
    const resize =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(solicitar)
        : null;
    if (tarjeta.current) resize?.observe(tarjeta.current);
    window.addEventListener("resize", solicitar);
    window.addEventListener("scroll", solicitar, true);
    window.visualViewport?.addEventListener("resize", solicitar);
    window.visualViewport?.addEventListener("scroll", solicitar);
    solicitar();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize?.disconnect();
      window.removeEventListener("resize", solicitar);
      window.removeEventListener("scroll", solicitar, true);
      window.visualViewport?.removeEventListener("resize", solicitar);
      window.visualViewport?.removeEventListener("scroll", solicitar);
      ultimo?.removeAttribute("aria-describedby");
      document.documentElement.style.removeProperty("--tour-space");
    };
  }, [paso, pausa, host]);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key === "Tab") teclado.current = true;
      if (e.key === "Escape" && !document.querySelector("dialog[open]"))
        pausar();
    };
    const pointer = () => {
      teclado.current = false;
    };
    window.addEventListener("keydown", f);
    window.addEventListener("pointerdown", pointer);
    return () => {
      window.removeEventListener("keydown", f);
      window.removeEventListener("pointerdown", pointer);
    };
  }, [pausar]);
  return createPortal(
    <>
      {!pausa && rect && (
        <div
          aria-hidden="true"
          className="sfm-tour-focus"
          style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
        />
      )}
      <div
        ref={tarjeta}
        data-tour-step={paso?.id ?? "fin"}
        role="region"
        aria-label="Práctica guiada"
        className={`sfm-tour-card ${pausa ? "sfm-tour-card--pausa" : ""} ${ventana.compacta ? "sfm-tour-card--compacta" : ""}`}
        style={{ top: ventana.top + 8 }}
      >
        <div className="sfm-tour-heading">
          <span>{titulo}</span>
          <span>
            {Math.min(numero, total)} / {total}
          </span>
        </div>
        <div
          className="sfm-tour-track"
          role="progressbar"
          aria-label="Progreso de la guía"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={Math.min(numero - 1, total)}
        >
          <i
            style={{ width: `${(Math.min(numero - 1, total) / total) * 100}%` }}
          />
        </div>
        <span className="sr-only" id="sfm-tour-instruccion">
          {paso?.titulo} {paso?.texto}
        </span>
        <h2 aria-live="polite">
          {repaso
            ? anterior?.titulo
            : pausa
              ? "A tu ritmo."
              : (paso?.titulo ?? "Ya lo has hecho.")}
        </h2>
        {confirmacion > 0 && !pausa && (
          <span
            className="sfm-tour-check"
            key={confirmacion}
            aria-label="Paso completado"
          >
            ✓
          </span>
        )}
        {repaso ? <p>{anterior?.texto}</p> : children}
        {!pausa && paso && !encontrado && (
          <small role="status">
            Abre el control indicado para continuar. Puedes pausar y volver a
            explorar.
          </small>
        )}
        <div className="sfm-tour-controls">
          {pausa ? (
            <button onClick={seguir}>Continuar</button>
          ) : (
            <button onClick={pausar}>Pausar</button>
          )}
          {!pausa && anterior && (
            <button onClick={() => setRepaso(!repaso)}>
              {repaso ? "Volver al paso actual" : "Repasar anterior"}
            </button>
          )}
          <button onClick={salir}>Salir</button>
        </div>
      </div>
    </>,
    host,
  );
}
