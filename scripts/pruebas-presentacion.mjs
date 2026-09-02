import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:8790'
const appHtml = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')
const appAsset = appHtml.match(/src="(\/assets\/[^" ]+\.js)"/)?.[1]
assert.ok(appAsset, 'El build debe incluir un asset privado real')
const results = []
async function check(path, expected) {
  const response = await fetch(new URL(path, base), { redirect: 'manual' })
  assert.ok(expected.includes(response.status), `${path}: ${response.status}, esperado ${expected}`)
  assert.equal(response.headers.get('set-cookie'), null, `${path}: no debe acuñar cookies`)
  results.push({ path, status: response.status })
  return response
}
const landing = await check('/presentacion', [200])
const html = await landing.text()
assert.ok(html.includes('/presentacion/assets/'))
assert.ok(!html.includes('sfm_sesion') && !html.includes('/access?t='))
assert.ok(landing.headers.get('content-security-policy')?.includes("connect-src 'none'"))
await check('/presentacion/', [200])
for (const asset of new Set([...html.matchAll(/(?:src|href)="(\/presentacion\/[^" ]+)"/g)].map((m) => m[1]))) await check(asset, [200])
await check('/presentacion/media/capturas/hoy.png', [200])
await check('/presentacion/media/ejercicios/sentadilla-barra.jpg', [200])
await check('/presentacion/assets/no-existe.js', [404])
for (const path of ['/', '/index.html', appAsset, '/manifest.webmanifest', '/ejercicios/sentadilla-barra.jpg', '/api/cliente', '/presentacion/index.html', '/presentacion/api/cliente']) await check(path, [401])
const admin = await check('/admin/', base.includes('localhost') ? [403] : [302])
if (!base.includes('localhost')) assert.ok(admin.headers.get('location')?.includes('cloudflareaccess.com'))
await check('/sw.js', [200])
console.log(JSON.stringify({ base, result: 'PASS', checks: results }, null, 2))
