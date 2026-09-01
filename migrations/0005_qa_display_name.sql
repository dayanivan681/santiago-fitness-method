-- Nombre visible del cliente técnico de QA.
--
-- "QA Role Split" era jerga interna en la lista del coach. El id técnico
-- `dayan-test` NO cambia: es por el que se filtra en producción, y renombrarlo
-- rompería el filtro y las suites.
--
-- Idempotente y acotada: sólo actúa sobre esa fila y sólo si aún tiene el
-- nombre antiguo. Si el coach ya la renombró a mano, se respeta. Volver a
-- ejecutarla no hace nada.
--
-- No se reescribe 0003, que ya está aplicada en producción.

UPDATE clientes
   SET nombre = 'Cliente de prueba 1',
       actualizado_en = unixepoch()
 WHERE id = 'dayan-test'
   AND nombre = 'QA Role Split';
