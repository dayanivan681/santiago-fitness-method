/**
 * Bi-series y tri-series (superseries).
 *
 * Una superserie agrupa 2 o 3 ejercicios seguidos de la sesión que se hacen
 * alternando: A1 → B1 (→ C1) → descanso → A2 → B2… Se marca con la misma letra
 * en `grupo` en slots consecutivos; sin `grupo` el ejercicio va suelto.
 *
 * La regla de 5–8 de la sesión cuenta bloques: una superserie cuenta como uno.
 * El descanso del grupo es el de su último ejercicio; los demás van a 0.
 *
 * Módulo puro: lo usan el servidor, el editor del coach y el entrenamiento.
 */

export const MIN_BLOQUES = 5;
export const MAX_BLOQUES = 8;
export const MAX_EJERCICIOS_POR_SESION = 12;
export const MIN_EN_GRUPO = 2;
export const MAX_EN_GRUPO = 3;
/** Descanso que recupera un ejercicio al salir de un grupo con el suyo a 0. */
export const DESCANSO_POR_DEFECTO = 120;

export interface SlotAgrupable {
  readonly grupo?: string;
  readonly seriesObjetivo: number;
  readonly descansoSegundos: number;
}

export interface Bloque {
  readonly grupo?: string;
  /** Posiciones dentro de la sesión, consecutivas. */
  readonly indices: readonly number[];
}

/** Agrupa los slots en bloques: cada tramo con la misma letra es uno. */
export function bloquesDe(slots: readonly SlotAgrupable[]): Bloque[] {
  const bloques: { grupo?: string; indices: number[] }[] = [];
  slots.forEach((s, i) => {
    const ultimo = bloques.at(-1);
    if (s.grupo && ultimo?.grupo === s.grupo) ultimo.indices.push(i);
    else bloques.push(s.grupo ? { grupo: s.grupo, indices: [i] } : { indices: [i] });
  });
  return bloques;
}

export function contarBloques(slots: readonly SlotAgrupable[]): number {
  return bloquesDe(slots).length;
}

export function nombreDeGrupo(tamano: number): string {
  return tamano >= 3 ? "Tri-serie" : "Bi-serie";
}

/** Mensajes de error de la estructura de grupos; vacío si es válida. */
export function erroresDeSuperseries(slots: readonly SlotAgrupable[]): string[] {
  const errores: string[] = [];
  const vistas = new Set<string>();
  for (const b of bloquesDe(slots)) {
    if (!b.grupo) continue;
    if (vistas.has(b.grupo))
      errores.push(`La superserie ${b.grupo} tiene ejercicios separados`);
    vistas.add(b.grupo);
    if (b.indices.length < MIN_EN_GRUPO || b.indices.length > MAX_EN_GRUPO)
      errores.push(`La superserie ${b.grupo} debe tener 2 o 3 ejercicios`);
    const series = new Set(b.indices.map((i) => slots[i].seriesObjetivo));
    if (series.size > 1)
      errores.push(`Los ejercicios de la superserie ${b.grupo} deben tener las mismas series`);
  }
  return errores;
}

export interface PosicionEnGrupo {
  readonly grupo: string;
  /** 1-based dentro del grupo. */
  readonly posicion: number;
  readonly tamano: number;
  readonly nombre: string;
  readonly indices: readonly number[];
}

export function posicionEnGrupo(
  slots: readonly SlotAgrupable[],
  indice: number,
): PosicionEnGrupo | null {
  const b = bloquesDe(slots).find((b) => b.indices.includes(indice));
  if (!b?.grupo || b.indices.length < 2) return null;
  return {
    grupo: b.grupo,
    posicion: b.indices.indexOf(indice) + 1,
    tamano: b.indices.length,
    nombre: nombreDeGrupo(b.indices.length),
    indices: b.indices,
  };
}

export interface Paso {
  /** A qué ejercicio de la sesión pasar. */
  readonly indice: number;
  /** Si toca descansar antes de la próxima serie. */
  readonly descansar: boolean;
  readonly descansoSegundos: number;
}

/**
 * Qué toca después de guardar la serie `numeroSerie` del ejercicio `indice`.
 *
 * `hechas[i]` son las series registradas hoy de cada ejercicio (puede no incluir
 * todavía la recién guardada). Se recalcula desde lo registrado, así que
 * navegar a mano a cualquier miembro no rompe el flujo.
 */
