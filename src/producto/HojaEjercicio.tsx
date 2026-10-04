import { useEffect, useState, type ChangeEvent } from "react";
import {
  EQUIPOS,
  EXPLICACION_MAX,
  EjercicioCoachNuevo,
  FOTO_MAX_BYTES,
  MUSCULOS,
  NOMBRE_MAX,
  TIPOS_DE_CARGA,
  type EjercicioCoach,
} from "../../shared/v2/biblioteca";
import { CATALOGO_PDF, type FichaCatalogoPdf } from "../../shared/catalogo-pdf";
import { reducirImagen } from "../datos/imagen";
import { useBiblioteca } from "./contextoBiblioteca";
import { ETIQUETA_EQUIPO, ETIQUETA_MUSCULO, OPCION_CARGA } from "./etiquetasBiblioteca";
import { ErrorVisible, Hoja } from "./ui";

const INCREMENTO_INICIAL = "5";
const MAX_RESULTADOS_CATALOGO = 60;
const TIPOS_DE_FOTO = new Set(["image/jpeg", "image/png", "image/webp"]);

type Equipo = (typeof EQUIPOS)[number];
type Musculo = (typeof MUSCULOS)[number];
type TipoCarga = (typeof TIPOS_DE_CARGA)[number];

type Borrador = {
  referenciaCatalogo: string | null;
  nombre: string;
  equipo: Equipo | "";
  musculoPrimario: Musculo | "";
  secundarios: Musculo[];
  parecidoA: string;
  tipoCarga: TipoCarga;
  incremento: string;
  pesoBase: string;
  explicacion: string;
};

const BORRADOR_VACIO: Borrador = {
  referenciaCatalogo: null,
  nombre: "",
  equipo: "",
  musculoPrimario: "",
  secundarios: [],
  parecidoA: "",
  tipoCarga: "total",
  incremento: INCREMENTO_INICIAL,
  pesoBase: "",
  explicacion: "",
};

/** Cómo se anota el peso con cada equipo, mientras el coach no elija otra cosa. */
const CARGA_POR_EQUIPO: Record<Equipo, TipoCarga> = {
  maquinaTradicional: "pesoMaquina",
  maquinaDiscos: "discosAnadidos",
  smith: "porLado",
  barraLibre: "porLado",
  convergente: "porLado",
  mancuernas: "porLado",
  cable: "pesoMaquina",
  pesoCorporal: "discosAnadidos",
};

/** En peso corporal no hay máquina: «discos añadidos» es el lastre. */
const LASTRE = { titulo: "Lastre que añades", ejemplo: "Chaleco de 20 lb → 20. Sin lastre → 0." };
const opcionCarga = (t: TipoCarga, equipo: Equipo | "") =>
  t === "discosAnadidos" && equipo === "pesoCorporal" ? LASTRE : OPCION_CARGA[t];

const sinAcentos = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const ATAJO = (t: string) => sinAcentos(t).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function desdeEjercicio(e: EjercicioCoach): Borrador {
  return {
    referenciaCatalogo: e.referenciaCatalogo,
    nombre: e.nombre,
    equipo: e.equipo,
    musculoPrimario: e.musculoPrimario,
    secundarios: [...e.musculosSecundarios],
    parecidoA: "",
    tipoCarga: e.tipoCarga,
    incremento: String(e.incrementoMinimoLb),
    pesoBase: e.pesoBaseMaquinaLb === null ? "" : String(e.pesoBaseMaquinaLb),
    explicacion: e.explicacionCorta,
  };
}

/**
 * Hoja para añadir un ejercicio (de tu catálogo o desde cero) o editar uno tuyo.
 * Cerrar sin guardar no cambia nada.
 */
