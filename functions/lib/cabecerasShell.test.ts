import { describe, expect, it } from 'vitest'
import { onRequest } from '../_middleware'
import { CSP_SHELL, conCabecerasDeShell } from './cabecerasShell'

function html(cabeceras: Record<string, string> = {}, status = 200): Response {
  return new Response('<!doctype html><div id="root"></div>', {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...cabeceras },
  })
}

describe('cabeceras de seguridad del shell', () => {
  it('impide que una web ajena incruste la app y no permite scripts en línea', () => {
    const respuesta = conCabecerasDeShell(html())
    const csp = respuesta.headers.get('Content-Security-Policy') ?? ''

    expect(csp).toContain("frame-ancestors 'self'")
    expect(csp).toContain("script-src 'self'")
    expect(csp).not.toMatch(/script-src[^;]*unsafe/)
    expect(respuesta.headers.get('X-Frame-Options')).toBe('SAMEORIGIN')
  })

  it("permite que /presentacion incruste la demo: 'self', nunca 'none'", () => {
    // Presentacion.tsx pinta /demo/cliente dentro de un iframe del mismo origen.
    expect(CSP_SHELL).not.toContain("frame-ancestors 'none'")
  })

  it('deja pasar sin tocar lo que no es HTML', () => {
    const js = new Response('export {}', { headers: { 'Content-Type': 'text/javascript' } })

    const respuesta = conCabecerasDeShell(js)

    expect(respuesta).toBe(js)
    expect(respuesta.headers.get('Content-Security-Policy')).toBeNull()
  })

  it('conserva el estado y las cabeceras que ya traía', () => {
    const respuesta = conCabecerasDeShell(html({ 'Cache-Control': 'no-store' }, 404))

    expect(respuesta.status).toBe(404)
    expect(respuesta.headers.get('Cache-Control')).toBe('no-store')
    expect(respuesta.headers.get('Content-Type')).toContain('text/html')
  })

  it('no modifica la respuesta que recibe', () => {
    const original = html()

    conCabecerasDeShell(original)

    expect(original.headers.get('Content-Security-Policy')).toBeNull()
  })

  it('el middleware la aplica a las rutas del SPA, como /demo/coach', async () => {
    const respuesta = await onRequest({
      request: new Request('https://sfm.test/demo/coach'),
      env: {},
      next: async () => html(),
    } as unknown as Parameters<typeof onRequest>[0])

    expect(respuesta.headers.get('Content-Security-Policy')).toBe(CSP_SHELL)
  })
})
