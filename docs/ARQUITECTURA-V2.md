# Santiago Fitness Method · producto de coaching v2

Estado: implementación en validación; no describe todavía el release canónico.
El registro operativo y los pendientes están en [HANDOFF](HANDOFF.md).

Santiago prepara y acompaña; el cliente entrena; ambos comparten su progreso.
Coach y Cliente reutilizan componentes React, navegación y reglas del método.
La identidad conserva Barlow, negro, blanco y rojo. Las equivalencias pendientes
del catálogo siguen pendientes y los PDFs de `docs/cliente` permanecen intactos.

## Fuente de verdad y acceso

D1 conserva perfiles, programas versionados, entrenamientos, series, correcciones,
sustituciones, medidas, calibraciones, borradores de onboarding e importaciones.
`sesiones` identifica accesos; `entrenamientos` identifica actividad física.
Cada entrenamiento fija su prescripción y significado de cargas: publicar otra
rutina no reinterpreta lo que el cliente hizo antes.

`cambios` registra documento, revisión, operación única, hash, actor y cursor.
La API aplica cambios y recibos en lotes atómicos; un reintento no duplica series.
Una revisión incompatible queda en `conflictos`; la resolución compara de nuevo
la revisión cloud y conserva las propuestas y la decisión. Las notas privadas
del Coach se filtran también en los endpoints de cambios y conflictos.

Dexie es caché y cola durable por entorno, rol e identidad. Registro y operación
se guardan en una transacción local. La confirmación inmediata significa guardado
en el dispositivo; «Pendiente de sincronizar» permanece hasta confirmación D1.
La cola se procesa al guardar, recuperar conexión, volver al primer plano y cada
cuatro segundos mientras la aplicación está visible. Cinco segundos es el
objetivo de convergencia con conexión normal, no una garantía ante cortes.

El shell PWA contiene código público, sin perfiles ni secretos. El service worker
no cachea APIs privadas ni fotos. Poder abrir el shell offline no concede acceso:
la identidad cacheada vence a las 24 horas de validación y nunca después de la
sesión. Una revocación detectada bloquea acceso y sincronización, conservando
operaciones pendientes para recuperación autenticada. No se elige automáticamente
el primer participante encontrado en una base antigua.

Las fotos usan R2 privado, metadatos en D1 y comprobación de permisos en cada GET.
El upload requiere consentimiento; compartir con Coach es una elección separada.
Límites de aplicación: 5 MB por imagen y 100 MB por cliente, incluyendo objetos
retenidos tras eliminación lógica. El estado pendiente permite recuperar cargas
interrumpidas. R2 fue habilitado por el dueño y los bindings privados separados
quedaron verificados el 2026-09-09: `sfm-fotos-staging` y
`sfm-fotos-production`. En staging se comprobó consentimiento, retirada de
compartición, recuperación de la cola offline y lectura desde otro navegador.

## Entornos y modos

| Modo | Entrada | Persistencia |
|---|---|---|
| Cliente real | `/`, invitación privada de un uso | D1 y caché de su identidad |
| Coach real | `/admin`, Cloudflare Access | Clientes autorizados en D1 |
| Vista previa | Ficha Coach → Vista previa | Lectura autorizada y simulación en memoria |
| Entrenar juntos | Acción distinta en ficha Coach | Actividad real con actor Coach |
| Demo pública | `/demo`, ambos roles ficticios | Sólo memoria; sin APIs privadas ni IndexedDB |

La demo de presentación utiliza `/demo`; `/presentacion` sigue siendo marketing.
El namespace de staging y su D1 están separados de producción. El runtime local
usa otra D1 y claves de QA válidas sólo en localhost y entorno local. Las suites
HTTP rechazan hosts remotos; no existe opción de QA de escritura en producción.

## Recuperación de datos anteriores

`0008` añade tablas sin alterar las existentes. `0009` copia perfiles y programas
como primeras versiones, conserva IDs, huecos y archivos. Los planes anteriores
se leen aunque no cumplan la nueva regla de publicación de 5–8 ejercicios; no se
rellenan automáticamente. Las semillas históricas nunca se ejecutan al atender
peticiones ni al migrar v2.

El cliente revisa propietario, fechas y cantidades antes de importar desde su
antigua base o respaldo v1. Confirmar pertenencia es obligatorio incluso si el ID
coincide, porque las previews antiguas podían escribir bajo identidades reales.
Las fotografías antiguas no se suben implícitamente.

La validación completa precede la importación; origen, contenido y hash se
conservan en D1, con recibos por lote. Se procesa en grupos de tres operaciones
para acotar consultas. Un corte permite retomar el cursor; los registros ya
confirmados no se duplican. Los conflictos conservan ambas versiones para revisar.
Conservar el registro actual queda auditado; corregir historia utiliza el flujo
de corrección, sin reemplazar su prescripción. La base antigua permanece intacta.
Los registros ambiguos nunca se incorporan ni eliminan automáticamente.

## Operación

Consultar [despliegue y migración](DESPLIEGUE.md), [acceso](ACCESO.md) y
[QA v2](QA-V2.md). No restaurar una base anterior sobre producción como rollback:
perdería actividad posterior. El rollback de aplicación debe mantener privacidad
y compatibilidad con el esquema aditivo; su artefacto debe verificarse antes del
rollout. Los respaldos SQL contienen datos privados y viven fuera de Git.
