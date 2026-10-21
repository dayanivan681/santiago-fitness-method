# Valores del sistema visual

**Los valores van escritos aquí, no deducidos de la imagen**: son los que copia el
generador, y medir a ojo sobre un render introduce error en los 286 ejercicios a la
vez.

Fuente única: [`generar.mjs`](generar.mjs). Cada número de esta página es una
constante de ese archivo (entre paréntesis, su nombre). Todos los SVG de la carpeta
salen de `node arte/sistema-visual/generar.mjs`; el script falla si alguna longitud
de segmento cambia entre poses.

---

## Paleta

Los tres primeros vienen de `src/index.css` y **no se cambian**: son los de la app.

| Uso | Hex | Notas |
|---|---|---|
| Fondo | `#0b0c0d` | fijo, `--fondo`. También es el color del separador entre segmentos |
| Cuerpo | `#f2f2f0` | fijo, `--texto`. Lado cercano de la figura |
| Acento de marca | `#e5352b` | fijo, `--rojo` |
| Cuerpo, lado lejano | `#b4b5b1` | brazo y pierna del lado lejano (`cuerpoLejano`) |
| Ropa | `#33363c` | camiseta sin mangas y pantalón corto, lisos |
| Equipo (acero) | `#6b717b` | tubos, bastidor, placas de la pila |
| Equipo (borde) | `#3f444c` | contorno de 2 px de todo el acero y los tapizados |
| Equipo (acero claro) | `#8d949e` | piezas que giran o se mueven: ejes, pivotes, manguitos, guía del Smith, pasador |
| Tapizado | `#2a2d33` | asientos, respaldos, almohadillas, rodillos |
| Discos | `#25282d` | cara del disco |
| Discos (aro) | `#555b64` | aro exterior y anillo interior |
| Cable | `#9aa0a8` | 3 px |
| Suelo | `#1c1e22` | una línea de 2 px en y = 897, sin sombra |
| Músculo que trabaja | `#e5352b` | el mismo rojo de marca, opaco |

## Grosores de segmento

En píxeles, sobre el lienzo 720 × 960. Profundidad total vista de perfil (de
delante a atrás). Los radios de articulación son iguales en los dos segmentos que se
tocan (`ARTICULACION`), y por eso la unión aguanta cualquier ángulo.

| Segmento | Grosor máximo | En la articulación (radio) |
|---|---|---|
| Torso | pelvis 88 · cintura 67 · pecho 95 | cadera 34 · hombro 24 |
| Muslo | 72 | cadera r 34 · rodilla r 22 |
| Pierna | 53 (gemelo) | rodilla r 22 · tobillo r 14 |
| Pie | 42 en el tobillo, 14 en la punta | tobillo r 14 |
| Brazo | 48 (deltoides) | hombro r 24 · codo r 15 |
| Antebrazo | 35 | codo r 15 · muñeca r 10 |
| Mano abierta / puño | 23 / 28 | muñeca r 10 |
| Cuello | 36 | base r 18 · atlas r 17 |
| Cabeza (radio) | óvalo de 86 de fondo × 94 de alto, equivalente a r 45 | gira sobre el atlas |

Trazos: separador de segmento 3 px de color fondo bajo cada pieza (se ven 1,5 px
fuera del contorno) · borde de equipo 2 px a cada lado · cable 3 px · suelo 2 px.

## Proporciones

Figura de 1,75 m a 411,4 px/m (`PX_POR_METRO`).

| | Valor |
|---|---|
| Lienzo | 720 × 960 (3:4) |
| Altura total de la figura | 720 (coronilla en y 176, planta en y 896) |
| Largo del muslo | 176 (cadera → rodilla) |
| Largo de la pierna | 177 (rodilla → tobillo) |
| Largo del torso (cadera → hombro) | 202 |
| Largo del brazo | 134 (hombro → codo) |
| Largo del antebrazo | 105 (codo → muñeca) |
| Largo del pie | 112 (talón → punta); tobillo a 28 del suelo, 26 por delante del talón |
| Largo del cuello | 40 (base → atlas) |
| Largo de la mano | 66 abierta · 30 puño (muñeca → centro de la yema) |
| Cabeza | 88 del atlas a la coronilla |

Alturas en la pose neutra: tobillo 28 · rodilla 205 · cadera 381 · hombro 583 ·
base del cuello 593 · atlas 632 · coronilla 720.

Puntos fijos dentro del torso (marco local, +x de cadera a hombro, +y hacia
delante): hombro en (202, 0), base del cuello en (212, -2).

