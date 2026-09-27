import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Hoja, Icono } from "./ui";
import { useAyuda } from "./ayuda-contexto";
import { RecorridoCoach } from "./RecorridoCoach";
import "./guia-demo.css";

const temasCoach = [
  [
    "Crear un cliente",
    "Toca Nuevo cliente. Añade su nombre, objetivo y días de entrenamiento. Revisa las sesiones y sus limitaciones antes de publicar el plan.",
  ],
  [
    "Editar un cliente",
    "Abre su ficha → Perfil → Editar perfil. Cambia los datos y toca Guardar perfil. Las notas del Coach son privadas.",
  ],
  [
    "Cambiar un plan",
    "En Programa, toca Preparar cambios. Puedes guardar un borrador y retomarlo después. Revisa los cambios antes de publicar: un borrador todavía no cambia el plan del cliente.",
  ],
  [
    "Invitar a un cliente",
    "Después de publicar, toca Probar invitación. Aquí es una simulación: no da acceso real ni envía mensajes. En una cuenta real, el Coach comparte personalmente el enlace privado de un uso.",
  ],
  [
    "Probar Vista previa",
    "Abre Vista previa desde la ficha. Puedes probar el entrenamiento sin añadir registros a la actividad del cliente.",
  ],
  [
    "Consultar actividad y privacidad",
    "En la ficha, abre Actividad para ver los entrenamientos. Las notas del Coach son privadas. El cliente decide si comparte sus fotos.",
  ],
];
const temasCliente = [
  [
    "Registrar una serie",
    "Toca Comenzar entrenamiento. Si tu Coach indicó un peso, ya aparece escrito y puedes ajustarlo. Introduce las repeticiones realizadas. RIR indica cuántas repeticiones más podrías hacer. Toca Completar serie para guardarla.",
  ],
  [
    "Corregir una serie",
    "Toca Editar en la serie registrada. Corrige los valores y vuelve a guardarla.",
  ],
  [
    "Descansar",
    "Al completar una serie, empieza el descanso indicado por tu Coach. Puedes omitirlo o añadir 30 segundos. Si el descanso está en cero, no aparece el temporizador. Corregir una serie no lo reinicia.",
  ],
  [
    "Terminar y ver tu historial",
    "Toca Terminar sesión y revisa el resumen. Después, en Progreso, abre un entrenamiento para consultar sus series.",
  ],
  [
    "Consultar un ejercicio",
    "Abre Biblioteca y elige un ejercicio para consultar su explicación y variantes.",
  ],
  [
    "Medidas, fotos y privacidad",
    "Desde tu avatar accedes a tu perfil. En Progreso puedes consultar medidas y fotos; tú decides si compartes las fotos con tu Coach.",
  ],
];
export function GuiaAyuda({ base, permitirBienvenida = true, clientes = 0 }: { base?: string; permitirBienvenida?: boolean; clientes?: number }) {
  const ayuda = useAyuda();
  const { pathname } = useLocation();
  const navegar = useNavigate();
  const cliente = ayuda?.esCliente ?? false;
  const raiz = base ?? (cliente ? "/demo/cliente" : "/demo/coach");
  const clave = cliente ? `bienvenida:${ayuda?.clienteId}` : "bienvenida:coach";
  const [abierta, setAbierta] = useState(false);
  const [repetir, setRepetir] = useState(false);
  // El coach real ve el recorrido cada vez que abre el panel; «Saltar» lo
  // cierra hasta la próxima visita (petición del dueño, 2026-09-27).
  const [recorridoVisto, setRecorridoVisto] = useState(false);
  // Las entradas profundas no interrumpen una tarea con una bienvenida.
  if (!ayuda) return null;
  const coachReal = !cliente && !ayuda.demo;
  const entrada = pathname === (raiz || "/") || pathname === `${raiz}/`;
  const bienvenida = ayuda.preparada && (repetir || (entrada && permitirBienvenida && !ayuda.tieneActividad && !ayuda.cerrados.has(clave)));
  const cerrar = () => {
    ayuda.cerrar(clave);
    setRepetir(false);
  };
  const recorrido = coachReal && (repetir || (entrada && permitirBienvenida && !recorridoVisto));
  const cerrarRecorrido = () => {
    setRecorridoVisto(true);
    setRepetir(false);
  };
  const titulo = cliente ? (ayuda.demo ? "Prueba tu primera serie" : "Tu entrenamiento, a mano") : ayuda.demo ? "Crea un cliente de prueba" : "Crea tu primer cliente";
  return (
    <>
      <button
        className="sfm-demo-help"
        onClick={() => setAbierta(true)}
        aria-label="Abrir ayuda"
      >
        Ayuda <span aria-hidden="true">?</span>
      </button>
      {recorrido && !abierta && (
        <RecorridoCoach
          clientes={clientes}
          cerrar={cerrarRecorrido}
          irAClientes={() => navegar(`${raiz}/clientes`)}
        />
      )}
      {!coachReal && bienvenida && !abierta && (
        <Hoja titulo={titulo} cerrar={cerrar} clase="sfm-guia">
          <p className="sfm-guia-copy">
            {cliente
              ? "Abre el entrenamiento y registra una serie con nuestra ayuda."
              : "Añade sus datos, revisa su plan y déjalo listo para entrenar."}
          </p>
          {ayuda.demo && <p className="sfm-guia-sandbox">
            Demo con datos ficticios. Al recargar, se reinicia.
          </p>}
          <div className="sfm-guia-actions">
            <button
              className="sfm-primary"
              onClick={() => {
                cerrar();
                navegar(cliente ? raiz || "/" : `${raiz}/nuevo`);
              }}
            >
              {cliente ? "Ver mi entrenamiento" : "Crear cliente"}
            </button>
            <button className="sfm-secondary" onClick={cerrar}>
              Explorar
            </button>
          </div>
        </Hoja>
      )}
      {abierta && (
        <Hoja
          titulo={cliente ? "Ayuda para entrenar" : "Ayuda para el Coach"}
          cerrar={() => setAbierta(false)}
          clase="sfm-guia"
        >
          <p className="sfm-guia-copy">Elige lo que necesitas hacer.</p>
          <div className="sfm-guia-temas">
            {(cliente ? temasCliente : temasCoach).map(([titulo, texto]) => (
              <details key={titulo}>
                <summary>
                  {titulo}
                  <Icono nombre="mas" size={18} />
                </summary>
                <p>{!ayuda.demo && titulo === "Invitar a un cliente" ? "Después de publicar su plan, toca Preparar invitación en su ficha. Copia el enlace privado y compártelo personalmente con el cliente. El enlace es de un uso; la app no envía mensajes por ti." : texto}</p>
              </details>
            ))}
          </div>
          <button
            className="sfm-secondary"
            onClick={() => {
              setAbierta(false);
              setRepetir(true);
            }}
          >
            {coachReal ? "Ver recorrido" : "Ver bienvenida"}
          </button>
          {ayuda.demo && <p className="sfm-guia-sandbox">
            Demo con datos ficticios. Al recargar, se reinicia.
          </p>}
        </Hoja>
      )}
    </>
  );
}
