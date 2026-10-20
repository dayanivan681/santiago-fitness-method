import { describe, expect, it } from 'vitest'
import { yaLaTiene } from './seguridad'

const con = (cabecera?: string) =>
  new Request('https://x/', cabecera === undefined ? {} : { headers: { 'If-None-Match': cabecera } })

describe('yaLaTiene: comparación débil de ETag', () => {
  it('acepta la etiqueta tal cual y la forma débil que deja Cloudflare al comprimir', () => {
    expect(yaLaTiene(con('"cl-1"'), '"cl-1"')).toBe(true)
    expect(yaLaTiene(con('W/"cl-1"'), '"cl-1"')).toBe(true)
    expect(yaLaTiene(con('"otra", W/"cl-1"'), '"cl-1"')).toBe(true)
    expect(yaLaTiene(con('*'), '"cl-1"')).toBe(true)
  })
  it('sin cabecera o con otra versión, no', () => {
    expect(yaLaTiene(con(), '"cl-1"')).toBe(false)
    expect(yaLaTiene(con('W/"cl-2"'), '"cl-1"')).toBe(false)
  })
})
