// Sistema visual de la biblioteca ilustrada · Santiago Fitness Method
//
// Fuente única del arte. Cada SVG de esta carpeta sale de aquí:
//   node arte/sistema-visual/generar.mjs
//
// Los valores de tokens.md son los de este archivo. Si se cambia un valor, se
// cambia aquí y se regenera; nunca se edita un SVG a mano.
//
// Convenciones de coordenadas (iguales en todas las láminas):
//   - Lienzo 720×960, origen arriba a la izquierda, y hacia abajo.
//   - Suelo en y = SUELO. La figura mira a la derecha (+x).
//   - Cada segmento se dibuja en su marco local: +x va de la articulación
//     proximal a la distal, la articulación proximal está en (0,0) y la distal
//     en (L,0). En la lámina, cada segmento es un <g> con
//     transform="translate(x y) rotate(θ)". Re-posar = cambiar x, y, θ.
//   - Ángulos en grados, sentido de la pantalla (0 = derecha, 90 = abajo).

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

export const LIENZO = { ancho: 720, alto: 960 };
export const SUELO = 896;
export const ALTURA_FIGURA = 720; // 75 % del lienzo
export const PX_POR_METRO = ALTURA_FIGURA / 1.75; // figura de 1,75 m → 411,4 px/m
export const EJE_X = 357; // x del tobillo en las láminas de figura

export const COLOR = {
  fondo: '#0b0c0d', // --fondo
  cuerpo: '#f2f2f0', // --texto
  cuerpoLejano: '#b4b5b1', // brazo y pierna del lado lejano
  ropa: '#33363c',
  acento: '#e5352b', // --rojo
  musculo: '#e5352b', // músculo que trabaja = acento
  acero: '#6b717b',
  aceroBorde: '#3f444c',
  aceroClaro: '#8d949e', // ejes, pivotes, manguitos, pasador
  tapizado: '#2a2d33',
  discoCara: '#25282d',
  discoAro: '#555b64',
  cable: '#9aa0a8',
  suelo: '#1c1e22',
};

export const TRAZO = {
  separador: 3, // contorno color fondo bajo cada segmento (se ve 1,5 px)
  bordeEquipo: 2, // borde a cada lado de un tubo de acero
  cable: 3,
  suelo: 2,
};

// Longitudes entre articulaciones (px). Idénticas en todas las láminas.
export const LARGO = {
  alturaTobillo: 28, // tobillo → suelo con el pie plano
  pie: 112, // talón → punta
  pierna: 177, // rodilla → tobillo
  muslo: 176, // cadera → rodilla
  torso: 202, // cadera → hombro
  cuello: 40, // base del cuello → atlas
  brazo: 134, // hombro → codo
  antebrazo: 105, // codo → muñeca
  mano: 66, // muñeca → centro de la yema (mano abierta)
  puno: 30, // muñeca → centro del puño (mano cerrada)
};

// Puntos fijos dentro del torso (marco local del torso: +x cadera→hombro, +y delante)
export const ANCLA_TORSO = {
  hombro: [LARGO.torso, 0],
  baseCuello: [212, -2],
};

// ---------------------------------------------------------------------------
// Utilidades geométricas
// ---------------------------------------------------------------------------

const rad = (g) => (g * Math.PI) / 180;
const gra = (r) => (r * 180) / Math.PI;
const f = (n) => {
  const v = Math.round(n * 10) / 10;
  return Object.is(v, -0) ? '0' : String(v);
};
const suma = (a, b) => [a[0] + b[0], a[1] + b[1]];
const resta = (a, b) => [a[0] - b[0], a[1] - b[1]];
const escala = (a, k) => [a[0] * k, a[1] * k];
const largo = (a) => Math.hypot(a[0], a[1]);
const dir = (theta) => [Math.cos(rad(theta)), Math.sin(rad(theta))];
const angulo = (v) => gra(Math.atan2(v[1], v[0]));
const rotar = (p, theta) => {
  const c = Math.cos(rad(theta));
  const s = Math.sin(rad(theta));
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
};
const rotarEn = (p, centro, theta) => suma(centro, rotar(resta(p, centro), theta));
const local = (origen, theta, p) => suma(origen, rotar(p, theta));

// Curva cerrada Catmull-Rom → beziers cúbicas
function curvaCerrada(puntos) {
  const n = puntos.length;
  let d = `M${f(puntos[0][0])} ${f(puntos[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = puntos[(i - 1 + n) % n];
    const p1 = puntos[i];
    const p2 = puntos[(i + 1) % n];
    const p3 = puntos[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d}Z`;
}

// Segmento de extremos redondeados: círculo r0 en la articulación proximal,
// círculo r1 en la distal, y un perfil de músculo a cada lado.
// lado -y y lado +y: listas de { t (0..1 del largo), w (semigrosor) }.
function capsula({ L, r0, r1, menosY, masY }) {
  const p = [];
  p.push([0, -r0]);
  for (const { t, w } of menosY) p.push([t * L, -w]);
  p.push([L, -r1]);
  for (const a of [-60, -30, 0, 30, 60]) p.push([L + r1 * Math.cos(rad(a)), r1 * Math.sin(rad(a))]);
  p.push([L, r1]);
  for (const { t, w } of [...masY].reverse()) p.push([t * L, w]);
  p.push([0, r0]);
  for (const a of [120, 150, 180, 210, 240]) p.push([r0 * Math.cos(rad(a)), r0 * Math.sin(rad(a))]);
  return curvaCerrada(p);
}

// ---------------------------------------------------------------------------
// Formas de la figura (marco local de cada segmento)
// ---------------------------------------------------------------------------

// Radio de cada articulación: el mismo en los dos segmentos que la comparten,
// por eso la unión aguanta cualquier ángulo.
export const ARTICULACION = {
  cadera: 34,
  rodilla: 22,
  tobillo: 14,
  hombro: 24,
  codo: 15,
  muneca: 10,
  cuello: 18,
};

