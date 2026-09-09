import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Fotos } from './Progreso';
import type { ConexionCloud } from '../nube/cloud';
afterEach(cleanup);
it('acompañar como Coach sólo permite leer fotos compartidas con la ruta autorizada', async () => {
  const api = {pedir:vi.fn().mockResolvedValue({medios:[{id:'foto-qa',tipo:'progreso',creado_en:1,compartido_coach:1}]})};
  const conexion = {ctx:{rol:'coach',medios:true},api} as unknown as ConexionCloud;
  render(<Fotos conexion={conexion} cliente="cliente-qa" />);
  expect(await screen.findByRole('img',{name:'Fotografía de progreso'})).toHaveAttribute('src','/admin/api/v2/medios/foto-qa?cliente=cliente-qa');
  expect(screen.getByText(/esta persona ha elegido compartir contigo/)).toBeInTheDocument();
  expect(screen.queryByText('Elegir fotografía')).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});
