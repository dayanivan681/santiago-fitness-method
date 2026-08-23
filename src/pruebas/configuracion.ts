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
