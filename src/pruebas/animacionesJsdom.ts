/**
 * jsdom no define AnimationEvent y, sin él, React escucha `webkitAnimationEnd`
 * en vez de `animationend`: `onAnimationEnd` nunca saltaría en las pruebas del
 * cierre animado de las hojas.
 *
 * React elige el nombre al cargar react-dom, así que esto tiene que ejecutarse
 * antes: es el primer import de `configuracion.ts`, por delante de Testing
 * Library (que ya trae react-dom).
 */
if (typeof window !== 'undefined' && !('AnimationEvent' in window)) {
  class AnimationEventDePrueba extends Event {
    readonly animationName: string
    constructor(tipo: string, init: AnimationEventInit = {}) {
      super(tipo, init)
      this.animationName = init.animationName ?? ''
    }
  }
  Object.defineProperty(window, 'AnimationEvent', { value: AnimationEventDePrueba, configurable: true })
}

export {}
