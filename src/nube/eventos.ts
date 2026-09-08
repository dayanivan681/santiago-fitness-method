import { useSyncExternalStore } from "react";
import { useLiveQuery as consultarDexie } from "dexie-react-hooks";
let revision = 0;
const oyentes = new Set<() => void>();
export function notificar() {
  revision++;
  for (const f of oyentes) f();
}
export function suscribir(f: () => void) {
  oyentes.add(f);
  return () => oyentes.delete(f);
}
export function useRevision() {
  return useSyncExternalStore(suscribir, () => revision);
}
export function useLiveQuery<T>(
  consulta: () => T | Promise<T>,
  deps: unknown[] = [],
  valorInicial?: T,
): T | undefined {
  const r = useRevision();
  return consultarDexie(consulta, [...deps, r], valorInicial);
}
