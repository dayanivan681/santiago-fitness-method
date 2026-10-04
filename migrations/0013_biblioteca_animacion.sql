-- Animación (GIF) de los ejercicios del coach.
--
-- Tabla aparte en vez de `ALTER TABLE ejercicios_coach ADD COLUMN`: las
-- migraciones v2 se ensayan y aplican siempre enteras y dos veces seguidas
-- (scripts/migrar-v2.mjs, preparar-qa-v2), y en SQLite un ADD COLUMN repetido
-- falla. CREATE TABLE IF NOT EXISTS es aditivo y repetible.
--
-- Una fila por ejercicio con animación; quitarla es borrar la fila. La foto fija
-- sigue en `ejercicios_coach.foto_clave` y es la que usan listas y miniaturas.
CREATE TABLE IF NOT EXISTS ejercicios_coach_animacion (
  ejercicio_id   TEXT PRIMARY KEY REFERENCES ejercicios_coach(id),
  clave          TEXT NOT NULL,
  actualizado_en INTEGER NOT NULL
);