// En piernas y brazos colgando (θ = 90) el lado -y es el de delante.
// En torso, cuello y cabeza (θ = -90) el lado +y es el de delante.
export const SEGMENTO = {
  muslo: {
    L: LARGO.muslo,
    r0: ARTICULACION.cadera,
    r1: ARTICULACION.rodilla,
    menosY: [{ t: 0.3, w: 37 }, { t: 0.72, w: 29 }],
    masY: [{ t: 0.15, w: 35 }, { t: 0.6, w: 28 }],
  },
  pierna: {
    L: LARGO.pierna,
    r0: ARTICULACION.rodilla,
    r1: ARTICULACION.tobillo,
    menosY: [{ t: 0.25, w: 22 }, { t: 0.7, w: 16 }],
    masY: [{ t: 0.28, w: 31 }, { t: 0.62, w: 21 }],
  },
  brazo: {
    L: LARGO.brazo,
    r0: ARTICULACION.hombro,
    r1: ARTICULACION.codo,
    menosY: [{ t: 0.5, w: 20 }],
    masY: [{ t: 0.3, w: 23 }, { t: 0.72, w: 18 }],
  },
  antebrazo: {
    L: LARGO.antebrazo,
    r0: ARTICULACION.codo,
    r1: ARTICULACION.muneca,
    menosY: [{ t: 0.32, w: 17 }],
    masY: [{ t: 0.25, w: 18 }],
  },
  mano: {
    L: LARGO.mano,
    r0: ARTICULACION.muneca,
    r1: 8,
    menosY: [{ t: 0.45, w: 12 }],
    masY: [{ t: 0.45, w: 11 }],
  },
  puno: {
    L: LARGO.puno,
    r0: ARTICULACION.muneca,
    r1: 13,
    menosY: [{ t: 0.55, w: 14 }],
    masY: [{ t: 0.55, w: 14 }],
  },
  cuello: {
    L: LARGO.cuello,
    r0: ARTICULACION.cuello,
    r1: 17,
    menosY: [{ t: 0.5, w: 17 }],
    masY: [{ t: 0.5, w: 17 }],
  },
};

const FORMA = Object.fromEntries(Object.entries(SEGMENTO).map(([k, s]) => [k, capsula(s)]));

// Torso: cadera en (0,0), hombro en (202,0). +y delante.
FORMA.torso = curvaCerrada([
  [-34, -14], [-14, -46], [20, -50], [60, -38], [100, -31], [145, -38], [185, -44],
  [215, -38], [232, -22], [240, -6], [238, 10], [226, 26], [205, 44], [172, 53],
  [140, 46], [100, 36], [50, 38], [10, 36], [-24, 22], [-38, 6],
]);

// Pie: tobillo en (0,0), +x hacia la punta, planta en y = 28.
FORMA.pie = curvaCerrada([
  [0, -14], [-12, -8], [-21, 4], [-26, 16], [-22, 26], [-10, 28], [30, 28], [64, 28],
  [80, 27], [86, 21], [82, 13], [64, 6], [40, -2], [18, -10],
]);

// Cabeza: atlas (punta del cuello) en (0,0), +x hacia la coronilla, +y delante.
// Sin rasgos: cráneo y mandíbula como una sola forma lisa.
FORMA.cabeza = curvaCerrada([
  [88, 2], [80, 26], [62, 40], [42, 44], [22, 42], [6, 36], [-6, 24], [-6, 12],
  [2, 2], [8, -20], [22, -36], [46, -42], [70, -32],
]);

// Zonas musculares (firma de marca): formas encima del segmento, recortadas a él.
export const MUSCULO = {
  cuadriceps: { segmento: 'muslo', puntos: [[24, -28], [60, -37], [105, -33], [148, -21], [160, -11], [130, -15], [80, -18], [40, -16]] },
  isquios: { segmento: 'muslo', puntos: [[30, 24], [70, 30], [120, 26], [150, 16], [120, 12], [70, 14]] },
  gemelo: { segmento: 'pierna', puntos: [[18, 20], [45, 31], [80, 27], [105, 16], [80, 12], [45, 14]] },
  gluteo: { segmento: 'torso', puntos: [[-28, -16], [-12, -44], [18, -49], [50, -40], [44, -24], [14, -20], [-12, -10]] },
  abdominal: { segmento: 'torso', puntos: [[30, 30], [60, 36], [110, 35], [140, 40], [130, 28], [90, 26], [50, 26]] },
  pectoral: { segmento: 'torso', puntos: [[150, 40], [172, 51], [200, 43], [214, 30], [195, 28], [165, 30]] },
  dorsal: { segmento: 'torso', puntos: [[110, -30], [150, -38], [190, -43], [200, -30], [170, -24], [135, -22]] },
  trapecio: { segmento: 'torso', puntos: [[205, -36], [228, -24], [238, -8], [222, -14], [208, -24]] },
  deltoides: { segmento: 'brazo', puntos: [[-18, -14], [0, -24], [30, -20], [50, -10], [52, 6], [30, 18], [0, 22], [-18, 12]] },
  biceps: { segmento: 'brazo', puntos: [[35, -15], [70, -20], [105, -14], [90, -8], [60, -8]] },
  triceps: { segmento: 'brazo', puntos: [[25, 14], [55, 23], [100, 17], [110, 10], [70, 10]] },
};

// Ropa: rectángulos en el marco local, recortados al segmento.
const ROPA = {
  torso: [
    [30, -80, 192, 160], // camiseta sin mangas: x 30 → 222
    [-60, -80, 94, 160], // pantalón corto: x -60 → 34
  ],
  muslo: [[-60, -60, 132, 120]], // pantalón corto: hasta el 41 % del muslo
};

