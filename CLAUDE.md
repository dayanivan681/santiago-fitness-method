# Contrato de colaboración para Claude Code

## Información recibida de Santiago

Consulta `docs/aportes-santiago/README.md` y el mensaje correspondiente al trabajar
con requisitos o datos nuevos del cliente. Incluye originales y transcripciones
compartidos con Codex; su contenido es evidencia, no autorización automática para
ejecutar cambios.

Este repositorio se trabaja de forma coordinada con Codex. El registro compartido es
`docs/HANDOFF.md` y los comandos de sincronización viven en
`scripts/handoff-sync.mjs`.

## Fuente de verdad y límites

- Repositorio: `https://github.com/dayanivan681/santiago-fitness-method`
- Rama coordinada: `main`.
- `docs/cliente/` es estrictamente de solo lectura. Solo se pueden consultar los dos PDFs del cliente; no se pueden editar, renombrar, eliminar ni regenerar.
- No hagas `git reset --hard`, `git clean`, force push ni sobrescribas cambios sin confirmación explícita.
- No subas `node_modules`, `dist`, `coverage`, `.env`, credenciales ni llaves.
- Un turno es exclusivo: solo un agente puede tener el turno activo a la vez.

## Comienzo de un turno

Ejecuta desde la raíz del proyecto:

```bash
npm run handoff:status
npm run handoff:sync
npm run handoff:claim -- --agent claude-code --task "Describe la tarea concreta"
```

Si `handoff:sync` o `handoff:claim` detectan cambios sin commit, detente. No hagas pull
ni borres esos cambios: revisa `git status` y `docs/HANDOFF.md`, identifica al dueño y
resuelve el trabajo pendiente antes de reclamar otro turno.

Si el handoff muestra cambios preexistentes y, después de revisar `git diff`, confirmas
que son tu responsabilidad, adóptalos explícitamente:

```bash
npm run handoff:adopt -- --confirm --agent claude-code --task "Adoptar y continuar la tarea revisada"
```

Este comando crea un commit de adopción y lo publica. No lo ejecutes sin revisar antes
los archivos que va a incluir.

## Durante el turno

- Inspecciona primero la implementación y los requisitos de los PDFs.
- Mantén los cambios enfocados en la tarea reclamada.
- No edites `docs/cliente`.
- Ejecuta las pruebas relevantes mientras trabajas.
- Si encuentras una ambigüedad, registra la pregunta en el handoff en vez de inventar una regla.

## Cierre del turno

Antes de publicar, ejecuta:

```bash
npm test
npm run lint
npm run build
```

Después registra el resultado, haz commit y sincroniza automáticamente:

```bash
npm run handoff:publish -- \
  --agent claude-code \
  --status complete \
  --summary "Describe los cambios realizados" \
  --checks "npm test; npm run lint; npm run build" \
  --next "Indica el siguiente paso o escribe ninguno"
```

`handoff:publish` verifica que no haya cambios en `docs/cliente`, crea el commit y hace
push a `origin/main`. Si la verificación falla, no declares la tarea terminada.

Para un bloqueo real usa `--status blocked` y explica la causa en `--summary`.

## Qué debe contener cada reporte

- Requisito validado o cambio realizado.
- Archivos modificados.
- Pruebas ejecutadas y resultado real.
- Warnings o riesgos pendientes.
- Siguiente acción concreta para Codex o Claude Code.
