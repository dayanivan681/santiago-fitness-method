# Implementación · claridad, enfoque y acción

El dueño considera válidas las tres propuestas y delega continuar bajo esos
criterios. Se adopta la **1**, `propuestas/1.png` (primer resultado mostrado,
853×1844), porque prioriza la revisión del programa. No se combinan layouts de
las otras alternativas ni se añade una función nueva. Rama `codex/coach-claridad-ios`.

## Inventario previo al código

- Orden móvil: firma SANTIAGO FM · COACH → Hoy/fecha/nuevo → Necesita revisión →
  persona/estado/acción Revisar programa → pagos pendientes → resumen semanal →
  actividad reciente → Ver clientes. Otros pendientes/borradores aparecen solo
  cuando existen. Los estados vacíos/cargando conservan sus datos y acciones reales.
- Componentes: shell/cabeceras del coach, componente Hoy separado, fila de cliente,
  listas agrupadas, enlace de tarea, sesiones del programa como filas, formularios,
  hojas y navegación existentes. Conservar repositorio, tours, permisos y guardado.
- Tokens: fondo #0b0c0d, superficie #141517, elevado #1b1c1f, texto #f4f3f0,
  secundario #a0a0a4, marca #e5352b, CTA #db3027. Sin nuevos filtros de color.
  Radio 16 px en revisión y 18 en grupos de días, 12 para controles, pestañas flotantes 36.
- Escala de espaciado 4/8/12/16/24/32; márgenes móviles 16 px; controles 48 px.
  Sistema -apple-system/BlinkMacSystemFont/Segoe UI para la interfaz, Barlow para firma.
  Hoy 40 px, ficha 28, sección 18, persona 16, cuerpo 14–16, auxiliar 12–13.
- Iconos Lucide ya usados: House, Users, Dumbbell, Plus, ChevronRight/Left,
  controles de orden/cierre; CreditCard coincide con la referencia de pagos.
  Línea 1.75, 20–24 px, estados rojos/grises. Sin SVG a mano ni iconos de texto.
- Medios: la referencia no tiene fotos ni ilustraciones nuevas. Avatares con
  iniciales son controles de identidad existentes, no retratos de sustitución.
  Reutilizar imágenes/GIF del catálogo en fichas y editor, sin recortes nuevos.
- Extensiones necesarias: Clientes (título breve/búsqueda/lista), ficha con contexto
  compacto y sesiones agrupadas, editor concentrado en el programa, Biblioteca con
  búsqueda antes de crear, formularios/hojas con tipografía y espacio coherentes.
  El desktop conserva lista/ficha, con navegación lateral y columnas de tareas/actividad
  cuando caben; no replica un móvil estirado ni añade módulos al negocio.
- Interacciones: revisar → ficha → preparar → prescripción → guardar borrador →
  retomar → publicar local sintético; buscar cliente/pagos, actividad, Biblioteca,
  añadir/cerrar hoja, navegación y ayuda. Verificar también que cliente no cambie.
- Diferencias intencionales respecto a la imagen: estados de programa se calculan
  con los datos; no deducir «sin publicar» de revisión pendiente. Los errores y
  borradores existentes se mantienen aunque el mock no los dibuje. La demo mantiene
  su banda informativa fuera del contenido comparado. La ayuda real sigue accesible.

## Entrega prevista

Comparar referencia y captura normalizadas al mismo viewport/estado, revisar cinco
superficies y variantes, pruebas/lint/build, navegador móvil/escritorio y Safari.
PR y preview, sin merge hasta visto bueno nuevo. QA físico/instalación no se inventa.

## Resultado

Implementación y verificación completas: [informe de QA](../../design-qa.md).
1057/1057 pruebas, lint y build PASS; Safari 16 Pro/SE y tamaños 320–1440 px.
PR/preview pendientes de aprobación del dueño antes de integrar.
