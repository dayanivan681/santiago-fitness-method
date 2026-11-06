# Piloto de GIF generativos — actualización 6 de noviembre de 2026

**Vía de ChatGPT comprobada. Piloto de tres ejercicios cerrado: dos con candidatos visuales y Pendulum Squat 90° rechazado por el mecanismo. Ningún medio integrado en la app.**

El dueño pidió comprobar si la nueva generación de imágenes permite recrear la biblioteca y autorizó un piloto de tres ejercicios, uno a la vez. Después autorizó gestionar los mensajes del otro chat y descargar sus resultados, evitando copiar prompts o archivos a mano.

## Resultado del flujo

La herramienta `image_gen.imagegen` de este chat entregó un PNG de un cuadro ante la petición de GIF; esa prueba y su hash permanecen en [el registro inicial](INTENTO-INTEGRADO-2026-11-05.md). Esto no implicaba que ChatGPT no pudiera animar: los GIF originales compartidos después sí contienen 16 cuadros y una repetición de 2,4 s.

Se localizó la conversación **Generar GIF Goblet Squat**, ID `6aed0bc0-fdd0-83e9-bff2-a0f9912c75ab`, mediante el conector de chats. El dueño autorizó mensajes en ella. El conector permite enviar prompts y leer respuestas, pero no descargar los enlaces `sandbox:/mnt/data`. Chrome, habilitado el 6 de noviembre, permitió descargar el GIF corregido y verificarlo localmente. No se accedió a cookies ni credenciales y no se publicó la conversación. El control de la app nativa seguía bloqueado.

No repetir transferencia de imágenes en base64 por texto: dos intentos llegaron con bytes incompletos y SHA-256 distinto; se rechazaron. Para revisión fiable, descargar el GIF por el navegador y extraer aquí los cuadros. La subida local mediante la extensión de Chrome solicitó permiso File URLs, que no se modificó; para el tercer piloto se aportó la URL pública del fabricante.

## Archivos realmente verificados

Los originales descargados se conservan sin recomprimir en `resultados-chatgpt/`. Cada hoja de contacto se extrajo localmente del GIF, no se tomó como cierta la descripción del otro chat. Metadatos y SHA-256 en [procedencia.json](resultados-chatgpt/procedencia.json).

| Ejercicio | Archivo | Dimensiones originales | Cuadros / duración | Estado |
| --- | --- | --- | --- | --- |
| M02-111 · Goblet Squat frontal | [GIF](resultados-chatgpt/goblet-squat-frontal.gif) · [cuadros](resultados-chatgpt/goblet-squat-frontal-secuencia.png) | 267×358 | 16 / 2,4 s | Candidato visual; mancuerna corregida. |
| M02-111 · Goblet Squat perfil | [GIF](resultados-chatgpt/goblet-squat-perfil.gif) · [cuadros](resultados-chatgpt/goblet-squat-perfil-secuencia.png) | 267×357 | 16 / 2,4 s | Candidato visual; mejora lectura de pelvis y espalda. |
| M02-162 · Cable Glute Kickback | [GIF](resultados-chatgpt/cable-glute-kickback.gif) · [cuadros](resultados-chatgpt/cable-glute-kickback-secuencia.png) | 480×640 | 16 / 2,4 s | Candidato visual; pie y tobillera completos en cuadros 8–9 tras corregir encuadre. |
| M02-126 · Pendulum Squat 90° | [Intento rechazado](resultados-chatgpt/rechazados/pendulum-squat-90.gif) · [cuadros](resultados-chatgpt/rechazados/pendulum-squat-90-secuencia.png) | 480×640 | 16 / 2,4 s | FAIL visual del mecanismo; formato GIF PASS. No integrar. |

Las observaciones de deformación iniciales del Goblet fueron demasiado categóricas: una postura profunda y rodillas abiertas no bastan para demostrar un defecto. La vista lateral permite valorar mejor la silueta, pero no certifica fuerzas, presiones ni técnica individual.

## Referencia y criterios del Pendulum

Se descartaron como referencia del aparato los PNG históricos `pendulum-aparato-*-no-aprobado.png`: solo muestran el cuerpo y no contienen máquina. No se usan como verdad biomecánica.

