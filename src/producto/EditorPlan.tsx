import { useState } from "react";
import type { Plan, Perfil } from "../../shared/v2/contratos";
import { Plan as ValidarPlan } from "../../shared/v2/contratos";
import { useBiblioteca } from "./contextoBiblioteca";
import type { SlotPlantilla } from "../dominio/tipos";
import { Hoja, Icono } from "./ui";
export function EditorPlan({
  plan,
  perfil,
  onChange,
}: {
  plan: Plan;
  perfil: Perfil;
  onChange: (p: Plan) => void;
}) {
  const { ejercicios, propios } = useBiblioteca();
  const [dia, setDia] = useState(0);
  const [editar, setEditar] = useState<number | null>(null);
  const [buscar, setBuscar] = useState("");
  const [anadir, setAnadir] = useState(false);
  const [sesiones, setSesiones] = useState(false);
  const d = plan.dias[Math.min(dia, plan.dias.length - 1)];
  function cambiar(slots: SlotPlantilla[]) {
    onChange({
      ...plan,
      revisado: false,
      dias: plan.dias.map((v) =>
        v.id === d.id
          ? { ...v, slots: slots.map((s, i) => ({ ...s, orden: i + 1 })) }
          : v,
      ),
    });
  }
  const item = editar === null ? null : d.slots[editar];
  const ejercicioEditado = ejercicios.find(e => e.id === item?.ejercicioId);
  const unidadPeso = ejercicioEditado?.tipoCarga === "porLado" ? "lb por lado" : "lb";
  const validacion = ValidarPlan.safeParse({
    ...plan,
    estado: "publicado",
    revisado: true,
  });
  return (
    <div className="sfm-editor" data-tour="editor-plan">
      <div className="sfm-segmentos" aria-label="Sesión del programa">
        {plan.dias.map((d, i) => (
          <button key={d.id} aria-pressed={i === dia} onClick={() => setDia(i)}>
            {d.nombre}
          </button>
        ))}
      </div>
      <button className="sfm-text-button" onClick={() => setSesiones(true)}>
        Organizar sesiones
      </button>
      <div className="sfm-section-heading">
        <h2>{d.nombre}</h2>
        <span>{d.slots.length}/8 ejercicios</span>
      </div>
      <label className="sfm-field sfm-field--compact">
        <span>Nombre de la sesión</span>
        <input
          value={d.nombre}
          maxLength={80}
          onChange={(e) =>
            onChange({
              ...plan,
              revisado: false,
              dias: plan.dias.map((v) =>
                v.id === d.id ? { ...v, nombre: e.target.value } : v,
              ),
            })
          }
        />
      </label>
      <div className="sfm-list">
        {d.slots.map((s, i) => {
          const e = ejercicios.find((e) => e.id === s.ejercicioId);
          return (
            <div className="sfm-plan-row" key={`${s.ejercicioId}-${i}`}>
              <button
                data-tour={i===0?"editar-ejercicio":undefined} data-tour-action="editar-ejercicio" className="sfm-row sfm-row--grow"
                onClick={() => setEditar(i)}
              >
                <span className="sfm-ordinal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* La misma foto que el cliente toca en su Hoy para ver el ejercicio. */}
                {e && <img className="sfm-exercise-thumb sfm-exercise-thumb--editor" src={e.imagen} alt="" loading="lazy" />}
                <span className="sfm-row-body">
                  <strong>{e?.nombre ?? "Variante pendiente"}</strong>
                  <small>
                    {s.seriesObjetivo} × {s.repMin}–{s.repMax} ·{" "}
                    {s.descansoSegundos / 60} min
                    {s.pesoSugeridoLb !== undefined && ` · ${s.pesoSugeridoLb} ${e?.tipoCarga === "porLado" ? "lb por lado" : "lb"} sugeridas`}
                  </small>
                  {perfil.ejerciciosEvitados.includes(s.ejercicioId) && (
                    <small className="sfm-alert-text">
                      Evitar según sus limitaciones
                    </small>
                  )}
                </span>
                <Icono nombre="flecha" size={16} />
              </button>
              <div className="sfm-order">
                <button
                  aria-label={`Subir ${e?.nombre}`}
                  disabled={i === 0}
                  onClick={() => {
                    const slots = [...d.slots];
                    [slots[i - 1], slots[i]] = [slots[i], slots[i - 1]];
                    cambiar(slots);
                  }}
                >
                  ↑
                </button>
                <button
                  aria-label={`Bajar ${e?.nombre}`}
                  disabled={i === d.slots.length - 1}
                  onClick={() => {
                    const slots = [...d.slots];
                    [slots[i + 1], slots[i]] = [slots[i], slots[i + 1]];
                    cambiar(slots);
                  }}
                >
                  ↓
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <button
        className="sfm-secondary"
        disabled={d.slots.length >= 8}
        onClick={() => {
          setBuscar("");
          setAnadir(true);
        }}
      >
        <Icono nombre="mas" /> Añadir ejercicio
      </button>
      <p className="sfm-hint">
        {validacion.success
          ? "Las sesiones tienen entre 5 y 8 ejercicios."
          : "Completa cada sesión con 5–8 ejercicios antes de publicar."}
      </p>
      {perfil.limitaciones && (
        <div className="sfm-callout">
          <span className="sfm-eyebrow">A tener en cuenta</span>
          <p>{perfil.limitaciones}</p>
        </div>
      )}
      {sesiones && (
        <Hoja titulo="Orden de las sesiones" cerrar={() => setSesiones(false)}>
          <p>
            El cliente seguirá esta rotación. La frecuencia indica cuántos días
            entrena por semana.
          </p>
          {plan.dias.map((v, i) => (
            <div className="sfm-plan-row" key={v.id}>
              <span className="sfm-row-body">
                <strong>{v.nombre}</strong>
                <small>{v.slots.length} ejercicios</small>
              </span>
              <div className="sfm-order">
                <button
                  aria-label={`Adelantar ${v.nombre}`}
                  disabled={i === 0}
                  onClick={() => {
                    const dias = [...plan.dias];
                    [dias[i - 1], dias[i]] = [dias[i], dias[i - 1]];
                    onChange({
                      ...plan,
                      revisado: false,
                      dias: dias.map((d, n) => ({ ...d, orden: n + 1 })),
                    });
                    setDia(0);
                  }}
                >
                  ↑
                </button>
                <button
                  aria-label={`Atrasar ${v.nombre}`}
                  disabled={i === plan.dias.length - 1}
                  onClick={() => {
                    const dias = [...plan.dias];
                    [dias[i + 1], dias[i]] = [dias[i], dias[i + 1]];
                    onChange({
                      ...plan,
                      revisado: false,
                      dias: dias.map((d, n) => ({ ...d, orden: n + 1 })),
                    });
                    setDia(0);
                  }}
                >
                  ↓
                </button>
              </div>
              <button
                className="sfm-text-button sfm-danger"
                aria-label={`Quitar ${v.nombre} del borrador`}
                disabled={plan.dias.length === 1}
                onClick={() => {
                  onChange({
                    ...plan,
                    revisado: false,
                    dias: plan.dias
                      .filter((d) => d.id !== v.id)
                      .map((d, n) => ({ ...d, orden: n + 1 })),
                  });
                  setDia(0);
                }}
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            className="sfm-secondary"
            disabled={plan.dias.length >= 7}
            onClick={() => {
              onChange({
                ...plan,
                revisado: false,
                dias: [
                  ...plan.dias,
                  {
                    id: crypto.randomUUID(),
                    participanteId: perfil.id,
                    nombre: `Sesión ${plan.dias.length + 1}`,
                    orden: plan.dias.length + 1,
                    slots: [],
                  },
                ],
              });
              setDia(plan.dias.length);
              setSesiones(false);
            }}
          >
            Añadir sesión
          </button>
          <button className="sfm-primary" onClick={() => setSesiones(false)}>
            Listo
          </button>
        </Hoja>
      )}
      {anadir && (
        <Hoja titulo="Añadir ejercicio" cerrar={() => setAnadir(false)}>
          <input
            className="sfm-search"
            placeholder="Buscar por nombre o equipo"
            aria-label="Buscar ejercicio"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          <div className="sfm-list">
            {ejercicios.filter((e) =>
              (e.nombre + " " + e.equipo)
                .toLowerCase()
                .includes(buscar.toLowerCase()),
            ).map((e) => (
              <button
                className="sfm-row"
                key={e.id}
                onClick={() => {
                  cambiar([
                    ...d.slots,
                    {
                      orden: d.slots.length + 1,
                      ejercicioId: e.id,
                      estimulo: "hipertrofia",
                      seriesObjetivo: 3,
                      repMin: 6,
                      repMax: 15,
                      descansoSegundos: 120,
                    },
                  ]);
                  setAnadir(false);
                }}
              >
                <img className="sfm-exercise-thumb sfm-exercise-thumb--editor" src={e.imagen} alt="" loading="lazy" />
                <span className="sfm-row-body">
                  <strong>{e.nombre}</strong>
                  <small>
                    {propios.has(e.id) && <span className="sfm-insignia-tuyo">Tuyo</span>}
                    {e.equipo}
                    {perfil.ejerciciosEvitados.includes(e.id)
                      ? " · Evitar según limitaciones"
                      : ""}
                  </small>
                </span>
                <Icono nombre="mas" />
              </button>
            ))}
          </div>
        </Hoja>
      )}
      {item && (
        <Hoja titulo="Prescripción" cerrar={() => setEditar(null)}>
          <h3>
            {ejercicios.find((e) => e.id === item.ejercicioId)?.nombre}
          </h3>
          <div className="sfm-fields-grid" data-tour="prescripcion">
            {(
              [
                ["seriesObjetivo", "Series", 1, 12],
                ["repMin", "Reps mínimas", 1, 100],
                ["repMax", "Reps máximas", 1, 100],
                ["descansoSegundos", "Descanso · segundos", 0, 1800],
              ] as const
            ).map(([k, label, min, max]) => (
              <label className="sfm-field" key={k}>
                <span>{label}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={min}
                  max={max}
                  data-tour={k === "descansoSegundos" ? "prescripcion-descanso" : undefined} value={item[k]}
                  onChange={(e) =>
                    cambiar(
                      d.slots.map((s, i) =>
                        i === editar
                          ? { ...s, [k]: Number(e.target.value) }
                          : s,
                      ),
                    )
                  }
                />
              </label>
            ))}
          </div>
          <label className="sfm-field">
            <span>Peso sugerido · {unidadPeso} (opcional)</span>
            <input type="number" inputMode="decimal" min={0} max={3000} step="any"
              value={item.pesoSugeridoLb ?? ""} placeholder="Sin peso sugerido"
              onChange={e => cambiar(d.slots.map((s, i) => i === editar
                ? { ...s, pesoSugeridoLb: e.target.value === "" ? undefined : Number(e.target.value) } : s))} />
          </label>
          <p className="sfm-hint">El Cliente recibirá este peso y podrá ajustarlo. Déjalo vacío para usar su historial.</p>
          <label className="sfm-field">
            <span>Estímulo</span>
            <select
              value={item.estimulo}
              onChange={(e) =>
                cambiar(
                  d.slots.map((s, i) =>
                    i === editar
                      ? {
                          ...s,
                          estimulo: e.target.value as SlotPlantilla["estimulo"],
                        }
                      : s,
                  ),
                )
              }
            >
              <option value="fuerza">Fuerza</option>
              <option value="hipertrofia">Hipertrofia</option>
              <option value="resistencia">Resistencia</option>
            </select>
          </label>
          <label className="sfm-field">
            <span>Progresión</span>
            <select
              value={item.progresionFijada ?? ""}
              onChange={(e) =>
                cambiar(
                  d.slots.map((s, i) =>
                    i === editar
                      ? {
                          ...s,
                          progresionFijada: (e.target.value ||
                            undefined) as SlotPlantilla["progresionFijada"],
                        }
                      : s,
                  ),
                )
              }
            >
              <option value="">Sugerencia del método</option>
              <option value="mantener">Mantener</option>
              <option value="subirReps">Subir repeticiones</option>
              <option value="subirCarga">Subir carga</option>
              <option value="revisarReducir">Revisar / reducir</option>
            </select>
          </label>
          <button data-tour="prescripcion-lista" data-tour-action="prescripcion-lista" className="sfm-primary" onClick={() => setEditar(null)}>
            Listo
          </button>
          <button
            className="sfm-text-button sfm-danger"
            onClick={() => {
              cambiar(d.slots.filter((_, i) => i !== editar));
              setEditar(null);
            }}
          >
            Quitar del borrador
          </button>
        </Hoja>
      )}
    </div>
  );
}
