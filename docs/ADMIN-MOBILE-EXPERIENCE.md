# Phase M1 — Coach / Admin Mobile App Experience

## Objetivo y alcance

Esta fase convierte la consola Coach/Admin existente en una experiencia móvil
clara y táctil sin cambiar sus permisos, datos ni operaciones. La aplicación del
cliente conserva su interfaz normal; el único cambio visible allí aparece durante
una vista previa iniciada por el coach y permite regresar de forma inequívoca.

Se mantuvieron fuera de alcance:

- autenticación y configuración de Cloudflare Access;
- esquema, migraciones o escrituras en D1 remota;
- IDs, datasets y ampliación de la biblioteca de ejercicios;
- `docs/cliente` y el landing `/presentacion`;
- nuevas funciones de producto o una reescritura de la consola en JavaScript.

## Auditoría previa

La consola era una página server-rendered funcional, pero se sentía como una web
de escritorio reducida:

- tarjetas y bordes competían con la jerarquía de la información;
- las secciones del cliente se presentaban como pestañas superiores;
- añadir un ejercicio dependía de un selector nativo largo;
- editar, reordenar y quitar eran acciones poco diferenciadas;
- los formularios no mantenían siempre una acción principal accesible;
- el regreso desde la vista previa dependía del cierre de sesión, sin una señal
  persistente de que el coach estaba probando la experiencia del cliente;
- el navegador solicitaba un favicon protegido y generaba un error 401 en consola.

Evidencia previa a 390×844:

- [Clientes](evidencia/admin-m1/antes/clientes-390x844.png)
- [Programa](evidencia/admin-m1/antes/programa-390x844.png)
- [Día](evidencia/admin-m1/antes/dia-390x844.png)
- [Editor](evidencia/admin-m1/antes/editor-390x844.png)
- [Perfil](evidencia/admin-m1/antes/perfil-390x844.png)
- [Acceso](evidencia/admin-m1/antes/acceso-390x844.png)

## Decisiones de UX

### Navegación

`/admin/` continúa siendo la lista de clientes. Al abrir un cliente aparece una
navegación inferior persistente con Programa, Perfil y Acceso. No se creó una
Biblioteca global inexistente: el catálogo actual aparece solamente al añadir un
ejercicio a un día, que es la función que ya existía.

Esta decisión mantiene el modelo mental de la consola y evita inventar una nueva
arquitectura de producto. El estado sigue viviendo en la URL y el botón Atrás del
navegador conserva su comportamiento.

### Jerarquía móvil

- encabezados del sistema con regreso, título y acción contextual;
- filas completas tocables, separadores y chevrons en lugar de tarjetas anidadas;
- búsqueda de clientes y búsqueda del catálogo renderizadas por el servidor;
- iconos SVG propios, sin emojis ni símbolos ambiguos;
- acción principal fija al final en formularios móviles; en 320 px pasa a flujo
  normal para no cubrir el último campo;
- atributos móviles apropiados en inputs y selects;
- barra inferior y vista previa respetan `safe-area-inset-*`;
- fuente de sistema y escala de espacios 4/8/12/16/24/32.

### Vista previa

`Probar como cliente` crea la misma sesión temporal que ya existía. Mientras esa
sesión está activa, la interfaz del cliente muestra una barra `Vista previa` con
`Volver al Coach`. Ese regreso usa `/salir?volver=admin`, revoca la sesión de
prueba y vuelve a la lista de clientes. El cliente normal no ve esta barra.

## Rutas y pantallas verificadas

| Pantalla | Ruta/estado |
| --- | --- |
| Clientes | `/admin/` |
| Buscar clientes | `/admin/?q=...` |
| Añadir cliente | `/admin/?nuevo=1` |
| Programa | `/admin/?cliente=X&seccion=programa` |
| Día | `...&dia=N` |
| Añadir desde catálogo | `...&dia=N&modo=anadir&q=...` |
| Editar ejercicio | `...&dia=N&ejercicio=O` |
| Perfil | `...&seccion=perfil` y `...&grupo=G` |
| Acceso | `...&seccion=acceso` |
| Vista previa | `/` con sesión temporal marcada como preview por la API |

## Verificación visual y táctil

