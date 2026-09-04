# Biblioteca Maestra — Phase 3A: análisis y propuesta

Estado: **ANÁLISIS COMPLETO; IMPORTACIÓN NO APROBADA NI IMPLEMENTADA**.

## 1. Resumen ejecutivo

El PDF contiene **299 entradas, no 299 identidades demostradas**. La propuesta
conservadora agrupa esas entradas en **293 registros canónicos de revisión**:
cinco pares repetidos exactamente y un par bilingüe propuesto. No es todavía
el número definitivo de identidades físicas: quedan solapamientos genérico/variante
que el documento no permite resolver. Una revisión puede consolidar más registros
o descomponer una entrada que agrupa variantes incompatibles.

De los 33 IDs actuales, **21 tienen coincidencia exacta de denominación**, uno
tiene relación verificable de variante más específica (Smith a 15°), y **11
permanecen sin asignación**, pendientes del coach. Ningún ID se sustituye.

Esta entrega sólo añade documentación y tablas de revisión. No importa ejercicios,
no modifica código, UI, programación, calibraciones, históricos, D1 ni PDFs.
No cambia el estado de release ni declara READY FOR SANTIAGO.

## 2. Análisis de fuentes

Fuentes leídas:

- `docs/cliente/Biblioteca_Maestra_Ejercicios_Santiago_Fitness_Method.pdf`, completo,
  18 páginas. SHA-256:
  `2a482961b3fa80f89c9ae0997e52c747553434a01de03e54d42c0bfda5c23ec0`.
- `docs/BIBLIOTECA-FASES-1-2.md` y `docs/HANDOFF.md`.
- Código actual, línea base `9ca11b7`; claim documental `aaf3357`.
  Se revisaron fuente compartida, fichas semilla, sincronización local, tipos,
  catálogo Admin, programación, alternativas, filtros y datos del landing.

La página 1 presenta el alcance; la 2 contiene el resumen; las 3–17 contienen
las entradas; la 18 propone campos y filtros futuros. Las referencias externas
mencionadas allí no se usaron para completar metadata: no constituyen evidencia
de que cada ejercicio tenga un equipo, músculo primario o mecánica particulares.

| Sección del PDF | Entradas |
| --- | ---: |
| Pecho | 47 |
| Espalda | 46 |
| Hombros | 32 |
| Bíceps | 22 |
| Tríceps | 22 |
| Cuádriceps | 27 |
| Femorales | 16 |
| Glúteos | 28 |
| Aductores / Cadera | 10 |
| Pantorrillas / Tibial | 10 |
| Core / Abdominales | 28 |
| Antebrazos / Agarre | 11 |
| **Total** | **299** |

Control por página: 3=30, 4=17, 5=32, 6=14, 7=30, 8=2, 9=22, 10=22,
11=27, 12=16, 13=28, 14=10, 15=10, 16=28, 17=11.

La extracción conserva nombre exacto, sección, subcategoría, página, orden global
y número dentro de subcategoría. La numeración reinicia según el documento, no
según la página; se conserva la continuación entre páginas. `S001`–`S299` son
referencias de esta extracción, **no IDs operativos**.

## 3. Metodología de deduplicación

Reglas reproducibles, aplicadas en este orden:

1. Conservar la fuente literalmente; no eliminar calificadores para buscar pares.
2. Proponer consolidación del mismo nombre en secciones diferentes sólo si sus
   contextos no aportan una contradicción de variante. Una clasificación muscular
   adicional no crea por sí sola otro ejercicio.
3. Consolidaciones semánticas: lista explícita revisable, nunca fuzzy matching.
   En esta versión sólo `Curl martillo` / `Hammer curl`.
4. Conservar diferencias explícitas de equipo, agarre, ángulo, postura,
   lateralidad, asistencia y énfasis técnico **incluido en el nombre**.
5. Un término genérico no hereda calificadores de otro más específico. Por ejemplo,
   ausencia de «unilateral» no significa «bilateral»; máquina no identifica modelo.
