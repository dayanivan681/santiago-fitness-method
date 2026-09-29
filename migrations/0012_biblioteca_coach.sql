-- Ejercicios que el coach añade a su biblioteca desde el panel.
--
-- Conviven con las fichas fijas del código (`BIBLIOTECA_INICIAL`). Un ejercicio
-- nunca se borra: se archiva (`activo = 0`), porque puede tener historial en los
-- dispositivos de los clientes y en planes ya publicados.
--
-- `referencia_catalogo` guarda la ficha `Cxxx` del catálogo del PDF cuando el
-- ejercicio salió de ahí. `foto_clave` es la clave en R2 (`biblioteca/<id>`).
-- Los instantes son milisegundos Unix.
CREATE TABLE IF NOT EXISTS ejercicios_coach (
  id                        TEXT PRIMARY KEY CHECK (id GLOB 'coach-ej-*'),
  referencia_catalogo       TEXT,
  nombre                    TEXT NOT NULL,
  equipo                    TEXT NOT NULL,
  movimiento                TEXT NOT NULL,
  musculo_primario          TEXT NOT NULL,
  musculos_secundarios_json TEXT NOT NULL DEFAULT '[]',
  tipo_carga                TEXT NOT NULL,
  incremento_lb             REAL NOT NULL,
  peso_base_lb              REAL,
  explicacion               TEXT NOT NULL DEFAULT '',
  foto_clave                TEXT,
  activo                    INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  creado_en                 INTEGER NOT NULL,
  actualizado_en            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ejercicios_coach_activos ON ejercicios_coach(activo, nombre);
