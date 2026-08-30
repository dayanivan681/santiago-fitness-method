/**
 * Alta del participante.
 *
 * Es la primera pantalla de una instalación nueva. Su especificación V1 pide
 * *"1 participante real al inicio, sin panel ficticio de clientes"*, así que la
 * app no arranca con datos inventados: pide los de §2 y con ellos ya se entrena.
 *
 * Su criterio 1 pide hacerlo en menos de dos minutos. Por eso todo llega con un
 * estimado y lo único que hay que escribir es el nombre.
 */

import { useState, type FormEvent } from 'react'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import { Cabecera } from '../../componentes/Cabecera'
import { RestaurarCopia } from './RestaurarCopia'
import { crearDiasIniciales } from '../../datos/semilla'
import { CamposParticipante } from '../Perfil/CamposParticipante'
import {
  ALTA_POR_DEFECTO,
  crearParticipante,
  erroresDeAlta,
  type DatosAlta,
} from '../../logica/participante'
import type { Repositorio } from '../../datos/repositorio'

interface Props {
  readonly repositorio?: Repositorio
}

export function AltaParticipante({ repositorio = repositorioPorDefecto }: Props = {}) {
  const [datos, setDatos] = useState<DatosAlta>(ALTA_POR_DEFECTO)
  const [errores, setErrores] = useState<readonly string[]>([])

  async function enviar(evento: FormEvent) {
    evento.preventDefault()

    // Se valida al enviar y no mientras se escribe: señalar en rojo un campo
    // que aún se está rellenando es ruido.
    const problemas = erroresDeAlta(datos)
    setErrores(problemas)
    if (problemas.length > 0) return

    const participante = crearParticipante(datos)
    await repositorio.guardarParticipante(participante)
    // Su estructura de 4 días nace con él: es suya, no un catálogo compartido.
    await crearDiasIniciales(repositorio, participante.id)
  }

  return (
    <>
      <Cabecera kicker="Santiago Fitness Method" titulo="Alta del participante" />

      <div className="contenido">
        <form className="panel" onSubmit={enviar}>
          <p className="nota">
            Los valores ya vienen puestos como estimados. Escribe el nombre y corrige lo
            que haga falta; después el coach podrá administrarlo desde su consola.
          </p>

          <CamposParticipante
            valores={datos}
            onCambiar={(cambios) => setDatos({ ...datos, ...cambios })}
          />

          {errores.length > 0 && (
            <div className="limitacion" role="alert">
              {errores.map((error) => (
                <span key={error}>{error}</span>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="boton-guardar"
            style={{ width: '100%', height: 44, justifyContent: 'center' }}
          >
            Crear participante
          </button>
        </form>

        {/* Va después del alta, no antes: empezar de cero es lo habitual. */}
        <RestaurarCopia repositorio={repositorio} />
      </div>
    </>
  )
}