6. Una barra oblicua no garantiza equivalencia: puede expresar traducción o mezclar
   modos de ejecución. `Dip machine / fondos asistidos` requiere revisión.
7. Un patrón parecido no prueba identidad ni autoriza sustitución.
8. Referencia canónica de revisión: `C` + ordinal de la primera entrada del grupo.
   Sólo las seis agrupaciones siguientes alteran la relación inicial uno-a-uno.
   Los demás casos permanecen separados, incluso si son posibles duplicados.

| Caso | Entradas | Denominación | Páginas | Decisión |
| --- | --- | --- | --- | --- |
| D01 | S087, S113 | Reverse fly en cable | 6, 7 | Un registro, espalda/hombros |
| D02 | S205, S220 | Cable pull-through | 12, 13 | Un registro, femorales/glúteos |
| D03 | S235, S244 | Sumo squat | 13, 14 | Un registro, glúteos/aductores |
| D04 | S249, S267 | Elevación de rodillas colgado | 14, 16 | Un registro, cadera/core |
| D05 | S283, S296 | Suitcase carry | 16, 17 | Un registro, core/agarre |
| D06 | S130, S294 | Curl martillo / Hammer curl | 9, 17 | Equivalencia léxica propuesta; aprobación pendiente |

En D03 el contexto «énfasis glúteo» es una clasificación de sección, no un
calificador técnico distinto del nombre. No se infiere equipo para Sumo squat.
En D06 no se infieren mancuernas ni se incluye el martillo cruzado.

El CSV REVISION contiene además **25 casos de solapamiento no resuelto** (R01–R25)
y **12 fronteras de variante** (V01–V12). Es el registro explícito de decisiones,
no una lista de fusiones ejecutadas.

## 4. Modelo de identidad canónica

- **Identidad:** definición de ejecución suficientemente precisa para distinguir
  registros. Su clave es estable; su etiqueta puede cambiar.
- **Clasificación:** grupos del PDF, equipo, patrón y contexto. Varias
  clasificaciones pueden apuntar a una identidad; no duplican sus series.
- **Variante:** diferencia explícita relevante para ejecución o interpretación
  de registros. Se conserva independiente mientras no exista equivalencia aprobada.
- **Alias:** nombre alternativo contextual. No es un comando para fusionar IDs.
- **Vínculo histórico:** relación entre un ID ya usado y una definición aprobada;
  no es una migración del historial a otro ID.

La propuesta es deliberadamente parcial: el nombre fuente puede describir una
familia más amplia que una ficha ejecutable. Un registro de revisión con campos
pendientes no debe publicarse como ejercicio listo para programar.

`muscle_groups[]` significa **secciones de clasificación del PDF**, no músculos
primarios ni atribución de volumen. `pattern[]` contiene familias textuales o
subcategorías inequívocas; **no equivale al `movimiento` operativo** del código.
Equipo y accesorio se distinguen: barra recta de una polea no es barra libre.

## 5. Catálogo normalizado propuesto y artefactos

| Archivo en `docs/` | Contenido |
| --- | --- |
| `BIBLIOTECA-FASE-3A-FUENTE.csv` | Las 299 entradas originales y su referencia propuesta |
| `BIBLIOTECA-FASE-3A-CATALOGO.csv` | Los 293 registros canónicos de revisión y metadata con evidencia |
| `BIBLIOTECA-FASE-3A-MAPPING-33.csv` | Los 33 IDs, evidencia, relación y política histórica |
| `BIBLIOTECA-FASE-3A-OPCIONES-COACH.csv` | Respuestas candidatas para cada uno de los 11 IDs pendientes |
| `BIBLIOTECA-FASE-3A-REVISION.csv` | 43 casos: consolidaciones, posibles solapamientos y variantes |

Formato: CSV UTF-8 con BOM; colecciones representadas como arrays JSON dentro
de celdas. Cadena vacía o `[]` significa «no determinado», no «no aplica» ni
«sin equipo». `canonical_ref` sirve para revisión y no se importará como ID.

