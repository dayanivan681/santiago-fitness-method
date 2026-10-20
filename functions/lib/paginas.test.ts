import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { paginaEntrar, paginaLogin, paginaRestablecer } from './paginas';
import { origenSeguro } from './v2/seguridad';
it('permite el POST del mismo origen sin compartir el token en el referrer', async () => {
  const pagina = paginaEntrar('token-sintetico');
  expect(pagina.headers.get('Referrer-Policy')).toBe('strict-origin');
  expect(pagina.headers.get('Content-Security-Policy')).toContain("form-action 'self'");
  expect(await pagina.text()).toContain('<form method="POST" action="/access">');
  expect(origenSeguro(new Request('https://sfm.test/access',{method:'POST',headers:{Origin:'https://sfm.test','Sec-Fetch-Site':'same-origin'}}))).toBe(true);
  expect(origenSeguro(new Request('https://sfm.test/access',{method:'POST',headers:{Origin:'null','Sec-Fetch-Site':'same-origin'}}))).toBe(false);
  expect(origenSeguro(new Request('https://sfm.test/access',{method:'POST',headers:{Origin:'https://otro.test','Sec-Fetch-Site':'cross-site'}}))).toBe(false);
});

it('instalar desde el acceso conserva el manifest y los inicios de cada iPhone del shell', async () => {
  const pagina = paginaLogin(false, true);
  const html = await pagina.text();
  const shell = readFileSync('index.html', 'utf8');
  const inicios = (valor: string) => [...valor.matchAll(/<link rel="apple-touch-startup-image"[^>]+/g)]
    .map(([enlace]) => enlace.replace(/\s*\/$/, '')).sort();
  expect(inicios(html)).toEqual(inicios(shell));
  expect(inicios(html)).toHaveLength(11);
  expect(html).toContain('<link rel="manifest" href="/manifest.webmanifest">');
  expect(html).toContain('name="apple-mobile-web-app-capable" content="yes"');
  expect(html).toContain('name="apple-mobile-web-app-title" content="Santiago FM"');
  const csp = pagina.headers.get('Content-Security-Policy');
  expect(csp).toContain("default-src 'none'");
  expect(csp).toContain("img-src 'self'");
  expect(csp).toContain("manifest-src 'self'");
  expect(csp).not.toContain('script-src');
  expect(pagina.headers.get('Referrer-Policy')).toBe('strict-origin');
});

it('los enlaces con token no ofrecen una instalación que guarde su URL', async () => {
  for (const pagina of [paginaEntrar('token-sintetico'), paginaRestablecer('token-sintetico')]) {
    expect(await pagina.text()).not.toContain('rel="manifest"');
    expect(pagina.headers.get('Content-Security-Policy')).not.toContain('manifest-src');
  }
});
