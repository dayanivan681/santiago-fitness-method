# Evidencia de QA iOS — 20 de octubre de 2026

La matriz y los límites están en [HANDOFF](../HANDOFF.md). Capturas reales del
simulador o fotogramas extraídos de grabaciones de `simctl`; no son mockups.

- `16-fallo-descanso.jpg`, `se-fallo-descanso.jpg`: producción, tarjeta cubierta.
- `se-fallo-inicio-blanco.jpg`, `se-fallo-inicio-secuencia.jpg`: instalación nueva
  desde `/entrar` de producción; falta de splash y blanco prolongado.
- `se-demo-fuera-pwa.jpg`: el mismo icono abre la demo fuera del scope instalado.
- `se-login-local-origen.jpg`: POST de Safari rechazado por Origin:null, solo local.
- `se-destello-residual.jpg`: fotograma claro durante el arranque local después de
  añadir los metadatos. No prueba un fallo de hardware físico; B7 sigue pendiente.
- Las demás imágenes muestran el logo, header, borde, progreso corregido y la raíz
  autenticada de un cliente ficticio local. La secuencia del SE puede contener el
  nombre Lucía QA; no es una cuenta real del cliente.
- `mediciones.json`: geometría/hit tests y eventos de Safari iOS.
- `safari-origen.json`: dos formularios aislados de prueba en Safari iOS, políticas
  no-referrer y strict-origin. No contiene cookies ni credenciales.

Los vídeos y guiones adicionales quedan en `/tmp/sfm-ios-nativa-qa/` y no se
consideran almacenamiento permanente. Los JPG y JSON de esta carpeta sí quedan
en Git. El PR #8 se incorporó a main con el «Hágale» del dueño: merge `cef5e2e`,
producción Pages `b711d85e`. `produccion-integracion.json` registra la verificación
HTTP de publicación, sin una nueva prueba nativa. El destello residual sigue pendiente.