Campos principales del catálogo:

- `canonical_label_source`: nombre fuente de referencia, sin traducción inventada.
- `canonical_name_es`: denominación española o híbrida documentada; vacío cuando
  sólo hay denominación inglesa sin versión española segura en la fuente.
- `possible_name_en`: sólo inglés explícito o correspondencia bilingüe documentada;
  no constituye una traducción profesional completa.
- `muscle_groups`, `source_classifications`: unión de clasificaciones con origen.
- `equipment`, `equipment_accessories`, `equipment_evidence`: equipo/accesorio
  explícito; encabezados mixtos no se convierten en selección de equipo.
- `pattern`, `laterality`, `compound_isolation`: sólo evidencia nominal/contextual
  inequívoca. Alterno no se traduce automáticamente a unilateral.
- `qualifiers`, `aliases`, `aliases_policy`: calificadores preservados y alias
  delimitados por contexto. Un alias no garantiza búsqueda global unívoca.
- `source_entries`, `source_pages`: trazabilidad completa.
- `existing_ids_verified`, `existing_ids_candidate_only`: vínculo verificado
  separado de las opciones aún no aceptadas.
- `identity_ambiguous`, `identity_review_reasons`, `metadata_gaps`,
  `needs_human_review`, `review_status`: incertidumbres distintas y explícitas.

Todos los registros tienen estado `propuesta_no_aprobada_para_importar`.
No se inventaron imágenes, explicación técnica, carga inicial, incrementos,
grupos secundarios ni equivalencias de sustitución para completar fichas.

## 6. Mapping de los 33 IDs existentes

«Exacto» significa coincidencia nominal verificable, no metadata completa ni
autorización de importación. Las páginas, evidencia y restricciones individuales
están en MAPPING-33. Ningún ID tiene estado «sin match»; once sólo tienen candidatos.

| ID existente | Fuente | Relación |
| --- | --- | --- |
| press-banca-15-smith | S020 | Verificable: 15° dentro de familia 15–30°, sin ampliar variante |
| press-inclinado-convergente | S024 | Exacto |
| press-banca-barra | S001 | Exacto |
| press-banca-mancuernas | S004 | Exacto |
| press-pecho-convergente | S023 | Exacto |
| pec-deck | S028 | Exacto |
| fondos-triceps | S156 | Exacto |
| extension-triceps-polea | Sin asignar | Pendiente |
| press-frances-barra-z | S151 | Exacto |
| elevacion-lateral-mancuernas | S104 | Exacto |
| elevacion-lateral-polea | Sin asignar | Pendiente |
| lat-pulldown-maquina | Sin asignar | Pendiente |
| jalon-agarre-cerrado | S054 | Exacto |
| dominadas | Sin asignar | Pendiente |
| remo-barra | S060 | Exacto |
| remo-sentado-cable | Sin asignar | Pendiente |
| remo-mancuerna | S062 | Exacto |
| curl-barra | Sin asignar | Pendiente |
| curl-mancuernas | Sin asignar | Pendiente |
| curl-martillo | S130 / S294 | Exacto con S130; traducción consolidada propuesta |
| hip-thrust-barra | S213 | Exacto |
| sentadilla-barra | Sin asignar | Pendiente |
| prensa | Sin asignar | Pendiente |
| hack-squat | S182 | Exacto |
| extension-cuadriceps | Sin asignar | Pendiente |
| zancadas-mancuernas | Sin asignar | Pendiente |
| peso-muerto-rumano | S197 | Exacto |
| curl-femoral-tumbado | S207 | Exacto |
| curl-femoral-sentado | S206 | Exacto |
| patada-gluteo-polea | S223 | Exacto |
| abduccion-maquina | S228 | Exacto |
| elevacion-talones-pie | S251 | Exacto |
| elevacion-talones-sentado | S252 | Exacto |

