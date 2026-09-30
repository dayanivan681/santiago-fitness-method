import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { ResumenSesiones } from './Progreso'
import type { Cambio } from '../../shared/v2/contratos'
import { PRESS_BANCA_15_SMITH } from '../datos/semilla/biblioteca'

it('el coach ve progreso por ejercicio con los valores corregidos y RIR', async () => {
  const cambios: Cambio[] = []
  const agregar = (tipo: Cambio['tipo'], id: string, datos: unknown) => cambios.push({tipo,id,datos,cursor:cambios.length+1,revision:cambios.length+1,eliminado:false,opId:id,actor:'qa'})
  for (let i=0;i<2;i++) {
    agregar('entrenamiento',`e${i}`,{id:`e${i}`,participanteId:'qa',plantillaDiaId:'dia',fecha:`2026-08-${12+i}`,completadaEn:'2026-08-13T12:00:00Z'})
    agregar('serie',`s${i}`,{id:`s${i}`,sesionId:`e${i}`,ejercicioId:PRESS_BANCA_15_SMITH.id,numeroSerie:1,pesoRegistradoLb:180+i*10,repsRealizadas:12,rir:2})
  }
  agregar('serie','s1',{id:'s1',sesionId:'e1',ejercicioId:PRESS_BANCA_15_SMITH.id,numeroSerie:1,pesoRegistradoLb:210,repsRealizadas:10,rir:5})
  render(<ResumenSesiones cambios={cambios} cliente="qa" />)
  await userEvent.click(screen.getByRole('button',{name:'Por ejercicio'}))
  expect(screen.getByRole('heading',{name:/Desde el/})).toHaveTextContent('+30')
  expect(screen.getByRole('status')).toHaveTextContent('210 lb/lado × 10 · RIR 5+')
  await userEvent.click(screen.getByRole('button',{name:/180 lb\/lado.*Peso/}))
  expect(screen.getByRole('status')).toHaveTextContent('180 lb/lado × 12 · RIR 2')
})
