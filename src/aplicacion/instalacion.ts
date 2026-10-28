/**
 * Instalar la app en la pantalla de inicio del teléfono. iPhone sólo lo
 * permite a mano desde el menú Compartir; Android/Chrome avisa con
 * `beforeinstallprompt`, que llega al cargar la página, antes de que se
 * monte la pantalla del Cliente: por eso se escucha desde `main.tsx`.
 */

export type PlataformaInstalacion = "ios" | "android";

/** Lo que usamos del evento `beforeinstallprompt` (no está en los tipos del DOM). */
export interface AvisoInstalacion {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let avisoPendiente: AvisoInstalacion | null = null;

export function avisarInstalacionDisponible(aviso: AvisoInstalacion | null): void {
  avisoPendiente = aviso;
}

export function avisoInstalacion(): AvisoInstalacion | null {
  return avisoPendiente;
}

export function escucharAvisoInstalacion(): void {
  window.addEventListener("beforeinstallprompt", (evento) => {
    // Sin esto Chrome muestra su propia barra; la guía decide cuándo ofrecerlo.
    evento.preventDefault();
    avisarInstalacionDisponible(evento as unknown as AvisoInstalacion);
  });
  window.addEventListener("appinstalled", () => avisarInstalacionDisponible(null));
}

/** El iPad se presenta como Mac; se distingue por la pantalla táctil. */
export function plataformaInstalacion(userAgent: string, puntosTactiles: number): PlataformaInstalacion | null {
  if (/iPhone|iPad|iPod/.test(userAgent)) return "ios";
  if (/Macintosh/.test(userAgent) && puntosTactiles > 1) return "ios";
  if (/Android/.test(userAgent)) return "android";
  return null;
}

export function enPantallaCompleta(): boolean {
  return (
    (typeof matchMedia === "function" && matchMedia("(display-mode: standalone)").matches) ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