// ---------------------------------------------------------------------------
// Figura: cinemática directa
// ---------------------------------------------------------------------------

// Una pose = cadera + ángulo absoluto de cada segmento. Lado lejano opcional
// (si no se da, copia el cercano: perfil puro, queda oculto detrás).
export function resolverPose(pose) {
  const j = {};
  const cadera = pose.cadera;
  j.torso = { o: cadera, th: pose.torso };
  const hombro = local(cadera, pose.torso, ANCLA_TORSO.hombro);
  const baseCuello = local(cadera, pose.torso, ANCLA_TORSO.baseCuello);
  j.cuello = { o: baseCuello, th: pose.cuello };
  const atlas = suma(baseCuello, escala(dir(pose.cuello), LARGO.cuello));
  j.cabeza = { o: atlas, th: pose.cabeza };

  for (const lado of ['cerca', 'lejos']) {
    const p = lado === 'cerca' ? pose : { ...pose, ...(pose.lejos ?? {}) };
    const rodilla = suma(cadera, escala(dir(p.muslo), LARGO.muslo));
    const tobillo = suma(rodilla, escala(dir(p.pierna), LARGO.pierna));
    const codo = suma(hombro, escala(dir(p.brazo), LARGO.brazo));
    const muneca = suma(codo, escala(dir(p.antebrazo), LARGO.antebrazo));
    j[`muslo-${lado}`] = { o: cadera, th: p.muslo };
    j[`pierna-${lado}`] = { o: rodilla, th: p.pierna };
    j[`pie-${lado}`] = { o: tobillo, th: p.pie };
    j[`brazo-${lado}`] = { o: hombro, th: p.brazo };
    j[`antebrazo-${lado}`] = { o: codo, th: p.antebrazo };
    j[`mano-${lado}`] = { o: muneca, th: p.mano, forma: p.formaMano ?? 'mano' };
  }
  return j;
}

// Cinemática inversa de dos segmentos. lado = +1 / -1 elige hacia dónde dobla.
export function ik2(raiz, objetivo, L1, L2, lado) {
  const d = resta(objetivo, raiz);
  const dist = Math.min(largo(d), L1 + L2 - 0.001);
  const a = Math.acos((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist));
  const base = Math.atan2(d[1], d[0]);
  const medio = suma(raiz, escala([Math.cos(base + lado * a), Math.sin(base + lado * a)], L1));
  return { medio, th1: angulo(resta(medio, raiz)), th2: angulo(resta(objetivo, medio)) };
}

function dibujarSegmento(id, tipo, { o, th }, color, musculos = []) {
  const ropa = (ROPA[tipo] ?? [])
    .map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`)
    .join('');
  const zonas = musculos
    .filter((m) => MUSCULO[m].segmento === tipo)
    .map((m) => `<path data-musculo="${m}" d="${curvaCerrada(MUSCULO[m].puntos)}"/>`)
    .join('');
  return [
    `<g id="${id}" data-segmento="${tipo}" transform="translate(${f(o[0])} ${f(o[1])}) rotate(${f(th)})">`,
    `<path d="${FORMA[tipo]}" fill="${color}" stroke="${COLOR.fondo}" stroke-width="${TRAZO.separador * 2}" paint-order="stroke" stroke-linejoin="round"/>`,
    ropa ? `<g clip-path="url(#recorte-${tipo})" fill="${COLOR.ropa}">${ropa}</g>` : '',
    zonas ? `<g clip-path="url(#recorte-${tipo})" fill="${COLOR.musculo}">${zonas}</g>` : '',
    '</g>',
  ].join('');
}

function defsFigura() {
  const tipos = ['torso', 'muslo', 'pierna', 'pie', 'brazo', 'antebrazo', 'mano', 'puno', 'cuello', 'cabeza'];
  return tipos
    .map((t) => `<clipPath id="recorte-${t}" clipPathUnits="userSpaceOnUse"><path d="${FORMA[t]}"/></clipPath>`)
    .join('');
}

// Orden de pintado: lado lejano → cuello → torso → cabeza → lado cercano.
export function figura(pose, { musculos = [] } = {}) {
  const j = resolverPose(pose);
  const seg = (id, tipo, color) => dibujarSegmento(id, tipo, j[id], color, id.endsWith('lejos') ? [] : musculos);
  const mano = (lado, color) => dibujarSegmento(`mano-${lado}`, j[`mano-${lado}`].forma, j[`mano-${lado}`], color);
  return [
    '<g id="figura">',
    '<g id="lado-lejano">',
    mano('lejos', COLOR.cuerpoLejano),
    seg('antebrazo-lejos', 'antebrazo', COLOR.cuerpoLejano),
    seg('brazo-lejos', 'brazo', COLOR.cuerpoLejano),
    seg('pie-lejos', 'pie', COLOR.cuerpoLejano),
    seg('pierna-lejos', 'pierna', COLOR.cuerpoLejano),
    seg('muslo-lejos', 'muslo', COLOR.cuerpoLejano),
    '</g>',
    seg('cuello', 'cuello', COLOR.cuerpo),
    seg('torso', 'torso', COLOR.cuerpo),
    seg('cabeza', 'cabeza', COLOR.cuerpo),
    '<g id="lado-cercano">',
    seg('pie-cerca', 'pie', COLOR.cuerpo),
    seg('pierna-cerca', 'pierna', COLOR.cuerpo),
    seg('muslo-cerca', 'muslo', COLOR.cuerpo),
    mano('cerca', COLOR.cuerpo),
    seg('antebrazo-cerca', 'antebrazo', COLOR.cuerpo),
    seg('brazo-cerca', 'brazo', COLOR.cuerpo),
    '</g>',
    '</g>',
  ].join('');
}

// ---------------------------------------------------------------------------
// Poses de las láminas
// ---------------------------------------------------------------------------

const ALTURA_CADERA = LARGO.alturaTobillo + LARGO.pierna + LARGO.muslo; // 381

export const POSE = {
  neutra: {
    cadera: [EJE_X, SUELO - ALTURA_CADERA],
    torso: -90, cuello: -80, cabeza: -90,
    muslo: 90, pierna: 90, pie: 0,
    brazo: 90, antebrazo: 90, mano: 90, formaMano: 'mano',
  },
  flexion: (() => {
    // Pie fijo en el mismo sitio que en la neutra. Tibia 30° adelante,
    // rodilla a 90°, cadera a 90°, columna neutra.
    const tobillo = [EJE_X, SUELO - LARGO.alturaTobillo];
    const pierna = 120; // rodilla → tobillo
    const rodilla = resta(tobillo, escala(dir(pierna), LARGO.pierna));
    const muslo = 30; // cadera → rodilla
    const cadera = resta(rodilla, escala(dir(muslo), LARGO.muslo));
    return {
      cadera,
      torso: -60, cuello: -52, cabeza: -78,
      muslo, pierna, pie: 0,
      brazo: 70, antebrazo: -60, mano: -60, formaMano: 'puno',
    };
  })(),
  brazosArriba: {
    cadera: [EJE_X, SUELO - ALTURA_CADERA],
    torso: -90, cuello: -80, cabeza: -90,
    muslo: 90, pierna: 90, pie: 0,
    brazo: -84, antebrazo: -84, mano: -84, formaMano: 'puno',
  },
};

// ---------------------------------------------------------------------------
// Equipo: primitivas
// ---------------------------------------------------------------------------

// Tubo de acero: trazo de borde + trazo de relleno, extremos redondeados.
function tubo(a, b, w, color = COLOR.acero) {
  const linea = (c, g) =>
    `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${c}" stroke-width="${g}" stroke-linecap="round"/>`;
  return linea(COLOR.aceroBorde, w + TRAZO.bordeEquipo * 2) + linea(color, w);
}

