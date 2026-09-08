# QA v2 · ejecución y evidencia

Estado al 8 de septiembre de 2026: validación en curso. Producción no migrada.

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

- Suite completa: 691 pruebas en 64 archivos PASS (`tests-v2-13.log`),
  incluyendo demo real sin red/IndexedDB/Storage. Lint y build aprobados.
- API local: 35 comprobaciones PASS, `.recovery/http-v2.log`.
- Maestro Chromium: 34 comandos PASS (repetido en build v2 actualizado): completar, editar, descanso manual,
  Biblioteca, búsqueda, retorno al ejercicio, cierre y resumen.
- Revocación de Coach: prueba adicional comprueba que la pantalla desmonta datos
  privados al detectar el acceso revocado, incluso fuera de un workout.
- Fotos: PUT/GET local con R2 simulado y lectura anónima rechazada; cloud R2 no
  validado hasta activar el servicio y bindings aislados.
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

## Pendientes explícitos

- QA autenticado del deployment de staging con Cloudflare Access real.
- Completar QA autenticado remoto y estados de error offline en dispositivos reales.
- R2 remoto, recuperación de subida interrumpida y lectura desde otro dispositivo.
- Safari de iPhone y PWA instalada: NO VERIFICADOS. El único dispositivo de Maestro
  disponible es Chromium; su jerarquía no constituye evidencia de iOS.
- Producción: migración y deployment final pendientes; sólo lectura al verificar.

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

Se intentó QA con iPhone Mirroring: «iPhone in Use», requiere que el dueño bloquee
su iPhone para conectar. No se interrumpió su uso y no se declaró Safari aprobado.
