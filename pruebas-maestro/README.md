# QA móvil con Maestro

Flujo de interfaz que recorre el cliente de la demo de punta a punta en Chromium,
tocando los controles de verdad.

## Por qué existe

Los tests de jsdom disparan eventos directamente sobre los elementos y
**atraviesan las capas**: un diálogo que tapa un botón, o un botón escondido bajo la
barra de pestañas, no les afecta. Este flujo sí lo detecta. El 2026-09-15 encontró
los dos casos mientras las 719 pruebas unitarias seguían en verde.

**No sustituye a Safari real**, que sigue sin verificar: los simuladores de iOS
necesitan Xcode completo, y el Chromium de Maestro no es WebKit.

## Cómo se ejecuta

```bash
npm run build
npm run qa:preparar -- --local
npm run qa:servir     # en otra terminal: Functions en localhost:8788
npm run qa:acceso     # en otra terminal: proxy en 127.0.0.1:8789
npm run test:movil
```

La demo vive en memoria, así que el flujo no escribe en ninguna base.
`qa-movil.yaml` sólo delega en `qa-v2.yaml`, por compatibilidad con el nombre
antiguo.

## Qué cubre y qué no

**Sí:** cerrar la bienvenida, elegir Upper A, entrar al entrenamiento, escribir
peso y reps, elegir RIR, completar la serie, que el descanso arranque solo, ir a
Biblioteca y buscar con el descanso en marcha, volver al ejercicio, corregir la
serie, omitir el descanso y terminar la sesión.

**No:**
- Safari ni iOS.
- La geometría fina de móvil: Chromium abre una ventana de escritorio. Esa parte la
  protege `src/pruebas/shellMovil.test.ts`.
- El Coach, las invitaciones reales y la sincronización: eso es `npm run test:http`.

## Estado

`clearState` al principio deja IndexedDB y las cookies limpias. Sin eso, el flujo
dependería de lo que quedara de la ejecución anterior: una serie marcada como
calentamiento no arranca descanso —comportamiento correcto— y parecería un fallo
del cronómetro.

Si el flujo falla en un toque que «debería» funcionar, lo primero es mirar la
captura en `~/.maestro/tests/<fecha>/`: casi siempre hay algo encima del control.