Smith conserva 15°, imagen, carga y registros: relacionarlo con S020 no lo
convierte en todas las inclinaciones de 15–30°. La ficha actual es más específica.

## 7. Ambigüedades y revisión humana

### Las once decisiones del coach — no resueltas

OPCIONES-COACH enumera cada respuesta candidata, página, acción de mapping y riesgo.
Siempre incluye «otra variante / no sé / varias variantes históricas»: en ese caso
no se fuerza ninguna identidad. Las opciones del PDF no son una lista exhaustiva
de todas las ejecuciones posibles del ejercicio histórico.

| ID | Respuesta que determina candidato | Referencias candidatas |
| --- | --- | --- |
| extension-triceps-polea | Recta, V, cuerda; confirmar variantes unilaterales/agarre si procede | S158–S162 |
| elevacion-lateral-polea | Unilateral, bilateral; inclinación lean-away por separado | S107, S108, S110 |
| lat-pulldown-maquina | Ancho pronado, medio pronado, cerrado neutro, supino | S052–S055 |
| dominadas | Pronadas, supinadas, neutras, asistidas; asistencia no aclara agarre | S048–S051 |
| remo-sentado-cable | Neutro cerrado, ancho, unilateral; confirmar eje faltante | S069–S071 |
| curl-barra | Barra recta o EZ | S126, S127 |
| curl-mancuernas | Alterno o simultáneo | S128, S129 |
| sentadilla-barra | Barra alta o baja | S170, S171 |
| prensa | 45°, horizontal, unilateral, pies altos; pueden combinarse ejes | S191–S194 |
| extension-cuadriceps | Bilateral o unilateral | S195, S196 |
| zancadas-mancuernas | Caminando, hacia delante o atrás; conservar mancuernas | S178–S180 |

Responder sobre el ejercicio **a partir de hoy** no demuestra qué se ejecutó en
registros pasados. Si el coach no puede confirmar consistencia histórica, el ID
legacy conserva su significado ambiguo; una variante nueva futura requiere
definición separada aprobada. Nunca se elimina ni se reinterpreta el ID anterior.

Si `lat-pulldown-maquina` resulta ser cerrado neutro puede apuntar a la misma
definición que `jalon-agarre-cerrado`. Ambos IDs, historiales y calibraciones siguen
separados. No hay fusión automática de series. Si `curl-barra` resulta ser EZ,
no se recalculan cargas antiguas ni se cambia retroactivamente el peso base.

### Solapamientos del PDF

Se mantienen sin fusionar Farmer carry/bilateral, Face pull/con cuerda,
Reverse fly máquina/Reverse pec deck, press cerrado Smith/press de banca cerrado
Smith y pullover/straight-arm pulldown. REVISION detalla los 25 casos completos.
Los restantes casos incluyen ángulos de press, modelos de máquina, postura,
agarres y unilateralidad que cruzan dimensiones independientes.

Una diferencia explícita no desaparece por compartir grupo: fondos pecho/tríceps,
sumo squat/deadlift, barra alta/baja, extensión unilateral/bilateral y martillo
cruzado se mantienen separados. Un genérico se conserva como propuesta incompleta,
no se afirma que sea una variante física adicional ya demostrada.

## 8. Recomendación de modelo de datos

Mantener el mínimo: **catálogo estático compartido versionado**, no seis tablas
D1 nuevas. El proyecto ya distribuye el catálogo con el código.

1. Definición de catálogo: clave estable, etiquetas, calificadores, arrays de
   clasificaciones, evidencia y estado de revisión. Fuente/entradas conservadas
   como objetos de procedencia, no como copias de ejercicios.
2. Registro de vínculos legacy: `existing_id`, definición aprobada opcional,
   relación (exacta/refinamiento), calificadores preservados y decisión del coach.
   Permite muchos IDs históricos a una definición; no fusiona almacenamiento.
3. Ficha ejecutable: ID operativo, metadata aprobada y perfil de carga compatible.
   Sólo fichas completas se ofrecen al coach y al cliente.
