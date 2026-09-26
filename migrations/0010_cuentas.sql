-- Cuentas invitadas. Los tokens de recuperación sólo se guardan como SHA-256.
-- Las columnas de clave admiten NULL para una futura cuenta creada con Google.
CREATE TABLE IF NOT EXISTS cuentas (
  cliente_id TEXT PRIMARY KEY REFERENCES clientes(id),
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  clave_hash TEXT,
  clave_sal TEXT,
  clave_iteraciones INTEGER,
  google_sub TEXT UNIQUE,
  creada_en INTEGER NOT NULL,
  ultimo_acceso_en INTEGER,
  CHECK (email = lower(email)),
  CHECK ((clave_hash IS NULL AND clave_sal IS NULL AND clave_iteraciones IS NULL)
      OR (clave_hash IS NOT NULL AND clave_sal IS NOT NULL AND clave_iteraciones IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS restablecimientos (
  token_hash TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES clientes(id),
  creado_en INTEGER NOT NULL,
  expira_en INTEGER NOT NULL,
  usado_en INTEGER
);
CREATE INDEX IF NOT EXISTS idx_restablecimientos_cliente ON restablecimientos(cliente_id);

CREATE TABLE IF NOT EXISTS intentos_de_acceso (
  clave TEXT PRIMARY KEY,
  ventana INTEGER NOT NULL,
  cuenta INTEGER NOT NULL
);
