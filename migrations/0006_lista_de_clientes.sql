-- La lista del coach queda en dos: Santiago y un cliente nuevo en blanco.
--
-- `ivanprueba` y `cliente1` eran pruebas de la fase de montaje y se colaban en
-- la lista como si fueran personas. Se dan de baja con la misma operación que
-- el botón «Eliminar» de la consola (functions/lib/roles.ts, archivarCliente):
-- se apaga `activo` y se revoca el acceso, pero NO se borra nada. Su
-- programación sigue en `rutinas`, así que devolverlos a la lista es
-- `UPDATE clientes SET activo = 1 WHERE id = '…'`.
--
-- Revocar es la mitad que no se puede olvidar: `cliente1` tenía una invitación
-- pendiente y dos sesiones vivas. Sacarlo de la lista sin cortarlas lo dejaría
-- entrando en la app después de "eliminado".
--
-- `dayan-test` no se toca: es el cliente técnico de las suites y de preview, y
-- en producción ya está oculto por SHOW_QA_CLIENTS (functions/lib/qa.ts).
--
-- Idempotente: repetirla no cambia nada.

UPDATE clientes
   SET activo = 0, actualizado_en = unixepoch()
 WHERE id IN ('ivanprueba', 'cliente1') AND activo = 1;

UPDATE invitaciones
   SET revocada_en = unixepoch()
 WHERE cliente_id IN ('ivanprueba', 'cliente1')
   AND consumida_en IS NULL AND revocada_en IS NULL;

UPDATE sesiones
   SET revocada_en = unixepoch()
 WHERE cliente_id IN ('ivanprueba', 'cliente1') AND revocada_en IS NULL;

-- El sitio en blanco para dar de alta a la próxima persona. Mismos valores por
-- defecto que «+ Cliente» en la consola, y los cuatro días vacíos: entra como
-- INCOMPLETE, que es lo correcto hasta que el coach lo programe.
INSERT OR IGNORE INTO clientes
  (id, nombre, sexo, edad, estatura_cm, peso_corporal_lb, objetivo,
   frecuencia_entrenamiento, limitaciones, notas, ejercicios_evitados_json,
   activo, creado_en, actualizado_en)
VALUES
  ('cliente-nuevo', 'Cliente nuevo', 'masculino', 30, 175.26, 175,
   'Pendiente de confirmar', 4, '', '', '[]', 1, unixepoch(), unixepoch());

INSERT OR IGNORE INTO rutinas (id, cliente_id, nombre, orden, slots_json, actualizado_en)
VALUES
  ('cliente-nuevo|upper-a', 'cliente-nuevo', 'Upper A', 1, '[]', unixepoch()),
  ('cliente-nuevo|lower-a', 'cliente-nuevo', 'Lower A', 2, '[]', unixepoch()),
  ('cliente-nuevo|upper-b', 'cliente-nuevo', 'Upper B', 3, '[]', unixepoch()),
  ('cliente-nuevo|lower-b', 'cliente-nuevo', 'Lower B', 4, '[]', unixepoch());
