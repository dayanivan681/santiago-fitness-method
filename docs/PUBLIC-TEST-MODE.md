# Demo pública y pruebas

El modo público anterior está retirado. `PUBLIC_DEMO_CLIENT_ID`, la apertura
temporal de Coach y las previews que generaban sesiones reales ya no existen
en la implementación v2.

`/demo` presenta Coach y Cliente con personas ficticias y repositorio en memoria.
Recargar reinicia la simulación. Usa componentes reales y no abre IndexedDB ni
llama APIs privadas. `/presentacion` enlaza a esta misma demo.

La demo ofrece una bienvenida breve por rol y ayuda contextual descartable.
El Coach crea una persona y revisa/publica su plan; el Cliente practica su
primera serie. No hay capítulos secuenciales ni bloqueo de navegación o scroll.
«Ayuda» contiene instrucciones opcionales por rol y no modifica datos. Cierres,
tareas completadas y la persona creada se conservan en memoria hasta recargar.
Este onboarding no está habilitado en cuentas reales.

La vista previa dentro de Coach lee sólo datos autorizados y simula cambios en
memoria. «Entrenar juntos» es una acción real distinta, con autor registrado.

Las escrituras de QA se limitan a staging o al runtime local aislado. Producción
sólo admite QA de lectura. Ver [QA v2](QA-V2.md) y [arquitectura](ARQUITECTURA-V2.md).
El release canónico se identifica en HANDOFF; este documento describe v2.

Entrada de revisión permanente sin OTP para Santiago:
https://codex-premium-v2.santiago-fitness-method.pages.dev/demo/coach

Cloudflare Access contiene la aplicación `Santiago · Demo pública`
(`ae649139-87e2-49d5-943c-dcaf01917213`) y la política Bypass/Everyone
`Demo sin inicio de sesión` (`26b25359-d457-48c8-82d7-6e8c9cc403e1`). Sólo aplica
al hostname exacto `codex-premium-v2.santiago-fitness-method.pages.dev` y a estas
rutas: `/demo`, `/assets`, `/ejercicios`, `/fuentes`, `/favicon.svg`,
`/apple-touch-icon.png`, `/manifest.webmanifest`, `/icon*`. La regla no tiene
vencimiento. No incluye raíz, Admin, API ni otros deployments.

La aplicación privada `Santiago Fitness Method` y su audiencia siguen intactas.
Al publicar v2 en el hostname canónico, `/demo` será igualmente pública por el
middleware; la excepción del alias sólo permite enseñar avances ya revisados.

## Descanso automático — decisión del dueño, 2026-09-13

Al completar y guardar cada serie, el entrenamiento inicia el descanso del
Coach. Aplica también a series marcadas como calentamiento; cero segundos no
muestra temporizador. Omitir lo cierra y +30s añade tiempo. Corregir una serie
no lo reinicia; terminar la sesión lo cierra tras confirmar el guardado.
Se aplica a Cliente real, demo y simulación de Vista previa. Esta decisión
sustituye el comportamiento manual descrito en los PDFs, que permanecen intactos.

## Peso sugerido y opciones de serie — 2026-09-15

El Coach puede indicar un peso sugerido opcional en Prescripción, en las mismas
libras que registra el Cliente (por lado cuando corresponde). Cero es válido;
vacío conserva el historial como punto de partida. La sugerencia publicada
precede al historial al comenzar; una serie guardada, borrador o ajuste del
Cliente se conserva. La siguiente serie toma lo utilizado hoy. Las reps del
historial se precargan dentro del rango vigente; los registros reales no se
recortan. Una variante distinta no hereda el peso de la original.

El campo opcional viaja con el plan y la prescripción histórica de la sesión;
los planes anteriores siguen siendo válidos y no requieren migración. Si hay
peso del Coach, se muestra identificado y no otra carga calculada contradictoria.
Más opciones se abre dentro del contenido, con Cerrar opciones, Escape y cierre
al tocar fuera. Cerrar conserva técnica, calentamiento y nota, sin guardar la serie.
