import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Hoja, Icono } from "./ui";
import "./guia-demo.css";

const pasos = [
  {
    etiqueta: "TU MÉTODO",
    titulo: "Tu coaching. Un solo lugar.",
    texto:
      "Prepara el plan, acompaña el proceso y descubre cómo lo vive tu cliente.",
    icono: "clientes",
    tarjetas: ["Tú preparas", "Tu cliente entrena", "Ambos ven el progreso"],
  },
  {
    etiqueta: "01 · PREPARAR",
    titulo: "Empieza por la persona.",
    texto:
      "Define su objetivo y sus limitaciones. Después revisa cada sesión de su primer plan antes de invitarla.",
    icono: "mas",
    tarjetas: [
      "Persona y objetivo",
      "Frecuencia y limitaciones",
      "Primer plan revisado",
    ],
  },
  {
    etiqueta: "02 · ACOMPAÑAR",
    titulo: "Sabe dónde estar presente.",
    texto:
      "Hoy reúne lo pendiente. En Clientes encuentras el plan, los entrenamientos y el progreso de cada persona.",
    icono: "progreso",
    tarjetas: [
      "Hoy · Tu siguiente paso",
      "Clientes · Cada proceso",
      "Biblioteca · Tu criterio técnico",
    ],
  },
  {
    etiqueta: "03 · ENTRENAR",
    titulo: "Una serie. El siguiente paso.",
    texto:
      "Tu cliente ajusta peso, repeticiones y RIR, guarda la serie y continúa. El descanso se inicia cuando lo necesita.",
    icono: "check",
    tarjetas: ["Ajustar", "Guardar la serie", "Descansar y continuar"],
  },
];
const temas = [
  {
    titulo: "Crear el primer cliente",
    texto:
      "En Coach, toca + o Nuevo cliente. Completa persona y objetivo, frecuencia y limitaciones, y primer plan. Revisa las sesiones antes de terminar. En esta demo puedes practicar todo el recorrido; el borrador desaparece al recargar.",
    accion: "Probar con un cliente ficticio",
    ruta: "/demo/coach/nuevo",
  },
  {
    titulo: "Preparar y publicar un plan",
    texto:
      "Abre Clientes y elige una persona. Revisa su programación: orden, ejercicios, series y prescripción. Prepara sesiones de 5–8 ejercicios y revisa las advertencias. Un borrador aún no es un plan publicado. La invitación real se prepara después de revisar el plan.",
    accion: "Ver los clientes de ejemplo",
    ruta: "/demo/coach/clientes",
  },
  {
    titulo: "Vista previa o entrenar juntos",
    texto:
      "Vista previa permite comprobar cómo verá el plan esa persona y simularlo sin registrar actividad. Entrenar juntos es acompañar un entrenamiento: en una cuenta real sí guarda actividad y registra al Coach como autor. En esta demo ambas acciones usan únicamente datos ficticios.",
    accion: "Explorar una ficha",
    ruta: "/demo/coach/clientes",
  },
  {
    titulo: "Registrar un entrenamiento",
    texto:
      "Cambia a Cliente y toca Comenzar entrenamiento. Ajusta peso, repeticiones y RIR (las repeticiones que crees que aún podrías hacer). Guarda cada serie; puedes editarla si te equivocas. El temporizador de descanso es manual. Al terminar, revisa el resumen.",
    accion: "Probar como Cliente",
    ruta: "/demo/cliente",
  },
  {
    titulo: "Consultar el progreso",
    texto:
      "El cliente encuentra su historial, medidas y fotos en Progreso. El Coach sigue la actividad desde la ficha de cada persona. Las notas privadas del Coach permanecen privadas y compartir fotografías es una elección del cliente.",
    accion: "Ver Progreso como Cliente",
    ruta: "/demo/cliente/progreso",
  },
  {
    titulo: "Qué se guarda en esta demo",
    texto:
      "Aquí no hay clientes reales, no se envían invitaciones y nada se guarda al cerrar o recargar. Puedes cambiar entre Coach y Cliente desde la barra superior. En las cuentas privadas, los registros se sincronizan con la nube; Pendiente de sincronizar indica que falta esa confirmación.",
    accion: "Volver a Hoy del Coach",
    ruta: "/demo/coach",
  },
];

