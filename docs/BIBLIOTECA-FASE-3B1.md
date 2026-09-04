# Biblioteca Maestra — Phase 3B.1

**Estado:** completada la fundación segura; Phase 3B.2 aún no iniciada.

Esta fase implementa únicamente el conjunto de identidades que puede conservarse
sin responder ninguna de las 48 decisiones del coach. No convierte las 293
propuestas del análisis en ejercicios listos para programar y no cambia el estado
de release de la aplicación.

## Fuentes y versión

Se usaron, en solo lectura, las fases 1–2, el análisis 3A, la revisión 3A.5, el
Decision Pack/Decision Map 3A.6, `docs/HANDOFF.md` y el PDF original
`docs/cliente/Biblioteca_Maestra_Ejercicios_Santiago_Fitness_Method.pdf`.

El PDF tiene SHA-256
`2a482961b3fa80f89c9ae0997e52c747553434a01de03e54d42c0bfda5c23ec0`.
La versión de esta fundación es `phase3b1-pdf-2a482961`; el sufijo ancla los
IDs a la extracción revisada, no a una etiqueta visible que pueda renombrarse.

## Resultado del cálculo conservador

El cálculo no resta el número de decisiones al número de propuestas. Para cada
uno de los 293 registros canónicos se hizo lo siguiente:

1. Se construyó la unión de todas las entradas `Sxxx` de R01–R25 y de todas las
   entradas del Decision Map A1–A11/B1–B37. La unión contiene 102 entradas fuente.
2. Si una identidad toca una de esas entradas, se clasificó como
   `EXCLUDED_PENDING_COACH_DECISION`.
3. Para las restantes, se excluyeron vínculos a cualquiera de los 33 IDs,
   `identity_ambiguous=true` y aliases adicionales cuyo significado no estuviera
   confirmado. Esas filas son `EXCLUDED_OTHER_REASON`.
4. Sólo lo que queda es `SAFE_TO_IMPORT`.

Las categorías son disjuntas (se aplica la prioridad anterior) y cada una de las
293 filas aparece exactamente una vez:

| Grupo | Cantidad | Significado en 3B.1 |
| --- | ---: | --- |
| `SAFE_TO_IMPORT` | **123** | Identidad no ambigua y sin dependencia de una decisión; se importa sólo como registro de fundación. |
| `EXCLUDED_PENDING_COACH_DECISION` | **102** | Toca una entrada usada por R01–R25 o A1–A11/B1–B37; no recibe ID nuevo. |
| `EXCLUDED_OTHER_REASON` | **68** | Legacy/ambiguo o alias adicional no confirmado; no recibe ID nuevo. |
| **Total** | **293** | Cada propuesta queda auditada. |

Las 123 filas seguras todavía pueden tener huecos de metadata del PDF (por ejemplo
inglés completo, lateralidad o compuesto/aislamiento). Eso no es una variante
inventada: se conserva como campo opcional y la fila no se vuelve programable.
«Segura» aquí significa segura para almacenar la identidad y su procedencia, no
aprobada para prescribirla al participante.

El detalle reproducible, incluyendo cada `Sxxx`, página, decisión, vínculo legacy,
hueco y motivo de exclusión, está en
[`BIBLIOTECA-FASE-3B1-MANIFEST.csv`](./BIBLIOTECA-FASE-3B1-MANIFEST.csv).

## Modelo implementado

Se añadió `IdentidadCatalogo` en
[`shared/catalogo-maestro.ts`](../shared/catalogo-maestro.ts). Una identidad
contiene:

- clave estable y referencia documental `Cxxx`;
- etiqueta fuente y, cuando existe en el CSV, nombre español/inglés explícito;
- arrays independientes de grupos del PDF, equipo, accesorios y patrones;
- lateralidad y compuesto/aislamiento sólo cuando la fuente lo deja explícito;
- aliases (vacío para este lote seguro);
- `entradasFuente`, `paginasFuente` y estado de revisión.

Las clasificaciones son datos separados de la identidad: pertenecer a dos grupos
del PDF no duplica la identidad ni mezcla sus historiales. No se asignan músculos
primarios/secundarios, cargas, incrementos, imágenes, instrucciones, sustituciones
ni multimedia que el PDF no demuestre.

La tabla se mantiene deliberadamente separada de `ejercicios`. Los 123 registros
no aparecen en el selector del Coach, no se pueden añadir a una plantilla y no
pueden generar un enlace. Así la interfaz operativa continúa trabajando con sus
33 fichas completas mientras Phase 3B.2 diseña el selector ampliado.

## IDs y preservación de los 33 actuales

Los nuevos registros usan `sfm-catalog-cNNN`, donde `NNN` es el `canonical_ref`
congelado en el manifest. El ID no se calcula desde el nombre visible, no reutiliza
ninguno de los 33 IDs y no se crea para una fila excluida. Un renombrado posterior
puede actualizar la etiqueta sin romper una referencia.

Los 33 IDs operativos siguen definidos en
[`shared/ejercicios-base.ts`](../shared/ejercicios-base.ts) y sus 33 fichas siguen
en `BIBLIOTECA_INICIAL`. No se cambiaron sus IDs, imágenes, patrones, cargas,
incrementos, calibraciones, plantillas, programación, sesiones ni series.

