# Brief para Claude Design — animaciones de ejercicio con la marca de Santiago

Para pegar en Claude Design. Todo lo técnico de aquí está **leído del código**, no
supuesto: si una animación incumple el bloque «Formato», la app la rechaza o se ve
mal, y eso no se arregla con estilo.

El objetivo es el registro visual de los catálogos de pago —figura limpia, fondo
neutro, bucle suave, todas las fichas iguales— pero con los colores y el carácter
de Santiago Fitness Method.

---

## 1. Formato — restricciones duras de la app

| | Valor | De dónde sale |
|---|---|---|
| Archivo | **GIF** (GIF87a o GIF89a) | `functions/lib/v2/medios.ts` valida la firma; un MP4 o WebM se rechaza |
| Tamaño máximo | **5 MB** | `FOTO_MAX_BYTES` |
| Peso objetivo | **≤ 250 KB** | los 46 actuales pesan 155 KB de media; los 10 nuevos, 183 KB |
| Proporción | **3:4 vertical** | `.hoja__imagen--movimiento` en `src/index.css` |
| Medida | **360 × 480 px** | es la que produce el conversor del coach |
| Fondo | **`#0b0c0d`, plano** | el contenedor pinta ese color detrás; cualquier otro deja un halo |
| Bucle | infinito, sin corte perceptible | |
| Duración | 1,5 – 2,5 s por repetición | |

**La trampa que casi nadie ve: el primer fotograma se usa como foto fija.** La app
lo extrae y lo usa en listas, miniaturas y cuando el cliente activa «reducir
movimiento» o está sin conexión (`src/producto/HojaEjercicio.tsx:236`). Así que el
fotograma 1 tiene que ser **la posición inicial del ejercicio y entenderse solo**,
sin movimiento. No vale empezar a mitad de recorrido.

Si Claude Design entrega MP4, no pasa nada: lo convierto aquí con ffmpeg, o lo
convierte la propia app desde el teléfono de Santiago.

## 2. Marca — tokens reales de la app

Sacados de `src/index.css`. No inventar colores: estos son los que ve el cliente.

| Uso | Token | Valor |
|---|---|---|
| Fondo | `--fondo` | `#0b0c0d` |
| Superficie | `--superficie` | `#131417` |
| Figura / texto | `--texto` | `#f2f2f0` |
| **Acento de marca** | `--rojo` | `#e5352b` |
| Borde tenue | `--borde` | `rgba(255,255,255,0.08)` |

Tipografía de la marca: **Barlow** y **Barlow Condensed**. En estas animaciones no
debería haber texto, pero si el sistema de diseño lo pide, esas son.

**Firma de marca propuesta:** el equipo en gris acero, la figura en hueso, y el
**rojo `#e5352b` reservado al músculo que trabaja**. Eso hace dos cosas a la vez:
distingue la biblioteca de cualquier catálogo comprado y enseña algo que un GIF
normal no enseña. Si resulta recargado, segunda opción: rojo sólo en la ropa.

## 3. Estilo

- **Fondo liso `#0b0c0d`**, sin gimnasio, sin sombras de ambiente, sin degradados.
  Es lo que hace que una biblioteca parezca comprada y no recopilada.
- **Una sola figura**, cuerpo entero, con aire alrededor. Nada recortado.
- **Vista de perfil** salvo que el ejercicio exija otra; la misma distancia de
  cámara, la misma altura y la misma escala **en todas**. La consistencia entre
  fichas importa más que la belleza de una.
- **Figura estilizada, anatómicamente correcta, nunca fotorrealista.** Maniquí de
  manual de anatomía: proporciones humanas creíbles, cero intento de parecer una
  foto. Esto no es una limitación, es la decisión que nos protege: el dueño ya
  rechazó una tanda de imágenes IA **por ejecución poco realista**
  (`public/ejercicios/PROCEDENCIA.md`). Un diagrama declarado no promete realismo,
  así que no puede fallar en eso.
- **Sin cara, sin rasgos, sin marcas de ropa.** Nada que envejezca o distraiga.
- **Máquina simplificada pero reconocible por su rasgo distintivo.** No hay que
  copiar una marca de aparato; hay que dejar claro de qué aparato se trata.
