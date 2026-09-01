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
    /*
     * Por encima del `asyncUtilTimeout` de 5 s que fija configuracion.ts.
     *
     * Con los dos en 5 s se contradecían: un test que agotara su espera de
     * `waitFor` moría por tiempo de test antes de poder fallar con un mensaje
     * útil. El síntoma era un fallo intermitente en el autosave del borrador,
     * que escribe en IndexedDB y es de los más lentos con la suite entera en
     * marcha. Esto no relaja ninguna comprobación: sólo le da margen al reloj.
     */
    testTimeout: 20000,
    coverage: {
      provider: 'v8',
      include: ['src/dominio/**', 'src/logica/**', 'src/datos/**'],
    },
  },
})
