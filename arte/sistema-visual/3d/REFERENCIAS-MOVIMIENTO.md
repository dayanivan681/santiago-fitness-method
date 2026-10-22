# Pendulum squat — referencias de movimiento

Revisión visual de Codex, 2026-10-21, solicitada por el dueño. Complementa las
mediciones del rig; no convierte sus pruebas de contacto en una validación
biomecánica ni acredita el prototipo como réplica de una marca.

## Fuentes consultadas

1. [Arsenal Strength: Reloaded Pendulum Squat](https://www.myarsenalstrength.com/strength-equipment/reloaded/featured-reloaded/reloaded-pendulum-squat).
   Fuente del fabricante. Describe respaldo grande, plataforma con cuatro
   posiciones, ajuste de altura y agarres utilizables durante el recorrido.
   Estos ajustes impiden suponer una única postura para todos los usuarios.
2. [How to: Arsenal Strength Pendulum Squat — Bodyplex Milledgeville](https://www.youtube.com/watch?v=OKPvJRjj1h4).
   Demostración directa de un gimnasio; no es un manual del fabricante.
   Inspeccionada visualmente en el reproductor, con tiempos comprobados:
   **1:08 aprox.** preparación; **1:19.7** colocación de manos junto a las
   hombreras; **1:26.1** posición alta; **1:31.1** posición flexionada con pies
   visibles sobre la plataforma; **1:36.1** posición alta y mano en el mando.
   Son muestras visuales, no captura de movimiento ni mediciones articulares.
3. [FLEX LEWIS on the Reloaded Pendulum Squat — Arsenal Strength](https://www.youtube.com/watch?v=jnWgrCYSVLM).
   Vídeo enlazado por el fabricante. Se inspeccionaron planos promocionales;
   no se empleó para medir un ciclo completo ni deducir ángulos.

También se buscó documentación de Panatta. Su página devolvió HTTP 403 al
abrirla; no se usa como prueba de una postura o de un ángulo concreto.

## Comparación con el prototipo

| Aspecto | Observación de la referencia | Aplicación al rig actual |
| --- | --- | --- |
| Cuerpo y carro | Espalda y hombros acompañan el conjunto móvil entre las posiciones alta y flexionada. | Mantener pelvis/torso relacionados con el carro y verificar las zonas de apoyo durante todo el arco. Los contactos ya medidos son evidencia geométrica propia. |
| Pies | En la posición flexionada se ve el calzado apoyado en la plataforma inclinada. | Conservar objetivos y orientación de pies fijos; no animar un desplazamiento del cuerpo para ocultar despegues. Una imagen del vídeo no demuestra por sí sola contacto continuo. |
| Cadera y rodillas | Ambas cambian al pasar de la posición alta a la flexionada. | Resolverlas juntas por IK desde los contactos y el pivote. No copiar ángulos de una imagen en perspectiva. |
| Manos | Durante la demostración se apoyan junto a las hombreras; una mano pasa al mando para operar el seguro. | El bucle representa sólo la repetición con agarres sujetos. No añadir el gesto de desbloqueo al ciclo ni interpretar la explicación como un agarre universal. |
| Plataforma y trayectoria | La plataforma Arsenal visible está más inclinada que la del prototipo. El fabricante ofrece varios ajustes. | La referencia sirve para relaciones de apoyo, no para trasladar su silueta o profundidad literalmente a nuestra geometría. |
| Columna y cuello | El torso permanece respaldado; ropa, perspectiva y cortes limitan la observación de vértebras y pelvis. | No inventar una curva vertebral ni una corrección cervical medida a partir de este vídeo. Mantener la distribución actual y comprobarla en vistas ortogonales si se cambia. |

## Decisión

No se cambia el modelo a partir de estas imágenes: la diferencia de plataforma
no demuestra un fallo de IK y cambiarla excedería la recalibración de apoyos
autorizada. Se conservan las proporciones, la plataforma y el criterio del
encargo: rodilla de aproximadamente 170° internos arriba y 90° abajo. Esos
valores son objetivos de este prototipo, no una prescripción universal extraída
del vídeo.

La secuencia actual es coherente con las relaciones generales observadas:
cuerpo respaldado, pies estables y flexión acoplada. Sigue siendo un prototipo
de máquina genérica. Para afirmar fidelidad a una máquina concreta harían falta
marca/modelo y referencias laterales de su plataforma, pivote y apoyos. No se
han medido fuerzas, presiones reales, velocidad humana ni límites individuales.

Las pruebas numéricas y su alcance están en [README.md](README.md). Esta
consulta añade procedencia y límites a la revisión; no sustituye esos resultados
ni altera el GIF entregado. No se descargaron vídeos ni se incorporaron sus
fotogramas como recursos de la app.
