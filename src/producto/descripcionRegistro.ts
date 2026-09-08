import { ETIQUETA_CARGA } from "../dominio/etiquetas";
export function describirRegistro(valor: unknown): string {
  if (!valor || typeof valor !== "object") return "Sin registro confirmado";
  const d = valor as Record<string, unknown>;
  if ("pesoRegistradoLb" in d)
    return `${d.pesoRegistradoLb} lb × ${d.repsRealizadas} reps · RIR ${d.rir}${d.nota ? ` · ${d.nota}` : ""}`;
  if (d.medidas)
    return Object.entries(d.medidas as Record<string, number>)
      .map(
        ([k, v]) =>
          `${k === "pesoCorporalLb" ? "Peso · lb" : "Medida · pulgadas"}: ${v}`,
      )
      .join(" · ");
  if (d.completadaEn) return "Entrenamiento completado";
  if (d.fecha) return `Entrenamiento del ${d.fecha}`;
  if (d.tipoCarga)
    return `${ETIQUETA_CARGA[d.tipoCarga as keyof typeof ETIQUETA_CARGA]} · Incremento ${d.incrementoMinimoLb} lb`;
  return "Cambio de tu programa";
}
