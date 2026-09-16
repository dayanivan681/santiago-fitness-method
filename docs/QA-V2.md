# QA v2 · ejecución y evidencia

Estado al 9 de septiembre de 2026: QA de release completado en staging y navegador.
El estado del rollout productivo está en HANDOFF. Safari/PWA física no verificados.

## Entorno local

```sh
npm run build
npm run qa:preparar -- --local
npm run qa:servir
```

En otra terminal, `npm run qa:acceso` sirve un proxy sólo en 127.0.0.1:8789.
`/qa/cliente` abre el cliente sintético; `/admin` usa el JWT firmado local.
Los archivos de acceso viven en `.qa-local`, no se imprimen ni se suben a Git.
Repreparar crea otro fixture y otra clave: reiniciar el runtime después.

```sh
npm run test:http
npm run test:movil
```

`test:http` verifica la API real de Functions en localhost:8788. Sus 35
comprobaciones incluyen JWT falsificado, roles, onboarding atómico, invitación de
un uso, filtrado de notas, identidad impuesta por servidor, CSRF, reintentos,
preview de lectura y revocación. Las cuatro entradas históricas `pruebas-acceso`,
`pruebas-roles`, `pruebas-admin-ui` y `pruebas-qa` son aliases de esta suite; no
son cuatro suites independientes ni se cuentan los antiguos checks HTML.

`test:movil` ejecuta `pruebas-maestro/qa-v2.yaml` con Maestro instalado. También
puede ejecutarse ese archivo mediante Maestro MCP en Chromium. La demo usa
componentes reales en memoria y ninguna persona productiva. El flujo histórico
`qa-movil.yaml` remite al vigente; ya no prepara `dayan-test` ni sesiones reales.

## Evidencia obtenida

- Suite completa: 701 pruebas en 69 archivos PASS (`sfm-release-tests-final.log`),
  incluyendo demo real sin red/IndexedDB/Storage. Lint y build aprobados.
- API local: 35 comprobaciones PASS, `sfm-release-http-final.log`.
- Maestro Chromium: 34 comandos PASS (repetido en build v2 actualizado): completar, editar, descanso manual,
  Biblioteca, búsqueda, retorno al ejercicio, cierre y resumen.
- Revocación de Coach: prueba adicional comprueba que la pantalla desmonta datos
  privados al detectar el acceso revocado, incluso fuera de un workout.
- Fotos: R2 privado real en staging; consentimiento requerido, compartir y retirar
  acceso del Coach, cola offline recuperada sin duplicación y dos imágenes
  sintéticas de 400×400 descargadas desde un segundo navegador.
- Invitación: formulario real local y remoto canjeado correctamente en IAB y
  Chrome; URL sin token después de entrar. strict-origin evita Origin null sin
  aceptar orígenes externos.
- Offline remoto: reabrir, comenzar, registrar y cerrar una sesión sin red;
  sincronizar y leer desde otro navegador 2.5 lb/lado × 1, RIR 2. Cinco pruebas
  cubren contexto válido, antiguo, vencido, revocado y fallo HTTP de servidor,
  incluso cuando navigator.onLine indica conexión.
- Onboarding remoto: borrador de Marina QA iniciado en IAB y retomado en Chrome;
  creación atómica, sesión acompañada y preview sin actividad cloud adicional.
- Autoguardado remoto: una edición añade una versión (33 → 34) y posteriores
  refrescos mantienen 34, evitando el bucle anterior.
- Migración: exportación reciente de producción, restauración aislada e iteración
  doble de 0008/0009; 6 clientes, 24 rutinas, 37 accesos y 13 invitaciones
  conservados. Se ensayó también staging. Manifiestos privados en `.recovery`.

## QA visual

Se han revisado Cliente a 320, 375, 390, 430, 768 y 1024 px, y Coach a 320 px
y las hojas a 375/430, lista a 390 y ficha a 768/1024 px. Las mediciones observadas no muestran overflow horizontal ni
controles principales inferiores a 48 px. No equivale a cubrir cada pantalla en
cada tamaño: completar la matriz antes de declarar aprobación visual total.

Respecto a los conceptos: paleta negra/blanca con rojo contenido; Barlow y números
protagonistas; superficies planas y separadores discretos; imágenes útiles del
catálogo; tres destinos persistentes y una sola serie activa. No se han usado
imágenes generadas como instrucciones técnicas de variantes.

La ficha a 1024 px usa lista y detalle. Se revisaron nombres largos y hojas de
prescripción con campos de 17 px, teclado numérico y controles de al menos 48 px.
El estado vacío de búsqueda tiene mensaje y acción para recuperar la lista.

Se corrigieron durante QA: contraste del temporizador, diferencia de ancho entre
barra de descanso y navegación, y scroll retenido al abrir Biblioteca. El
readback a 390 px confirma texto claro sobre #202124 y barras sin solapamiento.

## Límites explícitos

- QA autenticado remoto realizado con Cloudflare Access real y personas sintéticas.
- La recuperación de subida se comprobó mediante pérdida de red y cola durable;
  no se simuló un corte físico del dispositivo a mitad de un paquete de red.
- Safari de iPhone y PWA instalada: NO VERIFICADOS. El único dispositivo de Maestro
  disponible es Chromium; su jerarquía no constituye evidencia de iOS.
- Producción: sólo lectura durante QA; consultar HANDOFF para el rollout.

## Entrada pública para Santiago

Desde el 2026-09-08 la demo del alias `codex-premium-v2` abre sin login.
Comprobación anónima: Coach/Cliente, fuentes, favicon y manifiesto 200; Admin y
APIs privadas continúan redirigiendo a Access. Readback visual a 390 px, imágenes
cargadas y cambio entre roles confirmado. No se cambió la política de datos reales.

