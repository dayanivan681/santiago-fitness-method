import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from './App';
import { RepositorioMemoria } from './nube/memoria';
vi.mock('./producto/Cliente',()=>({ClienteApp:()=> <p>Entrenamiento recuperado</p>}));
vi.mock('./nube/cloud',async importar=>{
 const real=await importar<typeof import('./nube/cloud')>();
 return {...real,ConexionCloud:class {repositorio=new RepositorioMemoria();async preparar(){} limpiar(){}}};
});
afterEach(()=>{cleanup();localStorage.clear();vi.restoreAllMocks();vi.unstubAllGlobals();});
it.each(['valida','antigua','expirada','revocada','servidor'])(
 'recuperación offline con identidad %s',async modo=>{
  window.history.replaceState({},'', '/');vi.spyOn(window,'scrollTo').mockImplementation(()=>{});
  vi.spyOn(navigator,'onLine','get').mockReturnValue(true);
  localStorage.setItem('sfm-v2-contexto',JSON.stringify({identidad:'cliente-qa',rol:'cliente',entorno:'staging',nombre:'QA',validadoEn:Date.now()-(modo==='antigua'?86400001:1000),expiraEn:Date.now()+(modo==='expirada'?-1000:3600000)}));
  vi.stubGlobal('fetch',vi.fn(async()=>{if(modo==='revocada'||modo==='servidor')return new Response(JSON.stringify({error:'No autorizado'}),{status:modo==='revocada'?401:500});throw new TypeError('Failed to fetch');}));
  render(<App/>);
  if(modo==='valida')expect(await screen.findByText('Entrenamiento recuperado')).toBeInTheDocument();
  else {await screen.findByRole('heading',{name:/El siguiente paso/});expect(screen.queryByText('Entrenamiento recuperado')).not.toBeInTheDocument();}
 });
