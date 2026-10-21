import { useAyuda } from "./ayuda-contexto";
import { Consejo } from "./Ayuda";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Alta as ValidarAlta, type Alta } from "../../shared/v2/contratos";
import { useBiblioteca } from "./contextoBiblioteca";
import { Cabecera, ErrorVisible, Icono } from "./ui";
import { EditorPlan } from "./EditorPlan";
import { planBase, ServicioCoach, ultimos } from "./servicio";
export function Onboarding({
  servicio,
  base,
}: {
  servicio: ServicioCoach;
  base: string;
}) {
  const ayuda = useAyuda();
  const { ejercicios } = useBiblioteca();
  const { borradorId } = useParams();
  const navegar = useNavigate();
  const [alta, setAlta] = useState<Alta | null>(null);
  const [revision, setRevision] = useState(0);
  const [estado, setEstado] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const cola = useRef(Promise.resolve());
  const rev = useRef(0);
  const ultima = useRef("");
  const publicando = useRef(false);
  const editor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let vivo = true;
    void (async () => {
      const cambios = await servicio.cambios();
      const existente = ultimos(cambios, "alta").find(
        (c) => c.id === borradorId,
      );
      if (!vivo) return;
      if (existente) {
        rev.current = existente.revision;
        setRevision(existente.revision);
        setAlta(existente.datos as Alta);
        ultima.current = JSON.stringify(existente.datos);
      } else {
        const id = crypto.randomUUID();
        const persona = "cliente-" + crypto.randomUUID().replaceAll("-", "");
        setAlta({
          id,
          paso: 1,
          completado: false,
          perfil: {
            id: persona,
            nombre: "",
            sexo: null,
            edad: null,
            estaturaCm: null,
            pesoCorporalLb: null,
            objetivo: "",
            frecuenciaEntrenamiento: 4,
            limitaciones: "",
            notas: "",
            ejerciciosEvitados: [],
          },
          plan: planBase(persona),
        });
      }
    })().catch((e) => setError(e.message));
    return () => {
      vivo = false;
    };
  }, [servicio, borradorId]);
  const guardar = useCallback(
    (valor: Alta): Promise<void> => {
      if (!valor.perfil.nombre.trim()) return Promise.resolve();
      const serial = JSON.stringify(valor);
      if (ultima.current === serial) return cola.current;
      setEstado("Guardando borrador…");
      cola.current = cola.current
        .catch(() => {})
        .then(async () => {
          const c = await servicio.guardar(
            undefined,
            "alta",
            valor.id,
            rev.current,
            valor,
          );
          rev.current = c.revision;
          setRevision(c.revision);
          ultima.current = serial;
          setEstado("Borrador guardado");
        })
        .catch((e) => {
          setError(e.message);
          setEstado("Sin guardar");
          throw e;
        });
      return cola.current;
    },
    [servicio],
  );
  const ultimoBorrador=useRef({alta,guardar});
  useEffect(()=>{ultimoBorrador.current={alta,guardar};},[alta,guardar]);
  useEffect(()=>()=>{
    const ultimo=ultimoBorrador.current;
    if(servicio.demo&&ultimo.alta&&!publicando.current)void ultimo.guardar(ultimo.alta).catch(()=>{});
  },[servicio]);
  useEffect(() => {
    if (!alta) return;
    const t = setTimeout(() => {
      if (!publicando.current) void guardar(alta).catch(() => {});
    }, 900);
    return () => clearTimeout(t);
  }, [alta, guardar]);
  if (!alta)
    return (
      <p className="sfm-loading" role="status">
        Preparando onboarding…
      </p>
    );
  const a = alta;
  const p = a.perfil;
  async function siguiente() {
    setError("");
    if (!p.nombre.trim() || !p.objetivo.trim()) {
      setError("Añade su nombre y el objetivo que van a trabajar.");
      return;
    }
    setAlta({ ...a, paso: Math.min(3, a.paso + 1) });

  }
  async function crear() {
    if (publicando.current) return;
    publicando.current = true;
    setError("");
    setOcupado(true);
    try {
      const validacion = ValidarAlta.safeParse({
        ...a,
        plan: { ...a.plan, id: "programa", estado: "publicado" },
      });
      if (!validacion.success) {
        const aviso = validacion.error.issues.every((i) => i.path[0] === "plan")
          ? editor.current?.querySelector<HTMLElement>('[role="alert"]') : null;
        if (aviso) {
          setError("");
          (aviso.querySelector<HTMLButtonElement>("button") ?? aviso).focus();
        } else {
          setError([...new Set(validacion.error.issues.map((i) => i.message))].join(" "));
        }
        publicando.current = false;
        return;
      }
      const listo = validacion.data;
      await guardar(listo);
      const id = await servicio.crear(listo, rev.current);
      ayuda?.confirmarCliente(id);

      navegar(`${base}/clientes/${id}`);
    } catch (e) {
      publicando.current = false;
      setError(e instanceof Error ? e.message : "No se pudo crear el cliente.");
    } finally {
      setOcupado(false);
    }
  }
  return (
    <section className="sfm-onboarding" data-paso={a.paso}>
      <Cabecera
        titulo={
          ["Datos del cliente", "Días y limitaciones", "Revisa el plan"][
            a.paso - 1
          ]
        }
        kicker="Nuevo cliente"
        volver={`${base}/clientes`}
      />
      <div className="sfm-stepper" aria-label={`Paso ${a.paso} de 3`}>
        {["Datos", "Días", "Plan"].map((s, i) => (
          <button
            key={s}
            className={i + 1 <= a.paso ? "is-active" : ""}
            onClick={() => i + 1 < a.paso && setAlta({ ...a, paso: i + 1 })}
          >
            <span>
              {i + 1 < a.paso ? <Icono nombre="check" size={16} /> : i + 1}
            </span>
            {s}
          </button>
        ))}
      </div>
      {a.paso === 1 && (
        <div className="sfm-form" data-tour="alta-persona">
          <Consejo id="alta-datos"><p>Añade su nombre y lo que quiere conseguir.</p></Consejo>
          <label className="sfm-field">
            <span>Nombre</span>
            <input
              data-tour="alta-nombre" autoComplete="name"
              value={p.nombre}
              maxLength={120}
              placeholder="Nombre y apellido"
              onChange={(e) =>
                setAlta({ ...a, perfil: { ...p, nombre: e.target.value } })
              }
            />
          </label>
          <label className="sfm-field">
            <span>Objetivo</span>
            <textarea
              data-tour="alta-objetivo" value={p.objetivo}
              maxLength={4000}
              placeholder="Por ejemplo: ganar fuerza"
              onChange={(e) =>
                setAlta({ ...a, perfil: { ...p, objetivo: e.target.value } })
              }
            />
          </label>
          <p className="sfm-hint">
            Edad, medidas y otros detalles pueden completarse cuando los
            conozcas.
          </p>
        </div>
      )}
      {a.paso === 2 && (
        <div className="sfm-form" data-tour="alta-contexto">
          <h2>¿Cuántos días puede entrenar?</h2>
          <div className="sfm-frecuencia" data-tour="alta-frecuencia">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <button
                key={n}
                aria-pressed={p.frecuenciaEntrenamiento === n}
                onClick={() => {
                  // El programa inicial sigue a la frecuencia mientras el coach no lo haya tocado.
                  const intacto =
                    JSON.stringify({ ...a.plan, revisado: false }) ===
                    JSON.stringify(planBase(p.id, p.frecuenciaEntrenamiento));
                  setAlta({
                    ...a,
                    perfil: { ...p, frecuenciaEntrenamiento: n },
                    plan: intacto ? planBase(p.id, n) : a.plan,
                  });
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <label className="sfm-field">
            <span>Limitaciones (opcional)</span>
            <textarea
              data-tour="alta-limitaciones" value={p.limitaciones}
              placeholder="Movimientos a evitar, molestias o adaptaciones necesarias"
              maxLength={4000}
              onChange={(e) =>
                setAlta({
                  ...a,
                  perfil: { ...p, limitaciones: e.target.value },
                })
              }
            />
          </label>
          <details className="sfm-details">
            <summary>Marcar ejercicios a evitar</summary>
            {ejercicios.map((e) => (
              <label className="sfm-check" key={e.id}>
                <input
                  type="checkbox"
                  checked={p.ejerciciosEvitados.includes(e.id)}
                  onChange={(v) =>
                    setAlta({
                      ...a,
                      perfil: {
                        ...p,
                        ejerciciosEvitados: v.target.checked
                          ? [...p.ejerciciosEvitados, e.id]
                          : p.ejerciciosEvitados.filter((id) => id !== e.id),
                      },
                    })
                  }
                />
                <span>{e.nombre}</span>
              </label>
            ))}
          </details>
          <label className="sfm-field">
            <span>Notas privadas (opcional)</span>
            <textarea
              data-tour="alta-notas" value={p.notas}
              placeholder="Sólo tú podrás leerlas"
              maxLength={4000}
              onChange={(e) =>
                setAlta({ ...a, perfil: { ...p, notas: e.target.value } })
              }
            />
          </label>
        </div>
      )}
      {a.paso === 3 && (
        <>
          <div className="sfm-onboarding-summary">
            <strong>{p.nombre}</strong>
            <p>{p.objetivo}</p>
            <span>{p.frecuenciaEntrenamiento} días por semana · {a.plan.dias.length} {a.plan.dias.length === 1 ? "sesión" : "sesiones"} en el programa</span>
          </div>
          <p className="sfm-hint">
            Las sesiones se alternan según los días que entrena. En «Organizar sesiones»
            puedes ajustar cuántas sesiones tendrá el programa.
          </p>
          <div ref={editor} className="sfm-onboarding-editor">
          <EditorPlan
            plan={a.plan}
            perfil={p}
            onChange={(plan) => { setError(""); setAlta({ ...a, plan }); }}
          />
          </div>
          <label className="sfm-check" data-tour="alta-revision">
            <input
              type="checkbox"
              checked={a.plan.revisado}
              onChange={(e) =>
                setAlta({
                  ...a,
                  plan: { ...a.plan, revisado: e.target.checked },
                })
              }
            />
            <span>He revisado el plan y sus limitaciones.</span>
          </label>
        </>
      )}
      <ErrorVisible error={error} />
      <footer className="sfm-form-footer" data-tour="alta-publicar">
        <button
          data-tour="alta-continuar" className="sfm-primary"
          disabled={ocupado || (a.paso === 3 && !a.plan.revisado)}
          onClick={() => void (a.paso < 3 ? siguiente() : crear())}
        >
          {ocupado
            ? "Creando…"
            : a.paso < 3
              ? "Continuar"
              : "Crear cliente y publicar plan"}
          <Icono nombre="flecha" size={18} />
        </button>
        <Link
          className="sfm-text-button"
          to={`${base}/clientes`}
          onClick={(e) => {
            e.preventDefault();
            void guardar(a)
              .then(() => navegar(`${base}/clientes`))
              .catch(() => {});
          }}
        >
          Guardar y continuar después
        </Link>
        <span role="status" className="sfm-save-state">
          {estado ||
            (!revision
              ? "Aún no hay un borrador guardado"
              : "Borrador guardado")}
        </span>
      </footer>
    </section>
  );
}
