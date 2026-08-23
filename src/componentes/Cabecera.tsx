/**
 * Cabecera común a las cuatro secciones.
 * Kicker + titular condensado en mayúsculas + dato a la derecha.
 */

interface Props {
  readonly kicker: string
  readonly titulo: string
  readonly meta?: string
}

export function Cabecera({ kicker, titulo, meta }: Props) {
  return (
    <header className="cabecera">
      <div className="cabecera__identidad">
        <div className="kicker">{kicker}</div>
        <h1 className="cabecera__titulo">{titulo}</h1>
      </div>
      {meta && <div className="cabecera__meta">{meta}</div>}
    </header>
  )
}
