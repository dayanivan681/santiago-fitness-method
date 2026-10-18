/**
 * Modo entrenamiento: un ejercicio a la vez.
 *
 * Antes esto era la pantalla Hoy entera: los cinco ejercicios del día en un
 * acordeón, con el primero desplegado y sus cuatro series listas para guardar.
 * Sumaba unos cuarenta controles tocables en dos pantallas de scroll y se leía
 * como un formulario largo, que es justo lo que no debe ser lo que se usa con
 * el móvil en una mano entre serie y serie.
 *
 * Aquí sólo está el ejercicio en curso. Lo que se pierde de vista —los otros
 * cuatro— se recupera de dos formas, y a propósito son las dos que se usan de
 * verdad: la fila «Siguiente» al terminar, y la hoja del botón «···» para
 * saltar a cualquiera.
 *
 * La barra de pestañas se queda. Ocultarla era tentador para «reducir
 * distracción», pero salir a la Biblioteca mientras corre el descanso y volver
 * es un flujo real, y además una regresión cubierta por `pruebas-maestro`.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useEntrenamiento } from '../../aplicacion/useEntrenamiento'
import { useControlDescanso } from '../../aplicacion/contextoDescanso'
import { HojaCapa } from '../../componentes/HojaCapa'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import { CuerpoEjercicio } from './CuerpoEjercicio'
import { HojaVariantes } from './HojaVariantes'
import { HojaEjercicio } from '../Biblioteca/HojaEjercicio'
import { fechaDeHoy, type Repositorio } from '../../datos/repositorio'
import type { Ejercicio } from '../../dominio/tipos'
import type { ClaveDeBorrador } from '../../logica/borrador'
import { useMemoria, type Memoria } from '../../aplicacion/memoria'
import type { EjercicioDelDia } from '../../aplicacion/useEntrenamiento'
import { segunCantidad } from '../../logica/plural'
import { Hoja as HojaResumen,ErrorVisible } from '../../producto/ui'
import { pasoPendiente, posicionEnGrupo, siguienteTrasGuardar } from '../../../shared/superseries'

/** La clave sin `numeroSerie`: cada fila añade el suyo. */
type ClaveDelDia = Omit<ClaveDeBorrador, 'numeroSerie'>

interface Props {
  readonly repositorio?: Repositorio
  /** Día elegido, recordado por `App` mientras dure la pestaña. */
  readonly memoriaDia?: Memoria<string | null>
  /** Ejercicio en curso, para no volver siempre al primero al cambiar de pestaña. */
  readonly memoriaAbierta?: Memoria<number>
  /** Salir del modo y volver al resumen del día. */
  readonly onSalir?: () => void
}

