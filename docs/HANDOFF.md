# Handoff de Santiago Fitness Method

Este archivo es el registro compartido entre Codex y Claude Code. GitHub es la fuente
de verdad del código y este archivo es la fuente de verdad del turno actual. La
colaboración automática es deliberadamente serializada: un agente reclama el turno,
trabaja y lo publica antes de que el otro continúe.

## Estado actual

- **Owner:** claude-code
- **Status:** active
- **Rama coordinada:** `main`
- **Repositorio:** https://github.com/dayanivan681/santiago-fitness-method
- **Última sincronización:** 2026-08-23T04:33:59.477Z

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

Si el árbol ya estaba sucio antes del handoff, revisar primero el diff y adoptar esos
cambios de forma intencional con `npm run handoff:adopt -- --confirm --agent <agente> --task "..."`.
Ese comando crea un commit de adopción; nunca se deben borrar esos cambios para liberar
el turno.

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

### 2026-08-23T04:33:59.478Z | claude-code | ADOPT
- **Estado:** active
- **Tarea:** Implementar las brechas prioritarias de QA del piloto
- **Cambios adoptados:** docs/PLAN-FEEDBACK-CLIENTE.md, src/App.tsx, src/aplicacion/useCoach.ts, src/aplicacion/useEntrenamiento.ts, src/aplicacion/useHistorial.ts, src/aplicacion/usePerfil.ts, src/aplicacion/useVolumen.ts, src/datos/esquema.ts, src/datos/repositorio.ts, src/datos/repositorioLocal.test.ts, src/datos/repositorioLocal.ts, src/datos/semilla/index.ts, src/dominio/tipos.ts, src/index.css, src/logica/plantilla.test.ts, src/logica/plantilla.ts, src/logica/sugerencia.test.ts, src/logica/sugerencia.ts, src/pantallas/Coach/Coach.test.tsx, src/pantallas/Coach/Coach.tsx, src/pantallas/Coach/EditorSlot.tsx, src/pantallas/EntrenamientoHoy/EntrenamientoHoy.test.tsx, src/pantallas/EntrenamientoHoy/EntrenamientoHoy.tsx, src/pantallas/EntrenamientoHoy/TarjetaEjercicio.tsx, src/pantallas/Perfil/FichaParticipante.tsx, src/pantallas/Perfil/Perfil.test.tsx, src/pantallas/Perfil/Perfil.tsx, src/pruebas/configuracion.ts, src/datos/imagen.test.ts, src/datos/imagen.ts, src/dominio/progresion.ts, src/logica/participante.test.ts, src/logica/participante.ts, src/logica/progresoFisico.test.ts, src/logica/progresoFisico.ts, src/pantallas/Alta/, src/pantallas/Perfil/CamposParticipante.tsx, src/pantallas/Perfil/PanelProgreso.test.tsx, src/pantallas/Perfil/PanelProgreso.tsx, src/pruebas/participante.ts
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### Línea base antes del handoff

- 184 pruebas pasaban en 18 archivos.
- El build de producción pasaba.
- El lint no tenía errores, pero mostraba tres warnings de React.
- La configuración inicial quedó publicada en el commit `37d5c17`.
