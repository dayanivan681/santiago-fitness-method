# Animaciones del catálogo base

Revisión 2026-10-05 · Claude Code · decisiones del dueño aplicadas el mismo día · presupuesto $0 · preview `codex-gifs-base` (sin publicar en producción).

## Resultado

- **46 de 57** ejercicios base con animación en la ficha (`public/ejercicios/animaciones/<id>.gif`).
- **11 de 57** siguen con foto fija: no hay una animación libre que enseñe la misma variante.
- Ejercicios propios de Santiago: fuera de alcance, sin cambios.
- IDs, nombres, instrucciones, fotos e historial: sin cambios (prueba `animaciones.test.ts`).
- Coste: $0. Sin cuentas creadas, sin compras, sin marcas de agua.

## Cómo se hicieron

Dos fotogramas (0.jpg y 1.jpg) de [free-exercise-db](https://github.com/yuhonas/free-exercise-db), dominio público bajo Unlicense. Corte seco, 0,9 s por fotograma, en bucle, 480 px de ancho y 96 colores: unos 150 KB por GIF, 6,8 MB en total. 42 vienen de la misma fuente que la foto actual (comprobado por hash). En 3 se eligió una fuente más fiel a la ficha que la foto (marcadas abajo). Revisión visual fotograma a fotograma, no certificación de Santiago. Procedencia y sha256 en `public/ejercicios/PROCEDENCIA.md` y `procedencia.json`.

En la app: sólo la ficha reproduce la animación (cliente y coach). Listas, Hoy y miniaturas siguen con la foto. Sin conexión o si falla la carga, vuelve a la foto. Con «reducir movimiento» se ve la foto y el botón «Ver movimiento».

## Matriz

| ID | Ejercicio | Estado | Fuente | ¿Misma fuente que la foto? | Nota |
|---|---|---|---|---|---|
| press-banca-15-smith | Press inclinado bajo (15°) en Smith | ✅ GIF (174 KB) | free-exercise-db · Smith_Machine_Incline_Bench_Press | no | Fuente: Smith inclinado con respaldo más alto que 15°. Confirmar con Santiago. |
| press-inclinado-convergente | Press convergente inclinado | ✅ GIF (179 KB) | free-exercise-db · Leverage_Incline_Chest_Press | sí |  |
| press-banca-barra | Press de banca plano con barra | ✅ GIF (145 KB) | free-exercise-db · Barbell_Bench_Press_-_Medium_Grip | sí |  |
| press-banca-mancuernas | Press plano con mancuernas | ✅ GIF (116 KB) | free-exercise-db · Dumbbell_Bench_Press | sí |  |
| press-pecho-convergente | Press de pecho convergente horizontal | ✅ GIF (145 KB) | free-exercise-db · Leverage_Chest_Press | sí |  |
| pec-deck | Pec deck / fly de pecho | ✅ GIF (177 KB) | free-exercise-db · Butterfly | sí |  |
| fondos-triceps | Fondos en paralelas con énfasis en tríceps | ✅ GIF (168 KB) | free-exercise-db · Dips_-_Triceps_Version | sí |  |
| extension-triceps-polea | Extensión de tríceps en polea con barra V | ✅ GIF (183 KB) | free-exercise-db · Triceps_Pushdown_-_V-Bar_Attachment | no | Barra V (como la ficha); la foto usa barra recta. |
| press-frances-barra-z | Extensión acostado con barra EZ / skull crusher | ✅ GIF (116 KB) | free-exercise-db · EZ-Bar_Skullcrusher | sí |  |
| elevacion-lateral-mancuernas | Elevación lateral con mancuernas | ✅ GIF (115 KB) | free-exercise-db · Side_Lateral_Raise | sí |  |
| elevacion-lateral-polea | Elevación lateral en polea | ✅ GIF (165 KB) | free-exercise-db · Cable_Seated_Lateral_Raise | sí | Bilateral sentado; la ficha aún no fija unilateral/bilateral. |
| lat-pulldown-maquina | Lat pulldown | ✅ GIF (162 KB) | free-exercise-db · Wide-Grip_Lat_Pulldown | sí |  |
| jalon-agarre-cerrado | Lat pulldown agarre cerrado neutro | ✅ GIF (167 KB) | free-exercise-db · V-Bar_Pulldown | no | Barra V, agarre cerrado neutro (como la ficha). |
| dominadas | Dominadas | ✅ GIF (113 KB) | free-exercise-db · Pullups | sí |  |
| remo-barra | Remo con barra inclinado | ✅ GIF (124 KB) | free-exercise-db · Bent_Over_Barbell_Row | sí |  |
| remo-sentado-cable | Remo sentado en polea | ✅ GIF (157 KB) | free-exercise-db · Seated_Cable_Rows | sí |  |
| remo-mancuerna | Remo con mancuerna a una mano | ✅ GIF (133 KB) | free-exercise-db · One-Arm_Dumbbell_Row | sí |  |
| curl-barra | Curl con barra | ✅ GIF (117 KB) | free-exercise-db · Barbell_Curl | sí |  |
| curl-mancuernas | Curl con mancuernas | ✅ GIF (113 KB) | free-exercise-db · Dumbbell_Bicep_Curl | sí |  |
| curl-martillo | Curl martillo | ✅ GIF (109 KB) | free-exercise-db · Hammer_Curls | sí |  |
| hip-thrust-barra | Hip thrust con barra | ✅ GIF (147 KB) | free-exercise-db · Barbell_Hip_Thrust | sí |  |
| sentadilla-barra | Sentadilla con barra | ✅ GIF (126 KB) | free-exercise-db · Barbell_Squat | sí |  |
| prensa | Prensa de piernas | ✅ GIF (176 KB) | free-exercise-db · Leg_Press | sí |  |
| hack-squat | Hack squat | ✅ GIF (226 KB) | free-exercise-db · Hack_Squat | sí |  |
| extension-cuadriceps | Extensión de cuádriceps | ✅ GIF (179 KB) | free-exercise-db · Leg_Extensions | sí |  |
| zancadas-mancuernas | Zancadas con mancuernas | ✅ GIF (116 KB) | free-exercise-db · Dumbbell_Lunges | sí |  |
| peso-muerto-rumano | Peso muerto rumano con barra | ✅ GIF (121 KB) | free-exercise-db · Romanian_Deadlift | sí |  |
| curl-femoral-tumbado | Curl femoral acostado | ✅ GIF (191 KB) | free-exercise-db · Lying_Leg_Curls | sí |  |
| curl-femoral-sentado | Curl femoral sentado | ✅ GIF (182 KB) | free-exercise-db · Seated_Leg_Curl | sí |  |
| patada-gluteo-polea | Patada de glúteo en cable | ✅ GIF (125 KB) | free-exercise-db · Glute_Kickback | sí |  |
| abduccion-maquina | Abducción de cadera sentado en máquina | ✅ GIF (176 KB) | free-exercise-db · Thigh_Abductor | sí |  |
| elevacion-talones-pie | Standing calf raise en máquina | ✅ GIF (145 KB) | free-exercise-db · Standing_Calf_Raises | sí |  |
| elevacion-talones-sentado | Seated calf raise | ✅ GIF (136 KB) | free-exercise-db · Seated_Calf_Raise | sí |  |
| sfm-catalog-c191 | Prensa de piernas 45° | ✅ GIF (176 KB) | free-exercise-db · Leg_Press | sí |  |
| sfm-catalog-c194 | Prensa de piernas unilateral | ⏳ Foto fija | Mejor libre: Leg Press (bilateral) | — | Bilateral. |
| sfm-catalog-c196 | Extensión de cuádriceps unilateral | ✅ GIF (180 KB) | free-exercise-db · Single-Leg_Leg_Extension | sí |  |
| sfm-catalog-c203 | Peso muerto unilateral con mancuerna | ✅ GIF (127 KB) | free-exercise-db · Kettlebell_One-Legged_Deadlift | no | Kettlebell en vez de mancuerna; aprobado por el dueño. |
| sfm-catalog-c037 | Fly unilateral en cable | ✅ GIF (259 KB) | free-exercise-db · Single-Arm_Cable_Crossover | sí |  |
| sfm-catalog-c103 | Landmine press unilateral | ✅ GIF (169 KB) | free-exercise-db · Single-Arm_Linear_Jammer | sí |  |
| sfm-catalog-c154 | Extensión unilateral sobre cabeza con mancuerna | ✅ GIF (108 KB) | free-exercise-db · Standing_One-Arm_Dumbbell_Triceps_Extension | sí |  |
| sfm-catalog-c165 | Extensión unilateral sobre cabeza en cable | ✅ GIF (153 KB) | free-exercise-db · Standing_Low-Pulley_One-Arm_Triceps_Extension | sí |  |
| sfm-catalog-c161 | Pushdown unilateral agarre neutro | ⏳ Foto fija | Mejor libre: wger 803: vídeo de pushdown a una mano con asa (CC BY-SA 4.0, Goulart) | — | El más cercano: asa en vez de cuerda; vídeo casero; exige atribución visible en la ficha y compartir igual. Requiere aprobación. |
| sfm-catalog-c162 | Pushdown unilateral supinado | ✅ GIF (164 KB) | free-exercise-db · Cable_One_Arm_Tricep_Extension | sí |  |
| sfm-catalog-c056 | Jalón unilateral en polea alta | ✅ GIF (155 KB) | free-exercise-db · One_Arm_Lat_Pulldown | sí |  |
| sfm-catalog-c137 | Preacher curl con mancuerna unilateral | ✅ GIF (137 KB) | free-exercise-db · One_Arm_Dumbbell_Preacher_Curl | sí |  |
| sfm-catalog-c142 | Curl unilateral en cable | ✅ GIF (150 KB) | free-exercise-db · Standing_One-Arm_Cable_Curl | sí |  |
| sfm-catalog-c026 | Press unilateral convergente | ⏳ Foto fija | Mejor libre: Leverage Incline Chest Press (bilateral) | — | Bilateral: no enseña la variante unilateral. |
| sfm-catalog-c059 | Pulldown unilateral convergente | ⏳ Foto fija | Mejor libre: One Arm Lat Pulldown (polea, no máquina) | — | Equipo distinto (polea, no máquina convergente). |
| sfm-catalog-c071 | Remo sentado unilateral en cable | ✅ GIF (136 KB) | free-exercise-db · Seated_One-arm_Cable_Pulley_Rows | sí |  |
| sfm-catalog-c077 | Remo unilateral en máquina | ⏳ Foto fija | Mejor libre: Leverage Iso Row (bilateral) | — | Bilateral. |
| sfm-catalog-c107 | Elevación lateral unilateral en cable | ⏳ Foto fija | Mejor libre: One-Arm Incline Lateral Raise; wger 1378 (foto fija con banda) | — | Mancuerna en banco inclinado, no cable; wger sólo tiene foto fija. |
| sfm-catalog-c147 | Curl unilateral en máquina | ⏳ Foto fija | Mejor libre: Machine Bicep Curl (bilateral) | — | Bilateral. |
| sfm-catalog-c217 | Hip thrust unilateral | ⏳ Foto fija | Mejor libre: Single Leg Glute Bridge (suelo) | — | Puente en suelo, no hip thrust con espalda en banco. |
| sfm-catalog-c256 | Calf raise unilateral | ✅ GIF (108 KB) | free-exercise-db · Calf_Raise_On_A_Dumbbell | sí |  |
| sfm-catalog-c031 | Press unilateral de pecho en cable | ⏳ Foto fija | Mejor libre: Single-Arm Cable Crossover | — | Es un fly, no un press. |
| sfm-catalog-c102 | Press unilateral de hombro en máquina | ⏳ Foto fija | Mejor libre: Dumbbell One-Arm Shoulder Press | — | De pie con mancuerna, no máquina. |
| sfm-catalog-c204 | Peso muerto rumano unilateral en cable | ⏳ Foto fija | Mejor libre: Cable Deadlifts (bilateral) | — | Bilateral y sin bisagra a una pierna. |

## Pendientes y caminos

Revisadas sin éxito para los 11: free-exercise-db (876 ejercicios) y wger (917, API pública sin clave). wger sólo aporta un candidato parcial (C161) y exigiría atribución visible en la ficha, algo que la app aún no muestra.

Necesitan cuenta o clave, así que no se probaron (no se crean cuentas sin el dueño):

| Proveedor | Acceso | Coste mínimo para uso comercial | Nota |
|---|---|---|---|
| WorkoutX | Clave obligatoria (la API respondió 401 sin clave) | Basic $9,99/mes | El plan gratis es sólo para evaluación y proyectos pequeños. |
| exerciseapi.dev | Clave gratis (100 peticiones/día) | Desde $5/mes | Falta confirmar si trae GIF o vídeo por ejercicio y su licencia. |
| MuscleWiki API | Clave en planes de pago | Testing $10/mes (1.000 llamadas) | Todos los planes de pago incluyen uso comercial. |
| ExerciseDB / AscendAPI | Clave | Sin confirmar | |
| Your Move | Prueba gratis | Starter R$99/mes | Vídeo HD; la marca de agua depende del plan. |

Precios consultados el 2026-10-05; pueden cambiar.

Recomendación: mantener los 11 con foto fija. Si se quieren completar, lo más barato y limpio es que Santiago grabe esas 11 variantes con su equipo (el formulario del coach ya convierte vídeo en GIF). Una API de pago costaría desde unos $5–10/mes y, aun así, habría que validar ejercicio por ejercicio que muestre la variante unilateral correcta.

## Decisiones del dueño (2026-10-05)

1. `press-banca-15-smith`: se acepta la animación con un Smith más inclinado que 15°.
2. C203: se acepta la animación con kettlebell.
3. C161: no se usa el vídeo de wger; sigue con foto fija.
4. Publicación en producción aprobada.
