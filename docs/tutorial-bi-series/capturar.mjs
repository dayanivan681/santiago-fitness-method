import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const D='/tmp/claude-0/tuto/cap'; const URL='http://127.0.0.1:5173';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const meta={};
async function nueva(){
  const ctx = await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true});
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.addInitScript(()=>{const f=()=>{if(document.getElementById('cap-css'))return;const s=document.createElement('style');s.id='cap-css';s.textContent='.sfm-demo-banner,.sfm-context-help,.pista-deslizar,dialog.sfm-guia{display:none!important} *{caret-color:transparent!important}';document.documentElement.appendChild(s)};document.addEventListener('DOMContentLoaded',f);f();});
  return {p,cdp};
}
const cerrar=async(p)=>{for(let k=0;k<5;k++){const d=p.locator('dialog.sfm-guia[open]');if(!(await d.count()))break;await d.first().evaluate(x=>x.close()).catch(()=>{});await p.waitForTimeout(150);}};
async function foto(p,nombre,objetivos={}){
  await p.waitForTimeout(700);
  await p.screenshot({path:`${D}/${nombre}.png`});
  const cajas={};
  for(const [k,loc] of Object.entries(objetivos)){const bx=await loc.boundingBox();if(bx)cajas[k]=bx;}
  meta[nombre]=cajas; console.log('✓',nombre,Object.keys(cajas).join(','));
}
async function editorUpperA(p){
  await p.goto(URL+'/demo/coach'); await p.waitForTimeout(1800); await cerrar(p);
  await p.getByText('Alicia Rivera').first().click(); await p.waitForTimeout(800); await cerrar(p);
  await p.getByRole('button',{name:'Programa'}).first().click().catch(()=>{}); await p.waitForTimeout(400);
  await p.getByRole('button',{name:'Preparar cambios'}).click(); await p.waitForTimeout(700); await cerrar(p);
  await p.getByRole('button',{name:'Upper A'}).first().click(); await p.waitForTimeout(400);
}
// ── Coach: unir, descanso, publicar ──
{
  const {p}=await nueva(); await editorUpperA(p);
  const unir=p.getByRole('button',{name:/^Unir en serie Press convergente inclinado/});
  await unir.evaluate(e=>e.scrollIntoView({block:'center'}));
  await foto(p,'01-editor',{unir});
  await unir.click(); await p.waitForTimeout(500);
  const grupo=p.getByRole('region',{name:/Bi-serie A/});
  await grupo.evaluate(e=>e.scrollIntoView({block:'center'}));
  await foto(p,'02-biserie',{grupo});
  const ultimo=grupo.locator('button.sfm-row').last();
  await foto(p,'02b-biserie-ultimo',{grupo,ultimo});
  await ultimo.click(); await p.waitForTimeout(600);
  const hoja=p.getByRole('dialog',{name:'Prescripción'});
  const desc=hoja.getByLabel('Descanso entre rondas · segundos');
  await desc.evaluate(e=>e.scrollIntoView({block:'center'}));
  await desc.click(); await desc.selectText(); await p.keyboard.type('90'); await desc.blur();
  await foto(p,'03-descanso',{desc,aviso:hoja.getByText(/se ajustan juntas/)});
  await hoja.getByRole('button',{name:'Listo'}).click(); await p.waitForTimeout(700);
  const pub=p.getByRole('button',{name:/Revisado · Publicar programa/});
  await grupo.evaluate(e=>e.scrollIntoView({block:'start'})); await p.evaluate(()=>window.scrollBy(0,-120));
  await foto(p,'04-grupo-90',{grupo});
  await pub.evaluate(e=>e.scrollIntoView({block:'center'}));
  await foto(p,'05-publicar',{pub});
  await pub.click(); await p.waitForTimeout(1200); await p.evaluate(()=>window.scrollTo(0,0));
  await foto(p,'06-publicado',{ok:p.locator('.sfm-success').first()});
  // Cliente en la misma demo
  await p.evaluate(()=>{history.pushState({},'','/demo/cliente');dispatchEvent(new PopStateEvent('popstate'))}); await p.waitForTimeout(1200); await cerrar(p);
  await p.getByRole('button',{name:'Upper A'}).first().click(); await p.waitForTimeout(500);
  const g=p.getByRole('group',{name:'Bi-serie A'}); await g.evaluate(e=>e.scrollIntoView({block:'center'}));
  await foto(p,'07-hoy',{grupo:g});
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(300);
  await p.getByRole('button',{name:/Comenzar entrenamiento|^Continuar/}).click(); await p.waitForTimeout(1200); await cerrar(p);
  await p.getByRole('button',{name:'Ejercicios del día'}).click(); await p.waitForTimeout(500);
  await p.getByRole('dialog',{name:'Ejercicios del día'}).getByRole('button',{name:/Press convergente/}).click(); await p.waitForTimeout(1000);
  await p.evaluate(()=>window.scrollTo(0,0));
  const tira=p.locator('nav.entreno__superserie'); const paso=p.locator('.entreno__paso');
  await foto(p,'08-a1',{tira,paso});
  const g1=p.getByLabel(/^Guardar la serie 1 de Press convergente/);
  await g1.evaluate(e=>e.scrollIntoView({block:'center'}));
  await foto(p,'09-a1-guardar',{boton:g1});
  await g1.click(); await p.waitForTimeout(1200); await p.evaluate(()=>window.scrollTo(0,0));
  await foto(p,'10-a2',{tira,paso});
  const g2=p.getByLabel(/^Guardar la serie 1 de Lat pulldown/);
  await g2.evaluate(e=>e.scrollIntoView({block:'center'}));
  await foto(p,'11-a2-guardar',{boton:g2});
  await g2.click(); await p.waitForTimeout(2200); await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(400);
  await foto(p,'12-descanso',{tira,paso,descanso:p.getByRole('status',{name:'Temporizador de descanso'})});
  await p.context().close();
}
// ── Tri-serie (aparte) ──
{
  const {p}=await nueva(); await editorUpperA(p);
  await p.getByRole('button',{name:/^Unir en serie Press convergente inclinado/}).click(); await p.waitForTimeout(400);
  const unir2=p.getByRole('button',{name:/^Unir en serie Lat pulldown/});
  await unir2.evaluate(e=>e.scrollIntoView({block:'center'}));
  await foto(p,'02c-unir-tercero',{unir:unir2,grupo:p.getByRole('region',{name:/Bi-serie A/})});
  await unir2.click(); await p.waitForTimeout(500);
  const tri=p.getByRole('region',{name:/Tri-serie A/}); await tri.evaluate(e=>e.scrollIntoView({block:'center'}));
  await foto(p,'02d-triserie',{grupo:tri,separar:tri.getByRole('button',{name:'Separar'})});
  await p.context().close();
}
writeFileSync('/tmp/claude-0/tuto/cajas.json', JSON.stringify(meta,null,1));
await b.close();
