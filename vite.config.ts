import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expuesto en la red local para probar desde el móvil
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
