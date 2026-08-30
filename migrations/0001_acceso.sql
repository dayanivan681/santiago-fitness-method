-- Acceso por enlace privado.
--
-- Dos tablas y nada más: invitaciones de un solo uso y sesiones revocables.
-- Ni el token del enlace ni la cookie se guardan en claro; sólo su SHA-256.
-- Quien leyera esta base no obtendría credenciales utilizables.
--
-- Los instantes son segundos Unix (INTEGER), no texto: comparar fechas en
-- SQLite con cadenas es una fuente de errores silenciosos.

CREATE TABLE IF NOT EXISTS invitaciones (
  token_hash   TEXT PRIMARY KEY,
  cliente_id   TEXT NOT NULL,
  creada_en    INTEGER NOT NULL,
  expira_en    INTEGER NOT NULL,
  consumida_en INTEGER,
  revocada_en  INTEGER
);

CREATE TABLE IF NOT EXISTS sesiones (
  id          TEXT PRIMARY KEY,
  cliente_id  TEXT NOT NULL,
  invitacion  TEXT REFERENCES invitaciones(token_hash),
  creada_en   INTEGER NOT NULL,
  expira_en   INTEGER NOT NULL,
  revocada_en INTEGER
);

CREATE INDEX IF NOT EXISTS idx_sesiones_cliente ON sesiones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_invitaciones_cliente ON invitaciones(cliente_id);
