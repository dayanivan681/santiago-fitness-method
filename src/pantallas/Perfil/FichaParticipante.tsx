/**
 * Ficha del participante.
 * Guía del proyecto §2: los ocho datos, todos editables por el coach.
 *
 * Por defecto se lee, no se edita: es lo que se consulta a diario. La edición
 * queda detrás de un botón para que el panel no parezca un formulario que hay
 * que rellenar cada vez.
 */

import { useState, type FormEvent } from 'react'
import { INCREMENTO_IDEAL_LB } from '../../dominio/carga'
import { formatearEstatura } from '../../dominio/estatura'
import { CamposParticipante } from './CamposParticipante'
import { FotoDePerfil } from './FotoDePerfil'
import type { Repositorio } from '../../datos/repositorio'
import type { Participante } from '../../dominio/tipos'

const SEXO: Readonly<Record<Participante['sexo'], string>> = {
  femenino: 'Femenino',
  masculino: 'Masculino',
}

interface Props {
  readonly participante: Participante
  readonly repositorio: Repositorio
  readonly onGuardar: (cambios: Participante) => Promise<void>
  /** La consola del coach puede habilitar la edición; el cliente sólo lee. */
  readonly editable?: boolean
}

export function FichaParticipante({ participante, repositorio, onGuardar, editable = true }: Props) {
  const [editando, setEditando] = useState(false)
  const [borrador, setBorrador] = useState(participante)

  // Se reinicia el borrador sólo al cambiar de persona, no cada vez que llega
  // una versión nueva del mismo participante: si el coach está escribiendo y
  // otra parte de la app guarda algo suyo —una limitación, por ejemplo—, no
  // puede borrarle lo que lleva tecleado.
  const [personaEnEdicion, setPersonaEnEdicion] = useState(participante.id)
  if (participante.id !== personaEnEdicion) {
    setPersonaEnEdicion(participante.id)
    setBorrador(participante)
  }

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
          {editable && (
            <button
              type="button"
              className="hoja__cerrar"
              onClick={() => setEditando(true)}
            >
              Editar
            </button>
          )}
        </div>

        <FotoDePerfil participante={participante} repositorio={repositorio} />

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

        {/* Las notas no condicionan nada: se leen, no gritan. */}
        {(participante.notas ?? '').trim() !== '' && (
          <p className="nota">{participante.notas}</p>
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

      <CamposParticipante
        valores={borrador}
        onCambiar={(cambios) => setBorrador({ ...borrador, ...cambios })}
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="boton-guardar" style={{ flex: 1, height: 38, justifyContent: 'center' }}>
          Guardar
        </button>
        <button
          type="button"
          className="boton-guardar boton-guardar--secundario"
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
