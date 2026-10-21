/**
 * Genera el cuaderno de descripciones para la biblioteca ilustrada.
 *
 * Agrupa los ejercicios activos por familia de movimiento, porque dentro de una
 * familia el gesto es el mismo y sólo cambia el equipo: así la descripción se
 * escribe una vez por familia y no 286 veces.
 *
 *   node scripts/cuaderno-animaciones.mjs <export.json> > docs/.../CUADERNO.md
 *
 * El JSON de entrada es la salida de:
 *   wrangler d1 execute santiago-acceso --remote --json --command "SELECT ..."
 */
import fs from 'node:fs'

/**
 * Lote piloto: cinco familias y cinco equipos distintos, para que ninguno se
 * parezca a otro, más el pendulum squat como caso duro a propósito.
 * Si los seis salen coherentes entre sí, el resto es repetir.
 */
const PILOTO = new Set([
  'M02-107', // sentadilla · barra libre
  'M02-002', // press-pecho · mancuernas
  'M02-074', // jalón vertical · cable, y además unilateral
  'M02-223', // curl de bíceps · máquina de pin
  'M02-097', // remo horizontal · máquina de discos
  'M02-126', // sentadilla · pendulum squat: sin fuente libre, el caso duro
])

const EQUIPO = {
  cable: 'Cable', mancuernas: 'Mancuernas', pesoCorporal: 'Peso corporal',
  maquinaTradicional: 'Máquina de pin', barraLibre: 'Barra libre',
  maquinaDiscos: 'Máquina de discos', smith: 'Smith', convergente: 'Convergente',
}

const filas = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))[0].results
const familias = new Map()
for (const f of filas) {
  if (!familias.has(f.movimiento)) familias.set(f.movimiento, [])
  familias.get(f.movimiento).push(f)
}
const ordenadas = [...familias.entries()].sort((a, b) => b[1].length - a[1].length)

const L = []
L.push('# Cuaderno de descripciones — biblioteca ilustrada')
L.push('')
L.push(`Generado por \`scripts/cuaderno-animaciones.mjs\` desde la biblioteca real.`)
L.push(`**${filas.length} ejercicios activos** repartidos en **${ordenadas.length} familias**.`)
L.push('')
L.push('## Cómo se rellena, y por qué así')
L.push('')
L.push('Dentro de una familia el gesto es el mismo y lo único que cambia es el equipo.')
L.push('Por eso **la descripción se escribe una vez por familia**, no una por ejercicio:')
L.push('son 31 descripciones, no 286. Por ejercicio sólo hace falta una línea corta')
L.push('cuando algo lo distingue de sus hermanos (inclinación, agarre, unilateral,')
L.push('una máquina concreta).')
L.push('')
L.push('Las familias van **de mayor a menor**: rellenar las cinco primeras ya cubre')
L.push(`**${ordenadas.slice(0, 5).reduce((s, [, v]) => s + v.length, 0)} de los ${filas.length}** ejercicios.`)
L.push('')
L.push('Leyenda: 🔴 sin fuente libre, hay que grabarlo o ilustrarlo desde cero ·')
L.push('🟢 ya tiene animación fotográfica hoy, sirve de referencia para describirlo ·')
L.push('⭐ lote piloto.')
L.push('')
L.push('---')
L.push('')

for (const [familia, lista] of ordenadas) {
  const equipos = [...new Set(lista.map(e => EQUIPO[e.equipo] ?? e.equipo))]
  L.push(`## ${familia} · ${lista.length} ejercicio${lista.length > 1 ? 's' : ''}`)
  L.push('')
  L.push(`Equipo presente: ${equipos.join(' · ')}`)
  L.push('')
  L.push('| | A rellenar una sola vez para toda la familia |')
  L.push('|---|---|')
  L.push('| **Movimiento** | |')
  L.push('| **Posición inicial** | |')
  L.push('| **Posición final** | |')
  L.push('| **Punto fijo** | |')
  L.push('')
  L.push('| | Ejercicio | Equipo | Músculo | Qué lo distingue *(a rellenar)* |')
  L.push('|---|---|---|---|---|')
  for (const e of lista) {
    const marca = (PILOTO.has(e.referencia_catalogo) ? '⭐' : '') + (e.tiene_gif ? '🟢' : '🔴')
    L.push(`| ${marca} | ${e.nombre} | ${EQUIPO[e.equipo] ?? e.equipo} | ${e.musculo_primario} | |`)
  }
  L.push('')
}

process.stdout.write(L.join('\n') + '\n')
