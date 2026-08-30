-- Fixture técnico de QA: sólo completa el cliente dayan-test recién creado.
-- Santiago permanece con sus cuatro días pendientes de confirmar.
-- La condición slots_json='[]' evita sobrescribir una edición del coach.

UPDATE rutinas SET slots_json = '[
  {"orden":1,"ejercicioId":"press-banca-15-smith","estimulo":"fuerza","seriesObjetivo":4,"repMin":1,"repMax":5,"descansoSegundos":180},
  {"orden":2,"ejercicioId":"press-inclinado-convergente","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":3,"ejercicioId":"lat-pulldown-maquina","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":4,"ejercicioId":"hip-thrust-barra","estimulo":"hipertrofia","seriesObjetivo":3,"repMin":6,"repMax":15,"descansoSegundos":120},
  {"orden":5,"ejercicioId":"elevacion-lateral-mancuernas","estimulo":"resistencia","seriesObjetivo":3,"repMin":15,"repMax":20,"descansoSegundos":60}
]' WHERE cliente_id='dayan-test' AND slots_json='[]';
