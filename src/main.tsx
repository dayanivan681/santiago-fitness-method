import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { Presentacion } from './presentacion/Presentacion.tsx'

const ruta = window.location.pathname.replace(/\/+$/, '')
const contenido = ruta === '/presentacion' ? <Presentacion /> : <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {contenido}
  </StrictMode>,
)
