# Phase 3A.5 — Canonical Catalog Review

**Recomendación: NOT READY FOR PHASE 3B.** Sólo análisis; no hay importación aprobada.

## Alcance y fuentes

Revisión individual de R01–R25 desde Phase 3A, commit `b783b5d`, y el PDF
`docs/cliente/Biblioteca_Maestra_Ejercicios_Santiago_Fitness_Method.pdf`.
Se releyeron los nombres, encabezados y contexto de las páginas implicadas
(3, 5–7, 9–13, 15–17), además de las instrucciones de p.18; se inspeccionó
visualmente p.10 para verificar la secuencia relevante al alias R04.
SHA-256 del PDF: `2a482961b3fa80f89c9ae0997e52c747553434a01de03e54d42c0bfda5c23ec0`.

Se consultaron `docs/BIBLIOTECA-FASE-3A-ANALISIS.md`, sus cinco CSV,
`CLAUDE.md` y `docs/HANDOFF.md`. No se usaron fuentes externas para suplir
la intención del cliente ni convenciones del ejercicio «más común».

**Los cinco CSV y el análisis de Phase 3A permanecen intactos.** La tabla nueva
`BIBLIOTECA-FASE-3A5-REVISION.csv` es una capa de revisión, no un dataset de importación.
Las referencias S/C son documentales; no son nuevos IDs operativos.
Los 33 IDs y los once mappings históricos pendientes no se modifican ni se
resuelven por las conclusiones de este documento.

## Cómo interpretar las decisiones

Cada caso tiene una clasificación principal, mutuamente excluyente para el
recuento. Resolver algunas parejas **no resuelve todo un caso** de 3–8 entradas.
Los subresultados de alta confianza aparecen expresamente en cada ficha y no se
cuentan como casos completos. R07/R17 comparten S078 y R08/R18 comparten S106:
no se crean identidades adicionales por aparecer en dos expedientes.

- SAME_IDENTITY: una misma ejecución acreditada, sin diferencias significativas.
- DISTINCT_VARIANTS: diferencias demostradas que resuelven la partición del caso completo.
- ALIAS: distinta denominación de la misma identidad propuesta; puede requerir confirmación.
- MULTI_CLASSIFICATION: una identidad demostrada con varios grupos/contextos.
- NEEDS_COACH_REVIEW: queda al menos una relación decisiva que la fuente no establece.

`confidence` mide evidencia para **resolver la identidad del caso completo**, no
confianza en detectar que falta información. MEDIA no autoriza aplicar una fusión.
La ausencia de datos de equipo/postura se mantiene como desconocida. Las
clasificaciones musculares se conservan como contexto, no como biomecánica probada.

La fuente es un listado, no 299 fichas técnicas: en estos casos su metadata
consiste en nombre, calificadores, sección y subcategoría. No da modelos de
máquina, imágenes ni instrucciones que permitan completar los huecos restantes.

## Tabla completa de decisiones

Las identidades de esta tabla se expresan por referencia C para hacerla legible;
sus nombres exactos y procedencia completa están inmediatamente después, caso por caso.
«Separadas provisionalmente» no demuestra que sean físicamente diferentes.