- **Bucle completo**: fase concéntrica y excéntrica, velocidad pareja, sin pausa a
  mitad y sin rebote al final.

## 4. Técnica — lo que mira un entrenador

Esto manda sobre el estilo. Un diagrama bonito con un ángulo mal enseña mal.

- Los segmentos **no cambian de longitud** entre fotogramas.
- Columna neutra; sin curvar la espalda al bajar.
- Rodillas alineadas con la punta del pie, nunca hacia dentro.
- Talones apoyados; el pie no se despega.
- Recorrido completo y realista: ni medio ni forzado.
- El punto de apoyo que no se mueve, no se mueve. En una sentadilla, el pie.

**Santiago aprueba la técnica antes de que esto entre en la app.** Él es el
entrenador; ni Claude Design ni yo decidimos eso.

## 5. Ejercicio de prueba — Pendulum Squat 90° (M02-126)

Uno de los 23 que ninguna fuente libre cubre. Se eligió a propósito porque es de
los difíciles: si sale bien, el resto es más fácil.

**Qué es.** Sentadilla en una máquina donde el usuario queda recostado contra un
respaldo con hombreras, de pie sobre una plataforma inclinada. El carro **cuelga
de un pivote alto y adelantado**, así que el cuerpo baja describiendo un **arco**,
no una línea recta.

**El error que hay que evitar:** dibujarlo como un hack squat. El hack squat
desliza por un **raíl recto**; el pendulum gira sobre un **pivote**. Si el recorrido
sale recto, está mal.

**Partes que tienen que verse:**
1. Pivote alto y por delante del usuario, del que cuelga todo el carro.
2. Viga que gira con el carro, con **el disco en el extremo**.
3. Hombreras sobre los hombros y respaldo inclinado detrás de la espalda.
4. Plataforma de pies inclinada, abajo y por delante.

**Las dos posiciones:**
- **Arriba (fotograma 1, el que será la foto fija):** piernas casi extendidas sin
  bloquear, cuerpo alto y reclinado contra el respaldo, pies planos.
- **Abajo:** rodilla en torno a **90°**, cadera descendida siguiendo el arco, torso
  pegado al respaldo, talones apoyados, rodillas sobre la punta del pie.

**Referencias** (para estudiar el aparato, no para copiar):
- <https://boxlifemagazine.com/wp-content/uploads/2023/12/image-3-768x569.png>
- <https://healthendure.com/wp-content/uploads/2024/06/image-7-1024x930.webp>

## 6. Prototipo de referencia — y por qué no vale

En esta carpeta está `prototipo-pendulum-squat.gif`, hecho aquí en SVG puro, y
`prototipo-pendulum-squat-posiciones.png` con las dos posiciones.

**Sirve para dos cosas y para nada más:**
1. **La mecánica está resuelta.** El carro gira sobre el pivote, el pie no se
   despega, la rodilla sale por cinemática inversa y los segmentos no cambian de
   largo. Esa geometría es correcta y se puede copiar.
2. **El peso demuestra la tesis:** 78 KB con 16 fotogramas, frente a los 183 KB de
   media de los fotográficos de dos. Una ilustración plana comprime mejor que una
   foto, así que se puede animar mucho más fino y pesar menos.

**No vale como resultado final:** la figura es tosca, la cabeza flota, los brazos
parecen ganchos y el bastidor se lee como una caja. Está a dos iteraciones mías de
distancia del registro que buscamos, y por eso tiene sentido llevarlo a Claude
Design en vez de seguir aquí a mano.

## 7. Qué hace falta de vuelta

1. El GIF (o MP4) del pendulum squat con esta guía.
2. El **sistema de diseño guardado**, para que los 22 siguientes salgan idénticos
   en escala, encuadre, grosores y color. Esa reutilización es lo que decide si
   esto es viable para 23 fichas o es una pieza suelta bonita.

Con eso lo comparo aquí al lado de un GIF fotográfico real de la biblioteca, en la
ficha y en el teléfono, y te digo si aguanta la comparación o si canta.
