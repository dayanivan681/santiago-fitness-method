// Pantallas de inicio de iOS: una por tamaño de iPhone (CSS px × escala).
// Uso: node scripts/generar-pantallas-inicio.mjs "$PWD" (necesita Playwright con Chromium).
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const raiz = process.argv[2];
const fuente = readFileSync(`${raiz}/public/fuentes/barlow-condensed-700.woff2`).toString('base64');
const fuente5 = readFileSync(`${raiz}/public/fuentes/barlow-500.woff2`).toString('base64');
const tamanos = [
  [440, 956, 3], [402, 874, 3], [430, 932, 3], [393, 852, 3], [428, 926, 3],
  [390, 844, 3], [375, 812, 3], [414, 896, 3], [414, 896, 2], [375, 667, 2], [320, 568, 2],
];
const html = `<!doctype html><html><head><style>
@font-face{font-family:BC;src:url(data:font/woff2;base64,${fuente}) format('woff2');font-weight:700}
@font-face{font-family:B;src:url(data:font/woff2;base64,${fuente5}) format('woff2');font-weight:500}
html,body{margin:0;height:100%;background:#0b0c0d}
body{display:flex;align-items:center;justify-content:center}
.m{display:flex;flex-direction:column;align-items:center;gap:10px;color:#f4f3f0}
.m b{font:700 34px/1 BC;letter-spacing:4px}
.m span{font:500 10px/1 B;letter-spacing:5px;color:#bababa}
.m i{display:block;width:28px;height:2px;background:#e5352b;margin-top:6px}
</style></head><body><div class="m"><b>SANTIAGO</b><span>FITNESS METHOD</span><i></i></div></body></html>`;
const b = await chromium.launch();
const enlaces = [];
for (const [w, h, s] of tamanos) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: s });
  await p.setContent(html); await p.evaluate(() => document.fonts.ready);
  const nombre = `inicio-${w * s}x${h * s}.png`;
  await p.screenshot({ path: `${raiz}/public/inicio/${nombre}` });
  enlaces.push(`    <link rel="apple-touch-startup-image" media="(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${s}) and (orientation: portrait)" href="/inicio/${nombre}" />`);
  await p.close();
}
await b.close();
console.log(enlaces.join('\n'));