| case_id | source entries | proposed classification | proposed canonical identity/identities | confidence | reasoning | human review required |
| --- | --- | --- | --- | --- | --- | --- |
| R01 | S284, S295 | NEEDS_COACH_REVIEW | C284, C295; separadas provisionalmente | Insuficiente para cierre | La misma raíz del nombre y su presencia en core/agarre sugieren repetición, pero S295 no declara lateralidad. La ubicación no demuestra que el autor use Farmer carry exclusivamente para la ejecución bilateral. | Sí |
| R02 | S085, S114 | NEEDS_COACH_REVIEW | C085, C114; separadas provisionalmente | Insuficiente para cierre | Coincide el nombre de familia, pero el accesorio sólo está declarado en S114. El contexto muscular compatible no acredita cuerda ni descarta banda/u otra ejecución en S085. | Sí |
| R03 | S086, S112 | NEEDS_COACH_REVIEW | C086, C112; separadas provisionalmente | Insuficiente para cierre | La máquina genérica puede referirse al pec deck inverso, pero eso no está documentado. La sección deltoide posterior no identifica por sí misma aparato o trayectoria. | Sí |
| R04 | S018, S149 | ALIAS | C018: Press de banca agarre cerrado en Smith; C149 sería alias, aún sin unir | Media | La secuencia editorial respalda una abreviatura: el segundo renglón de tríceps parece la versión Smith del primero. No hay calificadores contradictorios. Aun así, S149 omite banca; la vecindad es evidencia contextual, no una definición expresa de equivalencia. | Sí |
| R05 | S082, S083, S084 | NEEDS_COACH_REVIEW | C082, C083, C084; separadas provisionalmente | Insuficiente para cierre | Barra y cuerda son diferencias expresas entre S082/S083. No existe una explicación que identifique el pullover con uno, ambos o ninguno de esos pulldowns. El encabezado no es una instrucción técnica. | Sí |
| R06 | S072, S115 | NEEDS_COACH_REVIEW | C072, C115; separadas provisionalmente | Insuficiente para cierre | Equipo y altura nominal coinciden; el énfasis aparece en el nombre de S115. Puede ser una clasificación más específica o una ejecución diferente. El PDF no decide cuál. | Sí |
| R07 | S064, S078, S116 | NEEDS_COACH_REVIEW | C064, C078, C116; separadas provisionalmente | Insuficiente para cierre | El apoyo común no elimina la diferencia de equipo S064/S078. Codos abiertos puede aplicarse a cualquiera; no consta equipo para S116 ni codos cerrados para los otros. | Sí |
| R08 | S106, S107, S110 | NEEDS_COACH_REVIEW | C106, C107, C110; separadas provisionalmente | Insuficiente para cierre | Inclinada y lean-away son candidatas a correspondencia, no una traducción acreditada aquí. S107 puede o no realizarse inclinándose. Ninguno de los encabezados añade postura/equipo faltante. | Sí |
| R09 | S277, S278 | NEEDS_COACH_REVIEW | C277, C278; separadas provisionalmente | Insuficiente para cierre | Arrodillado es un calificador real, pero el primero no dice de pie. No se puede demostrar ni identidad ni diferencia completa rellenando ese silencio. | Sí |
| R10 | S279, S280, S281 | NEEDS_COACH_REVIEW | C279, C280, C281; separadas provisionalmente | Insuficiente para cierre | Las dos direcciones son opuestas y justifican separación. Wood chop puede ser un alias contextual de una de ellas o una tercera ejecución; el PDF no da esa relación. | Sí |
| R11 | S016, S020 | NEEDS_COACH_REVIEW | C016, C020; separadas provisionalmente | Insuficiente para cierre | El intervalo de S020 puede estar contenido en el genérico. No se puede asignar 45° a S016 ni considerar el rango una sola variante de 15° del historial. | Sí |
| R12 | S023, S024, S025, S026, S027 | NEEDS_COACH_REVIEW | C023, C024, C025, C026, C027; separadas provisionalmente | Insuficiente para cierre | Los tres ángulos dan variantes separadas; unilateralidad y modo de carga son ejes distintos que pueden cruzarse con cualquiera de esos ángulos. | Sí |
| R13 | S001, S002, S003, S004, S005, S006, S007, S008 | NEEDS_COACH_REVIEW | C001, C002, C003, C004, C005, C006, C007, C008; separadas provisionalmente | Insuficiente para cierre | Equipo y ángulo separan las seis primeras. Neutro y alternado no son ángulos ni se excluyen mutuamente; pueden describir S004–S006 o combinarse entre sí. | Sí |
| R14 | S048, S049, S050, S051 | NEEDS_COACH_REVIEW | C048, C049, C050, C051; separadas provisionalmente | Insuficiente para cierre | Pronada, supinada y neutra son agarres distintos. Asistida describe otro eje; las primeras tampoco declaran sin asistencia. El alias explícito dentro de S049 no resuelve S051. | Sí |
| R15 | S058, S059 | NEEDS_COACH_REVIEW | C058, C059; separadas provisionalmente | Insuficiente para cierre | Una máquina puede satisfacer ambas etiquetas; el texto no demuestra que sean dos equipos ni dos ejecuciones excluyentes. | Sí |
| R16 | S069, S070, S071 | NEEDS_COACH_REVIEW | C069, C070, C071; separadas provisionalmente | Insuficiente para cierre | Neutro es orientación; ancho es separación, por lo que incluso S069/S070 pueden coexistir. La descripción anterior neutro/ancho no acredita agarres incompatibles sin más datos. | Sí |
| R17 | S074, S075, S076, S077, S078 | NEEDS_COACH_REVIEW | C074, C075, C076, C077, C078; separadas provisionalmente | Insuficiente para cierre | Selección de carga y convergente/divergente diferencian las tres primeras fichas nominales. Unilateralidad y apoyo no indican mecanismo ni trayectoria de las dos últimas. | Sí |
| R18 | S104, S105, S106 | NEEDS_COACH_REVIEW | C104, C105, C106; separadas provisionalmente | Insuficiente para cierre | No se declara de pie en S104. Sentado e inclinado pueden combinarse; la proximidad editorial no permite transferir mancuernas a los otros dos. | Sí |
| R19 | S145, S146, S147 | NEEDS_COACH_REVIEW | C145, C146, C147; separadas provisionalmente | Insuficiente para cierre | Preacher describe una variante/postura nominal; selectorizada carga; unilateral lateralidad. No son tres ejes excluyentes: una misma máquina/ejecución podría reunirlos. | Sí |
| R20 | S168 | NEEDS_COACH_REVIEW | C168; separadas provisionalmente | Insuficiente para cierre | No es evidencia de dos entradas duplicadas. Dip machine puede ser etiqueta inglesa pretendida como alias o una máquina de carga distinta; sin modelo o ficha no se puede afirmar que la traducción sea correcta ni dividirla en dos. | Sí |
| R21 | S186, S188 | NEEDS_COACH_REVIEW | C186, C188; separadas provisionalmente | Insuficiente para cierre | Pies adelantados no contradice back squat; describe otro eje. No consta posición de pies en S186 ni colocación de barra en S188. | Sí |
| R22 | S191, S192, S193, S194, S240 | NEEDS_COACH_REVIEW | C191, C192, C193, C194, C240; separadas provisionalmente | Insuficiente para cierre | Las orientaciones de máquina son diferentes. Unilateral y pies altos/abiertos pueden realizarse en ellas; la clasificación glúteo no crea otra identidad por sí sola, pero el calificador de pies tampoco puede borrarse. | Sí |
| R23 | S197, S198, S199, S200 | NEEDS_COACH_REVIEW | C197, C198, C199, C200; separadas provisionalmente | Insuficiente para cierre | Tres equipos se distinguen literalmente. La etiqueta piernas rígidas sugiere técnica diferenciada, pero el PDF no describe rodillas, recorrido ni su relación con rumano. No inventar una diferencia cinemática cuantificada ni afirmar alias. | Sí |
| R24 | S213, S214, S215, S216, S217 | NEEDS_COACH_REVIEW | C213, C214, C215, C216, C217; separadas provisionalmente | Insuficiente para cierre | Equipo/mecanismo de carga separan las cuatro primeras denominaciones. Unilateralidad puede aplicarse a cualquiera y no consta bilateralidad de las otras. | Sí |
| R25 | S251, S252, S253, S254, S255, S256, S257 | NEEDS_COACH_REVIEW | C251, C252, C253, C254, C255, C256, C257; separadas provisionalmente | Insuficiente para cierre | Se mezclan postura, equipo y lateralidad. El nombre máquina de S251 puede ser genérico respecto a Smith; no debe asignársele un modelo específico. Seated no equivale a una máquina concreta. | Sí |

