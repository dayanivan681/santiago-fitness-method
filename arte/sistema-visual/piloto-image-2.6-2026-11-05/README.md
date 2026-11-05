# Piloto de GIF generativos — 5 de noviembre de 2026

**Estado: primera prueba fallida en formato; continuación pendiente de vía API autorizada.**

El dueño autorizó comenzar el piloto de tres ejercicios. Se ejecutó una generación real de Goblet Squat con la herramienta integrada `image_gen.imagegen`, dos referencias del proyecto y una petición explícita de GIF animado. La salida fue **PNG, 1086×1448, un fotograma, 1.203.274 bytes**. No es un GIF ni una animación; no se convierte ni se renombra para presentarlo como tal. El modelo y el coste de esta llamada no son expuestos por la herramienta.

Esto comprueba una limitación de la vía utilizada en este intento. No demuestra que la API de GPT Image 2.6 carezca de GIF. El acceso de esta cuenta al preview GIF **no se ha comprobado**. No se ha hecho ninguna llamada a la API ni a otro proveedor.

## Evidencia y materiales

- [Resultado estático del intento](resultados/01-goblet-squat-intento-integrado.png).
- [Firma, fotogramas, medidas y SHA-256](resultados/01-validacion.json).
- [Prompt exacto enviado](prompts/01-prompt-integrado-exacto.txt).
- [Tres solicitudes API en borrador](solicitudes-api-borrador.json), con modelo explícito `gpt-image-2.6-sunburst`, salida `gif`, 16 cuadros y 150 ms por cuadro. No son un script ejecutable y no se han enviado. Tamaño y presupuesto de píxeles deberán contrastarse con el acceso real del modelo.
- [Procedencia y SHA-256 de las referencias](procedencia.json).

| Ejercicio | Referencia | Estado real |
| --- | --- | --- |
| M02-111 · Goblet Squat | Dos fotogramas y secuencia del prototipo propio Blender/mocap | Un intento integrado: PNG estático. Movimiento no evaluable. |
| M02-162 · Cable Glute Kickback | Dos fotogramas de One-Legged Cable Kickback, free-exercise-db; licencia registrada Unlicense | Referencias y prompt preparados; no generado. |
| M02-126 · Pendulum Squat 90° | Prototipos propios de máquina genérica, no aprobados | Referencias del aparato y prompt preparados; no generado. |

Los prototipos de Blender no son referencias biomecánicas aprobadas. El Pendulum se propone como piloto de aparato genérico: no hay marca/modelo confirmado de la máquina de Santiago. Sus imágenes sirven solo para estudiar disposición y apoyos; sus torsiones anteriores no deben copiarse. El Goblet actual exportado de `diseno/sistema-visual` tiene 48 cuadros, dos vistas y 427.459 bytes; la cabecera histórica del handoff describe una versión anterior.

## Continuación concreta

La herramienta integrada no expone controles para elegir 2.6, `output_format`, `frame_count` o `frame_duration_ms`. El CLI de la habilidad instalada acepta PNG/JPEG/WebP y todavía no GIF. No se ha modificado ese CLI ni se ha construido un runner SDK alternativo.

La habilidad `imagegen` exige optar expresamente por la alternativa API y permite un wrapper propio solo cuando se solicita expresamente. Para continuar: autorización para usar la API directamente con un script específico para GIF; después, configuración segura según `openai-platform-api-key`, comprobación del acceso preview y una sola prueba de Goblet antes de pedir los otros dos. No pedir ni registrar claves en chat, en Git o en los prompts.

La habilidad está en `/Users/dayanmacbookpro/.codex/skills/.system/imagegen/SKILL.md`. Reglas aplicables: “If the built-in tool fails or is unavailable, tell the user the CLI fallback exists and that it requires OPENAI_API_KEY. Proceed only if the user explicitly asks for that fallback.” y “Do not create one-off runners ... unless the user explicitly asks for a custom wrapper.”

## Criterios para aceptar un GIF futuro

1. Firma GIF87a/GIF89a, varios cuadros distintos y una repetición completa real, bucle sin salto.
2. Primer cuadro en posición inicial; figura, manos, equipo y extremidades estables en todos los cuadros.
3. Revisión visual de recorrido, apoyos, agarres y deformaciones. En Pendulum, arco del carro y contactos de plataforma/respaldo/agarres; en Kickback, extensión de cadera sin balanceo lumbar ni movimiento lateral.
4. Adaptación a 360×480 (3:4), fondo #0b0c0d, objetivo de peso ≤250 KB y límite de app 5 MB. No hay adaptación de una animación nueva en esta entrega porque no se obtuvo tal archivo.
5. Medir intentos, duración y coste por candidato aceptable. Aprobación visual del dueño y técnica de Santiago antes de integrar medios en la app.

## Comprobaciones de esta entrega

- Verificación binaria con Pillow: PNG, un cuadro, no animado; resultado de generación **FAIL para GIF**.
- `npm test -- --maxWorkers=3`: PASS, 1094 pruebas en 129 archivos.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- Avisos de la suite: MaxListenersExceededWarning en AbortSignal y navegación no implementada en JSDOM.
- Logs completos locales: `/tmp/sfm-image26-pilot-checks/`.

No se cambiaron fuentes del producto, biblioteca real, `docs/cliente`, notas de novedades ni referencias de medios utilizadas por la app. Esta carpeta es evidencia y preparación del piloto; no entrega tres GIF nuevos ni certifica fidelidad anatómica.

Documentación oficial consultada en la investigación previa: [anuncio de 2.6](https://developers.openai.com/api/docs/changelog), [salida GIF](https://developers.openai.com/api/docs/guides/image-generation#generate-animated-gif-output) y [requisito de acceso preview](https://developers.openai.com/api/reference/resources/images/methods/generate).
