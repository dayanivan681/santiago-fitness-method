# Santiago Fitness Method

Aplicación de entrenamiento para clientes y coach. Interfaz React/TypeScript con
Vite; servidor en Cloudflare Pages Functions, D1 y R2 privado.

## Retomar con Claude Code o Codex

Leer [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md) y el
[relevo vigente](docs/HANDOFF.md#relevo-para-claude-code--13-de-noviembre-de-2026).
El handoff incluye el estado del proyecto, los archivos del piloto de GIF, las
decisiones pendientes y el protocolo para reclamar y liberar el turno en `main`.

El código y los medios del piloto están en GitHub. Su revisión no requiere
recuperar Downloads, `/tmp` ni la conversación de ChatGPT. Los secretos y los
respaldos privados se mantienen fuera de Git.

## Instalación y demo local

Entorno comprobado: Node.js 20.19.6 y npm 10.8.2. La suite de servidor también
necesita SQLite disponible en `/usr/bin/sqlite3`.

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Abrir la dirección indicada por Vite con `/demo/cliente` o `/demo/coach`.
Las demos usan datos sintéticos y no requieren credenciales de producción.
Vite por sí solo no ejecuta Pages Functions; el [QA v2](docs/QA-V2.md) describe
el entorno de API local, que requiere Wrangler además de `npm ci`.

## Verificación y referencias

```sh
npm test -- --maxWorkers=3
npm run lint
npm run build
```

- [Registro de implementación y checks](docs/BUILD_LOG.md).
- [Arquitectura v2](docs/ARQUITECTURA-V2.md).
- [Despliegue y migraciones](docs/DESPLIEGUE.md).
- [Piloto de GIF: resultados y pendientes](arte/sistema-visual/piloto-image-2.6-2026-11-05/README.md).
- [Aportes de Santiago](docs/aportes-santiago/README.md).

La coordinación es serializada: revisar el estado, sincronizar y reclamar según
AGENTS/CLAUDE antes de cambiar el proyecto. `handoff:publish` hace push a `main`
y activa el despliegue conectado a Git. `docs/cliente` es de solo lectura.