function polilineaTubo(puntos, w, color = COLOR.acero) {
  const d = `M${puntos.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}`;
  const trazo = (c, g) =>
    `<path d="${d}" fill="none" stroke="${c}" stroke-width="${g}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return trazo(COLOR.aceroBorde, w + TRAZO.bordeEquipo * 2) + trazo(color, w);
}

// Almohadilla: cápsula tapizada entre a y b.
function almohadilla(a, b, w) {
  const linea = (c, g) =>
    `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${c}" stroke-width="${g}" stroke-linecap="round"/>`;
  return linea(COLOR.aceroBorde, w + TRAZO.bordeEquipo * 2) + linea(COLOR.tapizado, w);
}

function eje([x, y], r = 14) {
  return `<g data-pivote="${f(x)},${f(y)}"><circle cx="${f(x)}" cy="${f(y)}" r="${r + 2}" fill="${COLOR.aceroBorde}"/><circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${COLOR.aceroClaro}"/><circle cx="${f(x)}" cy="${f(y)}" r="${Math.round(r * 0.4)}" fill="${COLOR.aceroBorde}"/></g>`;
}

const cable = (puntos) =>
  `<path d="M${puntos.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}" fill="none" stroke="${COLOR.cable}" stroke-width="${TRAZO.cable}" stroke-linecap="round" stroke-linejoin="round"/>`;

export const DISCO = {
  grande: 0.45 * PX_POR_METRO / 2, // Ø 450 mm (20 kg) → r 92,6
  mediano: 0.33 * PX_POR_METRO / 2, // Ø 330 mm (10 kg)
  chico: 0.23 * PX_POR_METRO / 2, // Ø 230 mm (5 kg)
};

// Disco visto de frente (en perfil, los discos siempre se ven de frente).
function disco([cx, cy], r, id = 'disco') {
  const c = (rr, fill, extra = '') => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(rr)}" fill="${fill}"${extra}/>`;
  const asas =
    r > 80
      ? [-1, 1]
          .map((s) => `<rect x="${f(cx + s * r * 0.66 - 7)}" y="${f(cy - 16)}" width="14" height="32" rx="7" fill="${COLOR.fondo}"/>`)
          .join('')
      : '';
  return [
    `<g id="${id}" data-centro="${f(cx)},${f(cy)}" data-radio="${f(r)}">`,
    c(r, COLOR.discoAro),
    c(r - 7, COLOR.discoCara),
    c(r * 0.42, 'none', ` stroke="${COLOR.discoAro}" stroke-width="3"`),
    asas,
    c(15, COLOR.aceroClaro),
    c(7, COLOR.fondo),
    '</g>',
  ].join('');
}

// Manguito de barra visto de punta, con collarín.
function puntaBarra([cx, cy]) {
  const c = (rr, fill) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${rr}" fill="${fill}"/>`;
  return `<g id="manguito" data-centro="${f(cx)},${f(cy)}">${c(21, COLOR.aceroBorde)}${c(19, COLOR.acero)}${c(13, COLOR.aceroBorde)}${c(11, COLOR.aceroClaro)}${c(4, COLOR.aceroBorde)}</g>`;
}

const base = (x1, x2) => tubo([x1, SUELO - 10], [x2, SUELO - 10], 16);

// ---------------------------------------------------------------------------
// Kit de equipo (cada pieza sin figura; mismo suelo y misma escala)
// ---------------------------------------------------------------------------