export function Entrenamiento({
  repositorio = repositorioPorDefecto,
  memoriaDia,
  memoriaAbierta,
  onSalir,
}: Props = {}) {
  const {
    datos,
    registrarSerie,
    corregirSerie,
    deshacerUltimaCorreccion,
    terminarSesion,
    cambiarVariante,
    cargando,
  } = useEntrenamiento(repositorio, memoriaDia)

  const actualPropia = useMemoria(0)
  const { valor: actual, recordar: setActual } = memoriaAbierta ?? actualPropia
  const [variantesAbiertas, setVariantesAbiertas] = useState(false)
  const [fichaDe, setFichaDe] = useState<Ejercicio | null>(null)
  const [listaAbierta, setListaAbierta] = useState(false)
  const [resumenAbierto,setResumenAbierto]=useState(false)
  const [identidadVisible,setIdentidadVisible]=useState(true)
  const [errorCierre,setErrorCierre]=useState('')
  const [cerrando,setCerrando]=useState(false)
  const { arrancar: arrancarDescanso, terminar: terminarDescanso, declararBarraDeSesion } = useControlDescanso()

  /**
   * El cronómetro vive en App y no sabe si hay una sesión abierta, pero los dos
   * son fijos al fondo. Sin este aviso se solaparían: ya pasó una vez, 22 px.
   */
  const barraDeSesionVisible = Boolean(datos?.sesionDeHoy && !datos.sesionDeHoy.completadaEn)
  useEffect(() => {
    declararBarraDeSesion(barraDeSesionVisible)
    return () => declararBarraDeSesion(false)
  }, [barraDeSesionVisible, declararBarraDeSesion])

  /**
   * La identidad de la clave del borrador tiene que sobrevivir al repintado.
   *
   * Antes se construía un objeto nuevo en cada render y viajaba como prop hasta
   * el efecto de autosave de `FilaSerie`, que lo tiene en sus dependencias: el
   * autosave se disparaba en CADA repintado. El daño se veía justo al guardar
   * una serie —arrancar el descanso repinta el árbol— porque volvía a escribir
   * el borrador que `registrarSerie` acababa de borrar, y la serie recién
   * guardada se quedaba con un borrador fantasma.
   */
  const clavesDelDia = useMemo(() => {
    const claves = new Map<number, ClaveDelDia>()
    if (!datos) return claves

    const fecha = fechaDeHoy()
    for (const item of datos.ejerciciosDelDia) {
      claves.set(item.slot.orden, {
        participanteId: datos.participante.id,
        fecha,
        plantillaDiaId: datos.plantilla.id,
        orden: item.slot.orden,
      })
    }
    return claves
  }, [datos])

  /**
   * Series guardadas en esta pantalla, por día y posición. Al alternar rápido en
   * una bi-serie la recarga de `datos` puede ir un paso por detrás; sin esto el
   * flujo contaría una serie de menos del otro miembro y repetiría la ronda.
   */
  const guardadas = useRef(new Map<string, number>())

  /**
   * Al abrir una sesión ya empezada —tras recargar, por ejemplo— se retoma
   * donde iba el flujo en vez del primer ejercicio. Una vez por montaje, sólo
   * desde la posición inicial y nunca después de que el participante haya
   * elegido o guardado algo. Espera a que lleguen las series: tras recargar,
   * la primera carga puede venir antes que la sincronización.
   */
  const reanudada = useRef(false)
  useEffect(() => {
    if (reanudada.current || !datos || datos.seriesHechas === 0) return
    reanudada.current = true
    if (actual !== 0) return
    const destino = pasoPendiente(
      datos.ejerciciosDelDia.map((e) => e.slot),
      datos.ejerciciosDelDia.map((e) => e.seriesDeHoy.length),
    )
    if (destino !== null && destino !== 0) setActual(destino)
  }, [datos, actual, setActual])

  if (cargando) return <p className="aviso">Cargando…</p>
  if (!datos || datos.ejerciciosDelDia.length === 0) {
    return <p className="aviso">No hay entrenamiento configurado todavía.</p>
  }

  const {
    participante,
    plantilla,
    ejerciciosDelDia,
    seriesHechas,
    seriesObjetivo,
    sesionDeHoy,
  } = datos

  // Si el día cambia de longitud mientras se entrena, el índice recordado puede
  // quedar fuera de rango. Se recorta al mostrar, no se corrige el estado: eso
  // provocaría un render extra en cada carga.
  const indice = Math.min(Math.max(actual, 0), ejerciciosDelDia.length - 1)
  const item = ejerciciosDelDia[indice]
  const siguiente = ejerciciosDelDia[indice + 1]
  const bibliotecaDelDia = ejerciciosUnicos(
    ejerciciosDelDia.flatMap((ejercicioDelDia) => ejercicioDelDia.variantes),
  )

  const slotsDelDia = ejerciciosDelDia.map((e) => e.slot)
  const grupo = posicionEnGrupo(slotsDelDia, indice)
  /** Una elección del participante manda sobre la reanudación automática. */
  function elegir(destino: number) {
    reanudada.current = true
    setActual(destino)
  }
  const ronda = Math.min(item.seriesDeHoy.length + 1, item.slot.seriesObjetivo)

  /**
   * Tras guardar una serie: descanso y a qué ejercicio pasar.
   *
   * Suelto, es lo de siempre: descanso y, con la última serie, al siguiente.
   * En una bi-serie o tri-serie se alterna sin descanso (A1 → B1) y el descanso
   * del grupo llega al cerrar la ronda. Se calcula desde lo registrado, así que
   * saltar a mano a otro miembro no rompe el flujo.
   */
  function avanzarTrasGuardar(ejercicioId: string, numeroSerie: number) {
    reanudada.current = true
    const clave = (orden: number) => `${fechaDeHoy()}|${plantilla.id}|${orden}`
    guardadas.current.set(clave(item.slot.orden), Math.max(guardadas.current.get(clave(item.slot.orden)) ?? 0, numeroSerie))
    const paso = siguienteTrasGuardar(
      slotsDelDia,
      ejerciciosDelDia.map((e) => Math.max(e.seriesDeHoy.length, guardadas.current.get(clave(e.slot.orden)) ?? 0)),
      indice,
      numeroSerie,
    )
    // Dentro de la ronda no se descansa; si quedaba un descanso de la ronda
    // anterior en marcha, es que ya se empezó: se cierra para que no siga contando.
    if (paso.descansar) arrancarDescanso(ejercicioId, paso.descansoSegundos)
    else terminarDescanso()
    if (paso.indice !== indice) setActual((valor) => (valor === indice ? paso.indice : valor))
  }

  return (
    <>
      <header className="entreno__barra">
        <button
          type="button"
          className="entreno__salir"
          onClick={onSalir}
          aria-label="Volver al resumen del día"
        >
          ‹
        </button>
        <span className="entreno__contexto">
          <span className="entreno__dia">{identidadVisible?plantilla.nombre:item.ejercicio.nombre}</span>
          <span className="entreno__paso">
            {grupo
              ? `${grupo.nombre} ${grupo.grupo} · Ronda ${ronda} de ${item.slot.seriesObjetivo}`
              : `Ejercicio ${indice + 1} de ${ejerciciosDelDia.length}`}
          </span>
        </span>
        <button
          type="button"
          className="entreno__mas"
          onClick={() => setListaAbierta(true)}
          aria-label="Ejercicios del día"
        >
          <span aria-hidden="true">•••</span>
        </button>
      </header>

      {/* Con la barra de sesión abajo hace falta más hueco, o el último texto
          queda a seis píxeles de quedar tapado. */}
      <div
        className={
          sesionDeHoy && !sesionDeHoy.completadaEn ? 'contenido contenido--con-barra' : 'contenido'
        }
      >
        {grupo && (
          <nav className="entreno__superserie" aria-label={`${grupo.nombre} ${grupo.grupo}`}>
            <span className="entreno__superserie-posicion">
              {grupo.grupo}{grupo.posicion} de {grupo.tamano}
            </span>
            <span className="entreno__superserie-tira">
              {grupo.indices.map((i, n) => (
                <button
                  key={i}
                  type="button"
                  aria-current={i === indice ? 'step' : undefined}
                  onClick={() => elegir(i)}
                >
                  {grupo.grupo}{n + 1}
                  <span className="entreno__superserie-nombre"> · {ejerciciosDelDia[i].ejercicio.nombre}</span>
                </button>
              ))}
            </span>
          </nav>
        )}

        <CuerpoEjercicio
          key={item.ejercicio.id}
          item={item}
          onIdentidadVisible={setIdentidadVisible}
          onAbrirVariantes={() => setVariantesAbiertas(true)}
          onAbrirFicha={() => setFichaDe(item.ejercicio)}
          onDescansar={() => {arrancarDescanso(item.ejercicio.id, item.slot.descansoSegundos);}}
          onGuardarSerie={async (ejercicioId, numeroSerie, valores) => {
            await registrarSerie(ejercicioId, numeroSerie, valores)
            // Sólo una serie nueva confirmada inicia el descanso prescrito.
            avanzarTrasGuardar(ejercicioId, numeroSerie)
          }}
          onCorregirSerie={corregirSerie}
          onDeshacerCorreccion={deshacerUltimaCorreccion}
          repositorio={repositorio}
          claveDeBorrador={clavesDelDia.get(item.slot.orden)}
        />

        {/* Qué viene después, sin volver a ninguna lista. */}
        {siguiente ? (
          <div className="grupo grupo--pleno" style={{ marginTop: 22 }}>
            <button type="button" className="fila" onClick={() => elegir(indice + 1)}>
              <span className="fila__cuerpo">
                <span className="fila__detalle">Siguiente</span>
                <span className="fila__titulo">{siguiente.ejercicio.nombre}</span>
              </span>
              <span className="fila__flecha" aria-hidden="true">
                ›
              </span>
            </button>
          </div>
        ) : (
          <p className="nota" style={{ marginTop: 22 }}>
            Último ejercicio del día.
          </p>
        )}

        {/* §19: la sesión la cierra el participante. Se guarda lo que hizo,
            aunque falten ejercicios o series. */}
        {sesionDeHoy?.completadaEn && (
          <p className="nota nota--hecho" style={{ marginTop: 12 }}>
            Sesión terminada. Lo registrado ya está en el historial.
          </p>
        )}
      </div>

      {/*
       * Progreso de la sesión, siempre a la vista.
       *
       * Antes había que bajar hasta el final de la lista —hasta ocho ejercicios—
       * para ver cuánto llevabas y para poder cerrar la sesión.
       */}
      {sesionDeHoy && !sesionDeHoy.completadaEn && (
        <div className="progreso-sesion" role="group" aria-label="Progreso de la sesión y cierre">
          <div
            className="progreso-sesion__medidor"
            role="progressbar"
            aria-label="Progreso de la sesión"
            aria-valuemin={0}
            aria-valuemax={seriesObjetivo}
            aria-valuenow={seriesHechas}
          >
            <span
              className="progreso-sesion__relleno"
              // scaleX y no width: animar el ancho recalcula el diseño en cada cuadro.
              style={{ transform: `scaleX(${Math.min(1, seriesHechas / Math.max(1, seriesObjetivo))})` }}
            />
            <span className="progreso-sesion__texto">
              {seriesHechas} de {seriesObjetivo} series
            </span>
          </div>
          <button type="button" data-tour="terminar" className="progreso-sesion__terminar" disabled={cerrando} onClick={()=>{setCerrando(true);setErrorCierre('');void terminarSesion().then(()=>{terminarDescanso();setResumenAbierto(true);}).catch(e=>setErrorCierre(e.message)).finally(()=>setCerrando(false))}}>
            Terminar sesión
          </button>
        </div>
      )}

      <ErrorVisible error={errorCierre}/>
      {resumenAbierto&&<HojaResumen titulo="Sesión completada" cerrar={()=>setResumenAbierto(false)}><p data-tour="resumen">{plantilla.nombre} · {new Date().toLocaleDateString('es',{day:'numeric',month:'long'})}</p><div className="sfm-metrics sfm-metrics--two"><div><strong>{seriesHechas}</strong><span>{segunCantidad(seriesHechas,'Serie registrada','Series registradas')}</span></div><div><strong>{ejerciciosDelDia.filter(e=>e.seriesDeHoy.length).length}</strong><span>{segunCantidad(ejerciciosDelDia.filter(e=>e.seriesDeHoy.length).length,'Ejercicio entrenado','Ejercicios entrenados')}</span></div></div><p>Tu trabajo de hoy forma parte de tu progreso.</p><button data-tour="cerrar-resumen" className="sfm-primary" onClick={()=>{setResumenAbierto(false);onSalir?.()}}>Volver a Hoy</button><button className="sfm-secondary" onClick={()=>setResumenAbierto(false)}>Revisar y corregir series</button></HojaResumen>}
      {listaAbierta && (
        <HojaDelDia
          ejercicios={ejerciciosDelDia}
          actual={indice}
          onElegir={(destino) => {
            elegir(destino)
            setListaAbierta(false)
          }}
          onCerrar={() => setListaAbierta(false)}
        />
      )}

      {/* La ficha se superpone: el ejercicio sigue montado debajo, así que
          abrirla y cerrarla no cuesta lo que llevas tecleado en la serie. */}
      {fichaDe && (
        <HojaEjercicio
          ejercicio={fichaDe}
          biblioteca={bibliotecaDelDia}
          historial={{ participanteId: participante.id, repositorio }}
          onElegir={setFichaDe}
          onCerrar={() => setFichaDe(null)}
        />
      )}

      {variantesAbiertas && (
        <HojaVariantes
          variantes={item.variantes}
          actualId={item.ejercicio.id}
          asignadaId={item.ejercicioDeLaPlantillaId}
          participante={participante}
          rango={item.rango}
          repositorio={repositorio}
          onCerrar={() => setVariantesAbiertas(false)}
          onElegir={async (ejercicioId, alcance) => {
            await cambiarVariante(item.slot.orden, ejercicioId, alcance)
            setVariantesAbiertas(false)
          }}
        />
      )}
    </>
  )
}

