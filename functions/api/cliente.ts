/** Adaptador de lectura para instalaciones anteriores. Nunca siembra ni abre demos. */
import { autenticar, json, type EntornoV2 } from '../lib/v2/seguridad'
import { perfilActual, planActual } from '../lib/v2/datos'
export const onRequest:PagesFunction<EntornoV2> = async ({request,env}) => {
 if(request.method!=='GET')return json({error:'Método no permitido'},405)
 const ctx=await autenticar(request,env,'cliente');if(!ctx)return json({error:'Acceso requerido'},401)
 const perfil=await perfilActual(env.ACCESO,ctx.identidad);const {plan}=await planActual(env.ACCESO,ctx.identidad)
 return json({profile:perfil?{...perfil,notas:''}:null,routines:plan.dias.map(d=>({...d,clienteId:d.participanteId,actualizadoEn:0})),preview:false})
}
