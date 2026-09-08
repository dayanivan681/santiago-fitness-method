// @vitest-environment node
import { describe,it,expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { api } from './v2/api'
import type { EntornoV2 } from './v2/seguridad'
describe('Coach siempre privado',()=>{
 it('no existe apertura temporal en la configuración',()=>{expect(readFileSync('wrangler.toml','utf8')).not.toContain('COACH_ACCESS_TEMPORARY_UNTIL')})
 it('una cabecera presente sin firma válida no autoriza',async()=>{for(const cabeceras of [{},{'Cf-Access-Jwt-Assertion':'inventado'},{'Cf-Access-Authenticated-User-Email':'coach@example.test'}])expect((await api(new Request('https://sfm.test/admin/api/v2/clientes',{headers:cabeceras as Record<string,string>}),{} as EntornoV2,true)).status).toBe(401)})
})
