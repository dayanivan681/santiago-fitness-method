"""Genera los iconos PWA de Santiago Fitness Method: barra con discos.

PNG RGB de 8 bits escrito a mano con zlib, sin dependencias externas.
Colores del tema de la app: fondo #0f1115, acento #4ade80.
"""
import struct
import zlib

FONDO = (0x0B, 0x0C, 0x0D)
ACENTO = (0x4A, 0xDE, 0x80)

# Rectángulos de la barra en un lienzo de referencia de 512x512.
RECTANGULOS = [
    (96, 236, 320, 40),   # barra
    (120, 176, 48, 160),  # disco interior izquierdo
    (344, 176, 48, 160),  # disco interior derecho
    (72, 208, 36, 96),    # disco exterior izquierdo
    (404, 208, 36, 96),   # disco exterior derecho
]

REFERENCIA = 512


def trozo(tipo: bytes, datos: bytes) -> bytes:
    return (
        struct.pack(">I", len(datos))
        + tipo
        + datos
        + struct.pack(">I", zlib.crc32(tipo + datos) & 0xFFFFFFFF)
    )


def generar(tam: int) -> bytes:
    escala = tam / REFERENCIA
    escalados = [
        (
            round(x * escala),
            round(y * escala),
            round(ancho * escala),
            round(alto * escala),
        )
        for x, y, ancho, alto in RECTANGULOS
    ]

    filas = bytearray()
    for y in range(tam):
        filas.append(0)  # filtro "none"
        for x in range(tam):
            color = FONDO
            for rx, ry, rancho, ralto in escalados:
                if rx <= x < rx + rancho and ry <= y < ry + ralto:
                    color = ACENTO
                    break
            filas.extend(color)

    cabecera = struct.pack(">IIBBBBB", tam, tam, 8, 2, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + trozo(b"IHDR", cabecera)
        + trozo(b"IDAT", zlib.compress(bytes(filas), 9))
        + trozo(b"IEND", b"")
    )


if __name__ == "__main__":
    import sys

    destino = sys.argv[1]
    for tam in (192, 512):
        ruta = f"{destino}/icono-{tam}.png"
        with open(ruta, "wb") as f:
            f.write(generar(tam))
        print(f"{ruta}")
    # Apple no usa el manifest: necesita su propio icono de 180 px.
    with open(f"{destino}/apple-touch-icon.png", "wb") as f:
        f.write(generar(180))
    print(f"{destino}/apple-touch-icon.png")