export const EQUIPO = {
  'barra-libre': () => {
    const c = [360, SUELO - DISCO.grande];
    return `<g id="barra-libre" data-vista="punta">${disco(c, DISCO.grande)}${puntaBarra(c)}</g>`;
  },

  mancuerna: () => {
    // Vista lateral (agarre neutro) y vista de punta (agarre prono/supino).
    const yL = SUELO - 38;
    const lado = [
      `<g id="mancuerna-lado" data-vista="lado" data-centro="230,${yL}">`,
      `<rect x="${230 - 26.5}" y="${yL - 7}" width="53" height="14" rx="4" fill="${COLOR.aceroClaro}" stroke="${COLOR.aceroBorde}" stroke-width="2"/>`,
      ...[-1, 1].map(
        (s) =>
          `<rect x="${230 + s * 46.5 - 20}" y="${yL - 38}" width="40" height="76" rx="7" fill="${COLOR.discoCara}" stroke="${COLOR.discoAro}" stroke-width="4"/>`,
      ),
      '</g>',
    ].join('');
    const cP = [500, SUELO - 38];
    const hex = Array.from({ length: 6 }, (_, i) => rotar([38, 0], 30 + i * 60)).map((p) => suma(p, cP));
    const punta = [
      `<g id="mancuerna-punta" data-vista="punta" data-centro="${cP[0]},${cP[1]}">`,
      `<polygon points="${hex.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}" fill="${COLOR.discoCara}" stroke="${COLOR.discoAro}" stroke-width="4" stroke-linejoin="round"/>`,
      `<circle cx="${cP[0]}" cy="${cP[1]}" r="9" fill="${COLOR.aceroClaro}" stroke="${COLOR.aceroBorde}" stroke-width="2"/>`,
      '</g>',
    ].join('');
    return lado + punta;
  },

  'polea-cable': () => {
    const xc = 430; // columna
    const xp = 560; // columna trasera de la pila
    const top = SUELO - 2.05 * PX_POR_METRO;
    const placas = Array.from({ length: 14 }, (_, i) => {
      const y = SUELO - 30 - (i + 1) * 25;
      return `<rect x="${xc + 34}" y="${f(y)}" width="${xp - xc - 52}" height="22" rx="3" fill="${COLOR.acero}" stroke="${COLOR.aceroBorde}" stroke-width="2"/>`;
    }).join('');
    const yCarro = 150;
    const polea = [xc - 34, yCarro + 30];
    const agarre = [polea[0] - 21, 560];
    return [
      '<g id="polea-cable">',
      '<g id="bastidor">',
      base(300, 610),
      `<g id="pila" data-placas="14">${placas}<circle cx="${f((xc + xp) / 2 - 9)}" cy="${f(SUELO - 30 - 8 * 25 + 11)}" r="6" fill="${COLOR.aceroClaro}" stroke="${COLOR.aceroBorde}" stroke-width="2"/></g>`,
      tubo([xp, SUELO - 10], [xp, top], 14),
      tubo([xc, SUELO - 10], [xc, top], 28),
      tubo([xc - 10, top], [xp + 10, top], 20),
      '</g>',
      `<g id="carro-polea" data-riel="${xc},${f(top + 40)},${xc},${SUELO - 60}">`,
      `<rect x="${xc - 22}" y="${yCarro}" width="44" height="64" rx="6" fill="${COLOR.acero}" stroke="${COLOR.aceroBorde}" stroke-width="2"/>`,
      tubo([xc - 18, yCarro + 30], polea, 12),
      `<g id="polea" data-pivote="${polea[0]},${polea[1]}"><circle cx="${polea[0]}" cy="${polea[1]}" r="23" fill="${COLOR.aceroBorde}"/><circle cx="${polea[0]}" cy="${polea[1]}" r="21" fill="${COLOR.acero}"/><circle cx="${polea[0]}" cy="${polea[1]}" r="8" fill="${COLOR.aceroClaro}"/></g>`,
      '</g>',
      `<g id="cable">${cable([[polea[0] - 21, polea[1]], [agarre[0], agarre[1] - 18]])}</g>`,
      `<g id="agarre" data-punto="${agarre[0]},${agarre[1]}">`,
      `<circle cx="${agarre[0]}" cy="${agarre[1] - 18}" r="6" fill="none" stroke="${COLOR.aceroClaro}" stroke-width="4"/>`,
      `<path d="M${agarre[0] - 30} ${agarre[1] + 30}L${agarre[0]} ${agarre[1] - 12}L${agarre[0] + 30} ${agarre[1] + 30}Z" fill="none" stroke="${COLOR.aceroBorde}" stroke-width="12" stroke-linejoin="round"/>`,
      `<path d="M${agarre[0] - 30} ${agarre[1] + 30}L${agarre[0]} ${agarre[1] - 12}L${agarre[0] + 30} ${agarre[1] + 30}Z" fill="none" stroke="${COLOR.acero}" stroke-width="8" stroke-linejoin="round"/>`,
      almohadilla([agarre[0] - 24, agarre[1] + 30], [agarre[0] + 24, agarre[1] + 30], 14),
      '</g>',
      '</g>',
    ].join('');
  },

  'maquina-pin': () => {
    // Máquina selectorizada sentada: pila con pasador, leva en el eje, brazo con rodillo.
    const pivote = [470, 650];
    const placas = Array.from({ length: 15 }, (_, i) => {
      const y = SUELO - 30 - (i + 1) * 23;
      return `<rect x="186" y="${y}" width="56" height="20" rx="3" fill="${COLOR.acero}" stroke="${COLOR.aceroBorde}" stroke-width="2"/>`;
    }).join('');
    const yPila = SUELO - 30 - 15 * 23;
    return [
      '<g id="maquina-pin">',
      '<g id="bastidor">',
      base(130, 610),
      `<g id="pila" data-placas="15">${placas}`,
      tubo([214, yPila], [214, 360], 6, COLOR.aceroClaro),
      '</g>',
      tubo([170, SUELO - 10], [170, 330], 18),
      tubo([258, SUELO - 10], [258, 330], 18),
      tubo([150, 330], [440, 330], 20),
      tubo([440, 330], [440, 560], 16),
      tubo([380, SUELO - 10], [380, 700], 22),
      tubo([300, 700], [300, 450], 14),
      tubo([300, 700], [460, 700], 14),
      tubo([440, 560], pivote, 16),
      `<g id="pasador" data-placa="6">`,
      `<rect x="232" y="${SUELO - 30 - 6 * 23 + 6}" width="48" height="8" rx="4" fill="${COLOR.aceroClaro}" stroke="${COLOR.aceroBorde}" stroke-width="2"/>`,
      `<circle cx="284" cy="${SUELO - 30 - 6 * 23 + 10}" r="9" fill="${COLOR.aceroClaro}" stroke="${COLOR.aceroBorde}" stroke-width="2"/>`,
      '</g>',
      '</g>',
      `<g id="cable">${cable([[214, 360], [214, 345], [426, 345], [426, 610], [pivote[0] - 26, pivote[1] - 6]])}</g>`,
      '<g id="asiento">',
      almohadilla([298, 684], [462, 684], 30),
      almohadilla([316, 668], [300, 440], 34),
      '</g>',
      `<g id="brazo-movil" data-pivote="${pivote[0]},${pivote[1]}">`,
      `<circle cx="${pivote[0]}" cy="${pivote[1]}" r="28" fill="${COLOR.aceroBorde}"/><circle cx="${pivote[0]}" cy="${pivote[1]}" r="26" fill="${COLOR.acero}"/>`,
      tubo(pivote, [492, 812], 18),
      `<g id="rodillo"><circle cx="496" cy="818" r="26" fill="${COLOR.aceroBorde}"/><circle cx="496" cy="818" r="24" fill="${COLOR.tapizado}"/></g>`,
      eje(pivote, 12),
      '</g>',
      '</g>',
    ].join('');
  },

  'maquina-discos': () => {
    // Palanca cargada con discos (remo en T con apoyo de pecho).
    const pivote = [140, 852];
    const fin = [560, 630];
    const u = escala(resta(fin, pivote), 1 / largo(resta(fin, pivote)));
    const perp = [-u[1], u[0]]; // perpendicular hacia abajo
    const asa0 = suma(pivote, escala(u, 360));
    const asa1 = suma(asa0, escala(perp, 96));
    return [
      '<g id="maquina-discos">',
      '<g id="bastidor">',
      base(100, 640),
      tubo([pivote[0], SUELO - 10], pivote, 22),
      tubo([350, SUELO - 10], [350, 560], 20),
      tubo([350, 560], [380, 520], 16),
      `<rect x="200" y="${SUELO - 30}" width="120" height="14" rx="4" fill="${COLOR.acero}" stroke="${COLOR.aceroBorde}" stroke-width="2"/>`,
      almohadilla([350, 500], [440, 420], 36),
      '</g>',
      `<g id="palanca" data-pivote="${pivote[0]},${pivote[1]}">`,
      tubo(fin, suma(fin, escala(u, 26)), 14, COLOR.aceroClaro),
      disco(fin, DISCO.grande),
      tubo(pivote, fin, 20),
      tubo(asa0, asa1, 12),
      almohadilla(suma(asa1, [-16, 0]), suma(asa1, [16, 0]), 16),
      eje(pivote, 12),
      '</g>',
      '</g>',
    ].join('');
  },

  smith: () => {
    const xr = 380; // guía
    const top = SUELO - 2.1 * PX_POR_METRO;
    const yBarra = 340;
    const tacos = Array.from({ length: 12 }, (_, i) => {
      const y = top + 80 + i * 55;
      return `<rect x="${560 - 26}" y="${f(y)}" width="12" height="20" rx="3" fill="${COLOR.aceroClaro}" stroke="${COLOR.aceroBorde}" stroke-width="2"/>`;
    }).join('');
    return [
      '<g id="smith">',
      '<g id="bastidor">',
      base(130, 610),
      tubo([170, SUELO - 10], [170, top], 22),
      tubo([560, SUELO - 10], [560, top], 22),
      tubo([170, top], [560, top], 20),
      tubo([xr, top + 10], [xr, SUELO - 20], 8, COLOR.aceroClaro),
      `<g id="ganchos">${tacos}</g>`,
      `<rect x="${xr - 20}" y="700" width="40" height="18" rx="4" fill="${COLOR.acero}" stroke="${COLOR.aceroBorde}" stroke-width="2"/>`,
      '</g>',
      `<g id="carro" data-riel="${xr},${f(top + 30)},${xr},700">`,
      disco([xr, yBarra], DISCO.grande),
      `<rect x="${xr - 16}" y="${yBarra - 34}" width="32" height="68" rx="6" fill="${COLOR.acero}" stroke="${COLOR.aceroBorde}" stroke-width="2"/>`,
      tubo([xr + 10, yBarra + 6], [xr + 70, yBarra - 8], 10),
      puntaBarra([xr, yBarra]),
      '</g>',
      '</g>',
    ].join('');
  },

  convergente: () => {
    // Press convergente: pivote alto y atrás, brazo largo curvo hasta el agarre.
    const pivote = [252, 250];
    const asa = [560, 470];
    const cuerno = [470, 268];
    return [
      '<g id="convergente">',
      '<g id="bastidor">',
      base(120, 620),
      tubo([210, SUELO - 10], [210, 300], 24),
      tubo([210, 300], pivote, 22),
      tubo([360, SUELO - 10], [360, 700], 22),
      tubo([210, 700], [360, 700], 14),
      '</g>',
      '<g id="asiento">',
      almohadilla([280, 684], [440, 684], 30),
      almohadilla([296, 664], [266, 400], 34),
      '</g>',
      `<g id="brazo-movil" data-pivote="${pivote[0]},${pivote[1]}">`,
      tubo(cuerno, suma(cuerno, [0, 0]), 30, COLOR.aceroClaro),
      disco(cuerno, DISCO.grande),
      polilineaTubo([pivote, [380, 214], [490, 300], asa], 22),
      tubo([asa[0] - 6, asa[1] - 10], [asa[0] - 14, asa[1] + 62], 14),
      almohadilla([asa[0] - 10, asa[1] + 20], [asa[0] - 14, asa[1] + 56], 18),
      eje(pivote, 13),
      '</g>',
      '</g>',
    ].join('');
  },

  'banco-plano': () => {
    const alto = SUELO - 0.43 * PX_POR_METRO; // 43 cm
    return [
      '<g id="banco-plano">',
      '<g id="bastidor">',
      tubo([140, SUELO - 8], [260, SUELO - 8], 14),
      tubo([460, SUELO - 8], [580, SUELO - 8], 14),
      tubo([200, SUELO - 8], [200, alto + 30], 20),
      tubo([520, SUELO - 8], [520, alto + 30], 20),
      tubo([200, alto + 30], [520, alto + 30], 16),
      '</g>',
      `<g id="tablero" data-superficie="${f(alto)}">${almohadilla([126, alto + 10], [594, alto + 10], 36)}</g>`,
      '</g>',
    ].join('');
  },

  'banco-inclinado': () => {
    const bisagra = [400, 712];
    const angulo = -135; // 45° de respaldo
    const fin = suma(bisagra, escala(dir(angulo), 300));
    const apoyo = suma(bisagra, escala(dir(angulo), 170));
    return [
      '<g id="banco-inclinado">',
      '<g id="bastidor">',
      tubo([150, SUELO - 8], [600, SUELO - 8], 14),
      tubo([440, SUELO - 8], [440, bisagra[1] + 24], 20),
      tubo([300, SUELO - 8], suma(apoyo, [14, 22]), 14),
      tubo([440, bisagra[1] + 24], [560, bisagra[1] + 24], 14),
      '</g>',
      `<g id="asiento">${almohadilla([418, 704], [560, 704], 34)}</g>`,
      `<g id="respaldo" data-pivote="${bisagra[0]},${bisagra[1]}" data-angulo="${angulo}">`,
      almohadilla(suma(bisagra, escala(dir(angulo), 18)), fin, 36),
      '</g>',
      eje([bisagra[0] + 14, bisagra[1] + 18], 8),
      '</g>',
    ].join('');
  },

  'plataforma-pies': () => {
    const centro = [360, 820];
    const angulo = -25; // punta arriba
    const a = local(centro, angulo, [-110, 0]);
    const b = local(centro, angulo, [110, 0]);
    return [
      '<g id="plataforma-pies">',
      '<g id="bastidor">',
      base(200, 520),
      tubo(local(centro, angulo, [-80, 16]), [250, SUELO - 10], 16),
      tubo(local(centro, angulo, [80, 16]), [470, SUELO - 10], 16),
      '</g>',
      `<g id="placa" data-centro="${centro[0]},${centro[1]}" data-angulo="${angulo}">`,
      tubo(a, b, 18),
      tubo(local(centro, angulo, [-100, -11]), local(centro, angulo, [100, -11]), 4, COLOR.aceroClaro),
      '</g>',
      '</g>',
    ].join('');
  },

  disco: () =>
    [
      '<g id="discos">',
      disco([200, SUELO - DISCO.grande], DISCO.grande, 'disco-grande'),
      disco([390, SUELO - DISCO.mediano], DISCO.mediano, 'disco-mediano'),
      disco([530, SUELO - DISCO.chico], DISCO.chico, 'disco-chico'),
      '</g>',
    ].join(''),
};

