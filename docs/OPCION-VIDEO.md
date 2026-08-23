# Vídeo demostrativo por ejercicio

> **Estado: oportunidad guardada, no está construida.** Este documento existe
> para que, si el cliente lo pide, el plan ya esté hecho y se le puedan
> presentar las dos opciones con sus costes.

---

## Qué se pide y qué es realmente

El cliente quiere rutinas con vídeo: la nota de voz hablaba de "enviar las
rutinas a través de vídeos" y la web vende *"5 rutinas personalizadas con
vídeos"*.

**"Enviar" y "vídeo" son dos problemas distintos, y conviene no mezclarlos.**

- **Enviar** exige servidor, cuentas y sincronización entre dispositivos. Es la
  Etapa 2 completa, que la guía del proyecto (§31) condiciona a que el piloto
  funcione. Semanas de trabajo y coste mensual.
- **El vídeo** cabe en la app tal como está hoy. Días de trabajo.

Este documento cubre sólo el vídeo: **el participante toca un ejercicio y ve a
Santiago demostrándolo.**

### Una garantía que cambia

Hoy la app precarga 2.6 MB y funciona entera sin conexión, que es lo que exige
§27 para usarla en el gimnasio. El vídeo no se puede precargar a esa escala —33
ejercicios a unos pocos MB son cientos de MB—, así que **verlo necesitará
datos**. El resto de la app seguiría funcionando sin conexión.

---

## Lo que las dos opciones comparten (≈90% del trabajo)

Esto es idéntico se elija lo que se elija. **Por eso la decisión de alojamiento
no hay que tomarla ahora: se puede tomar el día que se arranque.**

### Modelo
Un campo opcional en `Ejercicio` (`src/dominio/tipos.ts`):

```ts
/** §15: enlace a la demostración. Opcional: la mayoría aún no lo tendrá. */
readonly videoUrl?: string
```

### Interpretación de la URL — módulo puro
`src/dominio/video.ts`, función pura y testeable como `carga.ts` o `estatura.ts`:

| Entrada | Resultado |
|---|---|
| `youtu.be/ID`, `youtube.com/watch?v=ID`, `youtube.com/shorts/ID` | `{ tipo: 'youtube', id }` |
| `vimeo.com/ID` | `{ tipo: 'vimeo', id }` |
| cualquier `.mp4` / `.webm` | `{ tipo: 'archivo', url }` |
| cualquier otra cosa | `{ tipo: 'desconocido' }` |

`desconocido` existe para que un enlace mal pegado avise en vez de romper la
pantalla. **Este módulo soporta las dos opciones desde el primer día**, y es lo
que hace barato cambiar de alojamiento más adelante.

### Dónde se ve
- **Biblioteca** (`src/pantallas/Biblioteca/Biblioteca.tsx`): su sitio natural
  según §15. Botón *Ver vídeo* en las fichas que lo tengan.
- **Entrenamiento de hoy** (`TarjetaEjercicio.tsx`): enlace discreto junto a
  *Cambiar variante*, sólo en la tarjeta desplegada. §25 pide no llenar la
  pantalla entrenando, y esto es un enlace de texto; consultar la técnica a
  mitad del ejercicio es justo cuando hace falta.
- **Reproductor** (`src/componentes/HojaVideo.tsx`): reutiliza la hoja inferior
  (`.hoja` en `src/index.css`) y **`useCapa`** (`src/aplicacion/useCapa.ts`), con
  lo que el botón atrás de Android la cierra y el fondo queda bloqueado sin
  escribir nada nuevo.

### Sin conexión
Se mira `navigator.onLine` antes de incrustar. Sin red, un aviso en vez de un
iframe en blanco.

### El punto delicado: el sembrado
`sincronizarBiblioteca` (`src/datos/semilla/index.ts`) refresca el contenido de
la app y conserva sólo lo que devuelve `calibracionDe`. **Hay que añadir
`videoUrl` a lo que se conserva**, o la próxima actualización borraría en
silencio todos los enlaces que Santiago haya pegado.

Es la misma clase de fallo que ya apareció dos veces en este proyecto —con las
imágenes y con `movimiento`—, así que conviene renombrar `calibracionDe` a
`datosDelCoach`: deja de ser sólo calibración.

---

