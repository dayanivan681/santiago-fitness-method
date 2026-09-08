import { useEffect, useState } from "react";
import type { ConexionCloud } from "../nube/cloud";
import { Avatar } from "./ui";

/** Las imágenes personales siempre se sirven detrás del permiso del servidor. */
export function AvatarCuenta({
  nombre,
  conexion,
}: {
  nombre: string;
  conexion?: ConexionCloud;
}) {
  const [foto, setFoto] = useState<string>();
  useEffect(() => {
    if (!conexion?.ctx.medios || conexion.ctx.rol !== "cliente") return;
    let vivo = true;
    const cargar = async () => {
      if (document.hidden) return;
      try {
        const { medios } = await conexion.api.pedir<{
          medios: { id: string; tipo: string; creado_en: number }[];
        }>("/medios");
        const perfil = medios
          .filter((m) => m.tipo === "perfil")
          .sort((a, b) => b.creado_en - a.creado_en)[0];
        if (vivo) setFoto(perfil ? `/api/v2/medios/${perfil.id}` : undefined);
      } catch {
        /* La inicial sigue disponible si la foto no tiene conexión. */
      }
    };
    void cargar();
    const timer = setInterval(cargar, 4000);
    return () => {
      vivo = false;
      clearInterval(timer);
    };
  }, [conexion]);
  return foto ? (
    <img
      className="sfm-avatar"
      src={foto}
      alt=""
      style={{ objectFit: "cover" }}
      onError={() => setFoto(undefined)}
    />
  ) : (
    <Avatar nombre={nombre} />
  );
}
