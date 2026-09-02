import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { limpiarOffline } from './aplicacion/limpiarOffline.ts'

// La app ya no funciona sin conexión: cada carga tiene que llegar al servidor
// para que Cloudflare Access la autorice. Esto desmonta lo que dejó la versión
// anterior. No bloquea el arranque: si falla, el sw.js lo reintenta.
void limpiarOffline()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
