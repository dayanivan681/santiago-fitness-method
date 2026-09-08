import { api } from '../lib/v2/api'
import { autenticar, json, type EntornoV2 } from '../lib/v2/seguridad'
export const onRequest:PagesFunction<EntornoV2> = async ({request,env}) => {
 const url=new URL(request.url)
 if(url.pathname.startsWith('/admin/api/v2/'))return api(request,env,true)
 const contexto=await autenticar(request,env,'coach')
 if(!contexto)return new Response('Acceso privado del Coach. Entra con tu correo autorizado.',{status:401,headers:{'Cache-Control':'no-store','Content-Type':'text/plain; charset=utf-8'}})
 if(url.pathname.startsWith('/admin/api/'))return json({error:'Esta versión del panel se ha actualizado. Recarga para continuar.'},410)
 if(request.method!=='GET' && request.method!=='HEAD')return json({error:'Recarga el panel para continuar.'},409)
 return env.ASSETS.fetch(new Request(new URL('/index.html',url),{method:'GET'}))
}
