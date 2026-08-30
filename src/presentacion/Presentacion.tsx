import './presentacion.css'

const CAPTURAS = {
  hoy: '/presentacion/hoy.png',
  biblioteca: '/presentacion/biblioteca.png',
  ficha: '/presentacion/ficha-ejercicio.png',
  temporizador: '/presentacion/temporizador.png',
  variantes: '/presentacion/variantes.png',
} as const

const FUNCIONES_ACTUALES = [
  {
    nombre: 'Alta y perfil',
    detalle:
      'Crear un cliente y editar sus datos, objetivo, frecuencia, foto y restricciones desde la consola protegida.',
    ubicacion: '/admin',
  },
  {
    nombre: 'Programación de 4 días',
    detalle:
      'Editar Upper A, Lower A, Upper B y Lower B; añadir, quitar, reemplazar y reordenar entre 5 y 8 ejercicios.',
    ubicacion: 'Coach/Admin → ficha del cliente',
  },
  {
    nombre: 'Registro por serie',
    detalle:
      'Registrar peso, repeticiones, RIR, técnica y calentamiento; corregir una serie guardada y deshacer la corrección.',
    ubicacion: 'Hoy',
  },
  {
    nombre: 'Referencias y progresión',
    detalle:
      'Separar la última sesión de la mejor referencia y mostrar una recomendación que el coach puede ajustar.',
    ubicacion: 'Hoy e Historial',
  },
  {
    nombre: 'Biblioteca de ejercicios',
    detalle:
      'Consultar imagen, equipo, tipo de carga, músculos, instrucción breve y alternativas equivalentes.',
    ubicacion: 'Biblioteca y Ficha',
  },
  {
    nombre: 'Progreso físico y volumen',
    detalle:
      'Guardar medidas y fotos con fecha, y revisar el volumen semanal por grupo muscular.',
    ubicacion: 'Perfil',
  },
  {
    nombre: 'Copia de seguridad',
    detalle:
      'Descargar o restaurar un archivo con las series, sesiones, fotos y progreso locales.',
    ubicacion: 'Perfil',
  },
] as const

const LIMITES_PILOTO = [
  'El coach administra identidad y rutina en D1; series, sesiones, fotos y progreso siguen locales en el dispositivo.',
  'La consola Coach/Admin está protegida por Cloudflare Access y el cliente entra por enlace de un solo uso.',
  'La biblioteca tiene imágenes, pero todavía no incorpora vídeo.',
  'No incluye chat, pagos, nutrición completa, redes sociales ni wearables.',
] as const

