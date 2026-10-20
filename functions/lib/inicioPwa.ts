/** Metadatos para instalar desde /entrar, que se sirve sin el shell de React. */
const PANTALLAS = [
  [440, 956, 3], [402, 874, 3], [430, 932, 3], [393, 852, 3],
  [428, 926, 3], [390, 844, 3], [375, 812, 3], [414, 896, 3],
  [414, 896, 2], [375, 667, 2], [320, 568, 2],
] as const

export const METADATOS_INICIO_PWA = `
<meta name="color-scheme" content="dark">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Santiago FM">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
${PANTALLAS.map(([ancho, alto, escala]) =>
  `<link rel="apple-touch-startup-image" media="(device-width: ${ancho}px) and (device-height: ${alto}px) and (-webkit-device-pixel-ratio: ${escala}) and (orientation: portrait)" href="/inicio/inicio-${ancho * escala}x${alto * escala}.png">`,
).join('\n')}`
