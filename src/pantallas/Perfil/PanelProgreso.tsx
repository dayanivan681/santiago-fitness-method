/**
 * Progreso físico: medidas y fotos con fecha.
 *
 * Su especificación V1 lo pide, y con una decisión de producto detrás: **la
 * foto no sale del dispositivo**. Mientras no haya cuentas, eso resuelve por
 * construcción el consentimiento y los permisos que él pregunta en su análisis.
 *
 * Las diferencias se muestran con su signo y sin calificarlas: si bajar de
 * cintura o subir de peso es bueno depende del objetivo, y eso lo lee el coach.
 */

import { useEffect, useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { fechaDeHoy, nuevoId, type Repositorio } from '../../datos/repositorio'
import { reducirImagen } from '../../datos/imagen'
import {
  MEDIDAS,
  hayAlgoQueGuardar,
  ordenarProgreso,
  variacion,
} from '../../logica/progresoFisico'
import type { Medidas, Participante, RegistroDeProgreso } from '../../dominio/tipos'

interface Props {
  readonly participante: Participante
  readonly repositorio: Repositorio
}

export function PanelProgreso({ participante, repositorio }: Props) {
  const registros = useLiveQuery(
    async () => ordenarProgreso(await repositorio.listarProgreso(participante.id)),
    [repositorio, participante.id],
  )

  const [fecha, setFecha] = useState(fechaDeHoy)
  const [medidas, setMedidas] = useState<Medidas>({})
  const [foto, setFoto] = useState<File | null>(null)
  const [aviso, setAviso] = useState('')
  const [midiendo, setMidiendo] = useState(false)

  async function guardar(evento: FormEvent) {
    evento.preventDefault()

    if (!hayAlgoQueGuardar(medidas, foto !== null)) {
      setAviso('Apunta al menos una medida o una foto.')
      return
    }

    setAviso('')
    await repositorio.guardarProgreso(
      {
        id: nuevoId(),
        participanteId: participante.id,
        fecha,
        medidas,
        tieneFoto: foto !== null,
      },
      // Una foto de móvil son varios megas y el sitio del dispositivo es el que
      // hay: se guarda encogida.
      foto ? await reducirImagen(foto) : undefined,
    )

    setMedidas({})
    setFoto(null)
    setMidiendo(false)
  }

  const lista = registros ?? []

  return (
    <section className="panel">
      <div className="panel__cabecera">
        <h2 className="panel__titulo">Progreso</h2>
        <span className="panel__nota">Sólo en este dispositivo</span>
      </div>

      {/*
        * Apuntar una medida es algo que se hace de vez en cuando, no cada vez
        * que se abre el perfil. Con el formulario siempre desplegado, siete
        * campos vacíos eran lo primero que se veía y convertían la pantalla en
        * una hoja de configuración.
        */}
      {!midiendo && (
        <button type="button" className="accion accion--suave" onClick={() => setMidiendo(true)}>
          Añadir medición
        </button>
      )}

      {midiendo && (
      <form className="pila" onSubmit={guardar}>
        <div className="rejilla-datos">
          <label className="campo-texto">
            <span className="etiqueta-campo">Fecha</span>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </label>

          {MEDIDAS.map(({ clave, etiqueta, unidad }) => (
            <label key={clave} className="campo-texto">
              <span className="etiqueta-campo">{`${etiqueta} (${unidad})`}</span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={medidas[clave] ?? ''}
                onChange={(e) =>
                  setMedidas({
                    ...medidas,
                    // Vaciar el campo es no haber medido eso, no medir cero.
                    [clave]: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
              />
            </label>
          ))}

          {/* El control nativo de archivo se pinta en el idioma del sistema
              ("Choose file / No file chosen") y rompe la pantalla. Se oculta y
              se sustituye por un botón propio; el nombre del archivo elegido se
              muestra aparte, que es la única información útil que daba. */}
          <div className="campo-texto" style={{ gridColumn: '1 / -1' }}>
            <span className="etiqueta-campo">Foto</span>
            <label className="filtro foto-perfil__elegir">
              {foto ? 'Cambiar foto' : 'Seleccionar foto'}
              <input
                type="file"
                accept="image/*"
                aria-label="Foto"
                onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              />
            </label>
            {foto && <span className="nota">{foto.name}</span>}
          </div>
        </div>

        {aviso !== '' && (
          <p className="limitacion" role="alert">
            {aviso}
          </p>
        )}

        <div className="acciones-medicion">
          <button type="button" className="boton-guardar boton-guardar--secundario"
            onClick={() => setMidiendo(false)}>
            Cancelar
          </button>
          {/* Sin alto fijo: `boton-guardar` ya trae los 44px mínimos, y el
              `height: 40` que había aquí se los comía. */}
          <button type="submit" className="boton-guardar">
            Guardar medición
          </button>
        </div>
      </form>
      )}

      {lista.length === 0 ? (
        <p className="nota">Todavía no hay mediciones.</p>
      ) : (
        <div className="pila">
          {lista.map((registro, indice) => (
            <Medicion
              key={registro.id}
              registro={registro}
              // La lista va de reciente a antigua, así que la anterior en el
              // tiempo es la siguiente de la lista.
              anterior={lista[indice + 1]}
              repositorio={repositorio}
              onBorrar={() => repositorio.borrarProgreso(registro.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function Medicion({
  registro,
  anterior,
  repositorio,
  onBorrar,
}: {
  readonly registro: RegistroDeProgreso
  readonly anterior?: RegistroDeProgreso
  readonly repositorio: Repositorio
  readonly onBorrar: () => void
}) {
  const anotadas = MEDIDAS.filter(({ clave }) => registro.medidas[clave] !== undefined)

  return (
    <article className="medicion">
      <div className="panel__cabecera">
        <h3 className="medicion__fecha">{formatearFecha(registro.fecha)}</h3>
        <button
          type="button"
          className="hoja__cerrar"
          aria-label={`Borrar la medición del ${formatearFecha(registro.fecha)}`}
          onClick={onBorrar}
        >
          Borrar
        </button>
      </div>

      {registro.tieneFoto && (
        <FotoDeProgreso registro={registro} repositorio={repositorio} />
      )}

      {anotadas.length > 0 && (
        <div className="rejilla-datos">
          {anotadas.map(({ clave, etiqueta, unidad }) => (
            <div key={clave} className="dato">
              <span className="etiqueta-campo">{etiqueta}</span>
              <span className="dato__valor">
                {registro.medidas[clave]} {unidad}
              </span>
              <Variacion
                valor={variacion(registro.medidas, anterior?.medidas, clave)}
                unidad={unidad}
              />
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

/** El signo, sin juicio: si bajar es bueno depende del objetivo. */
function Variacion({
  valor,
  unidad,
}: {
  readonly valor?: number
  readonly unidad: string
}) {
  if (valor === undefined || valor === 0) return null

  // Signo menos tipográfico: el guion corto se lee como separador.
  const texto = valor > 0 ? `+${valor}` : `−${Math.abs(valor)}`
  return <span className="medicion__variacion">{`${texto} ${unidad}`}</span>
}

function FotoDeProgreso({
  registro,
  repositorio,
}: {
  readonly registro: RegistroDeProgreso
  readonly repositorio: Repositorio
}) {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    let vigente = true
    let creada: string | undefined

    repositorio.obtenerFotoDeProgreso(registro.id).then((imagen) => {
      if (!imagen || !vigente) return
      creada = URL.createObjectURL(imagen)
      setUrl(creada)
    })

    // Sin revocar, cada repintado dejaría la imagen retenida en memoria.
    return () => {
      vigente = false
      if (creada) URL.revokeObjectURL(creada)
    }
  }, [registro.id, repositorio])

  if (!url) return null

  return (
    <img
      className="medicion__foto"
      src={url}
      alt={`Foto de progreso del ${formatearFecha(registro.fecha)}`}
    />
  )
}

function formatearFecha(iso: string): string {
  const [, mes, dia] = iso.split('-')
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${Number(dia)} ${meses[Number(mes) - 1]}`
}