## Expedientes y evidencia por caso

### R01 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S284 | Farmer carry bilateral | 16 | CORE / ABDOMINALES | Anti-rotación / oblicuos | C284 |
| S295 | Farmer carry | 17 | ANTEBRAZOS / AGARRE | Agarre | C295 |

**Metadata disponible:** S284 declara bilateral; S295 sólo Farmer carry. Ambos están bajo grupos funcionales distintos, sin equipo, agarre ni descripción de ejecución.

**Por qué se señaló y decisión:** La misma raíz del nombre y su presencia en core/agarre sugieren repetición, pero S295 no declara lateralidad. La ubicación no demuestra que el autor use Farmer carry exclusivamente para la ejecución bilateral.

**Resolución parcial / identidades propuestas:** Ninguna fusión segura. Si se confirma bilateral y misma ejecución, una identidad conservaría CORE / ABDOMINALES → Anti-rotación / oblicuos y ANTEBRAZOS / AGARRE → Agarre.

**Pregunta para cerrar:** ¿S295 es exactamente el carry bilateral S284 o abarca otra lateralidad/equipo?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R02 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S085 | Face pull | 6 | ESPALDA | Extensión/hombro y espalda alta | C085 |
| S114 | Face pull con cuerda | 7 | HOMBROS | Deltoide posterior / estabilidad | C114 |

**Metadata disponible:** S085 dice Face pull; S114 añade con cuerda. Sus subsecciones son espalda alta y deltoide posterior/estabilidad; ninguna fija el equipo de S085.

**Por qué se señaló y decisión:** Coincide el nombre de familia, pero el accesorio sólo está declarado en S114. El contexto muscular compatible no acredita cuerda ni descarta banda/u otra ejecución en S085.

**Resolución parcial / identidades propuestas:** Ninguna. Si se confirma misma ejecución con cuerda, el nombre más específico sería Face pull con cuerda, conservando ambas clasificaciones.

**Pregunta para cerrar:** ¿S085 se realiza con cuerda y el mismo equipo/ejecución que S114?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R03 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S086 | Reverse fly en máquina | 6 | ESPALDA | Extensión/hombro y espalda alta | C086 |
| S112 | Reverse pec deck | 7 | HOMBROS | Deltoide posterior / estabilidad | C112 |

**Metadata disponible:** S086 explicita máquina; S112 nombra Reverse pec deck. El PDF no aporta foto, modelo, agarres ni descripción que vincule ambos.

**Por qué se señaló y decisión:** La máquina genérica puede referirse al pec deck inverso, pero eso no está documentado. La sección deltoide posterior no identifica por sí misma aparato o trayectoria.

**Resolución parcial / identidades propuestas:** Ninguna. No se traduce Reverse pec deck a toda máquina de reverse fly.

**Pregunta para cerrar:** ¿La máquina de S086 es el reverse pec deck de S112, con misma posición y agarre?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R04 — ALIAS

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S018 | Press de banca agarre cerrado en Smith | 3 | PECHO | Smith | C018 |
| S149 | Press cerrado en Smith | 10 | TRÍCEPS | Press y peso libre | C149 |

**Metadata disponible:** S018 explicita banca, agarre cerrado y Smith. S149 dice cerrado y Smith. En p.10, S149 sigue inmediatamente a Press de banca agarre cerrado dentro de Press y peso libre; p.3 ubica S018 bajo Smith.

**Por qué se señaló y decisión:** La secuencia editorial respalda una abreviatura: el segundo renglón de tríceps parece la versión Smith del primero. No hay calificadores contradictorios. Aun así, S149 omite banca; la vecindad es evidencia contextual, no una definición expresa de equivalencia.

**Resolución parcial / identidades propuestas:** ALIAS propuesto, confianza media, no aplicado: canonical name Press de banca agarre cerrado en Smith; alias Press cerrado en Smith. Fuentes S018 y S149, páginas 3 y 10; conservar PECHO → Smith y TRÍCEPS → Press y peso libre. Si se confirma, no se pierde ningún calificador de los nombres y no se añade ángulo plano, que ninguno especifica.

**Pregunta para cerrar:** ¿S149 abrevia exactamente S018, sin cambio de apoyo, ángulo o ejecución? Confirmar antes de unir C149 con C018.

**Confianza y revisión:** MEDIA; revisión humana obligatoria. Delta aplicado: 0.

### R05 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S082 | Straight-arm pulldown con barra | 6 | ESPALDA | Extensión/hombro y espalda alta | C082 |
| S083 | Straight-arm pulldown con cuerda | 6 | ESPALDA | Extensión/hombro y espalda alta | C083 |
| S084 | Pullover en cable | 6 | ESPALDA | Extensión/hombro y espalda alta | C084 |

**Metadata disponible:** S082 nombra Straight-arm pulldown con barra; S083 con cuerda; S084 Pullover en cable. Comparten subsección, pero sólo S084 explicita cable y no define accesorio.

**Por qué se señaló y decisión:** Barra y cuerda son diferencias expresas entre S082/S083. No existe una explicación que identifique el pullover con uno, ambos o ninguno de esos pulldowns. El encabezado no es una instrucción técnica.

**Resolución parcial / identidades propuestas:** Alta confianza parcial: S082 y S083 son variantes de accesorio distintas. S084 sigue sin asignación; no se convierte en alias de ambas.

**Pregunta para cerrar:** ¿S084 es una ejecución distinta o el mismo straight-arm pulldown? Si es el mismo, ¿con qué accesorio y técnica?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R06 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S072 | Remo alto en cable | 5 | ESPALDA | Remos - máquina/cable | C072 |
| S115 | Remo alto para deltoide posterior con cable | 7 | HOMBROS | Deltoide posterior / estabilidad | C115 |

