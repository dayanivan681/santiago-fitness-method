import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { escucharAvisoInstalacion } from './aplicacion/instalacion'
// El worker guarda sólo la estructura pública. Las APIs y fotografías nunca se cachean.
if ('serviceWorker' in navigator && !location.pathname.startsWith('/demo')) {
  void navigator.serviceWorker.register('/sw.js').catch(() => {})
}

escucharAvisoInstalacion()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
