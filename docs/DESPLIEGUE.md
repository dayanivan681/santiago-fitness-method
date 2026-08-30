# Publicar la app para que el cliente la pruebe

## La decisión que hay que tomar antes de enseñársela

**IndexedDB es por origen.** Todo lo que el participante registre vive atado al
dominio donde abrió la app. Si prueba en `algo.pages.dev` y más adelante se pasa
a un dominio propio, **esos datos no viajan**: se quedan en el origen viejo, y no
hay redirección que los mueva.

Así que conviene **fijar el dominio definitivo antes de que el cliente escriba el
primer dato real**. Si todavía no hay dominio, se puede empezar en `*.pages.dev`
sabiendo que lo de esa etapa es desechable — o exportar la copia antes de mover
(ver *Copia de seguridad* en Perfil).

## Por qué Cloudflare Pages

- **Uso comercial permitido en el plan gratuito.** Vercel Hobby lo prohíbe, e
  incluye explícitamente *"un consultor pagado escribiendo el código"*: este
  proyecto entra en esa definición, así que usarlo obligaría a pagar Pro o a
  mudarse después.
- **Ancho de banda ilimitado** para archivos estáticos, que es todo lo que la app
  sirve. No hay backend: cero funciones, cero límites de invocación.
- **Sirve en la raíz del dominio**, que es lo que necesitan las rutas de imagen
  (`/ejercicios/…`) y el `start_url: '/'` del manifiesto.

**GitHub Pages no vale sin tocar código**: sirve bajo `/santiago-fitness-method/`
y habría que cambiar `vite.config.ts` y el manifiesto.

## ¿Se puede empezar en una cuenta y moverla después?

Sí, y sin drama: **en Cloudflare no vive nada**. El sitio se reconstruye desde
GitHub en cada despliegue, así que "transferir" es borrar el proyecto en una
cuenta y crearlo en la otra apuntando al mismo repositorio. Dos minutos.

Lo único que **no** se mueve solo son los datos del participante, porque
IndexedDB está atado al origen:

- Si se usa un **dominio propio**, se apunta a la cuenta nueva y el origen no
  cambia: no se pierde nada.
- Si se usa el subdominio `*.pages.dev`, la URL cambia con la cuenta. En ese
  caso, antes de mover: **Perfil → Copia de seguridad → Descargar copia**, y
  restaurarla en la URL nueva.

Por eso la copia de seguridad existe: hace que esta decisión deje de ser
irreversible.

## Pasos

1. En Cloudflare → Workers & Pages → Create → Pages → Connect to Git.
2. Elegir el repositorio `dayanivan681/santiago-fitness-method`.
3. Configuración de build:
   - **Framework preset:** ninguno / Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Variables de entorno:** ninguna
4. Desplegar. A partir de ahí, **cada push a `main` publica solo** — y como el
   protocolo de handoff hace push al publicar un turno, cada turno queda
   probable sin pasos extra.
5. Si hay dominio propio: Custom domains → añadirlo **antes** de entregarle la
   app al cliente.

### Atajo para el primer despliegue

Si sólo quieres verla publicada cuanto antes, sin conectar el repositorio:

```
npx wrangler login     # abre el navegador para entrar en tu cuenta
npm run deploy         # compila y publica
```

Es un despliegue suelto: no se actualiza sola con cada push. Para el piloto
conviene igualmente conectar el repositorio como arriba.

`public/_headers` ya trae las cabeceras de caché: los assets llevan hash en el
nombre y se cachean para siempre; `index.html` y `sw.js` no, para que la app note
cuando hay versión nueva.

## Comprobar que quedó bien

Desde un **móvil real**, no desde el escritorio:

- [ ] Abrir la URL y añadirla a la pantalla de inicio.
- [ ] Abrirla desde el icono: tiene que verse sin barra de navegador.
- [ ] Dar de alta al participante y registrar una serie.
- [ ] **Poner el móvil en modo avión y seguir usándola.** Es la única forma de
      comprobar el service worker; el servidor de desarrollo no lo activa.
- [ ] Hacer una foto de progreso desde la cámara.
- [ ] Perfil → Copia de seguridad → Descargar copia, y restaurarla en otro
      navegador para confirmar que el archivo sirve.

## Lo que sigue sin resolverse con esto

Alojar la app **no** da sincronización. Cada dispositivo tiene sus propios datos
y el coach no ve los del participante salvo que éste le mande la copia. Eso es
Etapa 2 (§31): cuentas, base de datos en la nube y login — plan en
`docs/PLAN-LOGIN.md`.