Referencia aportada: [Arsenal Strength Reloaded Pendulum Squat](https://www.myarsenalstrength.com/strength-equipment/reloaded/featured-reloaded/reloaded-pendulum-squat), imagen técnica `2-9002_WG_B_BG_2.png` de esa galería. Se consultó y descargó para inspección en Downloads; la fotografía no se incorpora al producto ni se redistribuye aquí. La marca/modelo real del gimnasio de Santiago sigue desconocida: el tercer piloto es de una máquina genérica.

Comprobar pivote y bastidor fijos; brazo de longitud estable; respaldo, hombreras y agarres unidos; plataforma estable; pies planos sin desplazarse; espalda respaldada y manos sujetas en todo el ciclo. El arco pendular debe distinguirse del desplazamiento por raíl de un hack squat. Una foto fija del fabricante permite revisar la disposición, no medir el movimiento humano.

## Resultado de la prueba de máquina

La UI del chat mostró tres borradores y 10 min 23 s de trabajo. El generador reconoció que no había resuelto el mecanismo. La descarga real confirma GIF89a, 480×640, 16 cuadros de 150 ms, bucle infinito y 2.712.173 bytes. Su formato pasa; la mecánica no.

Al comparar los cuadros 1 y 9, el enlace superior entre el círculo fijo y el respaldo cambia de longitud visible y orientación. El conjunto del respaldo desciende junto a la estructura diagonal, sin demostrar el arco de un brazo rígido. Dos revisiones visuales independientes coinciden en no aceptarlo como Pendulum. Esto no identifica el método interno ni constituye una medición 3D. El archivo queda en `rechazados/` como evidencia. No se siguió generando indefinidamente.

## Alcance y decisión pendiente

- La capacidad de obtener GIF reales desde ChatGPT quedó demostrada. El modelo exacto de las generaciones no se expone: no se atribuyen los archivos a 2.6 solo por el anuncio del producto.
- El coste por generación no está expuesto en este flujo. No se usó la API ni se compraron servicios; no se afirma un coste unitario de cero ni un presupuesto total para la biblioteca.
- 480×640 u otra medida del archivo no garantiza detalle nativo a esa resolución ni una escena 3D articulada. No se certifica una réplica mecánica o anatómica por apariencia.
- Los originales se conservan intactos. Se prepararon conversiones técnicas a 360×480 con escala proporcional y relleno, sin recorte, interpolación temporal ni eliminación de cuadros. Las medidas, fps y duración no son límites duros de aceptación de un GIF importado; el tope de subida es 5.242.880 bytes.
- Estos candidatos esperan aceptación visual del dueño y revisión técnica de Santiago antes de integrarse. No se cambia la biblioteca, nombres, fotos, IDs ni datos reales. No se aprueba un lote de toda la biblioteca.

## Conversión técnica a 360×480

En [preparados-360x480](preparados-360x480/metadatos.json) se registran tres pruebas de paleta global (64, 48 y 32 colores) por archivo, sus hashes y tamaños. Se mantiene el ciclo de 16 cuadros de 150 ms y bucle infinito. No se convirtió el Pendulum rechazado.

| Versión técnica seleccionada | Bytes | Objetivo ≤250.000 B |
| --- | ---: | --- |
| Goblet frontal | 686.675 | No |
| Goblet perfil | 354.641 | No |
| Cable Glute Kickback | 243.288 | Sí |

Las versiones de 32 colores son pruebas técnicas de tamaño, no una sustitución visual aprobada. La inspección de sus hojas confirma que conservan el encuadre y la secuencia; también se pierde suavidad de los gradientes y se atenúa el rojo muscular. Por eso se mantienen los originales como referencia de apariencia. Ampliar los Goblet desde 267 px no recupera detalle y aumentó el archivo; no se afirma que esté resuelta su optimización. No reducir más colores a ciegas solo para alcanzar el objetivo.

## Siguiente paso

Revisar los candidatos Goblet y Kickback con el dueño y Santiago; validar también sus versiones técnicas de 360×480 antes de una preview. Para un Pendulum fiel, obtener una demostración lateral de la máquina concreta y su marca/modelo; mantener Blender/rig con contactos como vía para la mecánica que esta prueba generativa no resolvió. No empezar un lote completo por este resultado.

## Comprobaciones del repositorio

El código de producto no se modificó. Checks del 6 de noviembre: `npm test -- --maxWorkers=3` PASS, 1094 pruebas en 129 archivos; `npm run lint` PASS; `npm run build` PASS. Avisos conocidos de AbortSignal/JSDOM en tests. Logs locales `/tmp/sfm-gif-pilot-close-checks-2026-11-06/`.
