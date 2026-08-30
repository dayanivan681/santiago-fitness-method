-- Frontera cloud para Coach/Admin y Cliente.
--
-- El registro de entrenamiento sigue local en IndexedDB durante este release.
-- Estas tablas son la fuente de verdad de identidad, perfil y programación:
-- un coach puede editar desde otro dispositivo y el cliente lo recibe al
-- iniciar/recargar su sesión.

CREATE TABLE IF NOT EXISTS clientes (
  id                       TEXT PRIMARY KEY,
  nombre                   TEXT NOT NULL,
  sexo                     TEXT NOT NULL DEFAULT 'masculino',
  edad                     INTEGER NOT NULL DEFAULT 30,
  estatura_cm              REAL NOT NULL DEFAULT 175.26,
  peso_corporal_lb         REAL NOT NULL DEFAULT 175,
  objetivo                 TEXT NOT NULL DEFAULT '',
  frecuencia_entrenamiento INTEGER NOT NULL DEFAULT 4,
  limitaciones             TEXT NOT NULL DEFAULT '',
  notas                    TEXT NOT NULL DEFAULT '',
  ejercicios_evitados_json TEXT NOT NULL DEFAULT '[]',
  activo                   INTEGER NOT NULL DEFAULT 1,
  creado_en                INTEGER NOT NULL,
  actualizado_en           INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS rutinas (
  id             TEXT PRIMARY KEY,
  cliente_id     TEXT NOT NULL,
  nombre         TEXT NOT NULL,
  orden          INTEGER NOT NULL,
  slots_json     TEXT NOT NULL DEFAULT '[]',
  actualizado_en INTEGER NOT NULL,
  UNIQUE(cliente_id, orden)
);

CREATE INDEX IF NOT EXISTS idx_rutinas_cliente ON rutinas(cliente_id, orden);

-- Se crean sólo las identidades mínimas necesarias para operar y probar el
-- split. No se toca ninguna fila de invitaciones ni sesiones existente.
INSERT OR IGNORE INTO clientes
  (id, nombre, sexo, edad, estatura_cm, peso_corporal_lb, objetivo,
   frecuencia_entrenamiento, limitaciones, notas, ejercicios_evitados_json,
   activo, creado_en, actualizado_en)
VALUES
  ('santiago', 'Santiago', 'masculino', 30, 175.26, 175,
   'Pendiente de confirmar', 4, '',
   'Perfil inicial sincronizado; confirmar datos con el coach.', '[]', 1,
   unixepoch(), unixepoch()),
  ('dayan-test', 'QA Role Split', 'masculino', 30, 175.26, 175,
   'Pruebas de rol y sincronización', 4, '',
   'Cliente técnico para QA; no representa datos de Santiago.', '[]', 1,
   unixepoch(), unixepoch());

INSERT OR IGNORE INTO rutinas (id, cliente_id, nombre, orden, slots_json, actualizado_en)
VALUES
  ('santiago|upper-a', 'santiago', 'Upper A', 1, '[]', unixepoch()),
  ('santiago|lower-a', 'santiago', 'Lower A', 2, '[]', unixepoch()),
  ('santiago|upper-b', 'santiago', 'Upper B', 3, '[]', unixepoch()),
  ('santiago|lower-b', 'santiago', 'Lower B', 4, '[]', unixepoch()),
  ('dayan-test|upper-a', 'dayan-test', 'Upper A', 1, '[]', unixepoch()),
  ('dayan-test|lower-a', 'dayan-test', 'Lower A', 2, '[]', unixepoch()),
  ('dayan-test|upper-b', 'dayan-test', 'Upper B', 3, '[]', unixepoch()),
  ('dayan-test|lower-b', 'dayan-test', 'Lower B', 4, '[]', unixepoch());