export function HojaEjercicio({ editando, cerrar }: { editando?: EjercicioCoach; cerrar: () => void }) {
  const [paso, setPaso] = useState<"elegir" | "catalogo" | "formulario">(editando ? "formulario" : "elegir");
  const [borrador, setBorrador] = useState<Borrador>(editando ? desdeEjercicio(editando) : BORRADOR_VACIO);
  const titulo = editando ? "Editar ejercicio" : paso === "catalogo" ? "De mi catálogo" : "Añadir ejercicio";
  return (
    <Hoja titulo={titulo} cerrar={cerrar}>
      {paso === "elegir" && (
        <div className="sfm-list">
          <button className="sfm-row" onClick={() => setPaso("catalogo")}>
            <span className="sfm-row-body">
              <strong>De mi catálogo</strong>
              <small>Elige una de las {CATALOGO_PDF.length} fichas de tu PDF.</small>
            </span>
          </button>
          <button className="sfm-row" onClick={() => setPaso("formulario")}>
            <span className="sfm-row-body">
              <strong>Nuevo</strong>
              <small>Empieza con un formulario en blanco.</small>
            </span>
          </button>
        </div>
      )}
      {paso === "catalogo" && (
        <Catalogo
          elegir={(f) => {
            setBorrador({ ...BORRADOR_VACIO, referenciaCatalogo: f.ref, nombre: f.nombre, equipo: f.equipo ?? "" });
            setPaso("formulario");
          }}
          volver={() => setPaso("elegir")}
        />
      )}
      {paso === "formulario" && (
        <Formulario
          inicial={borrador}
          editando={editando}
          volver={editando ? undefined : () => setPaso("elegir")}
          terminar={cerrar}
        />
      )}
    </Hoja>
  );
}

function Catalogo({ elegir, volver }: { elegir: (f: FichaCatalogoPdf) => void; volver: () => void }) {
  const [q, setQ] = useState("");
  const coincidencias = CATALOGO_PDF.filter((f) => sinAcentos(f.nombre).includes(sinAcentos(q)));
  return (
    <>
      <input
        className="sfm-search"
        aria-label="Buscar en mi catálogo"
        placeholder="Buscar por nombre"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="sfm-list">
        {coincidencias.slice(0, MAX_RESULTADOS_CATALOGO).map((f) => (
          <button className="sfm-row" key={f.ref} onClick={() => elegir(f)}>
            <span className="sfm-row-body">
              <strong>{f.nombre}</strong>
              <small>{f.equipo ? ETIQUETA_EQUIPO[f.equipo] : "Equipo por elegir"}</small>
            </span>
          </button>
        ))}
        {coincidencias.length > MAX_RESULTADOS_CATALOGO && (
          <p className="sfm-hint">Hay {coincidencias.length} coincidencias. Escribe más para acotar.</p>
        )}
        {!coincidencias.length && <p className="sfm-hint">No hay fichas con ese nombre.</p>}
      </div>
      <button className="sfm-secondary" onClick={volver}>Volver</button>
    </>
  );
}

