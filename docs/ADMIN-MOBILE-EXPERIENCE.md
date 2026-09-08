# Coach y Cliente · experiencia compartida v2

Implementación en validación; despliegue canónico pendiente según HANDOFF.

Coach tiene tres destinos: Hoy, Clientes y Biblioteca. Hoy reúne pendientes y
actividad; la ficha enlaza programa, entrenamientos y progreso. En pantallas
amplias se aprovecha la composición de lista y detalle. React Router conserva
historial y contexto; los IDs técnicos no aparecen en las tareas de coaching.

Crear cliente es un onboarding de tres pasos: persona y objetivo, frecuencia y
limitaciones, primer plan. El borrador vive en D1 y puede retomarse. Los datos
faltantes permanecen vacíos; la revisión de cada sesión precede la publicación.
Crear perfil y programa es atómico. La invitación es posterior y explícita.
Los programas nuevos requieren 5–8 ejercicios por sesión; los anteriores se
conservan tal como estaban y se revisan antes de volver a publicar.

Cliente usa Hoy, Biblioteca y Progreso, con perfil desde el avatar. Entrenar
muestra un ejercicio y una serie activa, referencias y objetivo, y controles
rápidos de peso, reps y RIR. Completar guarda localmente antes de esperar a la red,
pliega la serie y prepara la siguiente. Técnica, calentamiento y notas se abren
bajo demanda. Descanso es manual y comparte una composición inferior con la
navegación, sin tapar la acción. Biblioteca → Hoy retoma el ejercicio activo.

La misma tipografía, paleta, imágenes de ejercicios, separadores, hojas y
controles de al menos 48 px unen ambos roles. La demo reutiliza estos componentes.
La vista previa no guarda y «Entrenar juntos» se identifica como actividad real.

Evidencia y límites de validación: [QA v2](QA-V2.md). No declarar iPhone Safari ni
PWA instalada aprobados a partir de Maestro Chromium o una captura de escritorio.
