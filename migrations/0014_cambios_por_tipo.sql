-- Índice para que el panel del coach lea del historial sólo los tipos que usa
-- (perfil, plan, entrenamiento). Los borradores y altas autoguardados son la
-- mayoría de las filas de `cambios`; sin este índice cada lectura en frío los
-- recorría todos y el coste en filas leídas de D1 crecía con cada borrador.
-- CREATE INDEX IF NOT EXISTS es aditivo y repetible.
CREATE INDEX IF NOT EXISTS cambios_tipo_cursor ON cambios(tipo, cursor);
