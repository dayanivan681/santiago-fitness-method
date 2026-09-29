// Biblioteca Maestra de Santiago (mensaje 02): de su lista a fichas completas.
//
// Lo usan `generar-biblioteca-santiago.mjs` (escribe shared/biblioteca-santiago.ts)
// y `importar-biblioteca-santiago.mjs` (inserta en D1). Los nombres quedan tal
// cual los escribió Santiago. La explicación queda vacía: la escribe él.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

export const ORIGEN = "docs/aportes-santiago/2026-09-28-mensaje-02/ejercicios.csv";
const BASE = "shared/ejercicios-base.ts";

/** (grupo, subgrupo) → músculos y patrón. `movimiento` reutiliza el de la semilla si es equivalente. */
const POR_SUBGRUPO = {
  "Pecho|Press horizontal": ["pecho", ["triceps", "deltoideAnterior"], "press-pecho"],
  "Pecho|Press inclinado": ["pecho", ["deltoideAnterior", "triceps"], "press-pecho"],
  "Pecho|Press declinado": ["pecho", ["triceps", "deltoideAnterior"], "press-pecho"],
  "Pecho|Aperturas / aislamiento": ["pecho", ["deltoideAnterior"], "apertura-pecho"],
  "Pecho|Peso corporal": ["pecho", ["triceps", "deltoideAnterior"], "press-pecho"],
  "Hombros|Press vertical": ["deltoideAnterior", ["deltoideLateral", "triceps"], "press-hombro"],
  "Hombros|Deltoide lateral": ["deltoideLateral", [], "elevacion-lateral"],
  "Hombros|Deltoide anterior": ["deltoideAnterior", [], null],
  "Hombros|Deltoide posterior": ["deltoidePosterior", ["espalda"], null],
  "Espalda|Jalones verticales": ["espalda", ["biceps", "deltoidePosterior"], "jalon-vertical"],
  "Espalda|Remos": ["espalda", ["biceps", "deltoidePosterior"], "remo-horizontal"],
  "Espalda|Pullover": ["espalda", ["triceps"], null],
  "Cuádriceps / sentadillas|Sentadillas": ["cuadriceps", ["gluteos", "aductores"], "sentadilla"],
  "Cuádriceps / sentadillas|Máquinas": ["cuadriceps", ["gluteos"], "sentadilla"],
  "Cuádriceps / sentadillas|Unilaterales": ["cuadriceps", ["gluteos"], "sentadilla"],
  "Cuádriceps / sentadillas|Prensa": ["cuadriceps", ["gluteos"], "sentadilla"],
  "Cuádriceps / sentadillas|Aislamiento": ["cuadriceps", [], "extension-rodilla"],
  "Glúteos|Ejercicios": ["gluteos", ["femoral"], "extension-cadera"],
  "Femorales|Ejercicios": ["femoral", [], "curl-femoral"],
  "Peso muerto / cadena posterior|Ejercicios": ["femoral", ["gluteos", "espalda"], "bisagra-cadera"],
  "Bíceps|Ejercicios": ["biceps", [], "curl-biceps"],
  "Tríceps|Ejercicios": ["triceps", [], "extension-triceps"],
  "Pantorrillas|Ejercicios": ["pantorrillas", [], "gemelo"],
  "Aductores y abductores|Ejercicios": ["aductores", [], null],
  "Core / abdominales|Ejercicios": ["core", [], null],
};

