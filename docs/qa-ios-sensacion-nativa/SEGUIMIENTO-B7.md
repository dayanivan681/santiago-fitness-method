# Seguimiento de B7 en simulador — 2026-10-20

El dueño ya confirmó en su iPhone físico los puntos 3, 7, 9 y B7, según el
handoff de Claude Code publicado en `559780a`. **B7 permanece cerrado para ese
recorrido físico.** Este seguimiento documenta únicamente el simulador SE,
iOS 27.0 build 24A434; no sustituye esa prueba ni demuestra un fallo físico.

- Se eliminó desde la interfaz el icono antiguo de producción y se instaló de
  nuevo desde `/entrar`. El icono nuevo guarda título Santiago FM, URL raíz y
  una pantalla de inicio de 750×1334. El formulario se abre sin toolbar de Safari.
- [Secuencia de producción](se-seguimiento-produccion.jpg): fotogramas 109–144
  de `se-produccion-arranque1.mp4`, orden de decodificación. Durante la retirada
  del logo hay un aclarado y después aparece el formulario oscuro; cinco
  fotogramas superan YAVG 170, máximo 206,262. No se atribuye duración a esos
  fotogramas: grabaciones de simctl presentan marcas de tiempo discontinuas.
- [Control mínimo](se-seguimiento-control.jpg): fotogramas 32–55 de
  `se-control-arranque.mp4`. HTML estático, sin JavaScript, React, CSS externo,
  redirección ni service worker; fondo #0b0c0d inline en html/body, color-scheme
  dark, manifest y el mismo PNG de inicio. También se aclara al retirar el logo,
  con menor intensidad (máximo YAVG 120,062 tras aparecer el splash).
- El control no permite atribuir la transición a React. Es compatible con una
  transición de composición de iOS; **la causa nativa es una inferencia** y no
  se ha demostrado un cambio de producto que la elimine.
- Referencia primaria consultada: [WebKit 311569](https://bugs.webkit.org/show_bug.cgi?id=311569),
  reporte abierto de destellos en PWA con fondos oscuros y mitigaciones tempranas.
  Su existencia no prueba que sea el mismo defecto ni una solución aplicable.
- No se cambió código de producto. Vídeos, control y logs originales en
  `/tmp/sfm-b7-seguimiento/` (temporales). Se detuvieron los servidores 4199,
  4446 y 8788 y se apagó únicamente el SE de QA. La aprobación automática rechazó
  la limpieza del icono temporal B7 control y el cierre del puente Maestro por
  stdin, sin motivo adicional; quedan como restos locales. No afectan producción.

La última secuencia automatizada destinada a abrir la demo volvió a mostrar el
control estático. No se cuenta como QA de la demo ni como una prueba nueva de B8/B9.
La instalación desde acceso y Hoy raíz del 16 Pro tampoco se repitieron en este
seguimiento. La prueba física citada arriba es del dueño, no de Codex.
