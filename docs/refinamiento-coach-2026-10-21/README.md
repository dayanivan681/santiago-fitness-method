# Coach · revisión y propuestas visuales

Fecha: 2026-10-21. Turno `a383808`. El dueño acepta revisar/refinar el coach
después de completar el cliente en PR #11. Esta entrega contiene diagnóstico y
tres conceptos; **no cambia la app ni autoriza un diseño elegido de antemano**.

## Evidencia y resultado

[Auditoría con capturas, pasos y límites](AUDITORIA.md). Demo compilada local,
IAB a 390×844 y 1440×1024. Datos sintéticos: Alicia, Marcos y Nora. Se recorrieron:

| Paso | Pantalla/tarea | Salud observada |
|---|---|---|
| 1 | Hoy móvil y escritorio | Operativo; prioridades y contadores consumen demasiada altura. |
| 2 | Clientes y búsqueda por Alicia | Operativo; titular extenso antes de la lista. |
| 3 | Ficha/programa móvil y escritorio | Operativo; programa después de varias capas, lista lateral ya existente en escritorio. |
| 4 | Actividad | Operativa; navegación en dos niveles y contexto alto. |
| 5 | Preparar cambios | Operativo; borrador abierto y cancelado, sin guardar/publicar. |
| 6 | Prescripción | Operativa; hoja larga, cierre devuelve foco al ejercicio. |
| 7 | Biblioteca | Operativa; crear ejercicio antecede a buscar. |

No son bugs funcionales nuevos demostrados. Se revisan jerarquía, densidad y
consistencia; no se certifican VoiceOver, Safari nativo, instalación ni hardware.
No se probaron pagos, invitaciones, subida de medios o escritura real.

## Tres propuestas, en orden de aparición en el chat

Generadas por llamadas independientes a ImageGen con **las capturas actuales del
coach y el PNG del cliente aprobado adjuntos**. Cada salida se mostró una vez.
Objetivo 390×844; archivos 853×1844. Adaptación detallada de escritorio pendiente
de elegir dirección; conservar la relación existente entre lista y ficha.

1. [Propuesta 1](propuestas/1.png): Hoy con prioridades, programa de Nora como acción principal.
2. [Propuesta 2](propuestas/2.png): Personas primero, búsqueda y lista como superficie de trabajo.
3. [Propuesta 3](propuestas/3.png): Seguimiento en primer plano, actividad como entrada principal.

[Prompts completos](PROMPTS.md) y [referencias, archivos y hashes](REFERENCIAS.json).
Las imágenes son conceptos, no capturas de una interfaz implementada.

### Correcciones obligatorias al implementar

- **Propuesta 3 contiene un error de ImageGen:** Alicia aparece en «Pagos pendientes»
  con estado «Al día». No copiar esa lista ni cambiar su suscripción. El producto
  calcula los pendientes con `pagoPendiente`; hay 2 en la demo. Mantener un resumen
  numérico o usar exclusivamente los clientes que satisfagan ese cálculo.
- El icono Play que ImageGen dibujó en «Ver actividad» no significa vídeo. Usar un
  icono semántico de actividad/historial del catálogo existente, o solo texto.
- En propuesta 2, el resumen de sesiones no autoriza una página global de sesiones
  inexistente. Conservarlo como información, sin inventar el destino del chevron.
- El texto «Programa sin publicar» de 1 no sustituye las condiciones reales:
  mostrar el estado recibido y las razones de revisión existentes. No deducir
  falta de publicación únicamente de `revisado=false`.
- No copiar sombras, espaciados o tamaños que reduzcan el área táctil. Revalidar
  contraste de texto y CTA, nombres largos, foco, scroll y movimiento reducido.
- Tres clientes y 57 ejercicios son la demo, no cifras del negocio. La actividad
  de 18 oct está fuera de la semana actual 19–25 oct; 0 sesiones semanales es válido.
- El nuevo estilo debe quedar acotado al coach y conservar lo publicado del cliente,
  modelos, datos, permisos, invitaciones, borradores, validación y bi-series.

## Checks y siguiente

Base actual: `npm test -- --maxWorkers=3` **1054/1054, 123 archivos**;
`npm run lint`, `npm run build` con TypeScript y `git diff --check` PASS.
Avisos conocidos Node MaxListeners/JSDOM; consola de la app sin errores en lo revisado.
Estos checks validan la base, no un rediseño implementado.

**Siguiente:** el dueño elige 1, 2 o 3, o pide ajustes. Después concretar las
pantallas móvil/escritorio de esa dirección, implementar en rama con PR y preview,
verificar flujos y Safari y esperar visto bueno antes de merge. Sin vídeo,
mensajes a Santiago, funciones fuera del plan ni cambios en `docs/cliente`.