/** Dentro de grupos mixtos, el nombre decide el patrón (y a veces el músculo). */
const POR_NOMBRE = [
  // Glúteos
  [/abduct/i, { musculoPrimario: "gluteos", musculosSecundarios: [], movimiento: "abduccion-cadera" }, ["Glúteos", "Aductores y abductores"]],
  [/band walk|monster walk/i, { musculoPrimario: "gluteos", musculosSecundarios: [], movimiento: "abduccion-cadera" }, ["Aductores y abductores"]],
  [/adduct/i, { musculoPrimario: "aductores", musculosSecundarios: [], movimiento: "santiago-aductores-aduccion" }, ["Aductores y abductores"]],
  [/pull-through|back extension|hyperextension/i, { musculosSecundarios: ["femoral"], movimiento: "bisagra-cadera" }, ["Glúteos"]],
  [/step-up|lunge/i, { musculosSecundarios: ["cuadriceps"], movimiento: "sentadilla" }, ["Glúteos"]],
  // Femorales: la bisagra no es un curl
  [/deadlift/i, { musculosSecundarios: ["gluteos", "espalda"], movimiento: "bisagra-cadera" }, ["Femorales"]],
  [/nordic|glute-ham/i, { musculosSecundarios: ["gluteos"], movimiento: "curl-femoral" }, ["Femorales"]],
  // Peso muerto convencional, sumo y tirones: glúteo y espalda por igual
  [/conventional|sumo|trap-bar|rack pull|block pull/i, { musculoPrimario: "gluteos", musculosSecundarios: ["femoral", "espalda"] }, ["Peso muerto / cadena posterior"]],
  // Tríceps: el press cerrado también empuja con el pecho
  [/bench press|dip/i, { musculosSecundarios: ["pecho"] }, ["Tríceps"]],
  // Pantorrillas
  [/tibialis/i, { movimiento: "santiago-pantorrillas-tibial" }, ["Pantorrillas"]],
  // Core
  [/crunch|raise/i, { movimiento: "santiago-core-flexion" }, ["Core / abdominales"]],
  [/plank|rollout|dead bug|bird dog/i, { movimiento: "santiago-core-estabilidad" }, ["Core / abdominales"]],
  [/pallof|chop|rotation|twist/i, { movimiento: "santiago-core-rotacion" }, ["Core / abdominales"]],
  [/carry/i, { movimiento: "santiago-core-acarreo" }, ["Core / abdominales"]],
];

/** Palabras del nombre → equipo, en este orden. */
const REGLAS_EQUIPO = [
  [/smith/i, "smith"],
  [/convergent/i, "convergente"],
  [/plate-?loaded/i, "maquinaDiscos"],
  [/selectoriz|machine|máquina/i, "maquinaTradicional"],
  [/cable|polea|rope|pushdown/i, "cable"],
  [/dumbbell|mancuerna/i, "mancuernas"],
  [/barbell|barra|landmine|t-bar|trap-bar|ez-bar/i, "barraLibre"],
  [/push-up|dip|plank|walk|bird dog|dead bug|hanging|pull-up|chin-up|crunch|chair|leg raise|ab wheel|twist|nordic|glute-ham|stability ball|copenhagen|side-lying|bridge|frog|back extension|tibialis raise/i, "pesoCorporal"],
];

