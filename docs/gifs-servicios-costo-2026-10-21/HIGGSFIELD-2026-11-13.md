# Higgsfield: estimación por GIF y biblioteca — 13 de noviembre de 2026

Consulta de costes; no se contrató un plan, conectó una cuenta ni ejecutó una
generación. Moneda USD, antes de impuestos. El cálculo cubre herramientas;
excluye horas de preparación, grabación, revisión técnica e integración.

## Alcance

- **57 ejercicios base**, contados en `shared/ejercicios-base.ts`.
- **286 ejercicios del coach**, como escenario de biblioteca completa según el
  inventario de producción del 21 de octubre en [README.md](README.md).
  No se consultó D1 hoy para actualizar ese número.
- Un GIF por ejercicio. Dos vistas por ejercicio duplican aproximadamente el
  consumo de vídeo. Los resultados aceptables del piloto siguen pendientes de
  aprobación; el cálculo no establece una tasa de éxito comprobada en Higgsfield.

## Tarifas de referencia

Las tarjetas de [precios](https://higgsfield.ai/pricing?rp=%2Fpricing) anuncian
Starter $19/270 créditos, Plus $59/1.200 y Ultra $129/3.000 con pago mensual.
Los importes anuales equivalentes de $47/$99 no son una mensualidad sin compromiso.
La página mezcla tablas antiguas y el blog de planes del 24 de octubre mantiene
otras cantidades. Usar estos datos como presupuesto provisional y verificar la
tarjeta de la cuenta y el coste en Generate antes de cualquier gasto.

Para un vídeo de 5 s, la tabla publica aproximadamente 7 créditos en Kling 3.0
720p; Motion Control va de 5–7 a 720p y hasta 12 a 1080p según versión.
Una imagen Nano Banana Pro cuesta 2 créditos. No se ha comprobado esta selección
en una cuenta autenticada. El [centro de ayuda](https://higgsfield.ai/creator-hub/help-center/credits/how-credits-work)
explica que Generate muestra el coste exacto, los reintentos consumen saldo y los
créditos mensuales no se acumulan. Unlimited/free se limita a la web; MCP/CLI y
automatización consumen créditos.

## Consumo estimado para crear o regenerar

Supuestos nuestros: **3–5 intentos por resultado aceptable**, un vídeo de 5 s por
intento y una imagen de referencia de 2 créditos por ejercicio. Si la imagen ya
existe, ese coste puede omitirse. Es un supuesto presupuestario, no garantía de
fidelidad. Las máquinas concretas pueden requerir más intentos o no resolverse.

Se prorratea Plus: $59 / 1.200 = **$0,04917 por crédito**.

| Escenario | Créditos por GIF aceptable | Consumo equivalente por GIF | 57 ejercicios | 286 ejercicios |
| --- | ---: | ---: | ---: | ---: |
| 720p, 7 créditos por intento | 23–37 | $1,13–$1,82 | $64–$104 | $323–$520 |
| Motion Control 1080p, 12 por intento | 38–62 | $1,87–$3,05 | $106–$174 | $534–$872 |

Fórmula: `ejercicios × (2 + intentos × créditos_por_intento)`.
El equivalente de consumo no es el importe que permite pagar la plataforma.

### Desembolso por planes, sin promociones ni paquetes extra

- **57 a 720p:** 1.311–2.109 créditos; dos meses de Plus ($118, 2.400 créditos
  distribuidos entre esos meses) cubren este supuesto. También cabe en un mes
  de Ultra por $129 (3.000 créditos), $11 más para disponer del saldo ese mes.
- **286 a 720p:** 6.578–10.582 créditos; tres a cuatro meses de Ultra cuestan
  **$387–$516**, con 9.000–12.000 créditos generados a lo largo de esos meses.
- **286 en el escenario 1080p:** 10.868–17.732 créditos; cuatro a seis meses de
  Ultra cuestan **$516–$774**, con 12.000–18.000 créditos entre esos meses.

Hay que repartir el trabajo para consumir cada asignación antes de su renovación.
No son todos los créditos disponibles desde el primer día. Para terminar en un
mes habría que cotizar una asignación mayor o Credit Packs; no se verificó su
precio. Tampoco se presupuestan descuentos temporales ni Unlimited.

## Mejorar material existente puede costar más

[Genjutsu, actualizado el 2 de noviembre](https://higgsfield.ai/blog/higgsfield-genjutsu),
publica ejemplos de **15 s**: Lite 96/192 créditos a 720p/1080p y Motion Transfer
105/300. Al prorrateo Plus anterior, son **$4,72–$14,75 por intento**, según modo.
Son precios de 15 s; no equivalen al coste de nuestro GIF corto ni se extrapolan
como una tarifa exacta de 5 s. Mejoras de estilo, sustitución de objetos y upscale
se cotizan aparte con duración y modo definidos.

[Kling Motion Control](https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-kling)
usa imagen del personaje y vídeo de referencia. Nuestra vía sería vídeo generado
→ revisión de todos los cuadros → recorte/bucle → conversión local a GIF. La
conversión local no añade créditos de generación; no presupone exportación GIF
nativa ni resuelve por sí sola una técnica o una máquina incorrectas.

## Decisión propuesta, pendiente del dueño

Probar primero Goblet Squat con un mes de Plus como techo de suscripción de
referencia ($59 antes de impuestos), manteniendo un límite de intentos y sin
contratar automáticamente. Medir calidad, créditos y repeticiones antes de
escalar. Como reserva provisional para la biblioteca de 286, prever **$600 a
720p** o **$900 con margen para 1080p**, solo herramientas y bajo los supuestos
anteriores. El retoque avanzado masivo requiere otro presupuesto.
