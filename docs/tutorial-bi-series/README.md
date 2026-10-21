# Tutorial de bi-series y tri-series (vídeo)

Vídeo vertical 1080×1920, 30 fps, ~40 s, hecho con capturas reales de la demo. Guion visual en Claude Design: https://claude.ai/artifact/VNkGw7FofoFWg3zeo6CzLC (privado del dueño).

Cómo regenerarlo (por ejemplo, tras unir el PR #10, para que las series pendientes digan «6–15 reps»):

1. `npx vite --port 5173` en la raíz del repo.
2. `node docs/tutorial-bi-series/capturar.mjs`. Escribe PNG a 3x en `/tmp/claude-0/tuto/cap` y las cajas de cada objetivo en `/tmp/claude-0/tuto/cajas.json`. Cambia esas rutas si hace falta.
3. Genera `tutorial.html` junto a las PNG: copia `tutorial.plantilla.html`, sustituye `%CAJAS%` por el contenido de `cajas.json` y la ruta `../../public/fuentes` por la ruta absoluta `file://` de `public/fuentes`.
4. `node docs/tutorial-bi-series/render.mjs 0 39.5 0.0333333 <carpeta-frames>` (Chromium de Playwright; flag `--allow-file-access-from-files`).
5. `ffmpeg -framerate 30 -i <carpeta-frames>/%05d.jpg -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -movflags +faststart tutorial-bi-series-HD.mp4`.

Escenas, tiempos, zooms y anillos están en los arrays `ESC` y `T` de la plantilla. Si cambia la UI, recaptura y revisa que cada caja (`unir`, `grupo`, `desc`, `tira`…) siga existiendo.
