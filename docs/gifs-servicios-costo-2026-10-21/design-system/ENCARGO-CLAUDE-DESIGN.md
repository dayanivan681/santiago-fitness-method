# Qué pedirle a Claude Design — y en qué formato

El dueño fija el aspecto en Claude Design y me pasa las referencias; yo las
implemento en el esqueleto paramétrico. Este documento dice **qué necesito de
vuelta para poder implementarlo**, que no es lo mismo que «una animación bonita».

La marca, el formato de salida y el ejercicio de prueba están en
[README.md](README.md). Esto sólo cubre el encargo de arte.

---

## Lo primero, y lo que más importa

**Pide el SVG o el código, no una imagen.** La pantalla de Claude Design tiene un
botón `</>`. Con vector puedo leer las coordenadas, los grosores y los colores
exactos y llevarlos al esqueleto tal cual. Con un PNG me toca medir a ojo y el
resultado se parecerá, pero no será lo mismo.

Si sólo sale PNG, sirve igual — pero que sea **grande (al menos 1440 px de alto) y
sobre fondo plano**, para poder medir con precisión.

## No estamos pidiendo animaciones

Las animaciones las genero yo. De Claude Design necesito **el lenguaje visual**:
cómo se dibuja un cuerpo, cómo se dibuja una máquina, y con qué valores. Una vez
eso esté definido, los 286 salen del código.

Que no se gaste esfuerzo en: fondos, escenarios, iluminación, sombras de ambiente,
caras, logotipos, texto ni efectos. Nada de eso entra.

---

## Entrega 1 — La figura

**Vista de perfil** (es como se leen los diagramas de ejercicio), cuerpo entero.

Tres láminas de la **misma** figura:

1. **Pose neutra**, de pie, brazos a los lados, piernas rectas. Es de la que saco
   proporciones y la forma de cada segmento.
2. **Pose en flexión**: media sentadilla, rodilla y cadera dobladas en torno a 90°.
   Me enseña **cómo se resuelve una articulación doblada**, que es donde un estilo
   se rompe.
3. **Pose con brazos arriba**: los brazos extendidos por encima de la cabeza. Me
   enseña hombro y codo.

### Reglas que el arte tiene que respetar para ser articulable

Esto no es estética, es lo que decide si puedo re-posar la figura o no:

- **Los segmentos tienen que ser piezas separadas** —muslo, pierna, pie, torso,
  brazo, antebrazo, cabeza—, no una silueta fundida en una sola forma. Si el cuerpo
  es un único contorno, no se puede articular y hay que rehacerlo.
- **Las articulaciones tienen que aguantar cualquier ángulo.** Extremos redondeados
  o una pieza de articulación explícita. Si el codo sólo funciona doblado a 90°
  porque está dibujado a medida, no sirve.
- **Sin escorzo ni perspectiva** que dependa de una pose concreta.
- **Sin sombras pintadas encima del cuerpo** que supongan una luz y una postura.
- **Mismas longitudes de segmento en las tres láminas.** Si en una el muslo mide
  más que en otra, la animación se deformará.
- **Sin cara ni rasgos.** La cabeza es una forma.

## Entrega 2 — El kit de equipo

Una pieza por cada tipo, en el mismo lenguaje que la figura, **sin la figura
encima** (las compongo yo):

| | Ejercicios que lo usan |
|---|---|
| Cable / polea | 63 |
| Mancuernas | 54 |
| Peso corporal *(sólo suelo o banco)* | 40 |
| Máquina tradicional (de pin) | 40 |
| Barra libre | 37 |
| Máquina de discos | 29 |
| Smith | 16 |
| Convergente | 7 |

Más dos piezas sueltas que se repiten mucho: **banco plano** y **banco inclinado**.

No hace falta que sean máquinas reales de ninguna marca. Hacen falta **piezas
reconocibles y combinables**: un bastidor, un asiento, un respaldo, un brazo, una
polea, un disco, una barra.

## Entrega 3 — Los valores

Escritos, no deducidos de la imagen:

- **Paleta completa en hex**: cuerpo, ropa, equipo, discos, suelo, fondo, acento.
  La base de marca está en [README.md](README.md) — `#0b0c0d`, `#f2f2f0`,
  `#e5352b` — pero si el arte necesita tonos intermedios, que los nombre.
- **Grosor de cada segmento** en píxeles, sobre un lienzo declarado.
- **Proporciones**: altura total de la figura y largo de cada segmento.
- **Si usamos la firma de marca** (el rojo reservado al músculo que trabaja): cómo
  se marca ese músculo — relleno, contorno, una forma encima.

## Entrega 4 — Una pieza de destino

Un solo fotograma montado —figura + máquina juntas— **a la calidad que buscamos**,
del **Pendulum Squat 90°**, cuya descripción mecánica está en
[README.md](README.md#5-ejercicio-de-prueba--pendulum-squat-90-m02-126).

No para usarlo: para tenerlo como referencia de a dónde tiene que llegar lo que yo
genere. Si mi salida no se parece a eso, está mal y se ve enseguida.

---

## Encuadre

- Lienzo **3:4 vertical**; si se trabaja más grande, que sea múltiplo: 720×960.
- La figura ocupa en torno al **75 % de la altura**, centrada, con aire alrededor.
- Línea de suelo a aproximadamente el **90 % de la altura**.
- Misma escala y misma distancia de cámara en las tres láminas.

## Cuando me lo pases

Reviso que sea articulable, lo implemento en el esqueleto, genero los 6 del piloto
y los subo a staging. Si algo del arte no se puede articular, te lo digo con el
motivo concreto en vez de forzarlo: una figura que no se deja re-posar se nota en
cuanto se mueve.