// ---------------------------------------------------------------------------
// Lámina de destino: Pendulum Squat 90°
// ---------------------------------------------------------------------------

export const PENDULUM = {
  pivote: [610, 240],
  tobillo: [462, 812],
  anguloPie: -20, // plataforma con la punta arriba
  caderaATobilloArriba: 345, // rodilla casi extendida, sin bloquear
  reclinadoTorso: -115, // torso a 25° del vertical, recostado
  caderaATobilloAbajo: Math.hypot(LARGO.muslo, LARGO.pierna), // rodilla a 90°
};

function pendulumSquat(fase) {
  const P = PENDULUM;
  // Posición de arriba (fotograma 1)
  const dirPierna = -110;
  const cadera0 = suma(P.tobillo, escala(dir(dirPierna), P.caderaATobilloArriba));
  const hombro0 = local(cadera0, P.reclinadoTorso, ANCLA_TORSO.hombro);

  // El carro gira sobre el pivote: buscar φ para la fase pedida.
  const caderaEn = (phi) => rotarEn(cadera0, P.pivote, phi);
  let phi = 0;
  if (fase === 'abajo') {
    let lo = -60;
    let hi = 0;
    for (let i = 0; i < 60; i++) {
      const m = (lo + hi) / 2;
      if (largo(resta(caderaEn(m), P.tobillo)) > P.caderaATobilloAbajo) hi = m;
      else lo = m;
    }
    phi = (lo + hi) / 2;
  }
  const R = (p) => rotarEn(p, P.pivote, phi);

  // Marco del carro: ejes del torso en la posición de arriba.
  const t = escala(resta(cadera0, hombro0), 1 / LARGO.torso); // hombro → cadera
  const n = [-t[1], t[0]].map((v) => -v); // delante del usuario
  const C = (s, k) => R(suma(hombro0, suma(escala(t, s), escala(n, k))));

  const cadera = caderaEn(phi);
  const torso = P.reclinadoTorso + phi;
  const hombro = local(cadera, torso, ANCLA_TORSO.hombro);
  const piernaIK = ik2(cadera, P.tobillo, LARGO.muslo, LARGO.pierna, -1);
  const agarre = C(14, 58);
  const brazoIK = ik2(hombro, agarre, LARGO.brazo, LARGO.antebrazo, 1);

  const pose = {
    cadera,
    torso,
    cuello: torso + 18,
    cabeza: torso + 22,
    muslo: piernaIK.th1,
    pierna: piernaIK.th2,
    pie: P.anguloPie,
    brazo: brazoIK.th1,
    antebrazo: brazoIK.th2,
    mano: angulo(resta(C(-30, 64), C(40, 52))) + 180,
    formaMano: 'puno',
  };

  const B1 = C(-34, -96);
  const B2 = C(252, -96);
  const cuerno = C(250, -168);
  const plataforma = (x, y) => local(P.tobillo, P.anguloPie, [x, y]);

  const fijo = [
    '<g id="bastidor-fijo">',
    base(70, 690),
    tubo([652, SUELO - 10], [652, 200], 28),
    tubo([652, P.pivote[1]], P.pivote, 22),
    tubo([560, SUELO - 10], [652, 700], 14),
    '<g id="plataforma-pies">',
    tubo(plataforma(-30, 48), [400, SUELO - 10], 16),
    tubo(plataforma(90, 48), [550, SUELO - 10], 16),
    tubo(plataforma(-46, 37), plataforma(128, 37), 18),
    '</g>',
    '</g>',
  ].join('');

  const carroAtras = [
    `<g id="carro" data-pivote="${P.pivote[0]},${P.pivote[1]}" data-giro="${f(phi)}">`,
    tubo(B2, cuerno, 16, COLOR.aceroClaro),
    disco(cuerno, DISCO.grande),
    tubo(B1, B2, 18),
    tubo(P.pivote, B1, 24),
    almohadilla(C(-6, -70), C(236, -70), 32),
    tubo(C(-40, -96), C(-40, -40), 12),
    tubo(C(-40, 12), C(30, 52), 12),
    '</g>',
  ].join('');

  const carroDelante = [
    '<g id="hombrera">',
    almohadilla(C(-42, -34), C(-42, 14), 32),
    '</g>',
    eje(P.pivote, 16),
  ].join('');

  return { svg: fijo + carroAtras + figura(pose, { musculos: ['cuadriceps', 'gluteo'] }) + carroDelante, phi, pose };
}

