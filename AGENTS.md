# Coordinación de agentes

Lee `CLAUDE.md` y `docs/HANDOFF.md` antes de trabajar. Codex y Claude Code usan el
mismo protocolo: turnos serializados en `main`, sincronización con Git antes de
reclamar, y publicación del resultado mediante los comandos `handoff`.

Codex debe identificarse como `codex`:

```bash
npm run handoff:status
npm run handoff:sync
npm run handoff:claim -- --agent codex --task "Describe la tarea concreta"
```

Al terminar, ejecuta las pruebas y publica con:

```bash
npm run handoff:publish -- \
  --agent codex \
  --status complete \
  --summary "Describe los cambios realizados" \
  --checks "npm test; npm run lint; npm run build" \
  --next "Indica el siguiente paso o escribe ninguno"
```

Nunca modifiques `docs/cliente`; es la fuente de requisitos del cliente y permanece en
solo lectura.
