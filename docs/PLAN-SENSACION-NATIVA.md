# Plan: que la app se sienta nativa

Preparado por claude-code el 2026-10-20 para que cualquiera de los dos agentes
pueda continuar. Antes de empezar, lee la sección «Reglas y trampas conocidas».

## Por qué

El dueño dice que la app «sigue siendo una web app genérica». Lo que más lo
delataba en el código:

- cortes secos al cambiar de pantalla;
- ningún gesto táctil;
- «Cargando…» en texto;
- un destello vacío al abrir desde el icono de inicio;
- el `:hover` que se queda pegado en iPhone;
- cuatro estilos de iconos mezclados con flechas de texto.

El dueño pidió empezar por el pulido de animaciones e iconos.

## Estado

| Bloque | Estado | Dónde |
|---|---|---|
| 1. Transiciones, gestos, esqueletos, inicio iOS, hover, iconos | Hecho, **sin publicar** | PR #6, rama `claude/sensacion-nativa` |
| 2. Microanimaciones del entrenamiento | Por hacer | Este plan |
| 3. Momentos de celebración | Por hacer | Este plan |

### Bloque 1: lo que falta para cerrarlo

1. **El dueño prueba la preview en su iPhone**
   (https://claude-sensacion-nativa.santiago-fitness-method.pages.dev):
   - en Safari: transiciones, arrastrar hojas, deslizar entre ejercicios;
   - instalada en inicio (borrar el icono y volver a añadirlo): pantalla de inicio con el logo y deslizar desde el borde izquierdo para volver.
2. **Con su visto bueno:**
   1. `git checkout main && npm run handoff:sync`;
   2. reclamar el turno;
   3. unir la rama (`git merge --ff-only origin/claude/sensacion-nativa` si se puede; si no, merge normal);
   4. pasar las comprobaciones;
   5. `handoff:publish`.
3. **Si algo falla en iPhone,** lo más probable:
   - **Hojas:** que el arrastre compita con el scroll interno. El arrastre solo empieza con `scrollTop <= 0`; revisar `src/aplicacion/gestos.ts`, `useArrastrarParaCerrar`.
   - **Volver desde el borde:** que Safari en modo navegador también haga su propio gesto. Por eso solo se activa instalada en inicio (`display-mode: standalone`).

Archivos nuevos del bloque 1 (en el PR):

- `src/aplicacion/transiciones.tsx`: `useUbicacionConTransicion`, `conTransicion`, `direccionEntre`.
- `src/aplicacion/gestos.ts`: arrastrar para cerrar, deslizar horizontal, volver desde el borde.
- `src/componentes/Esqueleto.tsx`.
- `public/inicio/*.png` y `scripts/generar-pantallas-inicio.mjs`.
- `Icono` en `src/producto/ui.tsx`: ahora usa Lucide. Para añadir un icono, se añade al mapa `ICONOS`.

## Bloque 2: microanimaciones del entrenamiento

Objetivo: que cada toque frecuente tenga respuesta visual, como en Apple Fitness.
Todo con CSS y la View Transitions API, **sin librerías de animación**.

0. **Base de movimiento.** En `src/index.css`, `:root` gana tokens comunes:
   - `--mov-rapido: 120ms`, `--mov-medio: 220ms`, `--mov-lento: 340ms`;
   - `--curva-ios: cubic-bezier(0.32, 0.72, 0, 1)`.

   Las animaciones nuevas los usan.
1. **Completar serie** (`src/pantallas/EntrenamientoHoy/FilaSerie.tsx`, hacia la línea 317, `.serie__confirmacion`):
   - **Check:** el `Icono nombre="check"` se dibuja con `stroke-dasharray` y `stroke-dashoffset`, unos 300 ms. Ya existe `@keyframes sfm-check` en `producto.css`; reutilizarlo o sustituirlo.
   - **Fila:** al guardarse se pliega a su versión registrada con una transición de altura. Usar `interpolate-size: allow-keywords` donde exista; si no, `grid-template-rows: 0fr → 1fr`.
   - **Aceptación:** guardar una serie se ve fluido a 60 fps en Chromium; con «Reducir movimiento» no hay animación.
2. **Números de peso y repeticiones** (los pasos − y + de `FilaSerie`):
   - al cambiar, el número sale hacia arriba y el nuevo entra desde abajo (o al revés al bajar), en unos 160 ms;
   - basta un `key={valor}` en un `<span>` con una clase según la dirección.
   - **Aceptación:** pulsar + diez veces seguidas no acumula animaciones atrasadas.
3. **Descanso** (`src/componentes/Descanso.tsx`):
   - una barra fina que se vacía con `transform: scaleX(restantes/total)` y `transition: transform 1s linear`;
   - al llegar a 0, un pulso **finito** (2 iteraciones).
   - **Ojo:** `src/pruebas/movimiento.test.ts` exige que la única animación infinita sea `latido`. No añadir otra.
4. **Barra de progreso de la sesión** (`.progreso-sesion__relleno`, ya usa `scaleX`): añadir `transition: transform var(--mov-medio) var(--curva-ios)`.
5. **Resumen «Sesión completada»** (`src/pantallas/EntrenamientoHoy/Entrenamiento.tsx`, hacia la línea 332):
   - las cifras entran escalonadas (`animation-delay` 0, 60 y 120 ms) y cuentan hacia arriba de 0 al valor en unos 600 ms, con `requestAnimationFrame` y sin librería;
   - con «Reducir movimiento», el valor final directamente.
   - De paso, extraer esa línea larga a un componente `ResumenSesion`.
6. **Tarjetas y filas:** ya tienen `:active` (bloque 1). Revisar que los botones primarios usen la misma curva.

**Pruebas:**
- de componente para el contador del resumen, que con movimiento reducido muestra el valor final;
- de que `FilaSerie` sigue guardando igual;
- `movimiento.test.ts` en verde.

**QA:** Chromium 375×812 con y sin `reducedMotion: 'reduce'`, y capturas a mitad de animación.

## Bloque 3: momentos de celebración

1. **Al terminar la sesión:** una animación breve y sobria en el resumen, por ejemplo un círculo de progreso de la sesión que se cierra. **No copiar los anillos de Apple:** usar la marca propia (rojo `--rojo`, Barlow Condensed).
2. **Indicador de la semana en Hoy:**
   - «Semana: 2 de 4 sesiones», a partir de `participante.frecuenciaEntrenamiento` y las sesiones con `completadaEn` de la semana;
   - lunes como inicio de semana, igual que en `src/producto/servicio.ts`.
   - Se anima al aparecer.
3. Las demás ideas de la comparativa con Apple Fitness quedan para después de este plan:
   - tendencias por ejercicio en Progreso;
   - valoración del esfuerzo del 1 al 10 en el resumen;
   - rachas y logros;
   - compartir el resumen como imagen.

## Reglas y trampas conocidas

- **Nada a `main` sin el visto bueno del dueño:** rama, PR en borrador y preview de Cloudflare primero.
- **Comprobaciones antes de publicar:** `npm test`, `npx tsc -b`, `npm run lint` (0 avisos), `npm run build` y `git diff --check`.
- **«Reducir movimiento»:** toda animación nueva lo respeta, en CSS y, si hay JS, con `movimientoReducido()` de `src/aplicacion/transiciones.tsx`.
- **Sin animaciones infinitas nuevas:** lo exige `src/pruebas/movimiento.test.ts`.
- **Gestos:** usar eventos `touch*` con `passive: false`, no `pointer*` (iOS cancela los punteros al desplazar).
- **No quitar `overscroll-behavior-x: none`** de `html` y `body`: sin él, Chromium hace su propio «atrás» al deslizar de lado.
- **`view-transition-name` único por pantalla:** hoy los llevan `.sfm-tabbar` y `.sfm-demo-banner`. Uno duplicado rompe la transición entera.
- **Pruebas en el navegador:**
  - la demo abre guías (`dialog.sfm-guia`) que tapan los botones; cerrarlas antes de interactuar;
  - toques reales con CDP: `Input.dispatchTouchEvent`, con `hasTouch: true` e `isMobile: true`.
- **En un contenedor nuevo:**
  - `npm ci`;
  - instalar `sqlite3` para las pruebas de `functions/`;
  - `npm i -g wrangler@4.151.1` para `qa:preparar`;
  - `qa:servir` copia `dist` al arrancar: reiniciarlo tras cada build.