## Músculo que trabaja

Usamos la firma de marca: el rojo queda reservado al músculo que trabaja.

```
Forma encima del segmento, en el marco local del propio segmento, recortada
con clip-path a su contorno. Relleno #e5352b opaco, sin contorno ni degradado.
Se pinta encima de la ropa: es un diagrama, no una prenda.

Como va dentro del grupo del segmento, gira con él: no hay que recalcularla
por pose. Sólo en el lado cercano; el lado lejano nunca lleva rojo.

Zonas definidas (MUSCULO en generar.mjs, todas en figura/musculos.svg):
  muslo   cuadriceps · isquios
  pierna  gemelo
  torso   gluteo · abdominal · pectoral · dorsal · trapecio
  brazo   deltoides · biceps · triceps

Máximo dos zonas por ejercicio (motor principal y, si acaso, el secundario).
Pendulum squat: cuadriceps + gluteo.
```

## Notas del diseñador

**Cómo se articula.** Cada segmento es un `<g id="muslo-cerca" data-segmento="muslo"
transform="translate(x y) rotate(θ)">` con su forma en coordenadas locales: la
articulación proximal en (0, 0) y la distal en (L, 0). Re-posar es cambiar `x, y, θ`;
la forma no se toca nunca. Las articulaciones son los extremos redondeados de
radio idéntico en los dos segmentos que se tocan. `resolverPose()` hace la
cinemática directa e `ik2()` la inversa de dos segmentos (rodilla, codo).

**Orden de pintado.** Lado lejano (mano, antebrazo, brazo, pie, pierna, muslo) →
cuello → torso → cabeza → lado cercano (pie, pierna, muslo, mano, antebrazo, brazo).
El lado lejano copia los ángulos del cercano salvo que la pose diga otra cosa
(`pose.lejos`); en perfil puro queda tapado y sólo aparece en movimientos
alternos.

**Ángulos de referencia.** 0° = derecha, 90° = abajo. Piernas y brazos colgando
= 90°; torso, cuello y cabeza erguidos = -90°. En piernas y brazos el lado -y es el
de delante; en torso, cuello y cabeza, el +y.

**Cámara (cambio respecto al encargo).** El suelo está en y 896 (93 %), no en
864 (90 %). Con 864 y la figura a 720 px, la pose de brazos arriba se sale por
arriba del lienzo: del hombro a la punta del puño hay 282 px. Con 896 queda a
31 px del borde. La figura de pie queda centrada en x (eje del tobillo en x 357);
en vertical lo que está centrado es el recorrido completo, de los puños arriba
a la planta.

**Manos.** Hay dos formas: `mano` (abierta) y `puno` (cerrada, para agarrar).
Cambian sin tocar el antebrazo porque comparten el radio de muñeca. La mano es
un segmento propio aunque el encargo no lo pedía: hace falta para que la muñeca
se doble al agarrar una barra o un asa.

**Equipo.** Todo de perfil, sobre el mismo suelo y a la misma escala que la
figura. Las piezas que se mueven llevan sus datos en el SVG:
`data-pivote="x,y"` (centro de giro), `data-riel="x1,y1,x2,y2"` (recorrido del
carro del Smith y de la polea), `data-centro` y `data-radio` en los discos.
Discos: Ø 450 mm (r 92,6), 330 mm (r 67,9) y 230 mm (r 47,3). En perfil, la
barra libre y la mancuerna en agarre prono se ven **de punta**: disco de frente
más manguito. `mancuerna.svg` trae las dos vistas (`mancuerna-lado` para agarre
neutro, `mancuerna-punta` para el resto).

**Sin texturas.** Ni moleteado, ni marcas, ni brillos. El único "volumen" de la
figura es el separador color fondo entre piezas, que es lo que la hace leerse
como maniquí articulado.

**Pendulum squat.** El carro gira sobre el pivote (610, 240). Arriba φ = 0°;
abajo φ = -19,7°, que es el giro que deja la rodilla a 90° con el pie fijo en la
plataforma (-20°). El torso va solidario al respaldo, así que se reclina un poco
más al bajar: eso es correcto en un péndulo y es justo lo que lo distingue de un
hack squat. Se entregan las dos posiciones: `pendulum-squat.svg` (arriba,
fotograma 1 y foto fija) y `pendulum-squat-abajo.svg`.

**Pendiente de validar con Santiago.** Ángulo de la plataforma (-20°), recorrido
del péndulo, posición de las manos en las asas y si las dos zonas en rojo son
las correctas.
