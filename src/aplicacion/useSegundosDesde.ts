import { useEffect, useState } from 'react'

const MS_POR_SEGUNDO = 1000

/**
 * Segundos transcurridos desde un instante, actualizados cada segundo.
 * Sirve para el cronómetro de descanso entre series (§5, §12).
 * Devuelve `undefined` mientras no haya desde dónde contar.
 */
export function useSegundosDesde(instante?: string): number | undefined {
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    if (!instante) return
    setAhora(Date.now())
    const id = setInterval(() => setAhora(Date.now()), MS_POR_SEGUNDO)
    return () => clearInterval(id)
  }, [instante])

  if (!instante) return undefined

  const transcurridoMs = ahora - new Date(instante).getTime()
  return Math.max(0, Math.round(transcurridoMs / MS_POR_SEGUNDO))
}
