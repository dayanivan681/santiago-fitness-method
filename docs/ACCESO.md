# Acceso del cliente — Cloudflare Access

La app no tiene login propio. Toda la autenticación la hace Cloudflare Access
delante del sitio: el navegador nunca recibe la app sin estar autorizado.

## Configuración vigente

| | |
|---|---|
| URL de producción | `https://santiago-fitness-method.pages.dev` |
| Aplicación | **Santiago Fitness Method** |
| ID de aplicación | `5b3a4bda-e929-4b38-9116-bba12c4b8c88` |
| Política | `Cliente y coach` (Allow, lista explícita de correos) |
| ID de política | `e58035bc-b9e3-4f11-a2be-78f8e2453831` |
| Método de entrada | **One-time PIN** únicamente |
| Sesión de aplicación | 1 semana (7 días) |
| Sesión de política | Heredada de la aplicación |
| Dominio de equipo | `cool-surf-8e6d.cloudflareaccess.com` |

## Correos autorizados

- `yayo1716@gmail.com` — coach

**Falta el correo del cliente.** Para añadirlo:

1. `dash.cloudflare.com` → **Zero Trust** → **Access controls** → **Policies**
2. Abrir `Cliente y coach`
3. En *Include · Emails*, escribir el correo del cliente en el campo vacío
4. Guardar

No usar `Emails ending in`, ni `Everyone`, ni comodines: la lista tiene que
seguir siendo explícita.

## Cerrar sesión

El enlace *Cerrar sesión* del Perfil apunta a `/cdn-cgi/access/logout`, que es
el endpoint de Cloudflare. La app no guarda cookies ni tokens de sesión: eso lo
gestiona Cloudflare entero.

## Por qué no hay modo sin conexión

Un service worker sirve la app desde su propia caché sin tocar la red, así que
una copia guardada antes entraría **sin pasar por Cloudflare Access**. Mientras
Access sea la única capa de autenticación, las dos cosas no pueden convivir.

Por eso:

- no se registra ningún service worker;
- `public/sw.js` es un service worker de autodestrucción que desmonta lo que
  dejó la versión anterior (borra cachés, se desregistra y recarga la pestaña);
- `src/aplicacion/limpiarOffline.ts` hace la misma limpieza desde la app;
- `public/_headers` sirve el HTML con `no-store`, para que el navegador no
  pueda reutilizar una copia de disco sin preguntar al servidor.

`public/sw.js` se puede borrar cuando ya no queden navegadores con la versión
antigua instalada.
