import { useEffect, useRef, useState } from "react";

type Estado = "listo" | "copiada" | "manual";

/** Cuánto dura la confirmación en el botón antes de volver a «Copiar invitación». */
const DURACION_CONFIRMACION_MS = 4000;

/**
 * El aviso vive junto al botón: en el móvil la ficha es larga y un mensaje
 * arriba de la página queda fuera de la pantalla. Si el navegador no deja
 * escribir en el portapapeles, se selecciona el enlace para copiarlo a mano.
 */
export function CopiarInvitacion({ enlace }: { enlace: string }) {
  const [estado, setEstado] = useState<Estado>("listo");
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (estado !== "copiada") return;
    const temporizador = setTimeout(() => setEstado("listo"), DURACION_CONFIRMACION_MS);
    return () => clearTimeout(temporizador);
  }, [estado]);

  function seleccionarParaCopiaManual() {
    const elemento = campo.current;
    elemento?.focus();
    elemento?.setSelectionRange(0, elemento.value.length);
    setEstado("manual");
  }

  async function copiar() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Portapapeles no disponible");
      await navigator.clipboard.writeText(enlace);
      setEstado("copiada");
    } catch {
      seleccionarParaCopiaManual();
    }
  }

  return (
    <>
      <input
        ref={campo}
        aria-label="Invitación privada"
        readOnly
        value={enlace}
        onFocus={(e) => e.currentTarget.select()}
      />
      <button className="sfm-secondary" onClick={() => void copiar()}>
        {estado === "copiada" ? "Copiada" : "Copiar invitación"}
      </button>
      <p className="sfm-invitation-estado" role="status">
        {estado === "copiada" && "Enlace copiado. Pégalo en tu mensaje al cliente."}
        {estado === "manual" &&
          "No se pudo copiar automáticamente. El enlace está seleccionado: cópialo desde el menú del teléfono o con Cmd/Ctrl + C."}
      </p>
    </>
  );
}