// ---------------------------------------------------------------------------
// Salida
// ---------------------------------------------------------------------------

function lamina(titulo, cuerpo, { suelo = true } = {}) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LIENZO.ancho} ${LIENZO.alto}" width="${LIENZO.ancho}" height="${LIENZO.alto}">`,
    `<title>${titulo}</title>`,
    `<defs>${defsFigura()}</defs>`,
    `<rect id="fondo" width="${LIENZO.ancho}" height="${LIENZO.alto}" fill="${COLOR.fondo}"/>`,
    suelo
      ? `<line id="suelo" x1="0" y1="${SUELO + 1}" x2="${LIENZO.ancho}" y2="${SUELO + 1}" stroke="${COLOR.suelo}" stroke-width="${TRAZO.suelo}"/>`
      : '',
    cuerpo,
    '</svg>',
    '',
  ].join('\n');
}

function escribir(ruta, contenido) {
  const destino = join(RAIZ, ruta);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, contenido);
}

export function generar() {
  escribir('figura/neutra.svg', lamina('Figura · neutra', figura(POSE.neutra)));
  escribir('figura/flexion.svg', lamina('Figura · flexión', figura(POSE.flexion)));
  escribir('figura/brazos-arriba.svg', lamina('Figura · brazos arriba', figura(POSE.brazosArriba)));
  escribir(
    'figura/musculos.svg',
    lamina(
      'Figura · zonas musculares',
      figura({ ...POSE.neutra, brazo: 40, antebrazo: 40, mano: 40 }, { musculos: Object.keys(MUSCULO) }),
    ),
  );
  for (const [nombre, dibujar] of Object.entries(EQUIPO)) {
    escribir(`equipo/${nombre}.svg`, lamina(`Equipo · ${nombre}`, dibujar()));
  }
  escribir('destino/pendulum-squat.svg', lamina('Destino · Pendulum Squat 90° · arriba', pendulumSquat('arriba').svg));
  escribir('destino/pendulum-squat-abajo.svg', lamina('Destino · Pendulum Squat 90° · abajo', pendulumSquat('abajo').svg));
}

