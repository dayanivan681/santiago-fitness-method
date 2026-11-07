# Sistema visual — fuente del arte de las animaciones

Aquí vive el **lenguaje visual** de la biblioteca ilustrada: la figura, el kit de
equipo y sus valores. De aquí sale, por código, la animación de cada ejercicio.

Esta carpeta la escribe **Claude Design**. El plan completo está en
[`docs/gifs-servicios-costo-2026-10-21/PLAN-B-BIBLIOTECA-ILUSTRADA.md`](../../docs/gifs-servicios-costo-2026-10-21/PLAN-B-BIBLIOTECA-ILUSTRADA.md)
y los prompts en
[`design-system/PROMPTS.md`](../../docs/gifs-servicios-costo-2026-10-21/design-system/PROMPTS.md).

---

## Reglas de esta rama

Esta rama es **`diseno/sistema-visual`** y existe para no pisar a nadie.

- **No escribir en `main`.** `main` es la rama coordinada con Codex y el turno es
  exclusivo: un solo agente a la vez. Un tercero empujando a `main` bloquea a los
  demás y rompe `handoff:claim` / `handoff:publish`.
- **Sólo se toca `arte/sistema-visual/`.** Nada de `src/`, `functions/`, `public/`,
  `migrations/` ni `scripts/`.
- **`docs/cliente/` es estrictamente de solo lectura.** No se edita, no se renombra,
  no se regenera.
- **No subir** `node_modules`, `dist`, `coverage`, `.env`, credenciales ni llaves.
- El paso de este arte a `main` lo hace Claude Code desde su turno, con las
  comprobaciones del contrato (`npm test`, `npm run lint`, `npm run build`).

## Qué va en cada carpeta

```
figura/      la misma figura en tres poses
             neutra.svg · flexion.svg · brazos-arriba.svg
equipo/      una pieza por tipo, sin figura encima
             barra-libre · mancuerna · polea-cable · maquina-pin ·
             maquina-discos · smith · convergente · banco-plano ·
             banco-inclinado · plataforma-pies · disco
destino/     lámina de referencia de calidad final
             pendulum-squat.svg
tokens.md    paleta, grosores y proporciones, escritos
```

## Formato

- **SVG o código, nunca imagen plana.** Con vector se leen coordenadas, grosores y
  colores exactos y se llevan al esqueleto tal cual. Un PNG obliga a medir a ojo.
- Lienzo **3:4 vertical, 720×960**. Figura al 75 % de la altura, centrada.
- Misma escala y misma cámara en todas las láminas.

## Las cinco reglas que hacen el arte articulable

Si alguna falla, el arte no se puede re-posar y hay que rehacerlo. No son
preferencias estéticas: son la condición para que esto se pueda animar.

1. **Cada segmento es una pieza independiente** — muslo, pierna, pie, torso, brazo,
   antebrazo, cabeza. Nunca una silueta fundida en un solo contorno.
2. **Las articulaciones funcionan en cualquier ángulo**: extremos redondeados o una
   pieza de articulación explícita. Nada dibujado a medida para una pose.
3. **Sin escorzo ni perspectiva** que dependan de la pose.
4. **Sin sombras pintadas sobre el cuerpo** que supongan una luz y una postura.
5. **Las longitudes de cada segmento son idénticas** en todas las láminas.
