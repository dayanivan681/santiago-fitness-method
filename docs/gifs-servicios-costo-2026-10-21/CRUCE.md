# Cruce de los 50 sin animación contra las fuentes gratuitas — 2026-10-21 (claude-code)

Paso recomendado en [README.md](README.md) y pedido por el dueño: antes de pagar
nada, comprobar cuántos de los 50 ejercicios activos sin animación se pueden
cubrir gratis.

Se cruzaron contra **dos** fuentes, las dos de coste cero:

1. **Los 46 GIF que ya están en el repositorio** (`public/ejercicios/animaciones/`).
   Varios de los 50 son el mismo movimiento que un ejercicio del catálogo de
   arranque: el archivo ya existe y sólo habría que asociarlo.
2. **[free-exercise-db](https://github.com/yuhonas/free-exercise-db)** — dominio
   público bajo Unlicense, la misma fuente de los 46 actuales. Descargado hoy:
   **876 ejercicios, 873 con dos o más fotogramas**, que es lo que hace falta para
   armar el GIF con la técnica del 2026-10-05 (corte seco, 0,9 s por fotograma).

No se generó ningún GIF ni se tocó código de producto. Esto es el inventario
previo a decidir.

---

## Resultado

| | Ejercicios | Coste |
|---|---|---|
| **A. Ya tenemos el archivo en el repositorio** | **11** | $0 |
| **B. Se puede hacer gratis con free-exercise-db** | **17** | $0 |
| **C. Sin fuente libre fiel** | **22** | hay que grabarlo o comprarlo |
| | **50** | |

**28 de los 50 se cubren sin pagar nada.** De esos 28, **17 son fieles sin
reservas** y **11 llevan una reserva** que Santiago debería aprobar (el movimiento
es el correcto, pero hay un detalle distinto: sentado en vez de de pie, sin
asistencia, recorrido más largo). Las reservas van marcadas abajo una por una.

> **Corrección (2026-10-21):** al resumir esto en el chat dije «20 fieles y 8 con
> reserva». El reparto correcto, contando las filas de las tablas de abajo, es
> **17 y 11**.

> **Estado tras generar el lote** — ver [propuestos/README.md](propuestos/README.md).
> De los 17 sin reserva, 6 eran archivos que ya existían y 11 había que generar.
> Generados los 11: **9 aprobados**, **1 pasa a reserva** (M02-060: la fuente es a
> un brazo) y **1 rechazado** (M02-133: el sujeto queda tapado por la máquina y no
> se ve el movimiento), que vuelve al grupo sin fuente libre. El reparto queda en
> **15 listos sin reserva · 12 con reserva · 23 sin fuente libre**.

Los **22 restantes no tienen equivalente libre fiel**, y el motivo es casi siempre
el mismo que dejó 11 fuera en octubre: **no falta la animación, falta la máquina**.
Pendulum squat, power squat, belt squat sumo, hip thrust de pie en máquina,
elevación lateral en máquina, abductores de pie, jalón convergente, jalón de
discos, máquinas de asistencia… son aparatos concretos de gimnasio que un catálogo
genérico no trae. El resto son variantes unilaterales en cable o máquina, el mismo
hueco de siempre.

---

## A. Ya tenemos el archivo (11) — coste $0, es sólo asociarlo

| Ref | Ejercicio del coach | GIF que ya existe | Reserva |
|---|---|---|---|
| M02-081 | Barbell Row | `remo-barra.gif` | — |
| M02-095 | Low Cable Row | `remo-sentado-cable.gif` | — |
| M02-153 | Barbell Hip Thrust | `hip-thrust-barra.gif` | — |
| M02-001 | Bench Press con barra | `press-banca-barra.gif` | — |
| M02-002 | Bench Press con mancuernas | `press-banca-mancuernas.gif` | — |
| M02-004 | Bench Press en máquina convergente | `press-pecho-convergente.gif` | — |
| M02-052 | Cable Lateral Raise | `elevacion-lateral-polea.gif` | El GIF es **sentado y a dos brazos** |
| M02-107 | Low-Bar Back Squat | `sentadilla-barra.gif` | El GIF no fija la **posición de la barra** (alta/baja) |
| M02-238 | Assisted Dip | `fondos-triceps.gif` | El GIF es **sin asistencia** |
| M02-005 | Bench Press plate-loaded | `press-pecho-convergente.gif` | Convergente, **no de discos**: son máquinas distintas |
| *(propio)* | Press inclinado en maquina | `press-inclinado-convergente.gif` | Convergente, la ficha dice **máquina tradicional** |

Los seis primeros son el mismo movimiento con el mismo equipo: encaje limpio.
Los cinco últimos piden el visto bueno de Santiago.

## B. Se puede hacer gratis con free-exercise-db (17) — coste $0, hay que generar el GIF

| Ref | Ejercicio del coach | Fuente libre | Reserva |
|---|---|---|---|
| M02-273 | Plank | `Plank` [body only] | Es **isométrico**: ver abajo |
| M02-274 | Side Plank | `Side Bridge` [body only] | Isométrico; la fuente **no trae instrucciones**, sólo fotogramas |
| M02-133 | Bulgarian Split Squat Smith Machine | `Smith Single-Leg Split Squat` [machine] | — (banco detrás del Smith, pie trasero elevado: encaje exacto) |
| M02-139 | Walking Lunge | `Bodyweight Walking Lunge` | — |
| M02-039 | Arnold Press | `Arnold Dumbbell Press` [dumbbell] | — |
| M02-060 | Cable Front Raise | `Front Cable Raise` [cable] | — |
| M02-042 | Convergent Shoulder Press | `Leverage Shoulder Press` [machine] | — |
| M02-043 | Plate-Loaded Shoulder Press | `Leverage Shoulder Press` [machine] | Comparte fuente con M02-042 |
| M02-186 | Nordic Hamstring Curl | `Natural Glute Ham Raise` [body only] | — (rodillas apoyadas, tobillos sujetos: es el nórdico) |
| M02-159 | Barbell Glute Bridge | `Barbell Glute Bridge` [barbell] | — |
| M02-162 | Cable Glute Kickback | `One-Legged Cable Kickback` [cable] | — (tobillera en polea baja: encaje exacto) |
| M02-173 | Hiper extensiones enfoque en el glúteo | `Hyperextensions (Back Extensions)` | — (el énfasis en glúteo es una indicación, no otro movimiento) |
| M02-003 | Bench Press en Smith Machine | `Smith Machine Bench Press` [machine] | — (plano, mejor que el 15° que tenemos) |
| M02-030 | Cable Crossover | `Cable Crossover` [cable] | — |
| M02-058 | Barbell Front Raise | `Standing Front Barbell Raise Over Head` [barbell] | La fuente **sube por encima de la cabeza**: recorrido más largo |
| M02-197 | Block Pull | `Rack Pulls` [barbell] | Desde **pines de jaula**, no desde bloques |
| M02-025 | Cable Fly | `Flat Bench Cable Flyes` [cable] | La fuente es **tumbado en banco**; la ficha no dice si es de pie |

### Aviso sobre Plank y Side Plank
Son ejercicios **isométricos**: no hay movimiento que enseñar. Un GIF de dos
fotogramas de una plancha se ve igual que la foto fija. Técnicamente se pueden
hacer y cuestan $0, pero **no aportan nada al participante**. Mi criterio: dejarlos
con foto y no gastar esfuerzo. Decide el dueño.

## C. Sin fuente libre fiel (22)

| Ref | Ejercicio del coach | Qué hay de más cerca y por qué no sirve |
|---|---|---|
| M02-275 | Weighted Plank | Sólo `Plank` sin lastre; el disco en la espalda es el punto |
| M02-121 | Heel-Elevated Squat | No hay variante con talones elevados |
| M02-129 | Leverage Squat | No existe; `Hack Squat` es otra máquina |
| M02-126 | Pendulum Squat 90° | No existe el pendulum squat |
| M02-130 | Power Squat | `Reverse Band Power Squat` es **con barra y bandas**, no la máquina |
| M02-131 | Squat Press Machine | No existe |
| M02-047 | Single-Arm Cable Shoulder Press | Sólo bilateral en cable, o unilateral con mancuerna |
| M02-046 | Single-Arm Machine Shoulder Press | Sólo `Dumbbell One-Arm Shoulder Press`: de pie con mancuerna |
| *(propio)* | STANDING LATERAL RAISE MACHINE | No hay elevación lateral en máquina |
| M02-078 | Assisted Pull-Up | `Band Assisted Pull-Up` usa **banda**, no la máquina de asistencia |
| M02-076 | Convergent Lat Pulldown | Todos los jalones libres son **de polea**, no convergentes |
| M02-077 | Plate-Loaded Lat Pulldown | Igual: polea, no discos |
| *(propio)* | Abductores en maquina de pie | `Thigh Abductor` es la máquina **sentado** |
| M02-167 | Cable Abduction | Sólo hay `Cable Hip Adduction`, el movimiento **contrario** |
| M02-166 | Cable Diagonal Kickback | Sólo la patada recta; la diagonal es lo que distingue el ejercicio |
| M02-169 | Lean-Forward Hip Abduction | `Thigh Abductor` es **con torso vertical**; inclinarse es el punto |
| M02-160 | Smith Glute Bridge | Sólo con barra libre; el Smith guía la barra |
| M02-165 | Standing Glute Kickback | `Glute Kickback` es **a cuatro apoyos**, no de pie |
| *(propio)* | Standing Hip Thrust Machine | No existe |
| *(propio)* | Sumo Belt Squat Machine | No existe el belt squat |
| M02-035 | Assisted Chest Dip | `Dips - Chest Version` es **sin asistencia** |
| M02-243 | Cable Kickback (tríceps) | Sólo `Tricep Dumbbell Kickback`: **mancuerna**, no cable |

---

## Qué significa esto para la decisión de pagar

El informe anterior planteaba $199 (ExerciseDB Starter, pago único) como la única
opción de pago compatible con la app. Con el cruce hecho, la pregunta cambia:

**Los 23 que faltan no son ejercicios raros: son máquinas concretas.** De ellos,
**15 son un aparato específico de gimnasio** (los 14 de abajo más el Bulgarian
split squat en Smith, rechazado al revisar la imagen) (pendulum squat, power squat, squat
press, leverage squat, belt squat sumo, hip thrust de pie, elevación lateral en
máquina, abductores de pie, abductor inclinado, jalón convergente, jalón de discos,
asistencia de dominadas, asistencia de fondos, glute bridge en Smith) y **4 son
variantes unilaterales en cable o máquina**. Un catálogo genérico de 1.394
ejercicios se enfrenta exactamente al mismo problema que la fuente gratuita: puede
tener el movimiento, pero no en esa máquina.

**No puedo afirmar sin comprarlo cuántos de los 23 trae ExerciseDB.** Lo que sí
puedo afirmar, medido, es que las dos fuentes libres revisadas —876 y 917
ejercicios— no traen ninguno de los 15 aparatos. Pagar $199 para cubrir 23 fichas
es una apuesta sin verificar; grabarlas Santiago las cubre todas con seguridad,
porque son **sus** máquinas.

### Recomendación

1. **Hacer los 27 gratis que quedan.** Primero los 15 fieles; los 12 con reserva,
   cuando Santiago los apruebe. Eso lleva la biblioteca de 236/286 (83 %) a
   **263/286 (92 %)** sin gastar un dólar. Descontando Plank y Side Plank por
   isométricos, quedan 25 que valen el esfuerzo.
2. **Los 23 restantes los graba Santiago** con la herramienta que ya existe en la
   app. Son sus máquinas: nadie más tiene esas imágenes.
3. **No comprar nada todavía.** Si después de grabar sigue faltando mucho, se
   revisa; y antes de pagar $199 habría que pedirle a ExerciseDB la lista de
   ejercicios para comprobar si trae esos aparatos.

---

## Método y límites

- Los 50 salen de producción el 2026-10-21 con `wrangler d1 execute
  santiago-acceso --remote` (sólo SELECT): ejercicios activos sin fila en
  `ejercicios_coach_animacion`.
- El cruce es **por nombre, equipo y músculo**, con un script de coincidencia por
  palabras (`cruzar.mjs`, en el directorio temporal de la sesión) y después
  **revisión manual de cada candidato**, leyendo las instrucciones de la fuente
  cuando el nombre no bastaba (así se descartaron `Glute Kickback` por ser a cuatro
  apoyos y se confirmaron `Smith Single-Leg Split Squat` y
  `Natural Glute Ham Raise`).
- **No se compararon imágenes.** El veredicto es sobre el nombre, el equipo y las
  instrucciones de la fuente, no sobre el fotograma. Al generar los GIF habría que
  revisarlos uno a uno, como se hizo en octubre.
- El criterio de «fiel» es el del 2026-10-05: mismo movimiento **y mismo equipo**.
  Por eso un jalón de polea no cubre un jalón convergente, aunque el gesto se
  parezca.
- Las 8 reservas son juicio mío, no decisión tomada. Santiago es quien sabe si una
  elevación lateral sentada le sirve para enseñar la de pie.
