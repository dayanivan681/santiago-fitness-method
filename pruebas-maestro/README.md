# QA móvil con Maestro

Flujo de interfaz que recorre el cliente de punta a punta en Chromium.

## Por qué existe

Los simuladores de iOS necesitan Xcode y la máquina de desarrollo sólo tiene las
Command Line Tools. Esto **no sustituye a Safari real**, que sigue pendiente de
verificar, pero convierte en repetible el recorrido que antes se comprobaba a
mano en el navegador.

## Cómo se ejecuta

Necesita el servidor local en marcha y un enlace de acceso de un solo uso:

```bash
npx wrangler pages dev --port 8788 --local &
npm run test:movil
```

`enlace-local.mjs` acuña la invitación contra la D1 **local** a propósito: probar
no debe crear invitaciones en la base real. Igual que en producción, sólo el
SHA-256 llega a la base.

## Qué cubre y qué no

**Sí:** enlace de acceso, guardar una serie de trabajo, descanso automático,
reabrir la serie con "Editar", cambiar técnica, marcar calentamiento, y que el
descanso sobreviva a salir a Biblioteca y volver. Toca los controles de verdad,
así que un control que no responda al toque hace fallar el flujo.

**No:** la geometría de QA-MOB-01. Se comprobó reintroduciendo el fallo a
propósito y el flujo siguió pasando: Maestro desplaza el elemento a la vista
antes de tocarlo, y la ventana de Chromium no es un viewport de móvil, así que
nunca reproduce el solapamiento.

Esa parte la protege `src/pruebas/shellMovil.test.ts`, que sí falla con el fallo
reintroducido.

## Estado

`clearState` al principio deja IndexedDB y la cookie limpias. Sin eso el flujo
depende de lo que quedara de la sesión anterior: una serie marcada como
calentamiento no arranca descanso —comportamiento correcto— y parecería un fallo
del cronómetro.
