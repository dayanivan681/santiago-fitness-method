# Acceso — enlace privado

El cambio está hecho. Quién autentica qué:

| Ruta | Autentica |
|---|---|
| `santiago-fitness-method.pages.dev/access` y `/presentacion` | Público; el primero sólo muestra/consume enlaces válidos y el segundo es la presentación |
| `santiago-fitness-method.pages.dev/*` | El middleware, con enlace privado. **Sin Cloudflare a la vista.** |
| `santiago-fitness-method.pages.dev/admin/*` | Apertura temporal sin OTP hasta la fecha documentada; después, Cloudflare Access |
| `*.santiago-fitness-method.pages.dev/*` (previews y URLs hash) | Cloudflare Access con OTP; protege despliegues que no son el dominio canónico |

No existe un interruptor de entorno para saltarse el middleware del cliente.
Fuera de las excepciones públicas indicadas, una cookie `sfm_sesion` válida es
obligatoria. Un despliegue mal configurado falla cerrado: nunca convierte la
aplicación ni sus APIs en públicas por una variable antigua. `/sw.js` es una
excepción técnica adicional:
solo contiene la migración/autodestrucción del service worker y no datos ni
secretos.

**Aviso importante.** El proyecto está conectado a Git y el hostname sirve el
despliegue **canónico**, que sale de un push. Un `wrangler pages deploy` a mano
crea un despliegue más reciente que **nunca llega a servirse**. La configuración
sólo cuenta si está commiteada. Este malentendido ya costó una prueba fallida.

Si la variable falta, el middleware asume `magic` y cierra. Fallar cerrado es lo
único aceptable en una puerta.

### Excepción temporal del panel del coach

Para esta ventana operativa el panel `/admin` del hostname canónico puede abrirse
sin OTP hasta `2026-09-05T20:00:00Z` (UTC). La excepción no afecta `/`, `/access`,
las APIs, los assets, los ejercicios ni los previews; tampoco crea una sesión de
cliente. Al vencer, `/admin` vuelve a responder cerrado incluso si alguien
intenta falsificar la cabecera de Access. Para restaurar el flujo normal antes
del vencimiento hay que retirar `COACH_ACCESS_TEMPORARY_UNTIL` y volver a añadir
el destino `/admin` en la aplicación de Cloudflare Access.

## Cómo entra cada uno

**Cliente** — enlace privado → botón *Entrar* → app. Nunca ve Cloudflare, ni
escribe correo, ni crea cuenta.

**Coach** — durante la ventana operativa actual puede entrar directamente a
`/admin`; al terminar, la ruta vuelve al flujo normal de Cloudflare Access con
OTP. Desde la consola puede listar clientes, abrir su ficha, editar perfil y
rutina (días, ejercicios, orden, series, rango, descanso y progresión),
generar/revocar enlaces y *Previsualizar cliente*. La previsualización crea la
misma sesión normal que el enlace mágico; no existe bypass permanente. `Salir de
vista previa` revoca esa sesión y vuelve a pedir `/admin/` a Access.

Nada bajo `/admin` sirve aplicación de cliente. Antes no existía función para esa
ruta y Cloudflare Pages caía en su reserva de página única: servía la SPA, que
cargaba porque Access dejaba pasar el HTML, pero sus imágenes y bundles viven
fuera de `/admin` y chocaban con la puerta del enlace mágico. Un catch-all en
`functions/admin/[[ruta]].ts` lo impide.

## Generar un enlace

Desde la consola: `https://santiago-fitness-method.pages.dev/admin`.

Desde la terminal:

```bash
npm run invitar -- --cliente santiago
```

El token se imprime una sola vez. En la base sólo queda su SHA-256, así que no
se puede recuperar: si se pierde, se genera otro.

## Revocar

```bash
npx wrangler d1 execute santiago-acceso --remote \
  --command "UPDATE sesiones SET revocada_en=unixepoch()
             WHERE cliente_id='santiago' AND revocada_en IS NULL"
```

D1 es de consistencia fuerte: la siguiente petición ya falla. No hay ventana de
propagación — la razón de no haber usado KV.

## Por qué el GET no consume el enlace

WhatsApp, iMessage y los antivirus de correo abren los enlaces que reciben para
previsualizarlos. Si el GET consumiera el token, el enlace llegaría gastado.
`/access` sólo enseña un botón; el POST de ese botón es el único que consume.

## Pruebas

```bash
npm run build
npx wrangler pages dev --port 8788     # en otra terminal
BASE_URL=http://localhost:8788 node scripts/pruebas-acceso.mjs
```

La regresión de acceso cubre A–K, las comprobaciones de bypass, service worker y
la consola admin (37 checks). El issue P0 añade pruebas de superficie por rol y
el round-trip coach → cliente. Usan D1 de verdad, no dobles, para comprobar
atomicidad y persistencia.

## Frontera de datos del release

