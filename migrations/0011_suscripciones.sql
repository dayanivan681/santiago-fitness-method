-- Suscripciones de Stripe, una por cliente.
--
-- Stripe es la fuente de verdad: esta tabla es una copia que el webhook
-- refresca volviendo a leer la suscripción, así que no importa el orden en que
-- lleguen los eventos. `exento` y `precio_id` son decisiones del coach y sólo
-- las escribe su panel.
--
-- Los instantes son segundos Unix, como en 0001_acceso.sql.
CREATE TABLE IF NOT EXISTS suscripciones (
  cliente_id             TEXT PRIMARY KEY REFERENCES clientes(id),
  precio_id              TEXT,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT UNIQUE,
  estado                 TEXT,
  periodo_fin            INTEGER,
  cancelar_al_final      INTEGER NOT NULL DEFAULT 0 CHECK (cancelar_al_final IN (0, 1)),
  pausada                INTEGER NOT NULL DEFAULT 0 CHECK (pausada IN (0, 1)),
  exento                 INTEGER NOT NULL DEFAULT 0 CHECK (exento IN (0, 1)),
  actualizado_en         INTEGER NOT NULL
);

-- Cada evento de Stripe se procesa una vez aunque Stripe lo reintente.
CREATE TABLE IF NOT EXISTS eventos_stripe (
  id          TEXT PRIMARY KEY,
  tipo        TEXT NOT NULL,
  recibido_en INTEGER NOT NULL
);