/**
 * Los ejercicios del día, para saltar a cualquiera.
 *
 * Es lo que sustituye al acordeón: la lista completa sigue estando a un toque,
 * pero no ocupa la pantalla mientras se entrena.
 */
function HojaDelDia({
  ejercicios,
  actual,
  onElegir,
  onCerrar,
}: {
  readonly ejercicios: readonly EjercicioDelDia[]
  readonly actual: number
  readonly onElegir: (indice: number) => void
  readonly onCerrar: () => void
}) {
  return (
    <HojaCapa etiqueta="Ejercicios del día" titulo="Ejercicios del día" onCerrar={onCerrar}>
      <div className="grupo">
        {ejercicios.map((ejercicioDelDia, posicion) => (
          <button
            key={ejercicioDelDia.ejercicio.id}
            type="button"
            className="fila"
            aria-current={posicion === actual ? 'true' : undefined}
            onClick={() => onElegir(posicion)}
          >
            <span className="fila__cuerpo">
              <span className="fila__titulo">{ejercicioDelDia.ejercicio.nombre}</span>
              <span className="fila__detalle">
                {etiquetaEnGrupo(ejercicios, posicion)}
                {ejercicioDelDia.slot.seriesObjetivo} series ·{' '}
                {ejercicioDelDia.slot.repMin}–{ejercicioDelDia.slot.repMax} reps
              </span>
            </span>
            <span className="fila__valor">
              {ejercicioDelDia.seriesDeHoy.length}/{ejercicioDelDia.slot.seriesObjetivo}
            </span>
          </button>
        ))}
      </div>
    </HojaCapa>
  )
}

/**
 * Cada ejercicio del día carga todas sus variantes, así que al aplanarlas se
 * repite el mismo catálogo varias veces. La ficha necesita una sola fila por
 * ejercicio: además de evitar botones duplicados, conserva claves React únicas.
 */
function ejerciciosUnicos(ejercicios: readonly Ejercicio[]): Ejercicio[] {
  return [...new Map(ejercicios.map((ejercicio) => [ejercicio.id, ejercicio])).values()]
}

/** «A1 · » para un miembro de una superserie; vacío si va suelto. */
function etiquetaEnGrupo(ejercicios: readonly EjercicioDelDia[], indice: number): string {
  const grupo = posicionEnGrupo(ejercicios.map((e) => e.slot), indice)
  return grupo ? `${grupo.nombre} ${grupo.grupo} · ${grupo.grupo}${grupo.posicion} · ` : ''
}
