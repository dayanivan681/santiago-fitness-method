import { expect, it } from 'vitest';
import { paginaEntrar } from './paginas';
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
