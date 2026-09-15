/**
 * Dibuja el mismo modelo con los tres modos de ajuste, usando el codigo real de
 * lib/pattern. Lo que se ve en la imagen es exactamente lo que va a hacer la
 * app, no una reimplementacion parecida.
 *
 *   npx tsx tools/muestra-modos.ts B.01 3
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { areaLibre, desempaquetarMascara } from '../src/lib/pattern/mascara.js'
import { areaLibreVisible, esMetal, marcoDesdeMm, prepararTransforme } from '../src/lib/pattern/ajuste.js'
import { MODOS_AJUSTE } from '../src/lib/pattern/types.js'

interface Fila {
  id: string
  mascara: string
  mascaraAncho: number
  mascaraAlto: number
  areaLibre: number
  interior: { x0: number; x1: number; y0: number; y1: number }
}

const idModelo = process.argv[2] ?? 'B.01'
const propPano = Number(process.argv[3] ?? 3)
const ANCHO = 960
const ALTO = Math.round(ANCHO / propPano)

const indice: Fila[] = JSON.parse(readFileSync('public/modelos/indice.json', 'utf8'))
const fila = indice.find((m) => m.id === idModelo)
if (!fila) throw new Error(`no existe el modelo ${idModelo}`)

const bits = new Uint8Array(readFileSync(`public/modelos/${fila.mascara}`))
const mascara = desempaquetarMascara(bits, fila.mascaraAncho, fila.mascaraAlto)
const propMascara = fila.mascaraAncho / fila.mascaraAlto

console.log(`${fila.id}  dibujo ${propMascara.toFixed(3)}  pano ${propPano}  area libre del catalogo ${(areaLibre(mascara) * 100).toFixed(1)}%`)

for (const modo of MODOS_AJUSTE) {
  const ajuste = { modo, escala: modo === 'mosaico' ? 0.5 : 1 }
  const t = prepararTransforme(ajuste, propPano, propMascara, fila.interior)
  // Paño de 2,40 x 0,80 m con 30 mm de marco macizo, como se decidio.
  const marco = marcoDesdeMm(30, 2400, 2400 / propPano)

  const px = new Uint8Array(ANCHO * ALTO)
  for (let y = 0; y < ALTO; y++) {
    for (let x = 0; x < ANCHO; x++) {
      // 3x3 de supermuestreo, que es lo que el brief pide al soltar el dedo
      let metal = 0
      for (let sy = 0; sy < 3; sy++) {
        for (let sx = 0; sx < 3; sx++) {
          const u = (x + (sx + 0.5) / 3) / ANCHO
          const v = (y + (sy + 0.5) / 3) / ALTO
          if (esMetal(mascara, t, marco, u, v)) metal++
        }
      }
      px[y * ANCHO + x] = Math.round(255 - (metal / 9) * 255)
    }
  }

  const cabecera = Buffer.from(`P5\n${ANCHO} ${ALTO}\n255\n`, 'ascii')
  writeFileSync(`/tmp/modo-${modo}.pgm`, Buffer.concat([cabecera, Buffer.from(px)]))
  const visible = areaLibreVisible(mascara, t, marco, 400)
  console.log(`  ${modo.padEnd(9)} area libre que se ve: ${(visible * 100).toFixed(1)}%`)
}