4. Alias como array contextual; clasificación muscular/equipo/patrón como arrays,
   sin tablas puente hasta que consultas o edición remota lo justifiquen.
5. Sustituciones: relaciones explícitas aprobadas o grupos de equivalencia seguros,
   con motivo/restricción. No generarlas por igualdad de grupo muscular o alias.

El actual `movimiento` se usa para alternativas; el patrón de análisis no debe
sobrescribirlo. El filtro cliente actual usa músculo primario; incorporar grupos
del PDF ahí sería un cambio de UI y semántica, fuera de 3A y del import mínimo.
La taxonomía actual no cubre todas las categorías del PDF (p. ej. tibial/agarre).
No inventar correspondencias para pasar la validación.

No se necesita migración D1 para importar definiciones estáticas. Añadir metadata
opcional no obliga por sí mismo a modificar índices Dexie. Si el futuro alcance
requiere índices, nuevos modos de registro o catálogo editable remoto, necesita
un diseño separado y aprobación, no una migración preventiva en esta fase.

## 9. Métricas y límites de confianza

| Métrica | Resultado |
| --- | ---: |
| Entradas fuente | 299 |
| Nombres literales distintos | 294 |
| Registros canónicos propuestos | 293 |
| Pares exactos consolidados | 5 |
| Par semántico propuesto | 1 |
| Entradas involucradas en consolidaciones | 12 |
| Reducción neta | 6 |
| Identidades propuestas con varias secciones | 6 |
| Casos de solapamiento pendientes | 25 |
| Entradas marcadas para revisión de identidad | 158 |
| Registros canónicos marcados para revisión de identidad | 154 |
| IDs actuales exactos / verificables | 21 / 1 |
| IDs actuales pendientes / sin match | 11 / 0 |
| Registros sin nombre inglés seguro | 227 |
| Registros sin versión española segura | 61 |
| Registros sin equipo determinable | 94 |
| Registros sin patrón textual determinable | 62 |
| Registros sin lateralidad explícita | 262 |
| Registros sin compuesto/aislamiento explícito | 282 |
| Registros que requieren alguna revisión humana | 293 |

La bandera de identidad se activa por pertenencia a un caso R01–R25, equipo
indeterminado o refinamiento angular pendiente. No significa que las 158 entradas
sean duplicados ni que todas sean imposibles de identificar. La revisión general
también incluye metadata/traducción faltante: **293 revisables no son 293
identidades ambiguas**. Las métricas de campos faltantes se solapan y no se suman.

Cada fila identifica sus motivos y huecos; no se ocultan las entradas que no
pueden clasificarse con confianza. No hay un número definitivo de identidades
reales aprobadas. Tampoco corresponde calcular nuevas altas como `293 − 33`:
hay vínculos pendientes, familias más amplias y posibles múltiples IDs legacy.

## 10. Riesgos

| Riesgo | Protección propuesta |
| --- | --- |
| Falso duplicado por etiqueta abreviada | Mantener separado y pedir datos de ejecución |
| Fusionar equipo, ángulo, asistencia o lateralidad | Conservar calificadores y revisión explícita |
| Un ejercicio aparece en varios grupos | Una definición con procedencia múltiple; no duplicar volumen |
| Misma identidad bajo nombres distintos | Alias contextual aprobado, no fusión fuzzy |
| Sustituciones inseguras | No usar músculo/patrón textual como equivalencia automática |
| Alias compartido por varias variantes | Resolver candidatos, no elegir el primero |
| Renombrado cambia significado histórico | ID estable; etiquetas separadas de parámetros/ejecución |
| Once IDs aún ambiguos | Sin mapping por defecto; resolución documentada y no retroactiva |
| Carga nueva incompatible | No inventar lb×reps para holds, carries, asistencia o distancia |
| Catálogo visible sin ficha completa | Separar definición revisable de ficha programable |
| Rollback elimina referencias en rutinas | Conservar resolución de IDs retirados, nunca borrar registros |
| Material multimedia inexistente | Activar sólo con ficha/asset real o política explícita aprobada |