export function siguienteTrasGuardar(
  slots: readonly SlotAgrupable[],
  hechasAntes: readonly number[],
  indice: number,
  numeroSerie: number,
): Paso {
  const hechas = slots.map((_, i) =>
    i === indice ? Math.max(hechasAntes[i] ?? 0, numeroSerie) : (hechasAntes[i] ?? 0),
  );
  const bloques = bloquesDe(slots);
  const n = bloques.findIndex((b) => b.indices.includes(indice));
  const bloque = bloques[n];
  const primeroDelSiguiente = bloques[n + 1]?.indices[0];
  const ultimo = bloque.indices.at(-1)!;
  const descanso = slots[ultimo].descansoSegundos;
  const completo = (i: number) => hechas[i] >= slots[i].seriesObjetivo;

  if (!bloque.grupo || bloque.indices.length < 2) {
    const termino = completo(indice) && primeroDelSiguiente !== undefined;
    return {
      indice: termino ? primeroDelSiguiente : indice,
      descansar: true,
      descansoSegundos: slots[indice].descansoSegundos,
    };
  }

  // Dentro de la ronda: el siguiente miembro que aún no llegó a esta serie.
  const despues = bloque.indices.filter((i) => i > indice);
  const enRonda = despues.find((i) => hechas[i] < numeroSerie && !completo(i));
  if (enRonda !== undefined)
    return { indice: enRonda, descansar: false, descansoSegundos: 0 };

  // Ronda cerrada: descanso del grupo y vuelta al miembro más atrasado.
  const pendientes = bloque.indices.filter((i) => !completo(i));
  if (pendientes.length === 0)
    return {
      indice: primeroDelSiguiente ?? indice,
      descansar: true,
      descansoSegundos: descanso,
    };
  const minimo = Math.min(...pendientes.map((i) => hechas[i]));
  return {
    indice: pendientes.find((i) => hechas[i] === minimo)!,
    descansar: true,
    descansoSegundos: descanso,
  };
}

/**
 * Dónde retomar una sesión empezada: el primer bloque a medias (con series
 * hechas y otras pendientes) y, si no hay, el primero sin terminar. Dentro de
 * una superserie, el miembro más atrasado (A antes que B si van igual).
 * `null` si no queda nada.
 */
export function pasoPendiente(
  slots: readonly SlotAgrupable[],
  hechas: readonly number[],
): number | null {
  const h = (i: number) => hechas[i] ?? 0;
  const bloques = bloquesDe(slots);
  const pendientesDe = (b: Bloque) => b.indices.filter((i) => h(i) < slots[i].seriesObjetivo);
  const aMedias = bloques.find((b) => pendientesDe(b).length > 0 && b.indices.some((i) => h(i) > 0));
  const bloque = aMedias ?? bloques.find((b) => pendientesDe(b).length > 0);
  if (!bloque) return null;
  const pendientes = pendientesDe(bloque);
  const minimo = Math.min(...pendientes.map(h));
  return pendientes.find((i) => h(i) === minimo)!;
}

/* ───────────── Edición (editor del coach) ───────────── */

function letraLibre(slots: readonly SlotAgrupable[]): string {
  const usadas = new Set(slots.map((s) => s.grupo).filter(Boolean));
  for (let c = 65; c <= 90; c++) {
    const l = String.fromCharCode(c);
    if (!usadas.has(l)) return l;
  }
  throw new Error("No quedan letras para más superseries");
}

/** Reasigna letras A, B, C… por orden de aparición y limpia grupos de uno. */
export function normalizarGrupos<T extends SlotAgrupable>(slots: readonly T[]): T[] {
  const bloques = bloquesDe(slots);
  const salida = slots.map((s) => ({ ...s }));
  let letra = 65;
  for (const b of bloques) {
    if (!b.grupo) continue;
    if (b.indices.length < 2) {
      for (const i of b.indices) sinGrupo(salida, i);
      continue;
    }
    const l = String.fromCharCode(letra++);
    for (const i of b.indices) salida[i] = { ...salida[i], grupo: l };
  }
  return salida;
}

function sinGrupo<T extends SlotAgrupable>(slots: T[], i: number) {
  const { grupo: _grupo, ...resto } = slots[i];
  slots[i] = {
    ...(resto as T),
    descansoSegundos:
      slots[i].descansoSegundos === 0 ? DESCANSO_POR_DEFECTO : slots[i].descansoSegundos,
  };
}

