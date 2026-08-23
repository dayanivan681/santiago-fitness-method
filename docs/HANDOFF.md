# Handoff de Santiago Fitness Method

Este archivo es el registro compartido entre Codex y Claude Code. GitHub es la fuente
de verdad del código y este archivo es la fuente de verdad del turno actual. La
colaboración automática es deliberadamente serializada: un agente reclama el turno,
trabaja y lo publica antes de que el otro continúe.

## Estado actual

- **Owner:** unassigned
- **Status:** needs-review
- **Rama coordinada:** `main`
- **Repositorio:** https://github.com/dayanivan681/santiago-fitness-method
- **Última sincronización:** 2026-08-23

Hay cambios sin commit que existían antes de instalar este protocolo. No se han
tocado ni incluido en esta configuración:

- `docs/PLAN-FEEDBACK-CLIENTE.md`
- `src/pantallas/EntrenamientoHoy/EntrenamientoHoy.test.tsx`
- `src/pantallas/Perfil/Perfil.test.tsx`
- `src/pruebas/configuracion.ts`

El primer agente que adopte esos cambios debe revisarlos explícitamente y publicar su
resultado. No se deben borrar ni sobrescribir para liberar el turno.

## Protocolo

1. Consultar el estado: `npm run handoff:status`.
2. Sincronizar una copia limpia: `npm run handoff:sync`.
3. Reclamar el turno: `npm run handoff:claim -- --agent <codex|claude-code> --task "..."`.
4. Trabajar solo en la tarea reclamada.
5. Ejecutar pruebas, lint y build.
6. Publicar: `npm run handoff:publish -- --agent <agente> --status <complete|blocked> --summary "..." --checks "..." --next "..."`.

Los comandos de claim y publish hacen commit y push automáticamente. Se detienen si
hay cambios remotos, cambios sin dueño o cualquier modificación dentro de
`docs/cliente`.

## Requisitos de QA compartidos

- Sesiones de 5 a 8 ejercicios.
- Registro por serie de peso, repeticiones, RIR y descanso.
- Última sesión y mejor referencia separadas.
- Historial independiente por variante.
- Sustituciones sin destruir historiales.
- Temporizador manual.
- Autosave, recuperación y corrección de datos.
- Historial después de completar una sesión.
- Perfil, limitaciones y volumen semanal.

## Registro de turnos

<!-- HANDOFF-ENTRIES -->

### Línea base antes del handoff

- 184 pruebas pasaban en 18 archivos.
- El build de producción pasaba.
- El lint no tenía errores, pero mostraba tres warnings de React.
- La configuración inicial quedó publicada en el commit `37d5c17`.
