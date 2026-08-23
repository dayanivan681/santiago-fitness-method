/**
 * Ficha del participante.
 * Guía del proyecto §2: los ocho datos, todos editables por el coach.
 *
 * Por defecto se lee, no se edita: es lo que se consulta a diario. La edición
 * queda detrás de un botón para que el panel no parezca un formulario que hay
 * que rellenar cada vez.
 */

import { useEffect, useState, type FormEvent } from 'react'
import { INCREMENTO_IDEAL_LB } from '../../dominio/carga'
import { aCentimetros, aPiesYPulgadas, formatearEstatura } from '../../dominio/estatura'
import type { Participante } from '../../dominio/tipos'

const SEXO: Readonly<Record<Participante['sexo'], string>> = {
  femenino: 'Femenino',
  masculino: 'Masculino',
}

interface Props {
  readonly participante: Participante
  readonly onGuardar: (cambios: Participante) => Promise<void>
}

export function FichaParticipante({ participante, onGuardar }: Props) {
  const [editando, setEditando] = useState(false)
  const [borrador, setBorrador] = useState(participante)

  useEffect(() => setBorrador(participante), [participante])

  // El dato se guarda en centímetros; pies y pulgadas son sólo la forma de verlo.
  const estatura = aPiesYPulgadas(borrador.estaturaCm)

  const cambiar = <C extends keyof Participante>(campo: C, valor: Participante[C]) =>
    setBorrador({ ...borrador, [campo]: valor })

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    await onGuardar(borrador)
    setEditando(false)
  }

  if (!editando) {
    return (
      <section className="panel">
        <div className="panel__cabecera">
          <h2 className="panel__titulo">Participante</h2>
          <button
            type="button"
            className="hoja__cerrar"
            onClick={() => setEditando(true)}
          >
            Editar
          </button>
        </div>

        <div className="rejilla-datos">
          <Dato etiqueta="Nombre" valor={participante.nombre} />
          <Dato etiqueta="Sexo" valor={SEXO[participante.sexo]} />
          <Dato etiqueta="Edad" valor={`${participante.edad} años`} />
          <Dato etiqueta="Estatura" valor={formatearEstatura(participante.estaturaCm)} />
          <Dato etiqueta="Peso" valor={`${participante.pesoCorporalLb} lb`} />
          <Dato etiqueta="Objetivo" valor={participante.objetivo} />
          <Dato
            etiqueta="Frecuencia"
            valor={`${participante.frecuenciaEntrenamiento} días / semana`}
          />
          {/* §13: el incremento ideal es del método, no del participante. */}
          <Dato etiqueta="Incremento" valor={`+${INCREMENTO_IDEAL_LB} lb`} />
        </div>

        {/* §2: la limitación se destaca porque condiciona el entrenamiento. */}
        {participante.limitaciones.trim() !== '' && (
          <p className="limitacion">Limitación: {participante.limitaciones}</p>
        )}
      </section>
    )
  }

  return (
    <form className="panel" onSubmit={enviar}>
      <div className="panel__cabecera">
        <h2 className="panel__titulo">Participante</h2>
        <span className="panel__nota">Editable por el coach</span>
      </div>

      <div className="rejilla-datos">
        <label className="campo-texto" style={{ gridColumn: '1 / -1' }}>
          <span className="etiqueta-campo">Nombre</span>
          <input
            type="text"
            value={borrador.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
          />
        </label>

        <label className="campo-texto">
          <span className="etiqueta-campo">Sexo</span>
          <select
            value={borrador.sexo}
            onChange={(e) => cambiar('sexo', e.target.value as Participante['sexo'])}
          >
            <option value="femenino">Femenino</option>
            <option value="masculino">Masculino</option>
          </select>
        </label>

        <label className="campo-texto">
          <span className="etiqueta-campo">Edad</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={borrador.edad}
            onChange={(e) => cambiar('edad', Number(e.target.value))}
          />
        </label>

        <label className="campo-texto">
          <span className="etiqueta-campo">Estatura (pies)</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={estatura.pies}
            onChange={(e) =>
              cambiar('estaturaCm', aCentimetros({ ...estatura, pies: Number(e.target.value) }))
            }
          />
        </label>

        <label className="campo-texto">
          <span className="etiqueta-campo">Estatura (pulgadas)</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="11"
            value={estatura.pulgadas}
            onChange={(e) =>
              cambiar('estaturaCm', aCentimetros({ ...estatura, pulgadas: Number(e.target.value) }))
            }
          />
        </label>

        <label className="campo-texto">
          <span className="etiqueta-campo">Peso (lb)</span>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={borrador.pesoCorporalLb}
            onChange={(e) => cambiar('pesoCorporalLb', Number(e.target.value))}
          />
        </label>

        <label className="campo-texto">
          <span className="etiqueta-campo">Entrenos/semana</span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            max="7"
            value={borrador.frecuenciaEntrenamiento}
            onChange={(e) => cambiar('frecuenciaEntrenamiento', Number(e.target.value))}
          />
        </label>

        <label className="campo-texto" style={{ gridColumn: '1 / -1' }}>
          <span className="etiqueta-campo">Objetivo</span>
          <input
            type="text"
            value={borrador.objetivo}
            onChange={(e) => cambiar('objetivo', e.target.value)}
          />
        </label>

        <label className="campo-texto" style={{ gridColumn: '1 / -1' }}>
          <span className="etiqueta-campo">Lesiones o limitaciones</span>
          <textarea
            rows={2}
            value={borrador.limitaciones}
            onChange={(e) => cambiar('limitaciones', e.target.value)}
            placeholder="Ninguna"
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="boton-guardar" style={{ flex: 1, height: 38, justifyContent: 'center' }}>
          Guardar
        </button>
        <button
          type="button"
          className="boton-guardar boton-guardar--secundario"
          style={{ height: 38, justifyContent: 'center' }}
          onClick={() => {
            setBorrador(participante)
            setEditando(false)
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

function Dato({ etiqueta, valor }: { readonly etiqueta: string; readonly valor: string }) {
  return (
    <div className="dato">
      <span className="etiqueta-campo">{etiqueta}</span>
      <span className="dato__valor">{valor}</span>
    </div>
  )
}