`clientes` y `rutinas` son tablas cloud en D1 (`migrations/0002_role_split.sql`).
El panel admin es el único que puede escribirlas y exige Cloudflare Access más la
cabecera secundaria. `/api/cliente` valida `sfm_sesion` y deriva el
`cliente_id` de esa sesión: ignora cualquier identidad que intente mandar el
navegador. Al iniciar o recargar, la app copia ese perfil y rutina a IndexedDB.

Series, sesiones, fotos, progreso y borradores siguen locales en este release;
no se presentan como datos compartidos entre dispositivos. El cliente no recibe
ninguna ruta ni control de edición de rutina, aunque intente abrir URLs antiguas.

Después de crear el D1 original, aplicar la frontera una sola vez:

```bash
npm run d1:migrar-roles
```

La secuencia termina con `0004_seed_santiago_routines.sql`: completa los cuatro
días de Santiago únicamente cuando la fila sigue estructuralmente vacía. Una
rutina con al menos un slot se conserva sin cambios, por lo que reaplicar la
migración es seguro. Ninguna de estas migraciones consume, revoca ni reemplaza
la invitación real de Santiago.

La ficha Coach/Admin calcula además `Estado de programación` para cualquier
cliente. Sólo permite generar el enlace cuando existen exactamente cuatro días
y cada uno tiene entre 5 y 8 ejercicios válidos. La vista previa permanece
disponible para inspeccionar estados incompletos.

## Vuelta atrás

Si hubiera que bloquear temporalmente también al participante, se puede ampliar
la aplicación de Cloudflare Access al hostname completo desde su panel. El
middleware seguirá exigiendo la sesión por debajo; no hay una variable de
entorno que lo desactive.

## Configuración vigente en Cloudflare

| | |
|---|---|
| Aplicación de Access | **Santiago Fitness Method** |
| Destinos | `santiago-fitness-method.pages.dev/admin` (y descendientes) + `*.santiago-fitness-method.pages.dev` |
| Política | `Cliente y coach` · Allow · lista explícita de correos |
| Método de entrada | One-time PIN |
| Sesión | 1 semana, heredada por la política |
| Base D1 | `santiago-acceso` · `7cb38489-4054-45e9-94d9-aad9c9f533f5` |

El comodín se conserva para proteger las URLs hash de Pages, que permanecen
visitables aunque cambie el despliegue canónico. No cubre el dominio canónico
sin subdominio, por lo que un participante puede abrir `/access?t=…` y entrar
sin pasar por Cloudflare Access. Revisar por separado cualquier dominio
personalizado que se añada.

## El cliente técnico de QA

`dayan-test` (*QA Role Split*) existe para probar roles, impersonación y
programación sin tocar los datos de nadie real. **Su fila en D1 se conserva
siempre**: se oculta, no se borra, porque preview usa la misma base de datos que
producción y el historial de QA sigue haciendo falta.

Lo decide una bandera explícita, no el nombre del host:

| Entorno | `SHOW_QA_CLIENTS` | `dayan-test` |
|---|---|---|
| Producción | `"false"` | invisible e inoperable |
| Preview y desarrollo | `"true"` | visible y operable |

Si la variable falta, se comporta como producción. Fallar ocultando es el error
inofensivo; el contrario enseñaría un cliente de pruebas al coach como si fuera
real.

El filtro es de servidor, no de CSS. Se aplica en la lista del panel, en el
resumen de estado, en `/admin/api/clientes`, en la ficha por `?cliente=` y en las
mutaciones POST — incluida la impersonación, que sin cliente cae en QA por
defecto. La regla vive en `functions/lib/qa.ts` (`esClienteQa`, `qaHabilitado`)
para que todas las superficies apliquen exactamente la misma.

La clasificación va por id reservado, suficiente para un único cliente técnico.
Si algún día hay varios, toca una columna `es_qa` en `clientes`.

Comprobación: `scripts/pruebas-qa.mjs`, ejecutado dos veces contra el mismo
servidor con `QA_ESPERADO=true` y `QA_ESPERADO=false`.

## Consola del coach

Organizada por pantallas, cada una con una sola pregunta. El estado vive en la
URL, el servidor renderiza todo y no hace falta JavaScript:

| Ruta | Pregunta |
|---|---|
| `/admin/` | ¿A quién gestiono? |
| `/admin/?cliente=X&seccion=programa` | ¿Qué quiero gestionar? |
| `…&seccion=programa&dia=N` | ¿Qué día? |
| `…&seccion=programa&dia=N&ejercicio=O` | ¿Qué ejercicio? |
| `…&seccion=perfil[&grupo=G]` | ¿Qué datos del cliente? |
| `…&seccion=acceso` | ¿Cómo entra este cliente? |

Guardar redirige al nivel desde el que se guardó, así que no se pierde el
contexto. La vuelta atrás es siempre el nivel de arriba.

Reordenar es un modo (`&modo=reordenar`), no flechas permanentes en cada fila.
Quitar un ejercicio pasa por una pantalla de confirmación
(`&confirmar=quitar`): el POST destructivo no existe en ninguna otra vista.

Comprobación: `scripts/pruebas-admin-ui.mjs`. Necesita un cliente visible con
ejercicios; si no lo encuentra, lo dice y se omite en vez de fallar.