En una repetición de Maestro el controlador perdió una referencia al campo de
reps; inspección y repetición del flujo completo dieron 34 comandos PASS. No se
oculta esa intermitencia ni se interpreta el resultado como aprobación de Safari.

La prueba antigua de notas del perfil coincidía transitoriamente con el textarea
que se desmontaba al guardar. Ahora exige la nota en el párrafo de lectura y su
persistencia; la suite completa de 691 pasa con esa comprobación estable.

La suite HTTP usa dos invitaciones y sesiones independientes del mismo cliente:
la segunda recupera las series de D1 sin una copia local, y la revocación bloquea
ambas. Resultado actualizado: 35 comprobaciones PASS.

El usuario descartó expresamente el iPhone físico. No volver a intentar Mirroring.
El último flujo Maestro se ejecutó por CLI con un Chromium nuevo: 34 comandos
PASS (`sfm-maestro-final.log`). El controlador MCP anterior apuntaba a una ventana
cerrada y no ejecutó comandos; no se cuenta ese intento como una prueba aprobada.

La guía de demo en español se verificó local y remotamente a 320/375/390/430/768/
1024 px: bienvenida, retorno, cambio a Cliente, ayuda y onboarding ficticio;
sin errores de ejecución, overflow ni controles inferiores a 48 px en la guía.

## Revisión y arreglos del 2026-09-15

E2E completo sobre `0fea287` (tipado, suites, API local, Maestro, navegador y
producción en lectura). El producto pasó de punta a punta; falló la red que debía
vigilarlo. Tres arreglos:

**1. El flujo de Maestro estaba roto desde `f996e07` y nadie lo notó.** Tres causas,
todas en el test y ninguna en la app: la demo abre sola «Prueba tu primera serie» y
el diálogo se tragaba el primer toque —el flujo acababa en Lower A sin haber elegido
Upper A—; «Completar serie» carga bajo la barra de pestañas y el toque caía en la
barra; y desde `1b46fa1` el descanso arranca solo y su botón dice «Omitir». Corregido
en `qa-v2.yaml`, con las tres decisiones explicadas en su cabecera.

Lección para futuras revisiones: los tests de jsdom disparan eventos sobre los
elementos y **atraviesan las capas**. Un diálogo encima de un botón o un control
tapado por una barra no los rompe. Sólo Maestro los ve.

**2. La app salía sin CSP ni protección contra framing.** `/`, `/demo/*` y `/admin`
sirven el mismo index.html y sólo llevaban `Referrer-Policy` y `nosniff`: cualquier
web podía incrustar la app en un iframe. Nuevo `functions/lib/cabecerasShell.ts`,
aplicado en el middleware y en el handler de `/admin`. `frame-ancestors 'self'` y no
`'none'` a propósito: `/presentacion` incrusta `/demo/cliente` en su maqueta.
`public/_headers` no servía: sólo casa con `/` y `/index.html`, y `/demo/coach` llega
con las cabeceras por defecto de Cloudflare.

**3. La cobertura del 95 % era engañosa.** Medía sólo `dominio`, `logica` y `datos`:
594 sentencias de unas 18.000 líneas. Ampliada a `src`, `functions` y `shared`. Cifra
real y umbrales fijados en ese suelo, de modo que pueda subir pero no bajar:

| | Real | Umbral |
|---|---|---|
| Sentencias | 72,01 % | 72 |
| Ramas | 64,40 % | 64 |
| Funciones | 68,76 % | 68 |
| Líneas | 73,79 % | 73 |

Distancia al 80 % del contrato, por zona: `src/producto` 47,5 %, `src/nube` 55,2 %,
`functions` 66,1 %. El resto ya está por encima (`logica` 99,6 %, `datos` 89,9 %,
`pantallas` 89,1 %, `aplicacion` 88,5 %).

### Evidencia de esta revisión

- Suite completa 725 pruebas / 72 archivos PASS; `tsc -b`, lint y build limpios.
- API local: 35 comprobaciones PASS. Maestro Chromium: 34 comandos PASS con el flujo
  corregido, ejecutado desde el fichero del repositorio.
- Cabeceras en el runtime local: CSP y `X-Frame-Options: SAMEORIGIN` en `/`,
  `/demo/coach`, `/demo/cliente/entrenar` y `/admin`; `/presentacion` conserva la suya;
  APIs, `sw.js` y el manifiesto siguen sin tocar.
- Navegador sin una sola violación de CSP en: demo cliente completo, demo Coach,
  `/admin` real, `/qa/cliente` y `/presentacion` con su iframe cargando `/demo/cliente`.
- `qa:preparar --local` ya no acumula fichas: dos preparaciones seguidas dejan una
  sola «Lucía · QA aislado» (antes, una por ejecución).

### Pendiente y no verificado

- **Safari real de iPhone y PWA instalada siguen sin verificar.** Todo es Chromium.
- Cinco tests emitían avisos `act(...)` el 15 de septiembre por la mañana, con el
  navegador y dos servidores en marcha: `GuiaDemo`, `RecorridosDemo` (×3),
  `EntrenamientoHoy` (borrador) y `PanelProgreso` (borrar medición). **No se han
  podido reproducir** en seis suites completas, incluidas dos simultáneas para cargar
  la máquina. No se tocaron los tests: cambiarlos sin poder verificar el efecto
  arriesga debilitar sus aserciones. Si reaparecen, el patrón es una actualización
  asíncrona que llega después de la última aserción; se arregla esperando el estado
  final, no envolviendo código en `act`.