## 11. Propuesta Phase 3B — pendiente de aprobación

### Importación por etapas

1. Aprobar reglas, seis consolidaciones y tratamiento de familias incompletas.
   Resolver o excluir explícitamente del lote los registros pendientes.
2. Congelar versión del catálogo y decisiones en Git. Crear claves de catálogo
   estables, independientes de nombre, página y grupo. `S`/`C` son sólo referencias
   documentales; **no** se convierten automáticamente en IDs de app.
3. Incorporar primero definiciones compartidas y vínculos aprobados, sin activar
   automáticamente las 293 propuestas. Los 33 IDs operativos permanecen idénticos.
4. Activar únicamente un lote explícito de fichas completas compatibles con el
   modelo actual. Un ID operativo nuevo se asigna sólo a una variante nueva
   aprobada, nunca como sustituto de los 33. No agregar variantes incompletas por
   completar un objetivo numérico de importación.
5. Derivar la misma selección programable para Admin y Cliente. Separar
   «seleccionable para programación nueva» de «resoluble en historial existente».
6. Semilla idempotente por ID/version: insertar nuevas fichas aprobadas; actualizar
   sólo metadata permitida. Preservar pesos base e incrementos calibrados,
   plantillas, series, sesiones y vínculos. Ejecutarla dos veces sin duplicados.
7. Si un ejercicio requiere duración/distancia/asistencia no soportadas, mantenerlo
   fuera del lote operativo; diseñar ese soporte en otra fase aprobada.

### Rollback y protección histórica

Antes de activar, probar rollback en fixture local. Desactivar selección nueva
de fichas retiradas pero conservar definición operativa resoluble y registros
previos. **Un simple revert que borre IDs usados no es un rollback seguro**:
la validación actual marcaría las rutinas con referencias desconocidas INCOMPLETE.
No borrar filas sembradas ni reescribir D1 para ocultar el problema. Si no se
puede garantizar resolución de IDs retirados, no activar el lote.

La programación de clientes no se rellena ni cambia durante la importación.
Las pruebas usan fixtures reversibles, nunca Santiago ni D1 remota.

### Tests propuestos antes de activar

- Cobertura de todas las fuentes y decisiones; unicidad de claves; alias no
  ambiguos por accidente; ningún pendiente seleccionable.
- Estabilidad exacta de los 33 IDs y conservación de perfil de carga, calibración,
  imágenes, patrones y parámetros existentes.
- Paridad fuente compartida/Admin/Cliente/demo y rechazo informativo de IDs
  realmente desconocidos; resolución de IDs retirados válidos.
- Semilla repetida, upgrade local, reinicio y rollback sin pérdidas ni duplicados.
- Last Performance e Historial siguen ligados al ID y variante, no al alias/grupo.
- Exportación/restauración compatible con históricos y fichas retiradas.
- Ninguna sustitución nueva implícita ni mezcla de volumen por multi-clasificación.
- Tests/lint/build, y QA móvil de nombres largos, filtros existentes, fichas,
  selección coach y lectura cliente; autenticación y protección de assets intactas.

## 12. Archivos exactos propuestos para Phase 3B

Lista del **import mínimo propuesto**, no cambios realizados ni autorización.
El lote operativo y metadata deben aprobarse antes de implementar.

