// Primero, antes de que nada cargue react-dom (ver el módulo).
import './animacionesJsdom'
import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'
import { beforeEach } from 'vitest'
import { NOVEDADES } from '../producto/notas-novedades'

/**
 * Margen para las esperas de la interfaz.
 *
 * Todas las pantallas se pintan desde consultas vivas a IndexedDB, así que
 * cualquier comprobación posterior a un guardado espera a que la consulta
 * vuelva. El segundo que trae Testing Library por defecto se queda corto con la
 * suite entera en marcha, y el síntoma es un test que falla sin que nada esté
 * roto.
 */
configure({ asyncUtilTimeout: 5000 })

// El aviso de novedades depende de la fecha real: fuera de sus propias pruebas,
// el dispositivo de prueba ya las vio todas para que no tape otras pantallas.
beforeEach(() => {
  // Las pruebas de functions corren en Node, sin almacenamiento del navegador.
  if (typeof localStorage === 'undefined') return
  for (const audiencia of ['coach', 'cliente'] as const) {
    const ids = NOVEDADES.filter((n) => n.audiencia === audiencia).map((n) => n.id)
    localStorage.setItem(`sfm-novedades-vistas:${audiencia}`, JSON.stringify(ids))
  }
})

// jsdom no implementa todavía los métodos nativos del diálogo. Las pruebas
// funcionales verifican su apertura; foco y geometría se comprueban en navegador.
if(typeof HTMLDialogElement!=='undefined'){
 if(!HTMLDialogElement.prototype.showModal)HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')}
 if(!HTMLDialogElement.prototype.close)HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')}
}