/** La bienvenida vive en memoria, igual que la demo. Nunca marca dispositivos. */
export function GuiaDemo() {
  const { pathname } = useLocation();
  const navegar = useNavigate();
  const [paso, setPaso] = useState<number | null>(() =>
    pathname === "/demo/coach" || pathname === "/demo/coach/" ? 0 : null,
  );
  const [ayuda, setAyuda] = useState(false);
  const ir = (ruta: string) => {
    setPaso(null);
    setAyuda(false);
    navegar(ruta);
  };
  const actual = paso === null ? null : pasos[paso];
  return (
    <>
      <button
        className="sfm-demo-help"
        onClick={() => setAyuda(true)}
        aria-label="Abrir guía de uso"
      >
        Guía de uso <span aria-hidden="true">?</span>
      </button>
      {actual && (
        <Hoja
          titulo="Bienvenido, Santiago"
          cerrar={() => setPaso(null)}
          clase="sfm-guia"
        >
          <div
            className="sfm-guia-progress"
            aria-label={`Paso ${paso! + 1} de ${pasos.length}`}
          >
            {pasos.map((p, i) => (
              <span key={p.etiqueta} className={i <= paso! ? "activo" : ""} />
            ))}
          </div>
          <section
            className="sfm-guia-step"
            key={paso}
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="sfm-eyebrow">{actual.etiqueta}</p>
            <h3>{actual.titulo}</h3>
            <p className="sfm-guia-copy">{actual.texto}</p>
            <div className="sfm-guia-scene" aria-label="El recorrido">
              <span className="sfm-guia-symbol">
                <Icono nombre={actual.icono} size={30} />
              </span>
              <ol>
                {actual.tarjetas.map((texto, i) => (
                  <li key={texto}>
                    <span>0{i + 1}</span>
                    {texto}
                  </li>
                ))}
              </ol>
            </div>
          </section>
          <p className="sfm-guia-sandbox">
            Demo con personas ficticias. Prueba con libertad; al recargar, todo
            vuelve al inicio.
          </p>
          <div className="sfm-guia-actions">
            {paso! < pasos.length - 1 ? (
              <button
                className="sfm-primary"
                onClick={() => setPaso(paso! + 1)}
              >
                {paso === 0 ? "Conocer mi espacio" : "Continuar"}
                <Icono nombre="flecha" />
              </button>
            ) : (
              <>
                <button
                  className="sfm-primary"
                  onClick={() => ir("/demo/coach/nuevo")}
                >
                  Crear un cliente de prueba
                  <Icono nombre="mas" />
                </button>
                <button
                  className="sfm-secondary"
                  onClick={() => ir("/demo/cliente")}
                >
                  Vivirlo como Cliente
                </button>
              </>
            )}
            <div className="sfm-guia-foot">
              {paso! > 0 && (
                <button onClick={() => setPaso(paso! - 1)}>Atrás</button>
              )}
              <button onClick={() => setPaso(null)}>
                {paso === 3 ? "Explorar por mi cuenta" : "Ahora no"}
              </button>
              <span>
                {paso! + 1} / {pasos.length}
              </span>
            </div>
          </div>
        </Hoja>
      )}
      {ayuda && (
        <Hoja
          titulo="Tu guía de uso"
          cerrar={() => setAyuda(false)}
          clase="sfm-guia sfm-guia--ayuda"
        >
          <p className="sfm-guia-copy">
            Del primer plan a la siguiente serie. Elige lo que quieres hacer.
          </p>
          <button
            className="sfm-guia-replay"
            onClick={() => {
              setAyuda(false);
              setPaso(0);
            }}
          >
            <span>
              <small>¿Primera vez?</small>
              <strong>Ver la bienvenida</strong>
            </span>
            <Icono nombre="flecha" />
          </button>
          <div className="sfm-guia-temas">
            {temas.map((tema, i) => (
              <details key={tema.titulo}>
                <summary>
                  <span>0{i + 1}</span>
                  {tema.titulo}
                  <Icono nombre="mas" size={18} />
                </summary>
                <p>{tema.texto}</p>
                <button className="sfm-secondary" onClick={() => ir(tema.ruta)}>
                  {tema.accion}
                  <Icono nombre="flecha" size={18} />
                </button>
              </details>
            ))}
          </div>
          <p className="sfm-guia-sandbox">
            Esta guía siempre está en la barra superior. La demo no modifica
            cuentas reales.
          </p>
        </Hoja>
      )}
    </>
  );
}