| Archivo | Acción futura y propósito |
| --- | --- |
| `shared/catalogo-maestro.ts` | Nuevo: definiciones aprobadas, procedencia y vínculos legacy; un módulo, sin ORM |
| `shared/catalogo-maestro.test.ts` | Nuevo: integridad, estados, referencias, mapping y casos de revisión |
| `shared/ejercicios-base.ts` | Derivar selección aprobada conservando literalmente los 33 IDs |
| `shared/ejercicios-base.test.ts` | Estabilidad, paridad, pendientes excluidos y retirados resolubles |
| `src/datos/semilla/biblioteca/maestra.ts` | Nuevo sólo para lote aprobado: fichas completas adicionales |
| `src/datos/semilla/biblioteca/index.ts` | Combinar 33 existentes con lote operativo aprobado |
| `src/datos/semilla/index.ts` | Reconciliación idempotente con preservación y retirada no destructiva |
| `src/datos/semilla/semilla.test.ts` | Upgrade, doble ejecución, calibración y rollback |
| `functions/lib/roles.ts` | Distinguir selección activa y resolución histórica sin relajar permisos |
| `functions/lib/roles.test.ts` | Paridad, readiness y referencias válidas retiradas/desconocidas |
| `src/datos/repositorioLocal.test.ts` | Aislamiento y conservación de registros por ID |
| `src/datos/respaldo.test.ts` | Compatibilidad de exportación/restauración con catálogo versionado |
| `src/logica/respaldo.test.ts` | Validación de referencias preservadas |
| `src/logica/limitaciones.test.ts` | No generar equivalencias a partir de clasificaciones nuevas |
| `src/presentacion/Presentacion.test.tsx` | Demo sigue derivando nombres/fichas compatibles |
| `docs/BIBLIOTECA-FASE-3A-ANALISIS.md` | Registrar decisiones aprobadas sin alterar la fuente PDF |
| `docs/HANDOFF.md` | Lote, resultados, rollback y siguiente gate |

Archivos **condicionales**, sólo si el diseño aprobado lo exige:
`src/dominio/tipos.ts` (metadata opcional/tipos sin reinterpretar campos actuales),
`src/datos/respaldo.ts` y `src/logica/respaldo.ts` (si sus validaciones necesitan
soportar las referencias nuevas). No se presupone editar estos archivos sólo
por existir el catálogo. Los paths exactos de multimedia nueva se definirán con
los IDs y recursos aprobados; no se inventan nombres de assets en este análisis.

Sin cambios previstos al import mínimo: `shared/plantillas-base.ts`, fichas
existentes `empuje.ts`/`traccion.ts`/`pierna.ts`, pantallas, CSS, middleware,
Cloudflare Access, esquema/migraciones D1 ni `docs/cliente`.
Ampliar filtros o taxonomía operativa, modificar sustituciones o introducir nuevos
modos de carga se evalúa separadamente: no queda autorizado por esta propuesta.

**Siguiente paso: revisión y aprobación del catálogo y alcance de Phase 3B.
No ejecutar importación hasta recibir esa aprobación.**

### Verificación de esta entrega documental

- Readback de CSV: 299 filas fuente, 293 propuestas, 33 mappings, 45 opciones
  del coach y 43 casos de revisión. Cobertura exacta una vez por entrada;
  referencias válidas y arrays JSON legibles. Reconciliación de nombres y campos
  con extracción del PDF, totales por grupo/página y SHA-256 conservado.
- Recuento independiente desde CSV confirma las métricas de la sección 9.
  Los 33 IDs coinciden con `shared/ejercicios-base.ts`; los once pendientes
  tienen `canonical_ref` vacío, aunque sus candidatos estén documentados.
- `npm test`, primera corrida: **601/602**, fallo de presencia DOM en
  `src/pantallas/Perfil/Perfil.test.tsx:104`, prueba «guarda las notas del coach
  y las deja a la vista». Segunda corrida completa sin cambios: **602/602**.
  Fallo observado intermitente; causa no diagnosticada en esta fase documental.
  No se presenta la suite como estable por haber pasado la repetición.
- `npm run lint`: PASS. `npm run build`: PASS para app y presentación.
- No se ejecutó QA de interfaz ni se probaron nuevas funciones: no las hay.
  No se contactó D1 ni se crearon fixtures de clientes. Código de producción,
  los 33 IDs, PDFs y datos de Santiago permanecen sin cambios.
- Riesgo restante adicional al catálogo: investigar por separado la intermitencia
  de Perfil antes de usar la suite como gate de estabilidad del producto.
