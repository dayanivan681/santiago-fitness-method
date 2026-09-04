# Biblioteca maestra: fases 1 y 2

Fuente: `docs/cliente/Biblioteca_Maestra_Ejercicios_Santiago_Fitness_Method.pdf`
(18 páginas). El documento presenta 299 entradas; algunas aparecen en varios
grupos, por lo que no equivale automáticamente a 299 identidades únicas.

## Alcance retomado de Claude

El claim `90dd707` inició una fuente compartida de nombres, catálogo derivado,
paridad Coach/Cliente y alineación de nomenclatura. Esta fase conserva los 33
ejercicios existentes. La incorporación del resto del catálogo es posterior.

`shared/ejercicios-base.ts` define los pares id/nombre. Admin deriva su catálogo
de esa fuente y las fichas del cliente resuelven sus nombres con `nombreDe`.
La demo del landing deriva a su vez de esas fichas. Un identificador desconocido
bloquea la programación e informa cuál falta.

Los ids, imágenes, parámetros de carga y patrones permanecen iguales. Al iniciar,
la sincronización de biblioteca existente actualiza el nombre local y conserva
los incrementos y pesos base calibrados. Los historiales siguen asociados al id.

## Equivalencias verificables

Se adoptan términos del PDF cuando la ficha existente identifica la variante:
press convergente inclinado (p. 3), press de banca plano con barra (p. 3), press
plano con mancuernas (p. 3), pecho convergente horizontal (p. 3; ángulo plano),
pec deck (p. 3), fondos con énfasis en tríceps y extensión acostado con barra EZ
(p. 10), elevación lateral con mancuernas (p. 7), jalón cerrado neutro y remo con
barra inclinado (p. 5; confirmados por la explicación de la ficha), rumano con
barra y curl femoral acostado (p. 12), patada en cable y abducción sentado en
máquina (p. 13), pantorrillas de pie en máquina y sentado (p. 15).

El Smith mantiene **15°**, que es el ángulo del ejercicio e historial existente.
Su nombre se alinea con la familia «press inclinado bajo» del PDF, sin ampliar
la variante a todo el rango 15–30°.

## Confirmaciones pendientes

Se conserva el nombre genérico cuando el código no identifica una variante:

| Ejercicio existente | Dato que debe confirmar el coach |
| --- | --- |
| Extensión de tríceps en polea | Barra recta, V o cuerda |
| Elevación lateral en polea | Unilateral o bilateral |
| Lat pulldown | Agarre |
| Dominadas | Pronadas, supinadas, neutras o asistidas |
| Remo sentado en polea | Agarre |
| Curl con barra | Recta o EZ |
| Curl con mancuernas | Alterno o simultáneo |
| Sentadilla con barra | Barra alta o baja |
| Prensa de piernas | Inclinación/modelo |
| Extensión de cuádriceps | Unilateral o bilateral |
| Zancadas con mancuernas | Caminando, hacia delante o hacia atrás |

Asignar una de estas variantes requiere una decisión sobre los ids y el historial
previo; elegir «la más común» cambiaría el significado de los registros.

## Fuera de esta fase

Ampliar el catálogo, deduplicar sus entradas por identidad, añadir inglés,
lateralidad, compuesto/aislamiento, filtros nuevos o multimedia requiere otra
fase. Las capturas estáticas del landing y el informe PDF anterior conservan
la nomenclatura de su fecha; la demo interactiva recibe los nombres actuales.
No se cambia la programación de clientes ni se escribe en D1 remota.

## Verificación

Pruebas de paridad entre catálogo compartido y biblioteca, unicidad y estabilidad
de los 33 ids, referencias de plantillas, diagnóstico de ids desconocidos y
renombrado local idempotente sin pérdida de historial, plantilla o calibración.
Se actualizan las pruebas de interacción que dependían de los nombres anteriores.
Los resultados ejecutados y la evidencia visual se registran en `docs/HANDOFF.md`.
