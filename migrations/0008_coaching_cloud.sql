-- Aditiva. No modifica perfiles, rutinas, invitaciones ni sesiones existentes.
CREATE TABLE IF NOT EXISTS cambios (
 cursor INTEGER PRIMARY KEY AUTOINCREMENT,
 cliente_id TEXT NOT NULL,
 tipo TEXT NOT NULL,
 documento_id TEXT NOT NULL,
 revision INTEGER NOT NULL CHECK(revision > 0),
 datos_json TEXT NOT NULL CHECK(json_valid(datos_json)),
 eliminado INTEGER NOT NULL DEFAULT 0 CHECK(eliminado IN (0,1)),
 operacion_id TEXT NOT NULL,
 hash TEXT NOT NULL,
 actor TEXT NOT NULL,
 creado_en INTEGER NOT NULL,
 UNIQUE(cliente_id, tipo, documento_id, revision),
 UNIQUE(cliente_id, operacion_id)
);
CREATE INDEX IF NOT EXISTS cambios_documento ON cambios(cliente_id,tipo,documento_id,cursor DESC);
CREATE INDEX IF NOT EXISTS cambios_cursor ON cambios(cliente_id,cursor);
CREATE TABLE IF NOT EXISTS entrenamientos (
 id TEXT PRIMARY KEY,
 cliente_id TEXT NOT NULL REFERENCES clientes(id),
 prescripcion_json TEXT NOT NULL CHECK(json_valid(prescripcion_json)),
 cargas_json TEXT NOT NULL CHECK(json_valid(cargas_json)),
 fecha TEXT NOT NULL,
 actor TEXT NOT NULL,
 creado_en INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS entrenamientos_cliente ON entrenamientos(cliente_id,fecha);
CREATE TABLE IF NOT EXISTS conflictos (
 id TEXT PRIMARY KEY,
 cliente_id TEXT NOT NULL,
 operacion_json TEXT NOT NULL,
 actual_json TEXT NOT NULL,
 actor TEXT NOT NULL,
 creado_en INTEGER NOT NULL,
 resuelto_en INTEGER,
 resolucion_json TEXT
);
CREATE TABLE IF NOT EXISTS medios (
 id TEXT PRIMARY KEY,
 cliente_id TEXT NOT NULL REFERENCES clientes(id),
 registro_id TEXT NOT NULL,
 clave TEXT NOT NULL UNIQUE,
 tipo TEXT NOT NULL CHECK(tipo IN ('perfil','progreso')),
 mime TEXT NOT NULL,
 bytes INTEGER NOT NULL CHECK(bytes BETWEEN 1 AND 5242880),
 compartido_coach INTEGER NOT NULL DEFAULT 0,
 hash TEXT NOT NULL,
 estado TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente','listo','eliminado')),
 creado_en INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS medios_cliente ON medios(cliente_id,registro_id,estado);
CREATE TABLE IF NOT EXISTS importaciones (
 id TEXT PRIMARY KEY,
 cliente_id TEXT NOT NULL REFERENCES clientes(id),
 hash TEXT NOT NULL,
 manifest_json TEXT NOT NULL,
 creado_en INTEGER NOT NULL,
 UNIQUE(cliente_id,hash)
);
CREATE TABLE IF NOT EXISTS importaciones_partidas (
 cliente_id TEXT NOT NULL,
 lote_hash TEXT NOT NULL,
 tipo TEXT NOT NULL,
 origen_id TEXT NOT NULL,
 datos_json TEXT NOT NULL,
 PRIMARY KEY(cliente_id,lote_hash,tipo,origen_id)
);
CREATE TABLE IF NOT EXISTS entorno_sfm (id INTEGER PRIMARY KEY CHECK(id=1), nombre TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS importaciones_revisiones (
 cliente_id TEXT NOT NULL,
 lote_hash TEXT NOT NULL,
 tipo TEXT NOT NULL,
 origen_id TEXT NOT NULL,
 revision_actual INTEGER NOT NULL,
 actor TEXT NOT NULL,
 creado_en INTEGER NOT NULL,
 PRIMARY KEY(cliente_id,lote_hash,tipo,origen_id)
);
-- El despliegue asigna el entorno explícitamente, fuera de las peticiones.