## Opción A — Enlaces no listados (YouTube / Vimeo)

Santiago sube el vídeo a YouTube como "no listado" y pega el enlace en la app.

**Qué añade sobre el tronco común:** un campo de texto para pegar la URL. Nada más.

- **Coste:** 0 €/mes
- **Trabajo:** ~2–3 días
- Se incrusta desde `youtube-nocookie.com` para no arrastrar la cookie de
  seguimiento.

**A favor**
- Cero infraestructura y cero mantenimiento.
- Almacenamiento ilimitado y gratis.
- Calidad adaptativa resuelta — importa con el wifi de un gimnasio.
- Santiago sube desde el móvil en segundos, sin depender de nadie.

**En contra**
- **"No listado" no es privado:** cualquiera con el enlace puede verlo, y puede
  reenviarlo.
- El vídeo vive en un tercero: si se borra el vídeo o la cuenta, se rompe.
- Marca de YouTube en el reproductor.
- No sirve de base para la Etapa 2.

---

## Opción B — Almacenamiento propio

Santiago sube el vídeo desde la app y el archivo queda en un bucket nuestro.

**Qué añade sobre el tronco común:** un bucket de almacenamiento, un flujo de
subida desde el móvil y, para que se vea bien con mala cobertura, transcodificar
a dos o tres calidades.

- **Coste:** bajo a escala de piloto. Unos 33 vídeos de ~20 MB son ~660 MB de
  almacenamiento (céntimos al mes). El gasto real es el tráfico: con un proveedor
  sin cargo de salida es prácticamente cero, y con uno que lo cobre rondaría
  **1–3 €/mes** para un grupo pequeño. Crece con el número de participantes.
- **Trabajo:** ~1–2 semanas, según se transcodifique o no.

**A favor**
- Control total: sin marca ajena y sin depender de un tercero.
- **Privacidad real** con enlaces firmados que caducan.
- **Es un anticipo de la Etapa 2:** esa infraestructura hace falta igualmente
  para cuentas y sincronización.

**En contra**
- Coste recurrente, aunque pequeño.
- Más trabajo y más que mantener.
- Sin transcodificar, un vídeo pesado se atasca con mala cobertura.

---

## Comparación

| | A — Enlaces no listados | B — Almacenamiento propio |
|---|---|---|
| Coste mensual | 0 € | ~1–3 € a escala de piloto |
| Trabajo | 2–3 días | 1–2 semanas |
| Privacidad | Cualquiera con el enlace | Real, con enlaces firmados |
| Calidad adaptativa | Incluida | Hay que transcodificar |
| Depende de terceros | Sí | No |
| Sirve para la Etapa 2 | No | Sí |

---

## Recomendación

**Si el piloto aún no ha demostrado que el flujo sirve: opción A.** Cuesta cero y
se monta en días. Como el campo guarda una URL, pasar a la opción B más adelante
es cambiar los datos, no reescribir la app.

**Si ya está decidido que habrá Etapa 2: opción B directamente.** El
almacenamiento hará falta igual, y montarlo dos veces es tirar trabajo.

**El matiz de la privacidad puede decidirlo solo.** Si estas rutinas son el
producto que se cobra a 170 $/mes, un enlace que cualquiera puede reenviar es un
problema de negocio, no técnico. Ahí la opción B se justifica sola.

---

## Verificación (cuando se ejecute)

- **Unitarios:** las tres formas de URL de YouTube, Vimeo, `.mp4` y una inválida
  → `desconocido`.
- **Regresión del sembrado:** guardar un ejercicio con `videoUrl`, ejecutar
  `sembrar` y comprobar que el enlace sigue ahí. Es el fallo más probable y el
  más silencioso.
- **Pantalla:** la ficha sólo ofrece *Ver vídeo* si hay enlace; sin conexión sale
  el aviso y no un iframe vacío.
- **Manual en el móvil:** abrir desde Biblioteca y desde la tarjeta del día, y
  comprobar que el botón atrás cierra la hoja sin salir de la app.

---

## Lo que esto no resuelve

Sigue sin haber forma de que Santiago mande nada al móvil de un participante:
cada dispositivo guarda lo suyo (§26). Entregar rutinas a un equipo es la Etapa 2
(§31) y conviene decidirlo con los datos del piloto, como pide la guía.
