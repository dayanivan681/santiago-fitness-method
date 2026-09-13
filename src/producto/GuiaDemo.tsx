import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Hoja, Icono } from "./ui";
import { useAyudaDemo } from "./ayuda-demo-contexto";
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
    "Toca Comenzar entrenamiento. Introduce peso y repeticiones. RIR indica cuántas repeticiones más podrías hacer. Toca Completar serie para guardarla.",
  ],
  [
    "Corregir una serie",
    "Toca Editar en la serie registrada. Corrige los valores y vuelve a guardarla.",
  ],
  [
    "Descansar",
    "Toca Descanso cuando lo necesites. El temporizador no empieza solo. Toca Listo para cerrarlo.",
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
export function GuiaDemo() {
  const ayuda = useAyudaDemo()!;
  const { pathname } = useLocation();
  const navegar = useNavigate();
  const cliente = pathname.startsWith("/demo/cliente");
  const clave = cliente ? `bienvenida:${ayuda.clienteId}` : "bienvenida:coach";
  const [abierta, setAbierta] = useState(false);
  const [repetir, setRepetir] = useState(false);
  // Las entradas profundas no interrumpen una tarea con una bienvenida.
  const entrada = /^\/demo\/(coach|cliente)\/?$/.test(pathname);
  const bienvenida = repetir || (entrada && !ayuda.cerrados.has(clave));
  const cerrar = () => {
    ayuda.cerrar(clave);
    setRepetir(false);
  };
  const titulo = cliente ? "Prueba tu primera serie" : "Crea tu primer cliente";
  return (
    <>
      <button
        className="sfm-demo-help"
        onClick={() => setAbierta(true)}
        aria-label="Abrir ayuda"
      >
        Ayuda <span aria-hidden="true">?</span>
      </button>
      {bienvenida && !abierta && (
        <Hoja titulo={titulo} cerrar={cerrar} clase="sfm-guia">
          <p className="sfm-guia-copy">
            {cliente
              ? "Abre el entrenamiento y registra una serie con nuestra ayuda."
              : "Añade sus datos, revisa su plan y déjalo listo para entrenar."}
          </p>
          <p className="sfm-guia-sandbox">
            Demo con datos ficticios. Al recargar, se reinicia.
          </p>
          <div className="sfm-guia-actions">
            <button
              className="sfm-primary"
              onClick={() => {
                cerrar();
                navegar(cliente ? "/demo/cliente" : "/demo/coach/nuevo");
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
                <p>{texto}</p>
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
            Ver bienvenida
          </button>
          <p className="sfm-guia-sandbox">
            Demo con datos ficticios. Al recargar, se reinicia.
          </p>
        </Hoja>
      )}
    </>
  );
}
