# Procedencia de fotos — cierre unilateral 2026-09-28

14 archivos: 11 nuevas fichas (los diez pedidos y C071) y tres reemplazos.
Todas las entregas son JPG 850×567, menores de 100.000 bytes. Los originales IA
se generaron con la herramienta integrada `image_gen`, una imagen por ejercicio;
la única transformación local fue redimensionar y comprimir con macOS `sips`.
No se utilizó una API externa ni la alternativa CLI de generación.

Las 12 representaciones IA **no son fotografías reales**: están marcadas
`imagenGenerada=true` y la ficha avisa «Imagen generada con IA».
Los [términos de OpenAI](https://openai.com/policies/terms-of-use/), sección
Content, asignan el Output al usuario, sujeto a sus condiciones. No se atribuye
una licencia de dominio público ni exclusividad a las imágenes sintéticas.
C071 y C256 provienen de [free-exercise-db](https://github.com/yuhonas/free-exercise-db),
que publica el dataset e imágenes como dominio público bajo
[Unlicense](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md),
con uso comercial permitido. Copia local: `UNLICENSE-free-exercise-db.txt`.

El PDF del cliente enumera nombres/categorías, no fija modelos ni posturas.
La revisión visual comprueba movimiento, equipo, unilateralidad, agarre y
anatomía visible. El equipo es representativo; el bloque B quedó genérico según
confirmación del dueño. Los músculos y cargas siguen siendo estimados.

| Archivo | Origen | Condiciones | Revisión visual |
|---|---|---|---|
| [sfm-catalog-c026.jpg](sfm-catalog-c026.jpg) | **Generada con IA — OpenAI image_gen** | [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/) | Press de pecho: una palanca adelantada, brazo opuesto libre, respaldo y palancas con pivotes visibles. |
| [sfm-catalog-c031.jpg](sfm-catalog-c031.jpg) | **Generada con IA — OpenAI image_gen** | [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/) | Press en cable: agarre individual, empuje delante del pecho, cable a altura de pecho y postura dividida. |
| [sfm-catalog-c059.jpg](sfm-catalog-c059.jpg) | **Generada con IA — OpenAI image_gen** | [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/) | Pulldown: una palanca baja hacia el hombro, otra permanece alta, muslos bajo soporte y discos visibles. |
| [sfm-catalog-c077.jpg](sfm-catalog-c077.jpg) | **Generada con IA — OpenAI image_gen** | [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/) | Remo: apoyo de pecho, un agarre junto a las costillas, palanca opuesta extendida y pies en plataformas. |
| [sfm-catalog-c102.jpg](sfm-catalog-c102.jpg) | **Generada con IA — OpenAI image_gen** | [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/) | Press de hombro: una palanca elevada sobre la cabeza, otra a altura de hombro; espalda apoyada. |
| [sfm-catalog-c107.jpg](sfm-catalog-c107.jpg) | **Generada con IA — OpenAI image_gen** | [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/) | Elevación lateral: un brazo al costado, polea baja, cable conectado, torso vertical. |
| [sfm-catalog-c147.jpg](sfm-catalog-c147.jpg) | **Generada con IA — OpenAI image_gen** | [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/) | Curl: un brazo flexionado sobre apoyo, mano supinada sobre agarre de palanca; máquina con stack visible. |
| [sfm-catalog-c161.jpg](sfm-catalog-c161.jpg) | **Generada con IA — OpenAI image_gen** | [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/) | Pushdown: un brazo junto al costado, cuerda individual y puño vertical con agarre neutro; polea alta. |
| [sfm-catalog-c194.jpg](sfm-catalog-c194.jpg) | **Generada con IA — OpenAI image_gen** | [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/) | Prensa: un único pie sobre plataforma, pierna libre fuera del sled, cadera y espalda apoyadas. |
| [sfm-catalog-c203.jpg](sfm-catalog-c203.jpg) | **Generada con IA — OpenAI image_gen** | [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/) | Peso muerto: bisagra sobre una pierna, mancuerna hexagonal reconocible, pierna libre extendida atrás. |
| [sfm-catalog-c204.jpg](sfm-catalog-c204.jpg) | **Generada con IA — OpenAI image_gen** | [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/) | Rumano en cable: bisagra de una pierna, pierna libre atrás y D-handle conectado a polea baja. |
| [sfm-catalog-c217.jpg](sfm-catalog-c217.jpg) | **Generada con IA — OpenAI image_gen** | [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/) | Hip thrust: espalda alta en banco, un pie apoyado bajo rodilla y otro elevado; cadera extendida. |
| [sfm-catalog-c071.jpg](sfm-catalog-c071.jpg) | [Foto real — free-exercise-db](https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-arm_Cable_Pulley_Rows/1.jpg) | [Dominio público / Unlicense](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md) | Remo sentado: un único agarre activo, torso estable, polea baja y mano libre en muslo. |
| [sfm-catalog-c256.jpg](sfm-catalog-c256.jpg) | [Foto real — free-exercise-db](https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raise_On_A_Dumbbell/1.jpg) | [Dominio público / Unlicense](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md) | Calf raise de pie: una pierna sobre el apoyo, talón elevado y pierna libre sin empujar; barra del rack para equilibrio. |

## Prompts finales

Prompts completos también en `procedencia.json`, junto con fuente y condiciones por archivo.

### C026 — Generada con IA

Use case: photorealistic-natural. Asset: c026 exercise library. Generate ONE landscape 3:2 realistic gym photograph, editorial instructional fitness photography, adult athlete in plain light tank top and dark shorts, warm neutral light, grey gym machines and beige walls, full body and relevant apparatus visible, sharp hands and handles. Single arm converging chest press on a realistic plate-loaded machine with independent pivot arms. Seated upright with back on backrest, right hand pushing one handle forward at chest height, elbow partly extended, left hand resting on thigh, unused handle stationary. Visible coherent lever linkage, plates on separate loading horns. Horizontal chest press, not overhead. Anatomically correct two arms, two legs, five fingers per hand with natural closed grip, straight wrists, neutral spine. No logos, text, watermarks, collage, diagram or labels. Equipment must have realistic connected load-bearing parts; no floating cables or impossible handles.

### C031 — Generada con IA

Use case: photorealistic-natural. Asset: c031 exercise library. ONE landscape 3:2 realistic gym photograph, editorial instructional fitness photography, adult athlete in plain light tank top and dark shorts, warm neutral lighting, grey equipment beige gym walls. Full athlete and essential apparatus visible, sharply detailed hands. Standing single arm cable chest press. Athlete faces away from adjustable cable tower, split stance, upright stable torso. One right D-handle at chest height pushed forward, elbow about 30 degrees bent, palm inward, cable runs clearly from handle behind shoulder to chest-height pulley. Left hand resting on hip, no second active handle. Not a fly: elbow visibly bent and pushing forward. Anatomically correct two arms, two legs, natural five-finger closed grips and straight wrists, neutral spine. No logos, text, watermark, collage, diagram. All equipment parts mechanically connected; no floating cables or malformed handles.

### C059 — Generada con IA

Use case: photorealistic-natural. Asset: c059 exercise library. Generate ONE landscape 3:2 realistic gym photograph, editorial instructional fitness photography, adult athlete in plain light tank top and dark shorts, warm neutral light, grey gym machines and beige walls, full body and relevant apparatus visible, sharp hands and handles. Single arm converging lat pulldown on a plate-loaded independent-arm lever machine. Seated facing machine with thighs securely under thigh pads. Right hand grips overhead lever handle and pulls it down to upper chest/shoulder, right elbow points down beside ribs. Left arm relaxed on thigh, other machine lever remains overhead. Entire realistic machine including high pivots and weight plates visible. Anatomically correct two arms, two legs, five fingers per hand with natural closed grip, straight wrists, neutral spine. No logos, text, watermarks, collage, diagram or labels. Equipment must have realistic connected load-bearing parts; no floating cables or impossible handles.

### C077 — Generada con IA

Use case: photorealistic-natural. Asset: c077 exercise library. Generate ONE landscape 3:2 realistic gym photograph, editorial instructional fitness photography, adult athlete in plain light tank top and dark shorts, warm neutral light, grey gym machines and beige walls, full body and relevant apparatus visible, sharp hands and handles. Single arm seated machine row on a realistic independent-arm plate-loaded lever row machine. Chest pressed against chest support pad, feet on foot platforms. Right hand pulling neutral vertical handle toward ribs, elbow close to body and behind torso. Left hand rests relaxed on thigh. Unused left lever remains extended in front. Clear mechanically coherent row machine pivots and loading horns. Anatomically correct two arms, two legs, five fingers per hand with natural closed grip, straight wrists, neutral spine. No logos, text, watermarks, collage, diagram or labels. Equipment must have realistic connected load-bearing parts; no floating cables or impossible handles.

### C102 — Generada con IA

Use case: photorealistic-natural. Asset: c102 exercise library. ONE landscape 3:2 realistic gym photograph, editorial instructional fitness photography, adult athlete in plain light tank top and dark shorts, warm neutral lighting, grey equipment beige gym walls. Full athlete and essential apparatus visible, sharply detailed hands. Seated single arm overhead shoulder press on a realistic plate-loaded machine with two independent overhead lever arms. Back on nearly upright backrest, feet planted. Right hand pushing handle overhead, elbow slightly bent and forearm vertical, left hand relaxed on thigh, unused left lever at shoulder height. Visible high pivots, coherent arms and plates. Anatomically correct two arms, two legs, natural five-finger closed grips and straight wrists, neutral spine. No logos, text, watermark, collage, diagram. All equipment parts mechanically connected; no floating cables or malformed handles.

### C107 — Generada con IA

Use case: photorealistic-natural. Asset: c107 exercise library. ONE landscape 3:2 realistic gym photograph, editorial instructional fitness photography, adult athlete in plain light tank top and dark shorts, warm neutral lighting, grey equipment beige gym walls. Full athlete and essential apparatus visible, sharply detailed hands. Standing single arm cable lateral raise from a low pulley. Athlete upright next to tower, right arm elevated out sideways at just below shoulder height, elbow slightly bent and fixed, closed right hand grips D-handle, taut cable diagonally down across front of thighs to low pulley beside left ankle. Left arm relaxed by side. No lean-away, no overhead raise. Anatomically correct two arms, two legs, natural five-finger closed grips and straight wrists, neutral spine. No logos, text, watermark, collage, diagram. All equipment parts mechanically connected; no floating cables or malformed handles.

### C147 — Generada con IA

Use case: photorealistic-natural. Asset: c147 exercise library. ONE landscape 3:2 realistic gym photograph, editorial instructional fitness photography, adult athlete in plain light tank top and dark shorts, warm neutral lighting, grey equipment beige gym walls. Full athlete and essential apparatus visible, sharply detailed hands. Seated single arm biceps curl on a realistic independent-arm preacher curl machine. Right upper arm supported on sloped preacher pad, right elbow stays on pad and flexed 90 degrees, right palm up gripping machine lever handle. Left arm relaxed on thigh not gripping. Visible supported lever pivot aligned with elbow and attached weight mechanism. No dumbbell and no barbell. Anatomically correct two arms, two legs, natural five-finger closed grips and straight wrists, neutral spine. No logos, text, watermark, collage, diagram. All equipment parts mechanically connected; no floating cables or malformed handles.

### C161 — Generada con IA

Use case: photorealistic-natural. Asset: c161 exercise library. ONE landscape 3:2 realistic gym photograph, editorial instructional fitness photography, adult athlete in plain light tank top and dark shorts, warm neutral lighting, grey equipment beige gym walls. Full athlete and essential apparatus visible, sharply detailed hands. Single-arm triceps pushdown with NEUTRAL grip using ONE SHORT ROPE attachment from a HIGH cable pulley. Side-three-quarter view, athlete upright facing tower. Right upper arm stationary vertical tight against ribs, right elbow slightly bent near end of pushdown, forearm points downward, right fist grips vertical rope immediately above its rubber stop, thumb pointing upward and palm facing inward toward torso. Left hand rests on hip. One taut cable from high pulley descends to rope clip above right hand; visible entire connection. NO palm-up supinated grip, NO V bar, NO bilateral use. Anatomically correct two arms, two legs, natural five-finger closed grips and straight wrists. No logos, text, watermark, collage, diagram. All equipment parts mechanically connected; no floating cables or malformed handles.

### C194 — Generada con IA

Use case: photorealistic-natural. Asset: c194 exercise library. ONE landscape 3:2 realistic gym photograph, editorial instructional fitness photography, adult athlete in plain light tank top and dark shorts, warm neutral lighting, grey equipment beige gym walls. Full athlete and essential apparatus visible, sharply detailed hands. Unilateral leg press on realistic 45-degree sled leg press machine. Athlete reclined with back and hips supported on padded seat, RIGHT foot centered on sled platform, right knee bent about 70 degrees tracking toes. LEFT leg clearly resting bent OFF platform beside seat, left foot visible and completely off sled. Hands on side safety handles. Side view includes entire athlete, single active foot on platform, sled, two parallel diagonal guide rails and attached weight plates. Mechanically coherent machine. Anatomically correct two arms, two legs, natural five-finger closed grips and straight wrists. No logos, text, watermark, collage, diagram. All equipment parts mechanically connected; no floating cables or malformed handles.

### C203 — Generada con IA

Use case: photorealistic-natural. Asset: c203 exercise library. ONE landscape 3:2 realistic gym photograph, editorial instructional fitness photography, adult athlete in plain light tank top and dark shorts, warm neutral lighting, grey equipment beige gym walls. Full athlete and essential apparatus visible, sharply detailed hands. Single-leg Romanian deadlift with ONE hex dumbbell, not kettlebell. Full-body side-three-quarter view. Athlete standing on right leg, right knee softly bent, left leg extended backward in line with torso, hips square, neutral spine, torso hinged forward nearly horizontal. Left arm hangs vertically holding a clearly identifiable hex dumbbell below shoulder near shin height; right arm relaxed by side. Right foot flat on floor. Natural grip, realistic dumbbell handle and two symmetrical hex weights. Anatomically correct two arms, two legs, natural five-finger closed grips and straight wrists. No logos, text, watermark, collage, diagram. All equipment parts mechanically connected; no floating cables or malformed handles.

### C204 — Generada con IA

Use case: photorealistic-natural. Asset: c204 exercise library. ONE landscape 3:2 realistic gym photograph, editorial instructional fitness photography, adult athlete in plain light tank top and dark shorts, warm neutral lighting, grey equipment beige gym walls. Full athlete and essential apparatus visible, sharply detailed hands. Single-leg Romanian deadlift with a low cable pulley and one D-handle, not an ankle strap. Side-three-quarter view. Athlete stands on right leg with slight knee bend, hinges hips backward with straight spine, torso tilted forward near horizontal, left leg extended backward in line with torso. Left hand holds a D-handle below chest at knee height, arm straight, visible taut cable runs forward/down to low pulley in front of athlete. Right hand relaxed. Entire body, support foot and pulley visible. Anatomically correct two arms, two legs, natural five-finger closed grips and straight wrists. No logos, text, watermark, collage, diagram. All equipment parts mechanically connected; no floating cables or malformed handles.

### C217 — Generada con IA

Use case: photorealistic-natural. Asset: c217 exercise library. ONE landscape 3:2 realistic gym photograph, editorial instructional fitness photography, adult athlete in plain light tank top and dark shorts, warm neutral lighting, grey equipment beige gym walls. Full athlete and essential apparatus visible, sharply detailed hands. Single-leg bodyweight hip thrust with upper back resting horizontally across a sturdy gym bench, one foot flat on floor directly below bent working knee, working knee near 90 degrees. Hips raised to form straight line shoulder-hip-working knee, pelvis level, other leg lifted with bent knee, foot completely off floor. Hands rest on pelvis. Bench-supported hip thrust, not glute bridge on floor. Clear side view entire body and bench. Anatomically correct two arms, two legs, natural five-finger closed grips and straight wrists. No logos, text, watermark, collage, diagram. All equipment parts mechanically connected; no floating cables or malformed handles.