export function Presentacion() {
  return (
    <main className="presentacion">
      <header className="presentacion__barra">
        <a className="presentacion__marca" href="#inicio" aria-label="Santiago Fitness Method">
          Santiago FM
        </a>
        <nav className="presentacion__navegacion" aria-label="Contenido de la presentación">
          <a href="#flujo">Cómo funciona</a>
          <a href="#funciones">Funciones</a>
          <a href="#limites">Límites actuales</a>
        </nav>
        <a className="presentacion__boton presentacion__boton--compacto" href="/">
          Abrir la app
        </a>
      </header>

      <section className="presentacion__hero" id="inicio">
        <div className="presentacion__hero-texto">
          <h1>
            <span>Santiago</span>
            <span>Fitness</span>
            <span>Method</span>
          </h1>
          <p>
            El participante entra, ve lo que le toca, ejecuta una serie, registra lo que hizo
            y continúa. La aplicación conserva la información y utiliza ese entrenamiento
            como referencia para el siguiente.
          </p>
          <div className="presentacion__acciones">
            <a className="presentacion__boton" href="/">
              Abrir la app actual
            </a>
            <a className="presentacion__enlace" href="#flujo">
              Ver cómo se usa
            </a>
          </div>
        </div>

        <figure className="presentacion__marco presentacion__marco--hero">
          <img
            src={CAPTURAS.hoy}
            alt="Pantalla real de Entrenamiento de hoy con Upper A y el registro de series"
          />
          <figcaption>Captura real · Entrenamiento de hoy</figcaption>
        </figure>
      </section>

      <section className="presentacion__flujo" id="flujo" aria-labelledby="titulo-flujo">
        <div className="presentacion__introduccion">
          <h2 id="titulo-flujo">Un ciclo entre coach, participante y registro</h2>
          <p>
            El coach prepara la identidad y la rutina en su consola protegida. El participante
            entra por su enlace y sólo ve el entrenamiento, la biblioteca, su historial y su perfil.
          </p>
        </div>

        <ol className="presentacion__pasos">
          <li>
            <span>01</span>
            <h3>El coach prepara</h3>
            <p>
              Da de alta al participante, edita su perfil y configura los ejercicios,
              series, repeticiones, descanso y progresión de cada día.
            </p>
          </li>
          <li>
            <span>02</span>
            <h3>El participante entrena</h3>
            <p>
              Abre Hoy, consulta la referencia disponible y registra lo que realmente hizo
              en cada serie.
            </p>
          </li>
          <li>
            <span>03</span>
            <h3>La app conserva</h3>
            <p>
              Guarda el historial por variante, mantiene separadas la última sesión y la
              mejor referencia, y permite descargar una copia local.
            </p>
          </li>
        </ol>
      </section>

      <section className="presentacion__recorrido" aria-labelledby="titulo-participante">
        <div className="presentacion__texto-seccion">
          <h2 id="titulo-participante">Cómo la usa el participante</h2>
          <p>
            El entrenamiento ya está definido. La pantalla muestra el ejercicio, el número
            de series, el rango objetivo y la referencia disponible. La persona registra
            peso, repeticiones y RIR; también puede marcar técnica y calentamiento.
          </p>
          <ul>
            <li>El peso sigue siendo editable: la app no lo impone.</li>
            <li>El temporizador se activa manualmente desde Descanso.</li>
            <li>La ficha se abre sin perder la serie que se está editando.</li>
            <li>Una variante puede cambiarse sólo ese día o fijarse en la plantilla.</li>
          </ul>
        </div>
        <figure className="presentacion__marco">
          <img src={CAPTURAS.hoy} alt="Registro real de una serie en Entrenamiento de hoy" />
          <figcaption>Hoy · registro por serie</figcaption>
        </figure>
      </section>

      <section className="presentacion__triptico" aria-label="Controles durante el entrenamiento">
        <figure className="presentacion__marco">
          <img src={CAPTURAS.temporizador} alt="Temporizador manual de descanso con más 30 segundos y Listo" />
          <figcaption>Temporizador manual</figcaption>
        </figure>
        <figure className="presentacion__marco">
          <img src={CAPTURAS.variantes} alt="Selector real de variantes equivalentes" />
          <figcaption>Cambio de variante</figcaption>
        </figure>
        <figure className="presentacion__marco">
          <img src={CAPTURAS.ficha} alt="Ficha real de Press banca 15 grados Smith" />
          <figcaption>Ficha del ejercicio</figcaption>
        </figure>
      </section>

      <section className="presentacion__recorrido presentacion__recorrido--invertido" aria-labelledby="titulo-coach">
        <div className="presentacion__texto-seccion">
          <h2 id="titulo-coach">Cómo la usa el coach</h2>
          <p>
            Entra por Cloudflare Access a <code>/admin</code>, elige un cliente y abre su ficha.
            Esa consola escribe el perfil y la programación en D1 para que el cliente los reciba
            al recargar o abrir una nueva sesión.
          </p>
          <ul>
            <li>Crear y seleccionar clientes; ver estado de sesiones y enlaces.</li>
            <li>Añadir, quitar, reemplazar y reordenar ejercicios.</li>
            <li>Editar series, repeticiones mínimas y máximas, y descanso.</li>
            <li>Dejar la progresión automática o fijar una recomendación.</li>
            <li>Generar/revocar enlaces y previsualizar al cliente con una sesión normal.</li>
          </ul>
        </div>
      </section>

      <section className="presentacion__recorrido" aria-labelledby="titulo-biblioteca">
        <div className="presentacion__texto-seccion">
          <h2 id="titulo-biblioteca">Biblioteca visual y perfil</h2>
          <p>
            La biblioteca reúne 33 ejercicios y puede filtrarse por músculo. Cada ficha
            muestra la información disponible para identificar y ejecutar el ejercicio.
            En Perfil el participante consulta sus datos, medidas, fotos, volumen semanal y
            copia local. Los cuatro días sólo se editan desde Coach/Admin.
          </p>
        </div>
        <figure className="presentacion__marco">
          <img src={CAPTURAS.biblioteca} alt="Biblioteca real con ejercicios e imágenes" />
          <figcaption>Biblioteca · 33 ejercicios</figcaption>
        </figure>
      </section>

      <section className="presentacion__funciones" id="funciones" aria-labelledby="titulo-funciones">
        <div className="presentacion__introduccion">
          <h2 id="titulo-funciones">Funciones disponibles hoy</h2>
          <p>Este inventario corresponde a la versión actual de la aplicación.</p>
        </div>
        <div className="presentacion__tabla" role="list">
          {FUNCIONES_ACTUALES.map((funcion) => (
            <article key={funcion.nombre} className="presentacion__fila" role="listitem">
              <h3>{funcion.nombre}</h3>
              <p>{funcion.detalle}</p>
              <span>{funcion.ubicacion}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="presentacion__limites" id="limites" aria-labelledby="titulo-limites">
        <div>
          <h2 id="titulo-limites">Límites actuales del piloto</h2>
          <p>
            Estos puntos no se presentan como funciones porque todavía no forman parte del
            producto actual.
          </p>
        </div>
        <ul>
          {LIMITES_PILOTO.map((limite) => (
            <li key={limite}>{limite}</li>
          ))}
        </ul>
      </section>

      <footer className="presentacion__cierre">
        <h2>Ver la versión actual</h2>
        <p>Abre la aplicación y recorre el flujo real del piloto.</p>
        <a className="presentacion__boton" href="/">
          Abrir Santiago Fitness Method
        </a>
      </footer>
    </main>
  )
}
