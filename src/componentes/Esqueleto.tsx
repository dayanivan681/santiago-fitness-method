/**
 * Silueta de la pantalla mientras llegan los datos.
 *
 * Una app nativa no escribe «Cargando…»: enseña la forma de lo que viene, y el
 * contenido aparece en su sitio sin saltos. Para el lector de pantalla sigue
 * siendo un estado con nombre.
 */
export function Esqueleto({
  etiqueta = 'Cargando',
  forma = 'pantalla',
}: {
  readonly etiqueta?: string
  readonly forma?: 'pantalla' | 'lista' | 'tarjeta'
}) {
  return (
    <div className={`esqueleto esqueleto--${forma}`} role="status" aria-label={etiqueta}>
      {forma === 'pantalla' && (
        <>
          <span className="esqueleto__linea esqueleto__linea--corta" />
          <span className="esqueleto__titulo" />
          <span className="esqueleto__bloque" />
        </>
      )}
      {forma === 'tarjeta' ? (
        <span className="esqueleto__bloque" />
      ) : (
        [0, 1, 2, 3].map((n) => (
          <span className="esqueleto__fila" key={n}>
            <span className="esqueleto__miniatura" />
            <span className="esqueleto__textos">
              <span className="esqueleto__linea" />
              <span className="esqueleto__linea esqueleto__linea--corta" />
            </span>
          </span>
        ))
      )}
    </div>
  )
}
