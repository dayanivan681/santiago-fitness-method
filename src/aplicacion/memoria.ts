/**
 * Memoria de una sección entre visitas.
 *
 * Cambiar de pestaña desmonta la pantalla a propósito: mantenerlas montadas
 * dejaría vivas las consultas de Dexie de las cuatro y cada serie guardada
 * repintaría también Biblioteca e Historial. Lo que no puede perderse es la
 * elección del participante —qué día mira, qué filtro puso, qué ejercicio tenía
 * abierto—, así que eso vive un nivel más arriba, en `App`, y la pantalla lo
 * recibe ya resuelto.
 *
 * Es estado de navegación, no datos de entrenamiento: no se persiste en ningún
 * sitio y muere con la pestaña, que es justo lo que se quiere.
 */

import { useCallback, useState } from 'react'

export interface Memoria<T> {
  readonly valor: T
  /**
   * Acepta también una función, como `useState`: quien decide a partir del
   * valor actual no necesita tenerlo en su clausura y no puede leer uno viejo.
   */
  readonly recordar: (nuevo: T | ((actual: T) => T)) => void
}

export function useMemoria<T>(inicial: T): Memoria<T> {
  const [valor, setValor] = useState<T>(inicial)
  // Estable: entra en las dependencias de los efectos de las pantallas.
  const recordar = useCallback((nuevo: T | ((actual: T) => T)) => setValor(nuevo), [])
  return { valor, recordar }
}
