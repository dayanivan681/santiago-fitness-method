import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // §26 y §27: la app se instala en el móvil y funciona sin conexión, que es
    // la única forma de usarla de verdad en el gimnasio.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        // Las 33 fotos de la biblioteca entran en la precarga: §15 pide que la
        // imagen sirva para identificar el ejercicio, y sin conexión no habría.
        // Las woff2 también: se alojan aquí justamente para no depender de la red.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,ico,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'Santiago Fitness Method',
        short_name: 'Santiago FM',
        description: 'Registro de entrenamiento: ves lo que te toca, lo apuntas y sigue.',
        lang: 'es',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0b0c0d',
        theme_color: '#0b0c0d',
        icons: [
          { src: '/icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icono-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icono-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: {
    host: true, // expuesto en la red local para probar desde el móvil en el gimnasio (§27)
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/pruebas/configuracion.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/dominio/**', 'src/logica/**', 'src/datos/**'],
    },
  },
})