/** Filas que ninguna regla resuelve bien. Revisables: Santiago puede corregirlas con «Editar». */
const EQUIPO_POR_FILA = {
  "Incline Single-Arm Press": "mancuernas",
  "Pec Deck / Butterfly": "maquinaTradicional",
  "Arnold Press": "mancuernas",
  "Plate Front Raise": "mancuernas", // un disco sujeto con las manos: peso libre, no máquina
  "Reverse Pec Deck": "maquinaTradicional",
  "Incline Bench Rear Delt Fly": "mancuernas",
  "Face Pull": "cable",
  "Lat Pulldown agarre ancho": "maquinaTradicional",
  "Lat Pulldown agarre medio": "maquinaTradicional",
  "Lat Pulldown agarre cerrado": "maquinaTradicional",
  "Lat Pulldown agarre neutro": "maquinaTradicional",
  "Reverse-Grip Lat Pulldown": "maquinaTradicional",
  "Single-Arm Lat Pulldown": "cable",
  "Kneeling Single-Arm Pulldown": "cable",
  "Assisted Pull-Up": "maquinaTradicional",
  "Pendlay Row": "barraLibre",
  "Iso-Lateral Row": "maquinaDiscos",
  "Back Squat": "barraLibre",
  "High-Bar Back Squat": "barraLibre",
  "Low-Bar Back Squat": "barraLibre",
  "Front Squat": "barraLibre",
  "Goblet Squat": "mancuernas",
  "Sumo Squat": "barraLibre",
  "Box Squat": "barraLibre",
  "Belt Squat": "maquinaDiscos",
  "Cyclist Squat": "mancuernas",
  "Heel-Elevated Squat": "mancuernas",
  "Hack Squat": "maquinaDiscos",
  "Reverse Hack Squat": "maquinaDiscos",
  "Linear Hack Squat": "maquinaDiscos",
  "Pendulum Squat": "maquinaDiscos",
  "Pendulum Squat 90°": "maquinaDiscos",
  "V-Squat": "maquinaDiscos",
  "B-Squat / Squat Machine": "maquinaDiscos",
  "Leverage Squat": "maquinaDiscos",
  "Power Squat": "maquinaDiscos",
  "Squat Press Machine": "maquinaDiscos",
  "Split Squat": "mancuernas",
  "Reverse Lunge": "mancuernas",
  "Stationary Lunge": "mancuernas",
  "Forward Lunge": "mancuernas",
  "Step-Up": "mancuernas",
  "Lateral Lunge": "mancuernas",
  "45° Leg Press": "maquinaDiscos",
  "Horizontal Leg Press": "maquinaTradicional",
  "Vertical Leg Press": "maquinaDiscos",
  "Seated Leg Press": "maquinaTradicional",
  "Single-Leg Press": "maquinaDiscos",
  "Wide-Stance Leg Press": "maquinaDiscos",
  "Narrow-Stance Leg Press": "maquinaDiscos",
  "Leg Extension": "maquinaTradicional",
  "Single-Leg Extension": "maquinaTradicional",
  "Kneeling Glute Kickback": "pesoCorporal",
  "Standing Glute Kickback": "pesoCorporal",
  "Lean-Forward Hip Abduction": "maquinaTradicional",
  "Standing Hip Abduction": "pesoCorporal",
  "Reverse Hyperextension": "maquinaDiscos",
  "Step-Up con énfasis en glúteos": "mancuernas",
  "Reverse Lunge con énfasis en glúteos": "mancuernas",
  "Single-Leg Romanian Deadlift": "mancuernas",
  "Stiff-Leg Deadlift": "barraLibre",
  "Seated Leg Curl": "maquinaTradicional",
  "Lying Leg Curl": "maquinaTradicional",
  "Standing Leg Curl": "maquinaTradicional",
  "Single-Leg Curl": "maquinaTradicional",
  "Kneeling Leg Curl": "maquinaTradicional",
  "Assisted Nordic Curl": "pesoCorporal",
  "Conventional Deadlift": "barraLibre",
  "Sumo Deadlift": "barraLibre",
  "Romanian Deadlift": "barraLibre",
  "Rack Pull": "barraLibre",
  "Block Pull": "barraLibre",
  "Hammer Curl": "mancuernas",
  "Alternating Hammer Curl": "mancuernas",
  "Cross-Body Hammer Curl": "mancuernas",
  "Spider Curl": "mancuernas",
  "Concentration Curl": "mancuernas",
  "Single-Arm Preacher Curl": "mancuernas",
  "Close-Grip Bench Press": "barraLibre",
  "Standing Calf Raise": "maquinaTradicional",
  "Seated Calf Raise": "maquinaDiscos",
  "Leg Press Calf Raise": "maquinaDiscos",
  "Donkey Calf Raise": "maquinaDiscos",
  "Single-Leg Calf Raise": "pesoCorporal",
  "Pallof Press": "cable",
  "Farmer Carry": "mancuernas",
  "Suitcase Carry": "mancuernas",
};

/** Mismos perfiles de carga que la semilla (`src/datos/semilla/biblioteca/cargas.ts`). */
const CARGA_POR_EQUIPO = {
  mancuernas: { tipoCarga: "porLado", incrementoMinimoLb: 10, pesoBaseMaquinaLb: null },
  barraLibre: { tipoCarga: "porLado", incrementoMinimoLb: 5, pesoBaseMaquinaLb: 45 },
  smith: { tipoCarga: "porLado", incrementoMinimoLb: 5, pesoBaseMaquinaLb: 25 },
  convergente: { tipoCarga: "porLado", incrementoMinimoLb: 5, pesoBaseMaquinaLb: null },
  maquinaDiscos: { tipoCarga: "porLado", incrementoMinimoLb: 5, pesoBaseMaquinaLb: null },
  maquinaTradicional: { tipoCarga: "pesoMaquina", incrementoMinimoLb: 10, pesoBaseMaquinaLb: null },
  cable: { tipoCarga: "pesoMaquina", incrementoMinimoLb: 10, pesoBaseMaquinaLb: null },
  pesoCorporal: { tipoCarga: "discosAnadidos", incrementoMinimoLb: 5, pesoBaseMaquinaLb: null },
};
const BARRA_Z = { tipoCarga: "porLado", incrementoMinimoLb: 5, pesoBaseMaquinaLb: 25 };