**Metadata disponible:** S072 declara remo alto en cable; S115 añade para deltoide posterior con cable. No se describen trayectoria, agarre ni posición de codos.

**Por qué se señaló y decisión:** Equipo y altura nominal coinciden; el énfasis aparece en el nombre de S115. Puede ser una clasificación más específica o una ejecución diferente. El PDF no decide cuál.

**Resolución parcial / identidades propuestas:** Ninguna. No borrar el énfasis técnico de S115 ni inferir que S072 ya lo incluye.

**Pregunta para cerrar:** ¿S072 y S115 tienen la misma trayectoria, agarre y posición de codos, o el énfasis cambia la ejecución?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R07 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S064 | Remo pecho apoyado con mancuernas | 5 | ESPALDA | Remos - peso libre | C064 |
| S078 | Remo pecho apoyado en máquina | 5 | ESPALDA | Remos - máquina/cable | C078 |
| S116 | Remo pecho apoyado codos abiertos | 7 | HOMBROS | Deltoide posterior / estabilidad | C116 |

**Metadata disponible:** S064: pecho apoyado con mancuernas. S078: pecho apoyado en máquina. S116: pecho apoyado y codos abiertos, sin equipo.

**Por qué se señaló y decisión:** El apoyo común no elimina la diferencia de equipo S064/S078. Codos abiertos puede aplicarse a cualquiera; no consta equipo para S116 ni codos cerrados para los otros.

**Resolución parcial / identidades propuestas:** Alta confianza parcial: S064 y S078 distintos por mancuernas/máquina. S116 no se asigna a ninguno. S078 también participa en R17.

**Pregunta para cerrar:** ¿S116 usa mancuernas o qué máquina? ¿Los codos abiertos distinguen una ejecución respecto a S064/S078?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R08 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S106 | Elevación lateral inclinada | 7 | HOMBROS | Deltoide lateral | C106 |
| S107 | Elevación lateral unilateral en cable | 7 | HOMBROS | Deltoide lateral | C107 |
| S110 | Lean-away cable lateral raise | 7 | HOMBROS | Deltoide lateral | C110 |

**Metadata disponible:** S106: inclinada, equipo sin especificar. S107: unilateral en cable, inclinación sin especificar. S110: Lean-away cable lateral raise, cable y denominación lean-away; sin lateralidad literal.

**Por qué se señaló y decisión:** Inclinada y lean-away son candidatas a correspondencia, no una traducción acreditada aquí. S107 puede o no realizarse inclinándose. Ninguno de los encabezados añade postura/equipo faltante.

**Resolución parcial / identidades propuestas:** Ninguna separación o fusión completa. No asignar mancuernas a S106 por cercanía a S104, ni unilateral a S110 por convención.

**Pregunta para cerrar:** ¿Qué inclinación y equipo define S106? ¿S107 se hace sin lean-away? ¿S110 es una o dos manos?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R09 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S277 | Pallof press | 16 | CORE / ABDOMINALES | Anti-rotación / oblicuos | C277 |
| S278 | Pallof press arrodillado | 16 | CORE / ABDOMINALES | Anti-rotación / oblicuos | C278 |

**Metadata disponible:** S277: Pallof press, postura no especificada. S278: Pallof press arrodillado. Ambos en Anti-rotación / oblicuos; sin descripción de equipo.

**Por qué se señaló y decisión:** Arrodillado es un calificador real, pero el primero no dice de pie. No se puede demostrar ni identidad ni diferencia completa rellenando ese silencio.

**Resolución parcial / identidades propuestas:** Ninguna. Mantener el candidato arrodillado específico y el genérico pendiente.

**Pregunta para cerrar:** ¿S277 significa de pie u otra postura, o es la familia que incluye S278?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R10 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S279 | Cable chop alto a bajo | 16 | CORE / ABDOMINALES | Anti-rotación / oblicuos | C279 |
| S280 | Cable lift bajo a alto | 16 | CORE / ABDOMINALES | Anti-rotación / oblicuos | C280 |
| S281 | Wood chop | 16 | CORE / ABDOMINALES | Anti-rotación / oblicuos | C281 |

**Metadata disponible:** S279 explicita cable y dirección alto a bajo; S280 cable y bajo a alto. S281 sólo Wood chop, sin dirección ni equipo.

**Por qué se señaló y decisión:** Las dos direcciones son opuestas y justifican separación. Wood chop puede ser un alias contextual de una de ellas o una tercera ejecución; el PDF no da esa relación.

**Resolución parcial / identidades propuestas:** Alta confianza parcial: S279 y S280 distintos por dirección. No extender esa conclusión a S281.

**Pregunta para cerrar:** ¿S281 se ejecuta con cable? ¿En qué dirección? ¿Es otro nombre de S279 o S280?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R11 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S016 | Press inclinado en Smith | 3 | PECHO | Smith | C016 |
| S020 | Press inclinado bajo (15-30°) en Smith | 3 | PECHO | Smith | C020 |

**Metadata disponible:** S016: press inclinado en Smith. S020: press inclinado bajo (15-30°) en Smith. Misma subsección; S016 no tiene ángulo.

**Por qué se señaló y decisión:** El intervalo de S020 puede estar contenido en el genérico. No se puede asignar 45° a S016 ni considerar el rango una sola variante de 15° del historial.

**Resolución parcial / identidades propuestas:** Ninguna. La ficha histórica Smith a 15° y su mapping permanecen intactos; este caso sólo compara dos entradas del PDF.

