# Probar la app en el móvil desde el Mac

## Lo que se puede probar en cada opción

No todas las formas prueban lo mismo. **El service worker —que es lo que da la
instalación y el funcionamiento sin conexión— sólo se activa en `localhost` o
con HTTPS de verdad.** Por eso abrir la app por la red local desde el iPhone
sirve para casi todo menos para eso.

| Cómo | Registro y datos | Cámara y fotos | Instalar en el móvil | Sin conexión |
|---|---|---|---|---|
| Navegador del Mac en modo móvil | ✅ | ✅ | ✅ (Chrome) | ✅ |
| iPhone por WiFi (`http://…`) | ✅ | ✅ | ❌ | ❌ |
| iPhone con la app publicada | ✅ | ✅ | ✅ | ✅ |

## 1. Desde el Mac, tamaño de móvil — inmediato

`npm run dev` y abrir el navegador en modo dispositivo (390 × 844 para un
iPhone normal, 320 × 568 para el más pequeño que soportamos).

Sirve para el 90 % del trabajo diario y es lo que se ha usado para toda la
verificación visual. Lo que no reproduce es el motor de Safari: el Mac usa
Chromium, y iOS usa WebKit.

## 2. Desde tu iPhone, por la red local — ya funciona

El servidor de desarrollo ya se expone en la red (`server: { host: true }` en
`vite.config.ts`).

1. Que el iPhone esté en la misma WiFi que el Mac.
2. `npm run dev` en el Mac.
3. Abrir en Safari: **http://10.0.0.116:5173**
   *(si cambia la red, la IP se saca con `ipconfig getifaddr en0`)*

Esto sí usa Safari de verdad, con los dedos de verdad. **Pero es `http://`, no
`https://`**, así que iOS no registra el service worker: no se puede probar ni
instalar en la pantalla de inicio ni el modo sin conexión.

> El resto sí funciona. La app ya lleva un recambio para `crypto.randomUUID`,
> que no existe fuera de contexto seguro — sin él, guardar una serie fallaría
> justo aquí.

## 3. Con la app publicada — la única que lo prueba todo

Una vez desplegada (ver `docs/DESPLIEGUE.md`), la URL es HTTPS y entonces sí:

- Añadir a la pantalla de inicio y abrirla desde el icono, sin barra de navegador.
- **Modo avión y seguir entrenando.**

Es la única forma de comprobar esas dos cosas. Ninguna configuración local las
reproduce de manera fiable en iOS.

## Lo que haría falta para el simulador de iOS

Este Mac tiene sólo las Command Line Tools, no Xcode completo, así que no hay
simuladores de iPhone disponibles. Instalar Xcode son unos 7 GB, y aun así el
simulador tampoco prueba bien la instalación como app. **No compensa**: el
iPhone real por WiFi cubre más, y lo que falta lo cubre la app publicada.
