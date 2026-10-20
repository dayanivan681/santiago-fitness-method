/**
 * Gestos táctiles que una app nativa da por hechos y una web no trae.
 *
 * Se usan eventos `touch*` y no `pointer*`: en iOS el navegador cancela los
 * punteros en cuanto decide desplazar, y sólo `touchmove` con `passive: false`
 * permite quedarse con el gesto. Con ratón no hacen nada: en escritorio se
 * cierra y se navega con clics.
 */
import { useEffect, type RefObject } from 'react'
import { movimientoReducido } from './transiciones'

const EDITABLE = 'input, textarea, select, [contenteditable="true"], [data-sin-gestos]'

function esEditable(objetivo: EventTarget | null): boolean {
  return objetivo instanceof Element && objetivo.closest(EDITABLE) !== null
}

/**
 * Arrastrar una hoja hacia abajo la cierra, como en iOS. Sólo empieza si la
 * hoja está arriba del todo: si hay scroll, primero se desplaza el contenido.
 * Al soltar, cierra si se bajó lo bastante o rápido; si no, vuelve a su sitio.
 */
export function useArrastrarParaCerrar(
  ref: RefObject<HTMLElement | null>,
  cerrar: () => void,
  /** El que se desplaza, si no es el propio elemento. */
  desplazable?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const hoja = ref.current
    if (!hoja) return
    let inicioY = 0
    let inicioX = 0
    let inicioT = 0
    let dy = 0
    let arrastrando = false
    let posible = false

    const alEmpezar = (e: TouchEvent) => {
      const scroll = (desplazable?.current ?? hoja).scrollTop
      posible = e.touches.length === 1 && scroll <= 0 && !esEditable(e.target)
      arrastrando = false
      dy = 0
      inicioY = e.touches[0].clientY
      inicioX = e.touches[0].clientX
      inicioT = performance.now()
    }
    const alMover = (e: TouchEvent) => {
      if (!posible) return
      const y = e.touches[0].clientY - inicioY
      const x = e.touches[0].clientX - inicioX
      if (!arrastrando) {
        // Hacia arriba o de lado: es scroll u otro gesto, no un cierre.
        if (y < 0 || Math.abs(x) > Math.abs(y)) {
          posible = false
          return
        }
        if (y < 8) return
        arrastrando = true
        hoja.style.transition = 'none'
      }
      e.preventDefault()
      dy = y
      hoja.style.transform = `translateY(${dy}px)`
    }
    const alSoltar = () => {
      if (!arrastrando) return
      arrastrando = false
      posible = false
      const velocidad = dy / Math.max(1, performance.now() - inicioT)
      const umbral = Math.max(80, Math.min(140, hoja.offsetHeight * 0.3))
      const cierra = dy > umbral || (velocidad > 0.6 && dy > 40)
      hoja.style.transition = movimientoReducido() ? 'none' : 'transform 220ms cubic-bezier(0.32, 0.72, 0, 1)'
      if (!cierra) {
        hoja.style.transform = ''
        return
      }
      // Sigue bajando desde donde está; la salida animada normal ya no hace falta.
      hoja.dataset.arrastre = 'fuera'
      hoja.style.transform = 'translateY(110%)'
      window.setTimeout(cerrar, movimientoReducido() ? 0 : 200)
    }

    hoja.addEventListener('touchstart', alEmpezar, { passive: true })
    hoja.addEventListener('touchmove', alMover, { passive: false })
    hoja.addEventListener('touchend', alSoltar)
    hoja.addEventListener('touchcancel', alSoltar)
    return () => {
      hoja.removeEventListener('touchstart', alEmpezar)
      hoja.removeEventListener('touchmove', alMover)
      hoja.removeEventListener('touchend', alSoltar)
      hoja.removeEventListener('touchcancel', alSoltar)
    }
  }, [ref, cerrar, desplazable])
}

/**
 * Deslizar en horizontal sobre `ref` llama a `anterior` o `siguiente`.
 * Exige un gesto claramente horizontal para no robar el scroll vertical.
 */
export function useDeslizarHorizontal(
  ref: RefObject<HTMLElement | null>,
  { anterior, siguiente }: { anterior?: () => void; siguiente?: () => void },
) {
  useEffect(() => {
    const zona = ref.current
    if (!zona) return
    let x0 = 0
    let y0 = 0
    let t0 = 0
    let valido = false
    const alEmpezar = (e: TouchEvent) => {
      valido = e.touches.length === 1 && !esEditable(e.target)
      x0 = e.touches[0].clientX
      y0 = e.touches[0].clientY
      t0 = performance.now()
    }
    const alSoltar = (e: TouchEvent) => {
      if (!valido) return
      valido = false
      const dx = e.changedTouches[0].clientX - x0
      const dy = e.changedTouches[0].clientY - y0
      const rapido = performance.now() - t0 < 600
      if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 2 || !rapido) return
      if (dx < 0) siguiente?.()
      else anterior?.()
    }
    zona.addEventListener('touchstart', alEmpezar, { passive: true })
    zona.addEventListener('touchend', alSoltar)
    return () => {
      zona.removeEventListener('touchstart', alEmpezar)
      zona.removeEventListener('touchend', alSoltar)
    }
  }, [ref, anterior, siguiente])
}

function enPantallaCompleta(): boolean {
  return (
    (typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches) ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/**
 * Deslizar desde el borde izquierdo vuelve atrás. Safari ya lo hace en el
 * navegador; instalada en inicio no, y es lo que más delata a una web. Sólo se
 * activa en ese modo y si hay a dónde volver dentro de la app.
 */
export function useVolverDesdeElBorde(volver: (() => void) | null) {
  useEffect(() => {
    if (!volver || !enPantallaCompleta()) return
    const indicador = document.createElement('div')
    indicador.className = 'volver-borde'
    indicador.setAttribute('aria-hidden', 'true')
    document.body.appendChild(indicador)
    let x0 = 0
    let y0 = 0
    let activo = false
    let dx = 0
    const alEmpezar = (e: TouchEvent) => {
      activo = e.touches.length === 1 && e.touches[0].clientX < 24
      x0 = e.touches[0].clientX
      y0 = e.touches[0].clientY
      dx = 0
    }
    const alMover = (e: TouchEvent) => {
      if (!activo) return
      dx = e.touches[0].clientX - x0
      const dy = e.touches[0].clientY - y0
      if (Math.abs(dy) > Math.abs(dx) && dx < 20) {
        activo = false
        indicador.style.opacity = '0'
        return
      }
      e.preventDefault()
      const avance = Math.min(1, Math.max(0, dx / 110))
      indicador.style.opacity = String(avance)
      indicador.style.transform = `translate(${Math.min(dx, 110) * 0.5}px, ${y0}px)`
      indicador.dataset.listo = avance >= 1 ? 'si' : 'no'
    }
    const alSoltar = () => {
      if (!activo) return
      activo = false
      indicador.style.opacity = '0'
      if (dx >= 110) volver()
    }
    document.addEventListener('touchstart', alEmpezar, { passive: true })
    document.addEventListener('touchmove', alMover, { passive: false })
    document.addEventListener('touchend', alSoltar)
    document.addEventListener('touchcancel', alSoltar)
    return () => {
      indicador.remove()
      document.removeEventListener('touchstart', alEmpezar)
      document.removeEventListener('touchmove', alMover)
      document.removeEventListener('touchend', alSoltar)
      document.removeEventListener('touchcancel', alSoltar)
    }
  }, [volver])
}