**Pregunta para cerrar:** ¿S016 tiene un ángulo distinto del rango 15-30°, o es un encabezado genérico que incluye S020?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R12 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S023 | Press de pecho convergente horizontal | 3 | PECHO | Máquinas | C023 |
| S024 | Press convergente inclinado | 3 | PECHO | Máquinas | C024 |
| S025 | Press convergente declinado | 3 | PECHO | Máquinas | C025 |
| S026 | Press unilateral convergente | 3 | PECHO | Máquinas | C026 |
| S027 | Press de pecho con discos (plate-loaded) | 3 | PECHO | Máquinas | C027 |

**Metadata disponible:** S023 horizontal, S024 inclinado y S025 declinado, todos convergentes. S026 unilateral convergente sin ángulo. S027 de pecho con discos (plate-loaded), sin convergencia ni ángulo declarados. Todos bajo Máquinas.

**Por qué se señaló y decisión:** Los tres ángulos dan variantes separadas; unilateralidad y modo de carga son ejes distintos que pueden cruzarse con cualquiera de esos ángulos.

**Resolución parcial / identidades propuestas:** Alta confianza parcial: S023/S024/S025 distintos por ángulo. S026/S027 pendientes; no inferir bilateral o selectorizada para S023–S025.

**Pregunta para cerrar:** ¿Qué ángulo/modelo tienen S026 y S027? ¿S027 es convergente? ¿Es alguno de los tres anteriores?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R13 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S001 | Press de banca plano con barra | 3 | PECHO | Peso libre - barra y mancuernas | C001 |
| S002 | Press inclinado con barra | 3 | PECHO | Peso libre - barra y mancuernas | C002 |
| S003 | Press declinado con barra | 3 | PECHO | Peso libre - barra y mancuernas | C003 |
| S004 | Press plano con mancuernas | 3 | PECHO | Peso libre - barra y mancuernas | C004 |
| S005 | Press inclinado con mancuernas | 3 | PECHO | Peso libre - barra y mancuernas | C005 |
| S006 | Press declinado con mancuernas | 3 | PECHO | Peso libre - barra y mancuernas | C006 |
| S007 | Press con mancuernas agarre neutro | 3 | PECHO | Peso libre - barra y mancuernas | C007 |
| S008 | Press alternado con mancuernas | 3 | PECHO | Peso libre - barra y mancuernas | C008 |

**Metadata disponible:** S001–S003: barra, respectivamente plano/inclinado/declinado. S004–S006: mancuernas con los mismos tres ángulos. S007: mancuernas neutro, sin ángulo. S008: mancuernas alternado, sin ángulo/agarre.

**Por qué se señaló y decisión:** Equipo y ángulo separan las seis primeras. Neutro y alternado no son ángulos ni se excluyen mutuamente; pueden describir S004–S006 o combinarse entre sí.

**Resolución parcial / identidades propuestas:** Alta confianza parcial: seis variantes S001–S006 distintas por equipo/ángulo. S007/S008 no asignados. No se cambia ningún ID actual asociado a estas fuentes.

**Pregunta para cerrar:** ¿Qué ángulo tiene S007 y S008? ¿Qué agarre usa S008? ¿Son refinamientos de una de las seis o entradas intencionalmente independientes?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R14 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S048 | Dominada pronada | 5 | ESPALDA | Jalones verticales | C048 |
| S049 | Dominada supinada / chin-up | 5 | ESPALDA | Jalones verticales | C049 |
| S050 | Dominada agarre neutro | 5 | ESPALDA | Jalones verticales | C050 |
| S051 | Dominada asistida | 5 | ESPALDA | Jalones verticales | C051 |

**Metadata disponible:** S048 pronada, S049 supinada / chin-up, S050 neutra, S051 asistida. Todas bajo Jalones verticales. S051 no especifica agarre ni mecanismo de asistencia.

**Por qué se señaló y decisión:** Pronada, supinada y neutra son agarres distintos. Asistida describe otro eje; las primeras tampoco declaran sin asistencia. El alias explícito dentro de S049 no resuelve S051.

**Resolución parcial / identidades propuestas:** Alta confianza parcial: S048/S049/S050 distintos por agarre. Alias interno supinada/chin-up ya pertenece a una sola entrada; cero reducción de identidades por reconocerlo.

**Pregunta para cerrar:** ¿Qué agarre y asistencia define S051? ¿Representa una variante concreta o una familia? No es la pregunta de mapping del ID histórico dominadas.

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R15 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S058 | Pulldown convergente plate-loaded | 5 | ESPALDA | Jalones verticales | C058 |
| S059 | Pulldown unilateral convergente | 5 | ESPALDA | Jalones verticales | C059 |

**Metadata disponible:** S058: convergente plate-loaded. S059: unilateral convergente. Ambos jalones verticales; S058 no dice bilateral y S059 no dice tipo de carga.

**Por qué se señaló y decisión:** Una máquina puede satisfacer ambas etiquetas; el texto no demuestra que sean dos equipos ni dos ejecuciones excluyentes.

**Resolución parcial / identidades propuestas:** Ninguna. No traducir plate-loaded a bilateral ni unilateral a selectorizada.

**Pregunta para cerrar:** ¿S059 usa la misma máquina con discos de S058? ¿Cómo se ejecuta S058 respecto a lateralidad?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R16 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S069 | Remo sentado en cable agarre neutro | 5 | ESPALDA | Remos - máquina/cable | C069 |
| S070 | Remo sentado en cable agarre ancho | 5 | ESPALDA | Remos - máquina/cable | C070 |
| S071 | Remo sentado unilateral en cable | 5 | ESPALDA | Remos - máquina/cable | C071 |

**Metadata disponible:** S069: cable, sentado, agarre neutro. S070: cable, sentado, agarre ancho. S071: cable, sentado, unilateral, sin agarre. Las tres comparten Remos - máquina/cable.

**Por qué se señaló y decisión:** Neutro es orientación; ancho es separación, por lo que incluso S069/S070 pueden coexistir. La descripción anterior neutro/ancho no acredita agarres incompatibles sin más datos.

