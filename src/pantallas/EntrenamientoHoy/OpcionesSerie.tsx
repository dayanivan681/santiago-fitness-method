import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Opciones en el flujo de la página: no cubren los campos de la serie. */
export function OpcionesSerie({ children }: { children: ReactNode }) {
  const nodo = useRef<HTMLDetailsElement>(null)
  const [abierto, setAbierto] = useState(false)
  function cerrar(devolverFoco = false) {
    if (!nodo.current) return
    nodo.current.open = false
    if (devolverFoco) nodo.current.querySelector('summary')?.focus()
  }
  useEffect(() => {
    if (!abierto) return
    const fuera = (evento: PointerEvent) => {
      if (evento.target instanceof Node && !nodo.current?.contains(evento.target)) cerrar()
    }
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [abierto])
  return (
    <details ref={nodo} className="serie__opciones" onToggle={e => setAbierto(e.currentTarget.open)}
      onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrar(true) } }}>
      <summary>Más opciones</summary>
      {children}
      <button type="button" className="serie__cerrar-opciones" onClick={() => cerrar(true)}>Cerrar opciones</button>
    </details>
  )
}