function Formulario({
  inicial,
  editando,
  volver,
  terminar,
}: {
  inicial: Borrador;
  editando?: EjercicioCoach;
  volver?: () => void;
  terminar: () => void;
}) {
  const { ejercicios, servicio, recargar } = useBiblioteca();
  const [b, setB] = useState(inicial);
  const [foto, setFoto] = useState<Blob | null>(null);
  const [vista, setVista] = useState("");
  // GIF elegido: se sube aparte; `foto` guarda su primer cuadro como imagen fija.
  const [gif, setGif] = useState<Blob | null>(null);
  const [vistaGif, setVistaGif] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  // Si el ejercicio ya se creó y sólo falló la foto, un reintento no lo duplica.
  const [creado, setCreado] = useState<EjercicioCoach | null>(null);
  const existente = editando ?? creado ?? undefined;
  const actualiza = (parcial: Partial<Borrador>) => setB((v) => ({ ...v, ...parcial }));
  // Al editar, la carga ya está decidida: el equipo no la cambia.
  const [cargaTocada, setCargaTocada] = useState(!!editando);
  const necesitaBase = b.tipoCarga === "porLado" || b.tipoCarga === "discosAnadidos";

  useEffect(() => {
    if (!foto) return;
    const url = URL.createObjectURL(foto);
    // oxlint-disable-next-line react/set-state-in-effect
    setVista(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  useEffect(() => {
    if (!gif) return;
    const url = URL.createObjectURL(gif);
    // oxlint-disable-next-line react/set-state-in-effect
    setVistaGif(url);
    return () => URL.revokeObjectURL(url);
  }, [gif]);

  async function elegirFoto(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    if (archivo.type === "image/gif") return elegirGif(archivo);
    if (!TIPOS_DE_FOTO.has(archivo.type) && !archivo.type.startsWith("image/heic")) {
      setError("Usa una foto JPEG, PNG o WebP, o un GIF con el movimiento.");
      return;
    }
    const lista = await reducirImagen(archivo);
    if (!TIPOS_DE_FOTO.has(lista.type)) return setError("No pudimos preparar esa foto. Prueba con otra en JPEG, PNG o WebP.");
    if (lista.size > FOTO_MAX_BYTES) return setError("La foto pesa más de 5 MB. Elige otra.");
    setError("");
    setFoto(lista);
    setGif(null);
    setVistaGif("");
  }

  /** Un GIF animado: el primer cuadro es la imagen fija de listas y miniaturas; el GIF, sólo para la ficha. */
  async function elegirGif(archivo: Blob) {
    if (archivo.size > FOTO_MAX_BYTES)
      return setError("El GIF pesa más de 5 MB. Recórtalo o redúcelo (por ejemplo en ezgif.com) y vuelve a intentarlo.");
    const fija = await reducirImagen(archivo);
    if (!TIPOS_DE_FOTO.has(fija.type))
      return setError("No pudimos sacar una imagen fija de ese GIF. Prueba con otro.");
    setError("");
    setFoto(fija);
    setGif(archivo);
  }

  async function guardar() {
    setError("");
    if (!b.equipo) return setError("Elige el equipo.");
    if (!b.musculoPrimario) return setError("Elige el músculo principal.");
    const nombre = b.nombre.trim();
    const repetido = ejercicios.some(
      (x) => x.id !== existente?.id && sinAcentos(x.nombre).trim() === sinAcentos(nombre).replace(/\s+/g, " "),
    );
    if (repetido)
      return setError(`Ya hay un ejercicio llamado «${nombre}». Cambia el nombre; por ejemplo, añade la máquina o el agarre.`);
    const heredado = ejercicios.find((x) => x.id === b.parecidoA)?.movimiento;
    const datos = EjercicioCoachNuevo.safeParse({
      referenciaCatalogo: b.referenciaCatalogo,
      nombre: b.nombre,
      equipo: b.equipo,
      movimiento: heredado ?? editando?.movimiento ?? `coach-${ATAJO(b.nombre)}`,
      musculoPrimario: b.musculoPrimario,
      musculosSecundarios: b.secundarios.filter((m) => m !== b.musculoPrimario),
      tipoCarga: b.tipoCarga,
      incrementoMinimoLb: Number(b.incremento),
      pesoBaseMaquinaLb: necesitaBase && b.pesoBase !== "" ? Number(b.pesoBase) : null,
      explicacionCorta: b.explicacion,
    });
    if (!datos.success) return setError(datos.error.issues.map((i) => i.message).join(" "));
    if (!servicio) return setError("La biblioteca no está disponible aquí.");
    setGuardando(true);
    let yaGuardado = false;
    try {
      let actual = existente;
      if (!actual) actual = await servicio.crear(datos.data);
      else if (!creado) {
        const { referenciaCatalogo: _fija, ...cambio } = datos.data;
        void _fija;
        actual = await servicio.editar(actual.id, cambio);
      }
      yaGuardado = true;
      if (!editando) setCreado(actual);
      if (foto) actual = await servicio.subirFoto(actual.id, foto);
      // El GIF va después de su imagen fija; una foto nueva sin GIF reemplaza a la animación anterior.
      if (gif) await servicio.subirAnimacion(actual.id, gif);
      else if (foto && actual.tieneAnimacion) await servicio.quitarAnimacion(actual.id);
      await recargar();
      terminar();
    } catch (e) {
      const aviso = yaGuardado && !editando ? " El ejercicio ya está guardado; vuelve a intentar para subir la foto o la animación." : "";
      setError((e as Error).message + aviso);
      if (yaGuardado) await recargar();
    } finally {
      setGuardando(false);
    }
  }

  const fotoActual = vista || (existente?.tieneFoto && servicio ? servicio.urlDeFoto(existente) : null);
  // Una foto nueva sin GIF deja la animación anterior fuera de la vista previa: se quitará al guardar.
  const animacionActual = vistaGif || (!foto && existente && servicio ? servicio.urlDeAnimacion(existente) : null);
  return (
    <form
      className="sfm-form"
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
    >
      <ErrorVisible error={error} />
      <label className="sfm-field">
        <span>Nombre</span>
        <input value={b.nombre} maxLength={NOMBRE_MAX} onChange={(e) => actualiza({ nombre: e.target.value })} />
      </label>
      <label className="sfm-field">
        <span>Equipo</span>
        <select
          value={b.equipo}
          onChange={(e) => {
            const equipo = e.target.value as Equipo;
            actualiza(cargaTocada || !equipo ? { equipo } : { equipo, tipoCarga: CARGA_POR_EQUIPO[equipo] });
          }}
        >
          <option value="">Elige el equipo</option>
          {EQUIPOS.map((v) => (
            <option key={v} value={v}>{ETIQUETA_EQUIPO[v]}</option>
          ))}
        </select>
      </label>
      <label className="sfm-field">
        <span>Músculo principal</span>
        <select value={b.musculoPrimario} onChange={(e) => actualiza({ musculoPrimario: e.target.value as Musculo })}>
          <option value="">Elige el músculo</option>
          {MUSCULOS.map((v) => (
            <option key={v} value={v}>{ETIQUETA_MUSCULO[v]}</option>
          ))}
        </select>
      </label>
      <fieldset className="sfm-field">
        <legend>Otros músculos que trabaja</legend>
        <div className="sfm-check-grid">
        {MUSCULOS.filter((m) => m !== b.musculoPrimario).map((m) => (
          <label className="sfm-check" key={m}>
            <input
              type="checkbox"
              checked={b.secundarios.includes(m)}
              onChange={(e) =>
                actualiza({ secundarios: e.target.checked ? [...b.secundarios, m] : b.secundarios.filter((x) => x !== m) })
              }
            />
            {ETIQUETA_MUSCULO[m]}
          </label>
        ))}
        </div>
      </fieldset>
      <label className="sfm-field">
        <span>Se parece a…</span>
        <select value={b.parecidoA} onChange={(e) => actualiza({ parecidoA: e.target.value })}>
          <option value="">{editando ? "Sin cambios" : "Ninguno en particular"}</option>
          {ejercicios.filter((x) => x.id !== existente?.id).map((x) => (
            <option key={x.id} value={x.id}>{x.nombre}</option>
          ))}
        </select>
        <small className="sfm-hint">Así aparecerá como alternativa de ese ejercicio.</small>
      </label>
      <fieldset className="sfm-field">
        <legend>¿Cómo se anota el peso?</legend>
        {TIPOS_DE_CARGA.map((t) => (
          <label className="sfm-check" key={t}>
            <input
              type="radio"
              name="tipoCarga"
              checked={b.tipoCarga === t}
              onChange={() => {
                setCargaTocada(true);
                actualiza({ tipoCarga: t });
              }}
            />
            <span className="sfm-check-texto">
              <strong>{opcionCarga(t, b.equipo).titulo}</strong>
              <small className="sfm-hint">{opcionCarga(t, b.equipo).ejemplo}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <label className="sfm-field">
        <span>Salto mínimo entre pesos (lb)</span>
        <input inputMode="decimal" value={b.incremento} onChange={(e) => actualiza({ incremento: e.target.value })} />
      </label>
      {necesitaBase && (
        <label className="sfm-field">
          <span>Peso de la barra o del carro (lb)</span>
          <input inputMode="decimal" value={b.pesoBase} onChange={(e) => actualiza({ pesoBase: e.target.value })} />
        </label>
      )}
      <label className="sfm-field">
        <span>Cómo se hace</span>
        <textarea
          rows={3}
          maxLength={EXPLICACION_MAX}
          placeholder="Una o dos frases."
          value={b.explicacion}
          onChange={(e) => actualiza({ explicacion: e.target.value })}
        />
      </label>
      <label className="sfm-field sfm-campo-foto">
        <span>Foto de la máquina o del ejercicio</span>
        <small className="sfm-hint">También puede ser un GIF con el movimiento (hasta 5 MB).</small>
        {animacionActual ? (
          <span className="sfm-vista-animacion">
            <img className="sfm-exercise-thumb" src={animacionActual} alt="Animación elegida" />
            <span className="sfm-insignia-gif">Animación</span>
          </span>
        ) : (
          fotoActual && <img className="sfm-exercise-thumb" src={fotoActual} alt="Foto elegida" />
        )}
        {/* El botón nativo dice «no file selected» (y en el idioma del teléfono) aunque haya vista previa. */}
        <input className="solo-lectores" type="file" accept="image/*" onChange={(e) => void elegirFoto(e)} />
        <span className="sfm-elegir-foto" aria-hidden="true">{fotoActual ? "Cambiar foto" : "Elegir foto"}</span>
      </label>
      <button className="sfm-primary" type="submit" disabled={guardando}>
        {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Añadir a mi biblioteca"}
      </button>
      {volver ? (
        <button className="sfm-secondary" type="button" onClick={volver}>Volver</button>
      ) : (
        <button className="sfm-secondary" type="button" onClick={terminar}>Cancelar</button>
      )}
    </form>
  );
}
