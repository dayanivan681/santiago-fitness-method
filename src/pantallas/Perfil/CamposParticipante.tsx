/**
 * Los ocho datos de §2, como formulario.
 *
 * Vive aparte porque se rellenan en dos sitios —el alta del participante y la
 * edición de su ficha— y son exactamente los mismos campos. Duplicarlos haría
 * que uno se quedara atrás en cuanto §2 cambie.
 */

import { aCentimetros, aPiesYPulgadas } from '../../dominio/estatura'
import type { DatosAlta } from '../../logica/participante'

interface Props {
  readonly valores: DatosAlta
  readonly onCambiar: (cambios: Partial<DatosAlta>) => void
}

export function CamposParticipante({ valores, onCambiar }: Props) {
  // El dato se guarda en centímetros; pies y pulgadas son sólo la forma de verlo.
  const estatura = aPiesYPulgadas(valores.estaturaCm)

  return (
    <div className="rejilla-datos">
      <label className="campo-texto" style={{ gridColumn: '1 / -1' }}>
        <span className="etiqueta-campo">Nombre</span>
        <input
          type="text"
          value={valores.nombre}
          onChange={(e) => onCambiar({ nombre: e.target.value })}
        />
      </label>

      <label className="campo-texto">
        <span className="etiqueta-campo">Sexo</span>
        <select
          value={valores.sexo}
          onChange={(e) => onCambiar({ sexo: e.target.value as DatosAlta['sexo'] })}
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
          value={valores.edad}
          onChange={(e) => onCambiar({ edad: Number(e.target.value) })}
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
            onCambiar({
              estaturaCm: aCentimetros({ ...estatura, pies: Number(e.target.value) }),
            })
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
            onCambiar({
              estaturaCm: aCentimetros({ ...estatura, pulgadas: Number(e.target.value) }),
            })
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
          value={valores.pesoCorporalLb}
          onChange={(e) => onCambiar({ pesoCorporalLb: Number(e.target.value) })}
        />
      </label>

      <label className="campo-texto">
        <span className="etiqueta-campo">Entrenos/semana</span>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          max="7"
          value={valores.frecuenciaEntrenamiento}
          onChange={(e) => onCambiar({ frecuenciaEntrenamiento: Number(e.target.value) })}
        />
      </label>

      <label className="campo-texto" style={{ gridColumn: '1 / -1' }}>
        <span className="etiqueta-campo">Objetivo</span>
        <input
          type="text"
          value={valores.objetivo}
          onChange={(e) => onCambiar({ objetivo: e.target.value })}
        />
      </label>

      <label className="campo-texto" style={{ gridColumn: '1 / -1' }}>
        <span className="etiqueta-campo">Lesiones o limitaciones</span>
        <textarea
          rows={2}
          value={valores.limitaciones}
          onChange={(e) => onCambiar({ limitaciones: e.target.value })}
          placeholder="Ninguna"
        />
      </label>

      {/* Su V1 las pide en el perfil: es el contexto que no cabe en un campo. */}
      <label className="campo-texto" style={{ gridColumn: '1 / -1' }}>
        <span className="etiqueta-campo">Notas del coach</span>
        <textarea
          rows={2}
          value={valores.notas ?? ''}
          onChange={(e) => onCambiar({ notas: e.target.value })}
          placeholder="Horarios, contexto, lo que convenga recordar"
        />
      </label>
    </div>
  )
}
