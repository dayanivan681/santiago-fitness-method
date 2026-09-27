import { useState } from "react";
import { segunCantidad } from "../logica/plural";
import { Hoja } from "./ui";

type Paso = { titulo: string; texto: string };

function pasos(clientes: number): Paso[] {
  return [
    {
      titulo: "Tus clientes",
      texto: clientes
        ? `Ya tienes ${clientes} ${segunCantidad(clientes, "cliente", "clientes")}. En Clientes toca a una persona para abrir su ficha: programa, actividad y perfil.`
        : "Empieza con Nuevo cliente (+): nombre, objetivo y días de entrenamiento. Después abres su ficha para todo lo demás.",
    },
    {
      titulo: "Su plan",
      texto:
        "En Programa están sus cuatro sesiones. Toca Preparar cambios para elegir ejercicios, series y descansos. El cliente no ve nada hasta que revisas y publicas.",
    },
    {
      titulo: "Su acceso",
      texto:
        "Con el plan publicado, toca Preparar invitación y compártele el enlace. Crea su cuenta con su email o con Google; el enlace sirve una sola vez.",
    },
    {
      titulo: "Su progreso",
      texto:
        "En Actividad ves cada sesión y cada serie que registra. Vista previa te enseña su app sin guardar nada. Esta guía siempre está en Ayuda.",
    },
  ];
}

/**
 * Recorrido del coach en su cuenta real. Aparece al abrir el panel y se puede
 * saltar en cualquier paso; también se repite desde Ayuda.
 */
export function RecorridoCoach({ clientes, cerrar, irAClientes }: {
  clientes: number;
  cerrar: () => void;
  irAClientes: () => void;
}) {
  const lista = pasos(clientes);
  const [indice, setIndice] = useState(0);
  const paso = lista[indice];
  const ultimo = indice === lista.length - 1;
  return (
    <Hoja titulo={paso.titulo} cerrar={cerrar} clase="sfm-guia">
      <p className="sfm-guia-paso">Paso {indice + 1} de {lista.length}</p>
      <p className="sfm-guia-copy">{paso.texto}</p>
      <div className="sfm-guia-actions">
        {ultimo ? (
          <button className="sfm-primary" onClick={() => { cerrar(); irAClientes(); }}>
            Ver mis clientes
          </button>
        ) : (
          <button className="sfm-primary" onClick={() => setIndice(indice + 1)}>
            Siguiente
          </button>
        )}
        <div className="sfm-guia-secundarias">
          {indice > 0 && (
            <button className="sfm-secondary" onClick={() => setIndice(indice - 1)}>
              Atrás
            </button>
          )}
          {!ultimo && (
            <button className="sfm-secondary" onClick={cerrar}>
              Saltar
            </button>
          )}
        </div>
      </div>
    </Hoja>
  );
}
