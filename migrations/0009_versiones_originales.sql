-- Copia aditiva de la programación actual. Conserva originales, IDs y huecos.
-- Puede repetirse; nunca reemplaza documentos v2 ni actividad posterior.
INSERT INTO cambios(cliente_id,tipo,documento_id,revision,datos_json,operacion_id,hash,actor,creado_en)
SELECT c.id,'perfil',c.id,1,json_object(
 'id',c.id,'nombre',c.nombre,'sexo',CASE WHEN sexo IN ('femenino','masculino') THEN sexo ELSE NULL END,
 'edad',nullif(edad,0),'estaturaCm',nullif(estatura_cm,0),'pesoCorporalLb',nullif(peso_corporal_lb,0),
 'objetivo',objetivo,'frecuenciaEntrenamiento',frecuencia_entrenamiento,'limitaciones',limitaciones,
 'notas',notas,'ejerciciosEvitados',json(ejercicios_evitados_json)),
 'origen-perfil:'||c.id,'copia-original-v2','migracion:cloud-v2',unixepoch()*1000
FROM clientes c WHERE NOT EXISTS(SELECT 1 FROM cambios v WHERE v.cliente_id=c.id AND v.tipo='perfil');

INSERT INTO cambios(cliente_id,tipo,documento_id,revision,datos_json,operacion_id,hash,actor,creado_en)
SELECT c.id,'plan','programa',1,json_object('id','programa','estado','publicado','revisado',json('false'),
 'dias',json((SELECT json_group_array(json_object('id',r.id,'participanteId',r.cliente_id,
 'nombre',r.nombre,'orden',r.orden,'slots',json(r.slots_json)))
 FROM (SELECT * FROM rutinas WHERE cliente_id=c.id ORDER BY orden) r))),
 'origen-programa:'||c.id,'copia-original-v2','migracion:cloud-v2',unixepoch()*1000
FROM clientes c WHERE EXISTS(SELECT 1 FROM rutinas r WHERE r.cliente_id=c.id)
AND NOT EXISTS(SELECT 1 FROM cambios v WHERE v.cliente_id=c.id AND v.tipo='plan' AND v.documento_id='programa');
