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
import {
  accionesRecorrido,
  recorridos,
  titulos,
  type PasoRecorrido,
} from "./recorridos";
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
          clienteId={actual.cliente}
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
                  className="sfm-tour-primary"
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
  clienteId,
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
  clienteId: string;
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
  const [campoActivo, setCampoActivo] = useState(false);
  const [partePlan, setPartePlan] = useState(0);
  const [partesPlan, setPartesPlan] = useState(0);
  const [indicacion, setIndicacion] = useState("Mira aquí");
  const [pulso, setPulso] = useState(0);
  const [quieto, setQuieto] = useState(false);
  const [host, setHost] = useState<HTMLElement>(document.body);
  const [rect, setRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
    abajo: boolean;
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
    setPartePlan(0);
  }
  useLayoutEffect(() => {
    let frame = 0,
      ultimo: HTMLElement | null = null;
    let recolocar = true;
    let scrollAutomatico = false;
    let altoAnterior = window.visualViewport?.height ?? window.innerHeight;
    let anchoAnterior = window.innerWidth;
    const editados = new WeakSet<HTMLElement>();
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
      let objetivo =
        candidatos.find((e) => visible(e) && (!dialog || dialog.contains(e))) ??
        null;
      const buscar = (ancla: string) =>
        Array.from(
          lugar.querySelectorAll<HTMLElement>(`[data-tour="${ancla}"]`),
        ).find(visible) ?? null;
      const editando = (e: HTMLElement | null) =>
        e && document.activeElement === e;
      const pendiente = (e: HTMLElement | null) =>
        e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement
          ? !e.value.trim() || editando(e)
          : false;
      if (paso && !pausa) {
        objetivo = buscar(accionesRecorrido[paso.id] ?? paso.ancla) ?? objetivo;
        if (paso.id === "crear-persona") {
          const nombre = buscar("alta-nombre"),
            meta = buscar("alta-objetivo");
          objetivo = pendiente(nombre)
            ? nombre
            : pendiente(meta)
              ? meta
              : buscar("alta-continuar");
        }
        if (paso.id === "crear-contexto") {
          const frecuencia = buscar("alta-frecuencia");
          const limitaciones = buscar("alta-limitaciones"),
            notas = buscar("alta-notas");
          objetivo =
            frecuencia && !editados.has(frecuencia)
              ? frecuencia
              : limitaciones &&
                  (!editados.has(limitaciones) || editando(limitaciones))
                ? limitaciones
                : notas && (!editados.has(notas) || editando(notas))
                  ? notas
                  : buscar("alta-continuar");
        }
        if (paso.id === "crear-publicar") {
          const revision = buscar("alta-revision");
          objetivo = revision?.querySelector<HTMLInputElement>("input")?.checked
            ? buscar("alta-continuar")
            : revision;
        }
        if (paso.id === "crear-buscar") {
          const fila = Array.from(
            lugar.querySelectorAll<HTMLElement>("[data-tour-client]"),
          ).find((e) => e.dataset.tourClient === clienteId && visible(e));
          const campo = buscar("buscar-cliente");
          objetivo = editando(campo) ? campo : (fila ?? campo);
        }
        if (
          paso.id === "gestionar-objetivo" ||
          paso.id === "gestionar-prescripcion"
        ) {
          const campo = buscar(
            paso.id === "gestionar-objetivo"
              ? "objetivo-perfil"
              : "prescripcion-descanso",
          );
          objetivo =
            campo && editados.has(campo) && !editando(campo)
              ? buscar(
                  paso.id === "gestionar-objetivo"
                    ? "guardar-perfil"
                    : "prescripcion-lista",
                )
              : campo;
        }
        if (paso.id === "cliente-detalle")
          objetivo = lugar.querySelector<HTMLElement>(
            'button[aria-label="Cerrar"]',
          );
        if (paso.id === "cliente-corregir") {
          const campo = buscar("serie-activa");
          objetivo =
            campo?.querySelector<HTMLElement>('[aria-label^="Subir reps"]') ??
            buscar("guardar-serie");
          if (campo && editados.has(campo)) objetivo = buscar("guardar-serie");
        }
      }
      if (paso?.id === "crear-plan" && !pausa) {
        const editor = buscar("editor-plan");
        const partes = editor
          ? Array.from(
              editor.querySelectorAll<HTMLElement>(
                ".sfm-segmentos, .sfm-plan-row",
              ),
            )
          : [];
        setPartesPlan(partes.length);
        objetivo = partes[Math.min(partePlan, partes.length - 1)] ?? objetivo;
      }
      if (objetivo?.matches(":disabled")) objetivo = null;
      setCampoActivo(
        Boolean(objetivo?.matches("input:not([type=checkbox]),textarea")),
      );
      setEncontrado(Boolean(objetivo));
      if (objetivo) {
        objetivo.setAttribute("aria-describedby", "sfm-tour-instruccion");
        const r = objetivo.getBoundingClientRect();
        const cambiaObjetivo = ultimo !== objetivo;
        if (cambiaObjetivo) {
          ultimo?.removeAttribute("aria-describedby");
          ultimo?.removeAttribute("data-tour-highlight");
          ultimo = objetivo;
          const tipo = objetivo.matches("input:not([type=checkbox]),textarea")
            ? "Escribe aquí"
            : objetivo.matches("button,a,label")
              ? "Toca aquí"
              : objetivo.querySelector("button,input,select") && paso?.evento
                ? "Elige aquí"
                : "Mira aquí";
          setIndicacion(tipo);
          objetivo.setAttribute(
            "data-tour-highlight",
            paso?.id === "crear-plan" && partePlan > 0
              ? "lectura"
              : objetivo.matches("button,a")
                ? "accion"
                : "campo",
          );
          setQuieto(false);
          setPulso((n) => n + 1);
          if (teclado.current) {
            const control = objetivo.matches("button,a,input,textarea,select")
              ? objetivo
              : objetivo.querySelector<HTMLElement>(
                  "button,a,input,textarea,select",
                );
            control?.focus({ preventScroll: true });
          }
        }
        if (cambiaObjetivo || recolocar) {
          recolocar = false;
          if (
            r.top < top + (panel?.height ?? 180) + 24 ||
            r.bottom > top + alto - 110
          ) {
            scrollAutomatico = true;
            objetivo.scrollIntoView({ block: "center", behavior: "instant" });
          }
        }
        const b = objetivo.getBoundingClientRect();
        const y = Math.max(top + (panel?.height ?? 180) + 16, b.top - 5);
        const nuevo = {
          abajo: y - top < (panel?.height ?? 180) + 65,
          x: Math.max(4, b.left - 5),
          y,
          w: Math.min(window.innerWidth - 8, b.width + 10),
          h: Math.max(0, Math.min(b.bottom + 5, top + alto) - y),
        };
        // No dibujar un borde colapsado ni una etiqueta flotante cuando el
        // control ha salido del espacio utilizable bajo la guía.
        if (nuevo.h < 32 || b.top >= top + alto) {
          setRect(null);
          return;
        }
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
    const reajustar = () => {
      const alto = window.visualViewport?.height ?? window.innerHeight;
      // La barra del navegador y el tamaño de la tarjeta no deben recentrar
      // el formulario mientras la persona lo está recorriendo.
      recolocar ||=
        Math.abs(alto - altoAnterior) > 120 ||
        window.innerWidth !== anchoAnterior;
      altoAnterior = alto;
      anchoAnterior = window.innerWidth;
      solicitar();
    };
    const observer = new MutationObserver(solicitar);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "open",
        "data-tour",
        "aria-pressed",
        "disabled",
        "checked",
        "value",
      ],
    });
    const resize =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            recolocar = true;
            solicitar();
          })
        : null;
    if (tarjeta.current) resize?.observe(tarjeta.current);
    const interactuar = (e: Event) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (ultimo?.contains(e.target)) setQuieto(true);
      if (e.type === "input" || e.type === "change") editados.add(e.target);
      if (
        paso?.id === "crear-contexto" &&
        (e.type === "click" || e.type === "input")
      ) {
        const frecuencia = document.querySelector<HTMLElement>(
          '[data-tour="alta-frecuencia"]',
        );
        if (frecuencia && e.target.closest('[data-tour="alta-contexto"]'))
          editados.add(frecuencia);
      }
      if (
        paso?.id === "cliente-corregir" &&
        (e.type === "input" || e.type === "click") &&
        e.target.closest('[data-tour="serie-activa"]')
      ) {
        const serie = buscarSerie();
        if (
          serie &&
          (e.target.matches("input") ||
            e.target.closest(
              '[aria-label^="Subir reps"],[aria-label^="Bajar reps"]',
            ))
        )
          editados.add(serie);
      }
      solicitar();
    };
    const buscarSerie = () =>
      document.querySelector<HTMLElement>('[data-tour="serie-activa"]');
    const avanzarCampo = () => {
      if (!ultimo) return;
      if (
        ultimo instanceof HTMLInputElement ||
        ultimo instanceof HTMLTextAreaElement
      ) {
        if (paso?.id === "crear-persona" && !ultimo.value.trim()) {
          ultimo.focus();
          return;
        }
        if (!ultimo.reportValidity()) return;
        editados.add(ultimo);
        ultimo.blur();
      }
      recolocar = true;
      solicitar();
    };
    document.addEventListener("sfm-tour-campo-listo", avanzarCampo);
    const eventos = ["input", "change", "focusout", "click", "pointerdown"];
    eventos.forEach((e) => document.addEventListener(e, interactuar, true));
    window.addEventListener("resize", reajustar);
    const alDesplazar = () => {
      if (!scrollAutomatico) setQuieto(true);
      scrollAutomatico = false;
      solicitar();
    };
    window.addEventListener("scroll", alDesplazar, true);
    window.visualViewport?.addEventListener("resize", reajustar);
    window.visualViewport?.addEventListener("scroll", alDesplazar);
    solicitar();
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("sfm-tour-campo-listo", avanzarCampo);
      observer.disconnect();
      resize?.disconnect();
      window.removeEventListener("resize", reajustar);
      window.removeEventListener("scroll", alDesplazar, true);
      window.visualViewport?.removeEventListener("resize", reajustar);
      window.visualViewport?.removeEventListener("scroll", alDesplazar);
      ultimo?.removeAttribute("aria-describedby");
      ultimo?.removeAttribute("data-tour-highlight");
      eventos.forEach((e) =>
        document.removeEventListener(e, interactuar, true),
      );
      document.documentElement.style.removeProperty("--tour-space");
    };
  }, [paso, pausa, host, clienteId, partePlan]);
  useLayoutEffect(() => {
    if (pausa) return;
    document.documentElement.classList.add("sfm-tour-locked");
    const campoTexto = (e: Event) =>
      e.target instanceof HTMLElement &&
      e.target.matches("textarea,input,select");
    const bloquearRueda = (e: WheelEvent) => {
      if (!e.ctrlKey && !campoTexto(e)) e.preventDefault();
    };
    const bloquearArrastre = (e: TouchEvent) => {
      if (e.touches.length === 1 && !campoTexto(e)) e.preventDefault();
    };
    const permitido = (el: Element) =>
      Boolean(
        el.closest(
          '.sfm-tour-card,[data-tour-highlight]:not([data-tour-highlight="lectura"])',
        ),
      );
    const bloquearExploracion = (e: MouseEvent) => {
      if (
        document.querySelector("[data-tour-highlight]") &&
        e.target instanceof Element &&
        !permitido(e.target)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const tecladoGuiado = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const controles = Array.from(
          (
            document.querySelector("dialog[open]") ?? document
          ).querySelectorAll<HTMLElement>(
            'button,a,input,textarea,select,[tabindex="0"]',
          ),
        ).filter(
          (el) =>
            permitido(el) &&
            !el.matches(":disabled") &&
            el.getClientRects().length > 0,
        );
        if (controles.length) {
          e.preventDefault();
          const i = controles.indexOf(document.activeElement as HTMLElement);
          controles[
            (i + (e.shiftKey ? -1 : 1) + controles.length) % controles.length
          ]?.focus({ preventScroll: true });
        }
      } else if (
        !campoTexto(e) &&
        [
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
          " ",
        ].includes(e.key) &&
        !(e.key === " " && (e.target as HTMLElement)?.matches?.("button"))
      )
        e.preventDefault();
    };
    document.addEventListener("wheel", bloquearRueda, { passive: false });
    document.addEventListener("touchmove", bloquearArrastre, {
      passive: false,
    });
    document.addEventListener("click", bloquearExploracion, true);
    document.addEventListener("keydown", tecladoGuiado, true);
    return () => {
      document.documentElement.classList.remove("sfm-tour-locked");
      document.removeEventListener("wheel", bloquearRueda);
      document.removeEventListener("touchmove", bloquearArrastre);
      document.removeEventListener("click", bloquearExploracion, true);
      document.removeEventListener("keydown", tecladoGuiado, true);
    };
  }, [pausa]);
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
          className={`sfm-tour-focus ${quieto ? "sfm-tour-focus--quieto" : ""}`}
          style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
        >
          <span key={pulso} className="sfm-tour-halos">
            <i />
            <i />
          </span>
          {!ventana.compacta && (
            <span
              style={{
                left: Math.min(
                  Math.max(rect.w / 2, 80 - rect.x),
                  window.innerWidth - 80 - rect.x,
                ),
              }}
              className={`sfm-tour-cue ${rect.abajo ? "sfm-tour-cue--below" : ""}`}
            >
              {indicacion}
              <span className="sfm-tour-arrow">↓</span>
            </span>
          )}
        </div>
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
        {!pausa && campoActivo && (
          <button
            className="sfm-tour-primary"
            onClick={() =>
              document.dispatchEvent(new Event("sfm-tour-campo-listo"))
            }
          >
            Listo, continuar
          </button>
        )}
        {!pausa && paso?.id === "crear-plan" && partesPlan > 1 && (
          <div className="sfm-tour-parts">
            <button
              disabled={partePlan === 0}
              onClick={() => setPartePlan((n) => Math.max(0, n - 1))}
            >
              Anterior
            </button>
            <button onClick={() => setPartePlan((n) => (n + 1) % partesPlan)}>
              {partePlan === 0
                ? "Revisar ejercicios"
                : partePlan === partesPlan - 1
                  ? "Elegir otra sesión"
                  : "Siguiente ejercicio"}
            </button>
          </div>
        )}
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
