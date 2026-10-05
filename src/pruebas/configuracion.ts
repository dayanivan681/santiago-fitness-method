// Primero, antes de que nada cargue react-dom (ver el módulo).
import './animacionesJsdom'
import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'

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

// jsdom no implementa todavía los métodos nativos del diálogo. Las pruebas
// funcionales verifican su apertura; foco y geometría se comprueban en navegador.
if(typeof HTMLDialogElement!=='undefined'){
 if(!HTMLDialogElement.prototype.showModal)HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')}
 if(!HTMLDialogElement.prototype.close)HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')}
}