Se midieron 45 combinaciones: nueve pantallas en 320×667, 390×844, 430×932,
768×900 y 1024×900.

- scroll horizontal del documento: **0 casos**;
- clipping o solapamiento: **0 casos** después de la corrección de 320 px;
- controles visibles menores de 44×44 px: **0 casos**;
- mínimo observado en icon buttons: **44×44 px**;
- inputs y botones principales: **48 px** de alto;
- destinos de la navegación inferior: **52 px** de alto;
- la barra de vista previa deja un enlace tocable de **87×44 px**.

Durante la auditoría se detectó que la barra fija de Guardar podía ensanchar el
documento a 324 px y cubrir el último campo en 320 px. Se corrigió haciendo que
esa barra vuelva al flujo normal en anchos de 350 px o menos. El favicon pasó a
ser inline y dejó de generar la petición 401.

Evidencia posterior:

- [Clientes 390×844](evidencia/admin-m1/despues/clientes-390x844.png)
- [Programa 390×844](evidencia/admin-m1/despues/programa-390x844.png)
- [Día 390×844](evidencia/admin-m1/despues/dia-390x844.png)
- [Catálogo 390×844](evidencia/admin-m1/despues/biblioteca-390x844.png)
- [Editor 390×844](evidencia/admin-m1/despues/editor-390x844.png)
- [Perfil 390×844](evidencia/admin-m1/despues/perfil-390x844.png)
- [Acceso 390×844](evidencia/admin-m1/despues/acceso-390x844.png)
- [Vista previa 390×844](evidencia/admin-m1/despues/vista-previa-390x844.png)
- [Programa 1024×900](evidencia/admin-m1/despues/programa-1024x900.png)
- [Editor 1024×900](evidencia/admin-m1/despues/editor-1024x900.png)

Las capturas posteriores usan el entorno local reversible. Por eso la lista puede
incluir el cliente QA y los contadores de Acceso reflejan fixtures locales; no son
evidencia del estado de producción.

## Interacciones ejecutadas

- buscar Santiago, abrir su ficha y regresar, sólo lectura;
- abrir el cliente `dayan-test`, navegar Programa → Día → Ejercicio;
- buscar y añadir un ejercicio del catálogo existente;
- reordenarlo, editar sus parámetros, guardar y retirarlo con confirmación;
- comprobar que el día regresó a sus cinco IDs originales;
- recorrer Programa, Perfil y Acceso mediante la navegación inferior;
- iniciar `Probar como cliente`, navegar Hoy/Biblioteca/Historial/Perfil y volver
  al Coach con revocación de la sesión temporal;
- comprobar geometría, foco, nombres accesibles y ausencia de errores visibles.

Todas las escrituras se hicieron contra D1 local y el fixture `dayan-test`.
Santiago se usó sólo para lectura. No se consumieron invitaciones reales ni se
escribió en D1 remota.

## Cobertura automatizada

- unitarias: 632/632 en tres corridas consecutivas;
- roles Coach/Cliente: 11/11;
- arquitectura Admin: 15/15;
- acceso y aislamiento de rutas: 38/38;
- lint: sin errores;
- build de aplicación y presentación: correcto;
- Maestro móvil: toca la aplicación real, incluido guardar, timer, Técnica,
  Calentamiento, navegación y `EDITAR` durante el timer.

La primera corrida final reprodujo el fallo intermitente previo de
`aria-valuenow`: la prueba observaba la sesión después de crearla, pero antes de
que la consulta reactiva recibiera la primera serie. Se sincronizó la aserción
con el estado final de la escritura. Tres corridas completas consecutivas pasaron
después del ajuste; no se cambió la lógica del producto.

## Deuda y riesgos restantes

- La consola continúa siendo server-rendered y cada búsqueda/navegación recarga la
  página. Es deliberado para no introducir una reescritura de arquitectura en M1.
- No se añadieron animaciones de hoja nativa ni gestos; requerirían una capa de
  interacción nueva y pertenecen a una fase posterior.
- La validación geométrica de M1 usa Chromium y medición DOM; no sustituye una
  prueba física específica de Safari iOS.
- La ampliación futura de la biblioteca permanece separada y no se expone como si
  ya estuviera disponible.