/** ¿Se pueden unir el ejercicio `i` y el `i + 1`? */
export function puedeUnir(slots: readonly SlotAgrupable[], i: number): boolean {
  const a = slots[i];
  const b = slots[i + 1];
  if (!a || !b) return false;
  if (a.grupo && a.grupo === b.grupo) return false;
  const tamano = (s: SlotAgrupable, idx: number) =>
    s.grupo ? (posicionEnGrupo(slots, idx)?.tamano ?? 1) : 1;
  return tamano(a, i) + tamano(b, i + 1) <= MAX_EN_GRUPO;
}

/**
 * Une el ejercicio `i` con el `i + 1`. Si uno ya está en una bi-serie, el otro
 * se suma y queda en tri-serie. Las series se igualan a las del primero y el
 * descanso queda sólo en el último.
 */
export function unir<T extends SlotAgrupable>(slots: readonly T[], i: number): T[] {
  if (!puedeUnir(slots, i)) return [...slots];
  const letra = slots[i].grupo ?? slots[i + 1].grupo ?? letraLibre(slots);
  const salida = slots.map((s) => ({ ...s }));
  const miembros = new Set<number>([i, i + 1]);
  for (const g of [slots[i].grupo, slots[i + 1].grupo])
    if (g) salida.forEach((s, idx) => s.grupo === g && miembros.add(idx));
  const indices = [...miembros].sort((a, b) => a - b);
  const series = salida[indices[0]].seriesObjetivo;
  const descanso = Math.max(...indices.map((idx) => salida[idx].descansoSegundos));
  indices.forEach((idx, n) => {
    salida[idx] = {
      ...salida[idx],
      grupo: letra,
      seriesObjetivo: series,
      descansoSegundos: n === indices.length - 1 ? descanso || DESCANSO_POR_DEFECTO : 0,
    };
  });
  return normalizarGrupos(salida);
}

/** Deshace el grupo del ejercicio `i`; los de descanso 0 recuperan 120 s. */
export function separar<T extends SlotAgrupable>(slots: readonly T[], i: number): T[] {
  const g = slots[i]?.grupo;
  if (!g) return [...slots];
  const salida = slots.map((s) => ({ ...s }));
  salida.forEach((s, idx) => s.grupo === g && sinGrupo(salida, idx));
  return normalizarGrupos(salida);
}

/** Quita un ejercicio: una bi-serie se deshace y una tri-serie queda en bi-serie. */
export function quitar<T extends SlotAgrupable>(slots: readonly T[], i: number): T[] {
  const pos = posicionEnGrupo(slots, i);
  const salida = slots.map((s) => ({ ...s }));
  // Si se quita el último de un grupo, su descanso pasa al nuevo último.
  if (pos && pos.posicion === pos.tamano && pos.tamano > 2) {
    const nuevoUltimo = pos.indices[pos.tamano - 2];
    salida[nuevoUltimo] = { ...salida[nuevoUltimo], descansoSegundos: slots[i].descansoSegundos };
  }
  salida.splice(i, 1);
  return normalizarGrupos(salida);
}

/** Cambia las series de `i`; dentro de un grupo se aplican a todos. */
export function ajustarSeries<T extends SlotAgrupable>(
  slots: readonly T[],
  i: number,
  series: number,
): T[] {
  const g = slots[i]?.grupo;
  return slots.map((s, idx) =>
    idx === i || (g && s.grupo === g) ? { ...s, seriesObjetivo: series } : { ...s },
  );
}

/**
 * Mueve el bloque que contiene `i` una posición arriba (-1) o abajo (+1),
 * saltando el bloque vecino entero: un grupo se mueve junto y nada se mete
 * entre sus miembros.
 */
export function moverBloque<T extends SlotAgrupable>(
  slots: readonly T[],
  i: number,
  direccion: -1 | 1,
): T[] {
  const bloques = bloquesDe(slots);
  const n = bloques.findIndex((b) => b.indices.includes(i));
  const m = n + direccion;
  if (n < 0 || m < 0 || m >= bloques.length) return [...slots];
  const orden = [...bloques];
  [orden[n], orden[m]] = [orden[m], orden[n]];
  return normalizarGrupos(orden.flatMap((b) => b.indices.map((idx) => ({ ...slots[idx] }))));
}

export function puedeMover(
  slots: readonly SlotAgrupable[],
  i: number,
  direccion: -1 | 1,
): boolean {
  const bloques = bloquesDe(slots);
  const n = bloques.findIndex((b) => b.indices.includes(i));
  const m = n + direccion;
  return n >= 0 && m >= 0 && m < bloques.length;
}

export function puedeAnadir(slots: readonly SlotAgrupable[]): boolean {
  return slots.length < MAX_EJERCICIOS_POR_SESION && contarBloques(slots) < MAX_BLOQUES;
}