export const normalizar = (t) =>
  t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (t) => normalizar(t).replace(/ /g, "-");

/** Id estable por referencia: repetir la importación nunca crea otro ejercicio. */
export function idDeReferencia(ref) {
  const h = createHash("sha256").update(`sfm-biblioteca-santiago:${ref}`).digest("hex");
  return `coach-ej-${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function leerCsv(texto) {
  const [cabecera, ...lineas] = texto.replace(/^﻿/, "").trim().split(/\r?\n/);
  const cols = cabecera.split(",");
  return lineas.map((l) => Object.fromEntries(l.split(",").map((v, i) => [cols[i], v.trim()])));
}

function nombresFijos() {
  const texto = readFileSync(BASE, "utf8");
  return [...texto.matchAll(/\{ id: '([^']+)', nombre: '([^']+)' \}/g)].map(([, id, nombre]) => ({ id, nombre }));
}

function equipoDe(nombre) {
  if (EQUIPO_POR_FILA[nombre]) return EQUIPO_POR_FILA[nombre];
  return REGLAS_EQUIPO.find(([re]) => re.test(nombre))?.[1] ?? null;
}

/**
 * Todas las filas del CSV con su destino: `importar`, `yaExiste` (ficha fija con
 * el mismo nombre) o `duplicado` (repetida dentro de la lista de Santiago).
 */
export function fichasDeSantiago() {
  const filas = leerCsv(readFileSync(ORIGEN, "utf8"));
  const fijas = new Map(nombresFijos().map((f) => [normalizar(f.nombre), f.id]));
  const vistas = new Map();
  const sinEquipo = [];
  const fichas = filas.map((f, i) => {
    const ref = `M02-${String(i + 1).padStart(3, "0")}`;
    const clave = `${f.grupo_documento}|${f.subgrupo_documento}`;
    const base = POR_SUBGRUPO[clave];
    if (!base) throw Error(`Sin regla para ${clave}`);
    const [musculoPrimario, musculosSecundarios, movimiento] = base;
    const ajuste = POR_NOMBRE.find(([re, , grupos]) => grupos.includes(f.grupo_documento) && re.test(f.nombre_documento))?.[1] ?? {};
    const equipo = equipoDe(f.nombre_documento);
    if (!equipo) sinEquipo.push(f.nombre_documento);
    const carga = /\bEZ\b/.test(f.nombre_documento) && equipo === "barraLibre" ? BARRA_Z : CARGA_POR_EQUIPO[equipo];
    const ficha = {
      referenciaCatalogo: ref,
      nombre: f.nombre_documento,
      equipo,
      movimiento: movimiento ?? `santiago-${slug(f.grupo_documento)}-${slug(f.subgrupo_documento)}`,
      musculoPrimario,
      musculosSecundarios,
      ...carga,
      explicacionCorta: "",
      ...ajuste,
    };
    ficha.musculosSecundarios = ficha.musculosSecundarios.filter((m) => m !== ficha.musculoPrimario);
    const n = normalizar(ficha.nombre);
    const destino = fijas.has(n)
      ? { yaExiste: fijas.get(n) }
      : vistas.has(n)
        ? { duplicadoDe: vistas.get(n) }
        : { id: idDeReferencia(ref) };
    if (destino.id) vistas.set(n, ref);
    return { ...ficha, ...destino };
  });
  if (sinEquipo.length) throw Error(`Filas sin equipo, añade un override: ${sinEquipo.join(" | ")}`);
  return {
    fichas,
    importables: fichas.filter((f) => f.id),
    yaExisten: fichas.filter((f) => f.yaExiste),
    duplicados: fichas.filter((f) => f.duplicadoDe),
  };
}
