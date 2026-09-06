-- La lista del coach queda en dos: Santiago y un cliente nuevo en blanco.
--
-- Sustituye a la 0006, que nunca llegó a aplicarse y describía un punto de
-- partida que la realidad ya dejó atrás: entre medias se probó el borrado de
-- clientes desde la consola, así que `ivanprueba` y `cliente1` ya están dados
-- de baja y existe `cliente-1` con los cuatro días vacíos. Aplicar la 0006 hoy
-- crearía un sexto cliente que nadie quiere.
--
-- Tres operaciones, todas sobre `clientes` y ninguna destructiva:
--
-- 1. Santiago vuelve a la lista. Se dio de baja durante esas pruebas; sus
--    cuatro días con 20 ejercicios nunca se tocaron, porque la baja archiva y
--    no borra. Esto es exactamente el «se puede deshacer» que promete la
--    pantalla de confirmación.
--
--    Su acceso NO se restaura a propósito. Al darlo de baja se revocaron su
--    invitación y sus sesiones, y revivir un token revocado sería una puerta
--    trasera: el coach le genera un enlace nuevo desde /admin.
--
-- 2. `cliente-1` pasa a llamarse «Cliente nuevo». Ya es el hueco en blanco, así
--    que renombrarlo evita crear otra fila más para lo mismo.
--
-- 3. `ivanprueba` y `cliente1` se quedan como están: archivados, fuera de la
--    lista, recuperables con un UPDATE. Decisión explícita del dueño frente a
--    borrarlos de verdad.
--
-- `dayan-test` no aparece aquí: es el cliente técnico de las suites y de
-- preview, y en producción ya lo oculta SHOW_QA_CLIENTS (functions/lib/qa.ts).
--
-- Idempotente: repetirla no cambia nada.

UPDATE clientes
   SET activo = 1, actualizado_en = unixepoch()
 WHERE id = 'santiago' AND activo = 0;

UPDATE clientes
   SET nombre = 'Cliente nuevo', actualizado_en = unixepoch()
 WHERE id = 'cliente-1' AND nombre <> 'Cliente nuevo';
