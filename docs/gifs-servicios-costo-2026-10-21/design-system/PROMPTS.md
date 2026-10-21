# Prompts para Claude Design

Dos prompts listos para pegar: uno crea el sistema de diseño, el otro compone un
ejercicio y se reutiliza para los 286. Antes, cómo conectarlo a git sin romper el
contrato del repositorio.

---

## Conexión a git — una condición

Conectar Claude Design a git es mejor que pasar archivos a mano: llega vector en
vez de imagen, queda versionado y las iteraciones se ven en el diff.

**Pero no puede escribir en `main`.** `CLAUDE.md` fija que `main` es la rama
coordinada con Codex y que **el turno es exclusivo: un solo agente a la vez**. Los
comandos `handoff:claim` y `handoff:publish` dan por hecho que el árbol está limpio
y que hay un único dueño del turno; un tercero empujando a `main` rompe eso y
bloquea a los dos agentes.

**Configúralo así:**

| | |
|---|---|
| Rama | **`diseno/sistema-visual`** — nunca `main` |
| Carpeta | **`arte/sistema-visual/`** |
| Puede tocar | sólo esa carpeta |
| No puede tocar | `docs/cliente/` (solo lectura), `src/`, `functions/`, `public/`, `migrations/` |
| No debe subir | `node_modules`, `dist`, `coverage`, `.env`, credenciales |

Yo leo esa rama cuando me avises, implemento, y el paso a `main` lo hago desde mi
turno con las comprobaciones del contrato. Así Claude Design y yo no nos pisamos.

> `entrega-diseno/` **no** sirve para esto: está en `.gitignore` y no se versiona.

Estructura esperada dentro de `arte/sistema-visual/`:

```
figura/neutra.svg · figura/flexion.svg · figura/brazos-arriba.svg
equipo/<pieza>.svg      (una por tipo)
tokens.md               (paleta, grosores, proporciones)
destino/pendulum-squat.svg
```

---

## Prompt 1 — crear el sistema de diseño

```
Necesito definir un sistema de diseño para una biblioteca de animaciones de
ejercicio de una app de entrenamiento personal. No quiero animaciones: quiero el
lenguaje visual y las piezas por separado, porque luego las articulo por código.

CONTEXTO
App oscura, fondo #0b0c0d, minimalista, tipografía Barlow. Marca: Santiago Fitness
Method, acento rojo #e5352b. Las animaciones se ven en fichas de ejercicio, en
móvil, en un marco vertical 3:4.

REGISTRO VISUAL
Figura estilizada y anatómicamente correcta: un maniquí de manual de anatomía.
Ni fotorrealista ni monigote de palo. Proporciones humanas creíbles, sin cara, sin
rasgos, sin marcas de ropa. Equipo en gris acero, simplificado pero reconocible.
Nada de fondos, escenarios, iluminación ambiental, sombras de suelo, texto ni
logotipos.

ENTREGA 1 — FIGURA, vista de perfil, cuerpo entero. Tres láminas de la MISMA
figura:
  1. Pose neutra: de pie, piernas rectas, brazos a los lados.
  2. Pose en flexión: media sentadilla, rodilla y cadera a unos 90°.
  3. Pose con los brazos extendidos por encima de la cabeza.

ENTREGA 2 — KIT DE EQUIPO. Cada pieza por separado y SIN figura encima:
barra libre · mancuerna · polea con cable · máquina de pin (stack) · máquina de
discos · Smith · máquina convergente · banco plano · banco inclinado · plataforma
de pies · disco de peso.

ENTREGA 3 — VALORES, escritos, no deducidos de la imagen:
paleta completa en hex (cuerpo, ropa, equipo, discos, suelo, acento); grosor en
píxeles de cada segmento (torso, muslo, pierna, pie, brazo, antebrazo, cuello);
altura total de la figura y longitud de cada segmento.

ENTREGA 4 — una lámina de destino: figura y máquina compuestas, a la calidad final
que busco, para usarla como referencia de llegada.

REGLAS OBLIGATORIAS — de esto depende que pueda animarlo:
- Cada segmento es una pieza independiente (muslo, pierna, pie, torso, brazo,
  antebrazo, cabeza). NO una silueta fundida en un solo contorno.
- Las articulaciones deben funcionar en cualquier ángulo: extremos redondeados o
  una pieza de articulación explícita. Nada dibujado a medida para una pose.
- Sin escorzo ni perspectiva que dependan de la pose.
- Sin sombras pintadas sobre el cuerpo.
- Las longitudes de cada segmento son IDÉNTICAS en las tres láminas.

FORMATO
Lienzo 3:4 vertical, 720×960. La figura ocupa el 75% de la altura, centrada, con
aire alrededor. Misma escala y misma cámara en las tres láminas.
Entrégalo como SVG o como código, nunca como imagen plana.
```