**Resolución parcial / identidades propuestas:** Ninguna frontera completa entre las tres. No llamar cerrado al agarre neutro de S069: el PDF no lo dice.

**Pregunta para cerrar:** ¿Cuál es la anchura de S069, la orientación de S070 y el agarre de S071? ¿S069/S070 se ejecutan a dos manos?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R17 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S074 | Remo máquina selectorizada | 5 | ESPALDA | Remos - máquina/cable | C074 |
| S075 | Remo convergente plate-loaded | 5 | ESPALDA | Remos - máquina/cable | C075 |
| S076 | Remo divergente plate-loaded | 5 | ESPALDA | Remos - máquina/cable | C076 |
| S077 | Remo unilateral en máquina | 5 | ESPALDA | Remos - máquina/cable | C077 |
| S078 | Remo pecho apoyado en máquina | 5 | ESPALDA | Remos - máquina/cable | C078 |

**Metadata disponible:** S074 máquina selectorizada; S075 convergente plate-loaded; S076 divergente plate-loaded; S077 unilateral en máquina; S078 pecho apoyado en máquina.

**Por qué se señaló y decisión:** Selección de carga y convergente/divergente diferencian las tres primeras fichas nominales. Unilateralidad y apoyo no indican mecanismo ni trayectoria de las dos últimas.

**Resolución parcial / identidades propuestas:** Alta confianza parcial: S074 frente a S075/S076 por carga; S075 frente a S076 por convergencia/divergencia. S077/S078 pendientes; R07 comparte S078.

**Pregunta para cerrar:** ¿Qué modelos, carga y trayectoria corresponden a S077/S078? ¿Son configuraciones de S074–S076?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R18 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S104 | Elevación lateral con mancuernas | 7 | HOMBROS | Deltoide lateral | C104 |
| S105 | Elevación lateral sentado | 7 | HOMBROS | Deltoide lateral | C105 |
| S106 | Elevación lateral inclinada | 7 | HOMBROS | Deltoide lateral | C106 |

**Metadata disponible:** S104 explicita mancuernas, no postura. S105 dice sentado, no equipo. S106 dice inclinada, no equipo ni apoyo. Las tres bajo Deltoide lateral.

**Por qué se señaló y decisión:** No se declara de pie en S104. Sentado e inclinado pueden combinarse; la proximidad editorial no permite transferir mancuernas a los otros dos.

**Resolución parcial / identidades propuestas:** Ninguna. Resolver junto a R08 porque S106 es la misma fuente; no emitir decisiones contradictorias.

**Pregunta para cerrar:** ¿S104 tiene postura definida? ¿Qué equipo y tipo de inclinación usan S105/S106?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R19 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S145 | Preacher curl en máquina | 9 | BÍCEPS | Cable / máquina | C145 |
| S146 | Curl de bíceps en máquina selectorizada | 9 | BÍCEPS | Cable / máquina | C146 |
| S147 | Curl unilateral en máquina | 9 | BÍCEPS | Cable / máquina | C147 |

**Metadata disponible:** S145 Preacher curl en máquina; S146 curl en máquina selectorizada; S147 unilateral en máquina. Subcategoría mixta Cable / máquina; los tres nombres sí especifican máquina.

**Por qué se señaló y decisión:** Preacher describe una variante/postura nominal; selectorizada carga; unilateral lateralidad. No son tres ejes excluyentes: una misma máquina/ejecución podría reunirlos.

**Resolución parcial / identidades propuestas:** Ninguna. No declarar preacher no selectorizado o bilateral por omisión.

**Pregunta para cerrar:** ¿S145/S146 son la misma máquina? ¿Qué apoyo, carga y lateralidad tiene cada uno? ¿Qué máquina define S147?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R20 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S168 | Dip machine / fondos asistidos en máquina | 10 | TRÍCEPS | Cable / máquina | C168 |

**Metadata disponible:** Una sola entrada S168: Dip machine / fondos asistidos en máquina. La barra oblicua une ambas expresiones; asistidos es el único modo de ayuda explícito.

**Por qué se señaló y decisión:** No es evidencia de dos entradas duplicadas. Dip machine puede ser etiqueta inglesa pretendida como alias o una máquina de carga distinta; sin modelo o ficha no se puede afirmar que la traducción sea correcta ni dividirla en dos.

**Resolución parcial / identidades propuestas:** Ninguna. Conservar C168 y el texto literal como registro pendiente. No tratar la barra oblicua como aprobación semántica automática.

**Pregunta para cerrar:** ¿Se refiere sólo a fondos asistidos, sólo a una máquina de resistencia, o a dos ejercicios? Una respuesta dos aumentaría el total, no lo reduciría.

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R21 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S186 | Smith back squat | 11 | CUÁDRICEPS | Máquinas / Smith | C186 |
| S188 | Smith squat con pies adelantados | 11 | CUÁDRICEPS | Máquinas / Smith | C188 |

**Metadata disponible:** S186 Smith back squat. S188 Smith squat con pies adelantados. Ambos Máquinas / Smith; la entrada vecina S187 es Smith front squat, pero no define la posición de S188.

**Por qué se señaló y decisión:** Pies adelantados no contradice back squat; describe otro eje. No consta posición de pies en S186 ni colocación de barra en S188.

**Resolución parcial / identidades propuestas:** Ninguna. No completar pies estándar en S186 ni barra atrás en S188 por uso frecuente.

**Pregunta para cerrar:** ¿Dónde va la barra en S188? ¿S186 define una posición de pies diferente o incluye la adelantada?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R22 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S191 | Leg press 45° | 11 | CUÁDRICEPS | Máquinas / Smith | C191 |
| S192 | Leg press horizontal | 11 | CUÁDRICEPS | Máquinas / Smith | C192 |
| S193 | Leg press vertical | 11 | CUÁDRICEPS | Máquinas / Smith | C193 |
| S194 | Leg press unilateral | 11 | CUÁDRICEPS | Máquinas / Smith | C194 |
| S240 | Leg press pies altos y abiertos | 13 | GLÚTEOS | Compuestos con énfasis glúteo | C240 |

