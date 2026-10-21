# Plan B — biblioteca ilustrada completa, un solo estilo

Decisión del dueño (2026-10-21): **toda la biblioteca ilustrada, un único estilo de
GIF, cada ejercicio con el suyo, aspecto premium.** Piloto en staging y, si cuadra,
a producción.

Este documento es el plan. No hay nada ejecutado todavía.

---

## 1. El alcance real

No son 23. Medido hoy en producción:

| | |
|---|---|
| Ejercicios activos en la biblioteca del coach | **286** |
| Familias de movimiento distintas | **31** |
| Tipos de equipo | **8** |
| Animaciones que habría que producir | **286** |

**Los 286 no son 286 ilustraciones distintas.** Son 31 patrones de movimiento
combinados con 8 tipos de equipo. Las familias más pobladas:

| Ejercicios | Familia | | Ejercicios | Equipo |
|---|---|---|---|---|
| 47 | sentadilla | | 63 | cable |
| 26 | press-pecho | | 54 | mancuernas |
| 23 | curl-biceps | | 40 | peso corporal |
| 20 | extension-triceps | | 40 | máquina tradicional |
| 19 | remo-horizontal | | 37 | barra libre |
| 17 | bisagra-cadera | | 29 | máquina de discos |
| 14 | extension-cadera | | 16 | Smith |
| 13 | press-hombro | | 7 | convergente |

Esa estructura es lo que hace el plan viable: se construye **un esqueleto por
familia y una pieza por equipo**, y el resto se compone. Dibujar 286 a mano no es
viable; componer 31 × 8 sí.

**Pendiente de decidir:** los 46 GIF fotográficos del catálogo de arranque
(`public/ejercicios/animaciones/`) son archivos que viajan dentro de la app para
funcionar sin conexión. Si la biblioteca pasa a ser ilustrada, esos 46 quedan con
el estilo viejo. Habría que rehacerlos también o aceptar que sólo se ven sin
conexión. **Pregunta para el dueño.**

## 2. Por qué comprar no sirve para este plan

Para rellenar 23 huecos, comprar tenía sentido. Para **este** plan, no, y por una
razón que no es el precio:

**Una biblioteca comprada es un conjunto cerrado.** Santiago añade ejercicios desde
la app — así pasó de 11 a 290. El día que añada el 287, no habrá forma de producir
su animación en el mismo estilo, porque ese estilo es de otro. La biblioteca
quedaría congelada el día de la compra, y cualquier ejercicio nuevo rompería la
coherencia que es justo el objetivo del plan.

Aparte, el cálculo del precio se invierte respecto al caso de los 23: a $0,99 la
unidad, 286 ejercicios son ~$283, ya no más barato que una licencia completa
($299–$499 por 650–1.400). Y la cobertura habría que verificarla sobre **286**
nombres, no 23 — con las 15 máquinas concretas fallando igual que siempre.

**Conclusión: el plan B exige tener la capacidad de producir, no comprar activos.**

## 3. Cómo se produce

### Arquitectura
1. **Esqueleto paramétrico**: modelo de articulaciones con cinemática inversa, de
   modo que muslo, pierna, torso y brazos nunca cambian de longitud entre
   fotogramas. Ya está prototipado y funcionando
   (`design-system/prototipo-pendulum-squat.gif`).
2. **Kit de equipo**: una pieza reutilizable por cada uno de los 8 tipos, más las
   máquinas específicas que lo pidan.
3. **31 definiciones de movimiento**: cada familia describe las posiciones inicial
   y final y qué parte queda fija (en una sentadilla, el pie).
4. **Tubería de render**: SVG → PNG → GIF 360×480 a 3:4, primer fotograma en la
   posición inicial, bucle suave.

### Por qué en código y no a mano
- **La coherencia queda garantizada por construcción**, no por disciplina.
- Un cambio de estilo se reaplica a los 286 con **un comando**, no rehaciendo 286
  archivos.
- Queda versionado en git, revisable y reproducible.
- **El ejercicio 287 es una línea de configuración**, no un encargo.
- Coste cero por unidad.

### Dónde entra Claude Design
En la **dirección de arte, no en la producción**. Que defina cómo se ve la figura y
el kit de equipo —uno o dos fotogramas de referencia, a la calidad que buscamos— y
yo implemento ese aspecto en el esqueleto. Producir 286 archivos a mano en una
herramienta de diseño es justo lo que no queremos: no se puede regenerar ni
extender.

### El riesgo real, dicho claro
**La mecánica está resuelta; el arte no.** Mi prototipo mueve bien el péndulo y la
rodilla, pero la figura es tosca. Ese es el único punto que decide si este plan
sale premium o sale mediocre, y es un problema **de una vez**, no de cada ejercicio:
cuando la figura esté bien, los 286 salen bien.

## 4. Formato — restricciones que no se negocian

Leídas del código; incumplirlas significa que la app rechaza el archivo o se ve mal.

| | Valor |
|---|---|
| Archivo | **GIF** (firma GIF87a/89a validada en `functions/lib/v2/medios.ts`) |
| Proporción y medida | **3:4 vertical, 360×480** (`.hoja__imagen--movimiento`) |
| Fondo | `#0b0c0d` plano, o transparente |
| Peso objetivo | ≤ 250 KB · tope duro 5 MB |
| Primer fotograma | **es la foto fija** de listas, miniaturas, sin conexión y «reducir movimiento» |

Espacio en R2 para los 286 a 250 KB: unos **71 MB**, muy por debajo de los 10 GB
gratuitos. El almacenamiento no es un problema.

## 5. Piloto en staging

El entorno ya está montado: `env.preview` en `wrangler.toml` apunta a la base
`santiago-staging` y al bucket `sfm-fotos-staging`. **Nada toca producción hasta que
el dueño lo apruebe.**

**Lote piloto — 6 ejercicios elegidos para que ninguno se parezca a otro:**

| Familia | Equipo | Por qué está |
|---|---|---|
| sentadilla | barra libre | la familia más grande (47) |
| press-pecho | mancuernas | tumbado, dos implementos |
| jalon-vertical | cable | de pie, polea alta |
| curl-biceps | máquina tradicional | sentado en máquina |
| extension-cadera | máquina de discos | el caso raro |
| sentadilla | **pendulum squat** | una de las 23 sin fuente; la prueba dura |

Si esos seis salen bien y parecen de la misma familia visual, el resto es repetir.
Si no, lo sabremos con seis y no con 286.

**Pasos:** producir los seis → subirlos a staging → revisarlos en la preview desde
el iPhone, en la ficha y en las listas → juicio del dueño y visto bueno de Santiago
sobre la técnica → escalar a las 31 familias → producción.

## 6. Decisión pendiente antes de empezar

Quién fija el aspecto de la figura:

- **(a) Claude Design primero.** El dueño abre el proyecto, saca la figura y el kit
  al nivel que busca, me pasa las referencias y yo las implemento en el esqueleto.
  Más lento de arrancar, techo de calidad más alto.
- **(b) Yo primero.** Intento llevar la figura a un nivel presentable en el
  esqueleto que ya existe, lo enseño, y si no convence vamos a (a). Más rápido,
  techo incierto.

Las dos acaban en el mismo sitio: el estilo implementado en código, regenerable y
extensible.