## Prompt 2 — componer un ejercicio *(plantilla, se reutiliza)*

```
Usando el sistema de diseño que ya definimos —misma figura, mismo kit, mismos
colores, grosores y proporciones—, compón UN ejercicio.

EJERCICIO: {{NOMBRE}}
EQUIPO: {{EQUIPO}}
MÚSCULO PRINCIPAL: {{MÚSCULO}}

CÓMO ES EL MOVIMIENTO:
{{DESCRIPCIÓN EN DOS O TRES FRASES}}

POSICIÓN INICIAL: {{DESCRIPCIÓN}}
POSICIÓN FINAL: {{DESCRIPCIÓN}}
PUNTO FIJO, no se mueve en todo el recorrido: {{CUÁL}}
RASGO QUE IDENTIFICA EL APARATO: {{QUÉ TIENE QUE VERSE SÍ O SÍ}}

ENTREGA: dos láminas —posición inicial y posición final—, misma escala y misma
cámara, vista de perfil, lienzo 3:4 vertical 720×960, en SVG o código.

REGLAS DE TÉCNICA, mandan sobre la estética:
- Los segmentos no cambian de longitud entre las dos láminas.
- Columna neutra, sin curvar la espalda.
- Rodillas alineadas con la punta del pie, nunca hacia dentro.
- Talones apoyados. El punto fijo no se mueve ni un píxel.
- Recorrido completo y realista: ni corto ni forzado.

IMPORTANTE: la posición inicial se usará además como imagen fija por sí sola, así
que tiene que entenderse sin movimiento.
```

### La plantilla rellenada — Pendulum Squat 90°

```
EJERCICIO: Pendulum Squat 90°
EQUIPO: máquina de discos
MÚSCULO PRINCIPAL: cuádriceps

CÓMO ES EL MOVIMIENTO:
Sentadilla en una máquina donde el usuario queda recostado contra un respaldo con
hombreras, de pie sobre una plataforma inclinada. El carro cuelga de un pivote alto
y adelantado, así que el cuerpo baja describiendo un ARCO, no una línea recta.

POSICIÓN INICIAL: piernas casi extendidas sin bloquear la rodilla, cuerpo alto y
reclinado contra el respaldo, pies planos sobre la plataforma.
POSICIÓN FINAL: rodilla en torno a 90°, cadera descendida siguiendo el arco, torso
pegado al respaldo, talones apoyados, rodillas sobre la punta del pie.
PUNTO FIJO: los pies sobre la plataforma.
RASGO QUE IDENTIFICA EL APARATO: el pivote alto y por delante del usuario del que
cuelga todo el carro, y la viga que gira con él llevando el disco en el extremo.

AVISO: no es un hack squat. El hack squat desliza por un raíl RECTO; el pendulum
gira sobre un PIVOTE y el recorrido es un arco. Si sale recto, está mal.
```

---

## Cómo se rellena la plantilla para los demás

Los datos de cada ejercicio —nombre, equipo, músculo— salen de la biblioteca real:

```sql
SELECT nombre, equipo, musculo_primario, movimiento
FROM ejercicios_coach WHERE activo=1 ORDER BY movimiento;
```

Lo que **no** sale de la base de datos y hay que escribir a mano es lo que de
verdad importa: las dos posiciones, el punto fijo y el rasgo que identifica el
aparato. Son tres frases por ejercicio, y son las que evitan que salga el
movimiento equivocado.