**Metadata disponible:** S191 45°, S192 horizontal, S193 vertical; S194 unilateral sin orientación. S240 pies altos y abiertos, bajo Compuestos con énfasis glúteo, sin orientación/lateralidad.

**Por qué se señaló y decisión:** Las orientaciones de máquina son diferentes. Unilateral y pies altos/abiertos pueden realizarse en ellas; la clasificación glúteo no crea otra identidad por sí sola, pero el calificador de pies tampoco puede borrarse.

**Resolución parcial / identidades propuestas:** Alta confianza parcial: S191/S192/S193 distintos por orientación. S194/S240 pendientes. Compuesto se conserva como contexto literal de S240, no deducción general.

**Pregunta para cerrar:** ¿En qué prensa se ejecutan S194/S240? ¿S240 usa una o dos piernas y define una variante de alguna S191–S193?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R23 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S197 | Peso muerto rumano con barra | 12 | FEMORALES | Bisagra de cadera | C197 |
| S198 | Peso muerto rumano con mancuernas | 12 | FEMORALES | Bisagra de cadera | C198 |
| S199 | Peso muerto rumano en Smith | 12 | FEMORALES | Bisagra de cadera | C199 |
| S200 | Peso muerto piernas rígidas | 12 | FEMORALES | Bisagra de cadera | C200 |

**Metadata disponible:** S197 rumano con barra; S198 rumano con mancuernas; S199 rumano Smith; S200 piernas rígidas, sin equipo. Todas bajo Bisagra de cadera.

**Por qué se señaló y decisión:** Tres equipos se distinguen literalmente. La etiqueta piernas rígidas sugiere técnica diferenciada, pero el PDF no describe rodillas, recorrido ni su relación con rumano. No inventar una diferencia cinemática cuantificada ni afirmar alias.

**Resolución parcial / identidades propuestas:** Alta confianza parcial: S197/S198/S199 distintos por equipo. S200 mantiene identidad propuesta separada, todavía no una distinción técnica aprobada.

**Pregunta para cerrar:** ¿Qué equipo/ejecución define S200 y qué diferencia pretende el autor respecto al rumano?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R24 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S213 | Hip thrust con barra | 13 | GLÚTEOS | Extensión de cadera | C213 |
| S214 | Hip thrust en Smith | 13 | GLÚTEOS | Extensión de cadera | C214 |
| S215 | Hip thrust en máquina plate-loaded | 13 | GLÚTEOS | Extensión de cadera | C215 |
| S216 | Hip thrust en máquina selectorizada | 13 | GLÚTEOS | Extensión de cadera | C216 |
| S217 | Hip thrust unilateral | 13 | GLÚTEOS | Extensión de cadera | C217 |

**Metadata disponible:** S213 barra, S214 Smith, S215 máquina plate-loaded, S216 máquina selectorizada; S217 unilateral sin equipo. Todos Extensión de cadera.

**Por qué se señaló y decisión:** Equipo/mecanismo de carga separan las cuatro primeras denominaciones. Unilateralidad puede aplicarse a cualquiera y no consta bilateralidad de las otras.

**Resolución parcial / identidades propuestas:** Alta confianza parcial: S213–S216 distintos por equipo/carga. S217 no asignado.

**Pregunta para cerrar:** ¿Qué equipo/modelo define S217? ¿Es la ejecución unilateral de una ficha anterior y cómo se ejecuta esa ficha?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

### R25 — NEEDS_COACH_REVIEW

| Source | Nombre exacto | Página | Grupo muscular del PDF | Subcategoría | Identidad provisional conservada |
| --- | --- | ---: | --- | --- | --- |
| S251 | Standing calf raise en máquina | 15 | PANTORRILLAS / TIBIAL | Pantorrillas | C251 |
| S252 | Seated calf raise | 15 | PANTORRILLAS / TIBIAL | Pantorrillas | C252 |
| S253 | Calf raise en leg press | 15 | PANTORRILLAS / TIBIAL | Pantorrillas | C253 |
| S254 | Calf raise en Smith | 15 | PANTORRILLAS / TIBIAL | Pantorrillas | C254 |
| S255 | Calf raise con mancuernas | 15 | PANTORRILLAS / TIBIAL | Pantorrillas | C255 |
| S256 | Calf raise unilateral | 15 | PANTORRILLAS / TIBIAL | Pantorrillas | C256 |
| S257 | Donkey calf raise | 15 | PANTORRILLAS / TIBIAL | Pantorrillas | C257 |

**Metadata disponible:** S251 de pie en máquina; S252 sentado sin equipo; S253 leg press; S254 Smith; S255 mancuernas; S256 unilateral sin equipo/postura; S257 Donkey calf raise sin descripción de aparato/apoyo.

**Por qué se señaló y decisión:** Se mezclan postura, equipo y lateralidad. El nombre máquina de S251 puede ser genérico respecto a Smith; no debe asignársele un modelo específico. Seated no equivale a una máquina concreta.

**Resolución parcial / identidades propuestas:** Alta confianza parcial: de pie S251 frente a sentado S252 por postura; S253/S254/S255 separados por equipo explícito. S256/S257 y la relación máquina genérica con modelos quedan pendientes.

**Pregunta para cerrar:** ¿Qué máquina es S251, qué equipo usa S252 y cuál es la postura/equipo de S256/S257? ¿Donkey corresponde a una máquina o carga libre concreta?

**Confianza y revisión:** INSUFICIENTE_PARA_RESOLVER_CASO; revisión humana obligatoria. Delta aplicado: 0.

## Precisiones respecto de Phase 3A

La relectura detectó que algunos resúmenes anteriores añadían calificadores no
presentes en los nombres. Se deja constancia **sin editar los datasets ni los mappings**:

