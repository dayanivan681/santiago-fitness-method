import { useState } from 'react'

/** Cada valor sustituye la animación anterior: los toques rápidos no hacen cola. */
export function NumeroPaso({ valor }: { readonly valor: number }) {
  const [cambio, setCambio] = useState({ actual: valor, anterior: valor })
  if (cambio.actual !== valor) setCambio({ actual: valor, anterior: cambio.actual })
  return (
    <span key={valor} className={`numero-paso ${valor > cambio.anterior ? 'numero-paso--sube' : 'numero-paso--baja'}`}>
      {valor !== cambio.anterior && <span className="numero-paso__anterior" aria-hidden="true">{cambio.anterior}</span>}
      <span className={valor !== cambio.anterior ? 'numero-paso__actual' : undefined}>{valor}</span>
    </span>
  )
}
