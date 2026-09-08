// @vitest-environment node
import { describe,it,expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { api } from './v2/api'
import type { EntornoV2 } from './v2/seguridad'
describe('demo pública separada de identidades reales',()=>{
 it('la configuración ya no puede elegir un cliente público',()=>{expect(readFileSync('wrangler.toml','utf8')).not.toContain('PUBLIC_DEMO_CLIENT_ID')})
 it('ningún selector del navegador concede acceso a los datos reales',async()=>{for(const selector of ['?cliente=santiago','?cliente=cliente-1','?demo=1','?preview=1'])expect((await api(new Request('https://sfm.test/api/v2/inicio'+selector),{} as EntornoV2)).status).toBe(401)})
 it('la presencia de una variable antigua tampoco abre la API',async()=>{expect((await api(new Request('https://sfm.test/api/v2/inicio'),{PUBLIC_DEMO_CLIENT_ID:'cliente-1'} as unknown as EntornoV2)).status).toBe(401)})
})
