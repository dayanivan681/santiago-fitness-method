import { DIAS_DEMO, BIBLIOTECA_DEMO } from "./datos";

const CAPTURAS = [
  {
    id: "hoy",
    titulo: "Hoy",
    texto: "Tu rutina, referencia y registro por serie en una misma pantalla.",
  },
  {
    id: "biblioteca",
    titulo: "Biblioteca",
    texto:
      "Imágenes, equipos y filtros por músculo para encontrar cada ejercicio.",
  },
  {
    id: "progreso",
    titulo: "Progreso",
    texto:
      "Consulta tus sesiones y el registro independiente de cada variante.",
  },
  {
    id: "coach",
    titulo: "Coach",
    texto: "Personas, programación y actividad en un mismo espacio.",
  },
];

export function Presentacion() {
  return (
    <div className="landing" id="inicio">
      <a className="landing-skip" href="#como-usar">
        Saltar al contenido
      </a>
      <header className="landing-nav">
        <a className="landing-brand" href="#inicio">
          SANTIAGO<span>FITNESS METHOD</span>
        </a>
        <nav aria-label="Presentación">
          <a href="#pantallas">La app</a>
          <a href="#coach">Para el coach</a>
          <a className="landing-access" href="/">
            Ya tengo acceso{"\u00a0"}<span aria-hidden="true">↗︎</span>
          </a>
        </nav>
      </header>
      <main>
        <section className="landing-hero">
          <div className="landing-intro">
            <p className="landing-eyebrow">TU ENTRENAMIENTO. CON DIRECCIÓN.</p>
            <h1>
              DISCIPLINA.
              <br />
              REGISTRO.
              <br />
              <span>RESULTADOS.</span>
            </h1>
            <p className="landing-lead">
              Sabes qué hacer hoy. Registras lo que hiciste. Vuelves con una
              referencia.
            </p>
            <p>
              Santiago Fitness Method conecta la programación de tu coach con un
              registro claro de cada serie.
            </p>
            <div className="landing-actions">
              <a className="landing-primary" href="#como-usar">
                Ver cómo usar la app ↓
              </a>
              <a className="landing-secondary" href="/">
                Ya tengo acceso{"\u00a0"}<span aria-hidden="true">↗︎</span>
              </a>
            </div>
            <p className="landing-small">
              La aplicación es privada. Tu coach te envía un enlace; ábrelo y
              pulsa Entrar para comenzar.
            </p>
          </div>
          <div className="landing-demo">
            <p className="landing-eyebrow">
              PRUÉBALA AQUÍ · DATOS DE DEMOSTRACIÓN
            </p>
            <div className="landing-phone">
              <iframe
                title="Demo interactiva de Santiago Fitness Method"
                src="/demo/cliente"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="landing-small">
              Toca un ejercicio, ajusta una serie y guárdala.
              <br />
              La demo se reinicia al recargar; no guarda datos reales.
            </p>
          </div>
        </section>
        <section className="landing-section" id="como-usar">
          <div className="landing-section-heading">
            <p className="landing-eyebrow">01 / ENTRENAR</p>
            <h2>
              MENOS BUSCAR.
              <br />
              MÁS ENTRENAR.
            </h2>
            <p>
              El entrenamiento ya está preparado. Tú registras lo que realmente
              haces.
            </p>
          </div>
          <div className="landing-steps">
            <article>
              <span>01</span>
              <h3>Abre tu día</h3>
              <p>
                Elige Upper A, Lower A, Upper B o Lower B. Consulta ejercicios,
                series y rango de repeticiones.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Registra tu serie</h3>
              <p>
                Ajusta peso en libras, repeticiones y RIR. Marca la técnica y,
                si corresponde, el calentamiento.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Descansa y continúa</h3>
              <p>
                Guardar una nueva serie de trabajo inicia el descanso. Puedes
                añadir 30 segundos, pulsar Listo o editar la serie.
              </p>
            </article>
            <article>
              <span>04</span>
              <h3>Cierra tu entrenamiento</h3>
              <p>
                Terminar sesión conserva lo registrado, incluso si quedan series
                pendientes. Revísalo después en Historial.
              </p>
            </article>
          </div>
        </section>
        <section className="landing-section" id="pantallas">
          <div className="landing-section-heading">
            <p className="landing-eyebrow">02 / LA APP REAL</p>
            <h2>TODO EN SU SITIO.</h2>
            <p>
              Explora las dos caras del mismo producto con personas ficticias.
              Cada demo empieza de nuevo al recargar.
            </p>
          </div>
          <div className="landing-captures">
            {CAPTURAS.map((item) => (
              <figure key={item.id}>
                <a className="landing-view-link" href={item.id==='coach'?'/demo/coach':`/demo/cliente${item.id==='hoy'?'':'/'+item.id}`}>Explorar {item.titulo}{"\u00a0"}<span aria-hidden="true">↗︎</span></a>
                <figcaption>
                  <h3>{item.titulo}</h3>
                  <p>{item.texto}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
        <section className="landing-section landing-program">
          <div className="landing-section-heading">
            <p className="landing-eyebrow">03 / TU PROGRAMACIÓN</p>
            <h2>
              CUATRO DÍAS.
              <br />
              UN PLAN CLARO.
            </h2>
            <p>
              Estas son las plantillas iniciales: cinco ejercicios por día. El
              coach puede ajustar la programación entre cinco y ocho ejercicios.
            </p>
          </div>
          <div className="landing-days">
            {DIAS_DEMO.map((dia) => (
              <article key={dia.slug}>
                <h3>{dia.nombre}</h3>
                <ol>
                  {dia.ejercicios.map(({ ejercicio, slot }) => (
                    <li key={ejercicio.id}>
                      <span>{ejercicio.nombre}</span>
                      <small>
                        {slot.seriesObjetivo} series · {slot.repMin}–
                        {slot.repMax} reps · {slot.descansoSegundos / 60}:00
                        descanso
                      </small>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
          <p className="landing-small">
            El peso es editable. Cuando corresponde a carga por lado, verás
            lb/lado. Cada variante mantiene su propio historial.
          </p>
        </section>
        <section className="landing-section landing-library">
          <div>
            <p className="landing-eyebrow">04 / BIBLIOTECA VISUAL</p>
            <h2>
              RECONOCE EL
              <br />
              EJERCICIO.
            </h2>
            <p>
              {BIBLIOTECA_DEMO.length} ejercicios con imagen, equipo, músculo
              principal y secundarios, tipo de carga e instrucciones breves.
              Abre la ficha para consultar alternativas equivalentes.
            </p>
            <a className="landing-secondary" href="#inicio">
              Explorar en la demo ↑
            </a>
          </div>
          <div className="landing-library-images">
            {BIBLIOTECA_DEMO.slice(0, 4).map((e) => (
              <figure key={e.id}>
                <img
                  src={e.imagen}
                  alt={e.nombre}
                  loading="lazy"
                  width="320"
                  height="220"
                />
                <figcaption>{e.nombre}</figcaption>
              </figure>
            ))}
          </div>
        </section>
        <section className="landing-section" id="coach">
          <div className="landing-section-heading">
            <p className="landing-eyebrow">05 / PARA EL COACH</p>
            <h2>
              PREPARA EL PLAN.
              <br />
              EL CLIENTE ENTRENA.
            </h2>
            <p>
              El coach entra en su espacio privado con su correo autorizado.
              Allí administra perfiles, programación y acceso de cada cliente.
            </p>
          </div>
          <ol className="landing-coach-flow">
            <li>
              <span>01</span>
              <h3>Clientes</h3>
              <p>
                Elige a quién gestionas y revisa si su programación está
                completa.
              </p>
            </li>
            <li>
              <span>02</span>
              <h3>Programa y Perfil</h3>
              <p>
                Abre un día y un ejercicio para ajustar series, repeticiones y
                descanso. Mantén sus datos y limitaciones al día.
              </p>
            </li>
            <li>
              <span>03</span>
              <h3>Acceso</h3>
              <p>
                Genera o revoca el enlace privado y abre la vista previa del
                cliente.
              </p>
            </li>
          </ol>
          <a
            className="landing-secondary"
            href="/admin/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Entrar como coach{"\u00a0"}<span aria-hidden="true">↗︎</span>
          </a>
        </section>
        <section className="landing-section landing-practical">
          <div>
            <p className="landing-eyebrow">06 / ANTES DE EMPEZAR</p>
            <h2>
              TU APP.
              <br />
              TU DISPOSITIVO.
            </h2>
          </div>
          <div>
            <details open>
              <summary>¿Cómo entro?</summary>
              <p>
                Abre el enlace privado que te envía tu coach. Verás la página
                Entrar; el enlace se utiliza al pulsar ese botón. Si ya tienes
                sesión, abre la app directamente.
              </p>
            </details>
            <details>
              <summary>¿Dónde se guarda mi entrenamiento?</summary>
              <p>
                Tu perfil, programación, series, entrenamientos y progreso se
                guardan en tu cuenta. Los cambios sin conexión quedan pendientes
                y se sincronizan cuando vuelves. Tus fotos sólo se suben con tu consentimiento.
              </p>
            </details>
            <details>
              <summary>¿Puedo abrirla desde la pantalla de inicio?</summary>
              <p>
                En Safari, usa Compartir → Añadir a pantalla de inicio.
                Entra primero con tu invitación privada y abre tu entrenamiento
                con conexión. Después podrás continuar temporalmente sin señal;
                la app te indicará qué cambios quedan pendientes de sincronizar.
              </p>
            </details>
            <details>
              <summary>¿Qué puedo probar aquí?</summary>
              <p>
                La demo permite registrar y editar series, usar el descanso,
                consultar fichas y recorrer Cliente y Coach. Todas las personas
                son ficticias. Los cambios sólo duran mientras mantengas esta demo abierta.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <p className="landing-eyebrow">SANTIAGO FITNESS METHOD</p>
        <h2>
          LA PRÓXIMA SERIE
          <br />
          EMPIEZA AQUÍ.
        </h2>
        <a className="landing-primary" href="/">
          Abrir Santiago Fitness Method{"\u00a0"}<span aria-hidden="true">↗︎</span>
        </a>
        <p>Acceso privado mediante invitación de tu coach.</p>
        <a href="#inicio">Volver al inicio ↑</a>
      </footer>
    </div>
  );
}