- S069 dice «agarre neutro», no «neutro cerrado». S070 dice «ancho», no define
  orientación. Por eso R16 no puede resolverse como tres agarres excluyentes.
- S193 es «Leg press vertical» y S194 «Leg press unilateral». La tabla narrativa
  de Phase 3A describía equivocadamente esas posiciones como unilateral/pies altos.
  «Leg press pies altos y abiertos» es S240, p.13. Las fuentes originales del CSV
  sí conservan los nombres correctos. No se decide aquí el mapping histórico de prensa.
- S052/S053 dicen «Lat pulldown agarre ancho/medio», no «pronado». Esa inferencia
  del resumen anterior no puede usarse en una importación ni como respuesta del coach.

Estas precisiones no autorizan a asignar las once variantes legacy. Antes de
Phase 3B debe aprobarse la corrección de los resúmenes de decisión que vaya a
usar el importador, manteniendo como autoridad los textos fuente exactos.

## Métricas y cálculo del total provisional

| Métrica (casos completos, no parejas internas) | Resultado |
| --- | ---: |
| Casos revisados | 25 |
| SAME_IDENTITY | 0 |
| DISTINCT_VARIANTS | 0 |
| ALIAS | 1 |
| MULTI_CLASSIFICATION | 0 |
| NEEDS_COACH_REVIEW | 24 |
| Casos completos resueltos con alta confianza | 0 |
| Casos que aún requieren decisión humana | 25 |
| Casos con distinciones parciales de alta confianza | 11 |
| Fusiones nuevas de alta confianza aplicables | 0 |
| Separaciones nuevas de alta confianza que aumentan identidades | 0 |
| Total canónico PROVISIONAL sobre la base Phase 3A | **293** |

Las 11 distinciones parciales están en R05, R07, R10, R12, R13, R14, R17,
R22, R23, R24 y R25. No se cuentan como once casos DISTINCT_VARIANTS porque
en cada uno subsiste al menos una relación pendiente. Las variantes ya estaban
separadas en las 293 propuestas: mantenerlas no aumenta el total.

Cálculo: **293 − 0 fusiones nuevas seguras + 0 particiones nuevas seguras = 293**.
Se conserva la base de seis consolidaciones de Phase 3A como hipótesis de partida;
esta revisión de R01–R25 no revalida ni eleva la confianza de D01–D06. En particular,
no convierte por arrastre el alias bilingüe D06 en una aprobación nueva.
Si posteriormente se confirma R04, el escenario sería 292, pero **292 no es el
resultado de esta fase**. Si S168 agrupa dos movimientos y se aprueba dividirlo,
el total podría aumentar. No es válido restar un caso por cada duda cerrada.

Los 25 casos pendientes del catálogo no son los once IDs históricos pendientes:
son conjuntos de preguntas diferentes y no se suman como 36 ejercicios ambiguos.
El mapping previo sigue en 22 verificables y 11 sin asignación; no se ha actualizado.

## Recomendación explícita

**NOT READY FOR PHASE 3B** para fijar/importar el catálogo completo como identidades
definitivas. Motivos:

1. Ningún caso completo tiene evidencia suficiente para una nueva fusión de alta
   confianza. R04 tiene un alias editorial plausible, todavía no confirmado.
2. Persisten familias genéricas cruzadas con ángulos, equipos, agarres y lateralidad;
   importarlas como identidades físicas independientes consolidaría ambigüedad.
3. S168 puede incluso necesitar partición: un simple proceso de deduplicación
   reductiva no basta para resolver ese registro.
4. Los metadatos incompletos y la protección de IDs/históricos identificados en
   Phase 3A siguen vigentes. Esta revisión no valida fichas operativas, cargas,
   multimedia, sustituciones ni los once mappings legacy.
5. Las precisiones de nomenclatura anteriores deben incorporarse, con aprobación,
   a las decisiones finales antes de preparar datasets de importación.

Siguiente paso recomendado: entregar al coach las preguntas de los 25 expedientes
y pedir equipo/modelo, postura, agarre y si cada nombre genérico es familia, alias
o variante concreta. Atender juntos R07/R17 y R08/R18. Separar esta revisión de
las preguntas sobre qué representaban los registros históricos.

Un lote limitado podría evaluarse en otra aprobación excluyendo explícitamente
los registros pendientes y completando sus fichas; **no se da aquí READY ni se
autoriza ese lote por defecto**. No se implementa Phase 3B.

## Validación documental

- Cada uno de R01–R25 aparece una vez en la tabla y en el CSV nuevo, con las
  mismas fuentes que REVISION de Phase 3A. Los nombres/grupos/subcategorías/páginas
  se contrastaron con el texto extraído del PDF y sus encabezados.
- Todas las decisiones tienen pregunta concreta y deltas explícitos. R04 está
  marcado como alias propuesto, media confianza, revisión humana y delta cero.
- Los cinco CSV y el Markdown de Phase 3A, código de producción y `docs/cliente`
  permanecen idénticos a `b783b5d`. No se ejecutan llamadas D1 ni cambios de UI.
- Readback de CSV/Markdown: PASS en cobertura de R01–R25, referencias originales,
  métricas y deltas; verificación directa de nombres, páginas y encabezados del
  PDF, incluyendo la continuación de ESPALDA de p.5 a p.6. Comparación byte a
  byte de fuentes y datasets con `b783b5d`: PASS.
- `npm test`: 602/602 PASS en esta corrida; `npm run lint`: PASS;
  `npm run build`: PASS (app y presentación). La intermitencia de Perfil registrada
  en Phase 3A no reapareció en esta corrida, pero no se considera diagnosticada
  ni corregida. Estas pruebas no equivalen a aprobación semántica del catálogo.

**Fin de Phase 3A.5. Detenerse y esperar decisión; no importar.**
