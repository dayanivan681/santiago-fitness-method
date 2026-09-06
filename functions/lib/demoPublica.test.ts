import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  CLIENTE_DEMO_PUBLICO,
  clienteDemoPublico,
  identidadClienteServidor,
} from './demoPublica'

describe('cliente público temporal', () => {
  it('acepta exclusivamente cliente-1', () => {
    expect(clienteDemoPublico({ PUBLIC_DEMO_CLIENT_ID: 'cliente-1' })).toBe('cliente-1')
    expect(CLIENTE_DEMO_PUBLICO).toBe('cliente-1')
  })

  it.each([undefined, '', 'santiago', 'dayan-test', 'cliente-1 ', ' cliente-1'])
  ('falla cerrado con %o', (valor) => {
    expect(clienteDemoPublico({ PUBLIC_DEMO_CLIENT_ID: valor })).toBeNull()
  })

  it('ignora cualquier selector de identidad que proceda del navegador', () => {
    const entornoConEntradaManipulada = {
      PUBLIC_DEMO_CLIENT_ID: 'cliente-1',
      cliente_id: 'santiago',
      id: 'santiago',
      client: 'santiago',
      email: 'santiago@example.test',
    }

    expect(clienteDemoPublico(entornoConEntradaManipulada)).toBe('cliente-1')
  })

  it('prevalece sobre una sesión antigua de Santiago', () => {
    expect(
      identidadClienteServidor(
        { PUBLIC_DEMO_CLIENT_ID: 'cliente-1' },
        'santiago',
      ),
    ).toBe('cliente-1')
  })

  it('conserva la sesión normal cuando la demo está apagada', () => {
    expect(
      identidadClienteServidor({ PUBLIC_DEMO_CLIENT_ID: '' }, 'santiago'),
    ).toBe('santiago')
  })
})

describe('configuración desplegada de la demo pública', () => {
  const wrangler = readFileSync(resolve(process.cwd(), 'wrangler.toml'), 'utf8')
  const valores = [...wrangler.matchAll(/^PUBLIC_DEMO_CLIENT_ID = "([^"]*)"$/gm)].map(
    (coincidencia) => coincidencia[1],
  )

  it('declara producción y preview explícitamente', () => {
    expect(valores).toHaveLength(2)
  })

  it('publica sólo cliente-1 en el hostname canónico', () => {
    expect(valores[0]).toBe('cliente-1')
  })

  it('no abre ningún cliente desde deployments de preview', () => {
    expect(valores[1]).toBe('')
  })
})
