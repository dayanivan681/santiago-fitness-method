-- Release hardening para Santiago.
--
-- Inserta cualquier día ausente y completa únicamente filas cuyo JSON sigue
-- estructuralmente vacío. Una rutina con uno o más slots, aunque sea distinta
-- de la plantilla, se considera una edición real del coach y jamás se pisa.
-- La migración no toca clientes, invitaciones ni sesiones y puede repetirse.

INSERT OR IGNORE INTO rutinas (id, cliente_id, nombre, orden, slots_json, actualizado_en)
VALUES
  ('santiago|upper-a', 'santiago', 'Upper A', 1, '[
    {"orden":1,"ejercicioId":"press-banca-15-smith","estimulo":"fuerza","seriesObjetivo":4,"repMin":1,"repMax":5,"descansoSegundos":180},
    {"orden":2,"ejercicioId":"press-inclinado-convergente","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
    {"orden":3,"ejercicioId":"lat-pulldown-maquina","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
    {"orden":4,"ejercicioId":"hip-thrust-barra","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
    {"orden":5,"ejercicioId":"elevacion-lateral-mancuernas","estimulo":"resistencia","seriesObjetivo":3,"repMin":15,"repMax":20,"descansoSegundos":60}
  ]', unixepoch()),
  ('santiago|lower-a', 'santiago', 'Lower A', 2, '[
    {"orden":1,"ejercicioId":"sentadilla-barra","estimulo":"fuerza","seriesObjetivo":4,"repMin":1,"repMax":5,"descansoSegundos":180},
    {"orden":2,"ejercicioId":"prensa","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
    {"orden":3,"ejercicioId":"curl-femoral-tumbado","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
    {"orden":4,"ejercicioId":"patada-gluteo-polea","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
    {"orden":5,"ejercicioId":"elevacion-talones-pie","estimulo":"resistencia","seriesObjetivo":3,"repMin":15,"repMax":20,"descansoSegundos":60}
  ]', unixepoch()),
  ('santiago|upper-b', 'santiago', 'Upper B', 3, '[
    {"orden":1,"ejercicioId":"remo-barra","estimulo":"fuerza","seriesObjetivo":4,"repMin":1,"repMax":5,"descansoSegundos":180},
    {"orden":2,"ejercicioId":"press-pecho-convergente","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
    {"orden":3,"ejercicioId":"jalon-agarre-cerrado","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
    {"orden":4,"ejercicioId":"curl-mancuernas","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
    {"orden":5,"ejercicioId":"extension-triceps-polea","estimulo":"resistencia","seriesObjetivo":3,"repMin":15,"repMax":20,"descansoSegundos":60}
  ]', unixepoch()),
  ('santiago|lower-b', 'santiago', 'Lower B', 4, '[
    {"orden":1,"ejercicioId":"peso-muerto-rumano","estimulo":"fuerza","seriesObjetivo":4,"repMin":1,"repMax":5,"descansoSegundos":180},
    {"orden":2,"ejercicioId":"hack-squat","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
    {"orden":3,"ejercicioId":"hip-thrust-barra","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
    {"orden":4,"ejercicioId":"extension-cuadriceps","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
    {"orden":5,"ejercicioId":"elevacion-talones-sentado","estimulo":"resistencia","seriesObjetivo":3,"repMin":15,"repMax":20,"descansoSegundos":60}
  ]', unixepoch());

UPDATE rutinas
SET slots_json = '[
  {"orden":1,"ejercicioId":"press-banca-15-smith","estimulo":"fuerza","seriesObjetivo":4,"repMin":1,"repMax":5,"descansoSegundos":180},
  {"orden":2,"ejercicioId":"press-inclinado-convergente","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":3,"ejercicioId":"lat-pulldown-maquina","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":4,"ejercicioId":"hip-thrust-barra","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":5,"ejercicioId":"elevacion-lateral-mancuernas","estimulo":"resistencia","seriesObjetivo":3,"repMin":15,"repMax":20,"descansoSegundos":60}
]', actualizado_en = unixepoch()
WHERE cliente_id = 'santiago' AND orden = 1 AND (
  trim(slots_json) = '' OR
  CASE WHEN json_valid(slots_json) THEN json_type(slots_json) = 'array' AND json_array_length(slots_json) = 0 ELSE 0 END
);

UPDATE rutinas
SET slots_json = '[
  {"orden":1,"ejercicioId":"sentadilla-barra","estimulo":"fuerza","seriesObjetivo":4,"repMin":1,"repMax":5,"descansoSegundos":180},
  {"orden":2,"ejercicioId":"prensa","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":3,"ejercicioId":"curl-femoral-tumbado","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":4,"ejercicioId":"patada-gluteo-polea","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":5,"ejercicioId":"elevacion-talones-pie","estimulo":"resistencia","seriesObjetivo":3,"repMin":15,"repMax":20,"descansoSegundos":60}
]', actualizado_en = unixepoch()
WHERE cliente_id = 'santiago' AND orden = 2 AND (
  trim(slots_json) = '' OR
  CASE WHEN json_valid(slots_json) THEN json_type(slots_json) = 'array' AND json_array_length(slots_json) = 0 ELSE 0 END
);

UPDATE rutinas
SET slots_json = '[
  {"orden":1,"ejercicioId":"remo-barra","estimulo":"fuerza","seriesObjetivo":4,"repMin":1,"repMax":5,"descansoSegundos":180},
  {"orden":2,"ejercicioId":"press-pecho-convergente","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":3,"ejercicioId":"jalon-agarre-cerrado","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":4,"ejercicioId":"curl-mancuernas","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":5,"ejercicioId":"extension-triceps-polea","estimulo":"resistencia","seriesObjetivo":3,"repMin":15,"repMax":20,"descansoSegundos":60}
]', actualizado_en = unixepoch()
WHERE cliente_id = 'santiago' AND orden = 3 AND (
  trim(slots_json) = '' OR
  CASE WHEN json_valid(slots_json) THEN json_type(slots_json) = 'array' AND json_array_length(slots_json) = 0 ELSE 0 END
);

UPDATE rutinas
SET slots_json = '[
  {"orden":1,"ejercicioId":"peso-muerto-rumano","estimulo":"fuerza","seriesObjetivo":4,"repMin":1,"repMax":5,"descansoSegundos":180},
  {"orden":2,"ejercicioId":"hack-squat","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":3,"ejercicioId":"hip-thrust-barra","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":4,"ejercicioId":"extension-cuadriceps","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":5,"ejercicioId":"elevacion-talones-sentado","estimulo":"resistencia","seriesObjetivo":3,"repMin":15,"repMax":20,"descansoSegundos":60}
]', actualizado_en = unixepoch()
WHERE cliente_id = 'santiago' AND orden = 4 AND (
  trim(slots_json) = '' OR
  CASE WHEN json_valid(slots_json) THEN json_type(slots_json) = 'array' AND json_array_length(slots_json) = 0 ELSE 0 END
);