Los 11 ejercicios históricos ambiguos continúan exactamente con su ID y nombre
genérico actual. No se les asignó una variante, no se creó un reemplazo canónico y
no se fusionó ningún alias. Los 22 mappings verificables permanecen documentados,
pero ninguno autoriza duplicar o sustituir el registro histórico en esta fase.

## Importación y seed

La implementación local de Dexie añade la tabla `identidadesCatalogo` en la
versión de esquema 10. Es una ampliación de IndexedDB local; **no es una migración
SQL ni un write a D1**. El upgrade sólo crea la tabla nueva y no transforma tablas
existentes.

`sembrar()` llama a `sincronizarCatalogoMaestro()` después de la biblioteca
operativa. Para cada una de las 123 filas seguras:

- busca por el ID estable;
- usa `put` sólo si falta o cambió la metadata estática;
- no borra filas, sesiones, series, plantillas o calibraciones;
- no añade una fila a `ejercicios`.

Repetir el seed deja una fila por ID y conserva la identidad aunque cambie la
etiqueta. No se hicieron escrituras manuales ni se ejecutaron comandos D1 remotos.
Los errores de un ID desconocido siguen siendo explícitos mediante
`nombreDe()`/la validación existente; esta fase no relaja ese contrato.

### Rollback

Como el lote seguro está inactivo y ningún slot puede referenciarlo, revertir el
commit de 3B.1 elimina el código y la tabla de la siguiente instalación sin
requerir una operación destructiva sobre `ejercicios`, historial o plantillas.
Una instalación ya actualizada conserva la tabla local sin uso hasta que se
actualice por una versión posterior; no hay filas D1 que deshacer. Si una fase
futura activara un ID, primero deberá definir una política de tombstone/retención
antes de permitir rollback, fuera del alcance de 3B.1.

## Tests añadidos y validación

La cobertura nueva está en `shared/catalogo-maestro.test.ts` y
`src/datos/semilla/semilla.test.ts`. Verifica:

- versión, cardinalidad, procedencia y unicidad de los 123 IDs;
- coincidencia exacta entre `SAFE_TO_IMPORT` y la tabla estática;
- 102 pendientes y 68 excluidas con ID vacío, sin importación ni activación;
- ningún ID nuevo coincide con los 33 operativos;
- seed repetido sin duplicados y sin alterar la lista de 33 ejercicios;
- metadata idempotente sin cambiar el ID.

La suite existente conserva además la estabilidad de los 33 IDs, la integridad de
plantillas, el historial append-only, la detección de IDs desconocidos, la paridad
Coach/Cliente y las regresiones de sesión. Las comprobaciones ejecutadas en este
turno fueron:

| Comprobación | Resultado |
| --- | --- |
| `npm test` | **610/610 PASS** (52 archivos) |
| `npm run lint` | **PASS**, sin warnings |
| `npm run build` | **PASS**, app y presentación Vite limpias |
| Manifest | **293 filas**: 123/102/68; BOM y arrays JSON válidos |
| Migración/seed local | **PASS**: esquema anterior abre con v10; seed repetido conserva las tablas existentes |
| D1 remota | **No ejecutada; no hubo writes** |
| `docs/cliente` | **Sin modificaciones** |

La validación manual del producto permanece limitada a las 33 fichas operativas;
la nueva tabla no cambia la navegación, la UI, la autenticación ni el flujo de
sesiones. La evidencia de este turno queda registrada en el handoff.

## Archivos de esta fase

- `shared/catalogo-maestro.ts` — definición estática de las 123 identidades seguras.
- `shared/catalogo-maestro.test.ts` — auditoría del catálogo y manifest.
- `docs/BIBLIOTECA-FASE-3B1-MANIFEST.csv` — las 293 filas auditables.
- `src/datos/esquema.ts` — tabla local Dexie v10.
- `src/datos/repositorio.ts` y `src/datos/repositorioLocal.ts` — contrato y acceso local.
- `src/datos/semilla/index.ts` — seed idempotente de la fundación.
- `src/datos/semilla/semilla.test.ts` — pruebas de repetición y aislamiento.
- `docs/BIBLIOTECA-FASE-3B1.md` — este registro.
- `docs/HANDOFF.md` — entrada de publicación del turno.

No se modificaron `docs/cliente`, D1, el esquema SQL, la consola Admin, el selector
del Coach, la experiencia Cliente, el landing, los datasets de Phase 3A/3A.5/3A.6
ni los 33 ejercicios actuales.

## Deuda y límites para la siguiente fase

3B.1 se detiene aquí. Antes de activar cualquier identidad nueva hacen falta,
según corresponda:

- respuestas del coach para las decisiones pendientes y política explícita para
  los 11 IDs históricos;
- resolver los 102 registros excluidos y sus aliases/consolidaciones sin
  reinterpretar historia;
- completar fichas operativas (imagen, explicación, carga, instrucciones y
  alternativas) de forma comprobable;
- selector/buscador y filtros del Coach, paridad Cliente y validación de sus
  nuevas referencias;
- soporte futuro de multimedia, inglés completo y sincronización/cloud si se
  aprueba; ninguno existe en esta fase.

**Recomendación:** `READY FOR PHASE 3B.2` queda fuera del alcance de este turno.
El resultado es apto para revisión de Santiago y para planificar la siguiente
fase, pero no debe presentarse como catálogo completo ni como aprobación para
programar las 123 filas. No se declara `READY FOR SANTIAGO`.
