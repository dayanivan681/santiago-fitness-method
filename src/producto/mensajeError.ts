const REINTENTAR = "No pudimos completar la acción. Vuelve a intentarlo.";
const REVISAR = "Revisa los datos indicados y vuelve a intentarlo.";

/** Frontera de presentación: los detalles internos nunca son el aviso al usuario. */
export function mensajeError(error: string): string {
  const texto = error.trim();
  if (!texto) return "";
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(texto))
    return "No pudimos conectar. Comprueba tu conexión y vuelve a intentarlo.";
  if (texto.startsWith("{") || texto.startsWith("[")) {
    try {
      const datos: unknown = JSON.parse(texto);
      const issues = Array.isArray(datos) ? datos :
        datos && typeof datos === "object" && "issues" in datos ? datos.issues : null;
      if (Array.isArray(issues) && issues.length) {
        const mensajes = issues.map((issue: unknown) => {
          if (!issue || typeof issue !== "object") return REVISAR;
          const { code, message } = issue as Record<string, unknown>;
          return code === "custom" && typeof message === "string" ? mensajeError(message) : REVISAR;
        });
        return [...new Set(mensajes)].join(" ");
      }
    } catch { /* Un fragmento de respuesta tampoco se presenta como JSON. */ }
    return REINTENTAR;
  }
  if (/\b(?:Too small|Too big|Invalid input|Invalid option|Invalid string|Unrecognized key)/i.test(texto))
    return REVISAR;
  if (/\b(?:TypeError|SyntaxError|ReferenceError|ZodError|SQLITE_ERROR|D1_ERROR)\b|\n\s*at |<\/?(?:html|!doctype)|unexpected token|invalid_type|too_small|too_big|^HTTP\s*\d{3}\b/i.test(texto))
    return REINTENTAR;
  return texto;
}