// Comprobación: longitudes idénticas entre láminas.
export function comprobar() {
  const poses = [POSE.neutra, POSE.flexion, POSE.brazosArriba, pendulumSquat('arriba').pose, pendulumSquat('abajo').pose];
  const medir = (j) => ({
    muslo: largo(resta(j['pierna-cerca'].o, j['muslo-cerca'].o)),
    pierna: largo(resta(j['pie-cerca'].o, j['pierna-cerca'].o)),
    brazo: largo(resta(j['antebrazo-cerca'].o, j['brazo-cerca'].o)),
    antebrazo: largo(resta(j['mano-cerca'].o, j['antebrazo-cerca'].o)),
    torso: largo(resta(j['brazo-cerca'].o, j.torso.o)),
    cuello: largo(resta(j.cabeza.o, j.cuello.o)),
  });
  return poses.map((p) => medir(resolverPose(p)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  generar();
  const medidas = comprobar();
  const ref = medidas[0];
  for (const m of medidas) {
    for (const k of Object.keys(ref)) {
      if (Math.abs(m[k] - ref[k]) > 0.01) throw new Error(`Longitud distinta en ${k}: ${m[k]} ≠ ${ref[k]}`);
    }
  }
  console.log('Láminas generadas. Longitudes idénticas en las 5 poses:', ref);
}
