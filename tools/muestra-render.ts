/**
 * Renderiza un modelo sobre una fachada sintetica, con el codigo real.
 * Mide tambien cuanto tarda, que es la pregunta de rendimiento del brief.
 *
 *   npx tsx tools/muestra-render.ts B.01
 */
import { readFileSync, writeFileSync } from 'node:fs'
import type { Quad } from '../src/lib/geometry/types.js'
import { areaLibreVisible, marcoDesdeMm, prepararTransforme } from '../src/lib/pattern/ajuste.js'
import { desempaquetarMascara } from '../src/lib/pattern/mascara.js'
import { construirPiramide } from '../src/lib/pattern/piramide.js'
import { componer, renderizarPano } from '../src/lib/render/render.js'
import { COLOR_MATERIAL, type Imagen } from '../src/lib/render/types.js'

const W = 1200
const H = 800
const id = process.argv[2] ?? 'B.01'

interface Fila {
  id: string; mascara: string; mascaraAncho: number; mascaraAlto: number
  interior: { x0: number; x1: number; y0: number; y1: number }
}
const indice: Fila[] = JSON.parse(readFileSync('public/modelos/indice.json', 'utf8'))
const fila = indice.find((m) => m.id === id)!
const mascara = desempaquetarMascara(
  new Uint8Array(readFileSync(`public/modelos/${fila.mascara}`)),
  fila.mascaraAncho, fila.mascaraAlto,
)
const piramide = construirPiramide(mascara)

/** Fachada de mentira: pared clara con una abertura oscura y algo de textura. */
function fachada(): Imagen {
  const datos = new Uint8ClampedArray(W * H * 4)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * H === 0 ? 0 : y * W + x) * 4
      const cielo = y < H * 0.18
      const ruido = ((x * 7919 + y * 104729) % 23) - 11
      let r: number, g: number, b: number
      if (cielo) { r = 150; g = 185; b = 215 }
      else if (y > H * 0.82) { r = 120; g = 118; b = 112 }   // vereda
      else { r = 196 + ruido; g = 192 + ruido; b = 184 + ruido } // pared
      datos[i] = r; datos[i + 1] = g; datos[i + 2] = b; datos[i + 3] = 255
    }
  }
  // La abertura donde va el pano: un vidrio con reflejo de cielo arriba y
  // interior oscuro abajo. Hace falta contraste de verdad contra el color de la
  // chapa, si no la prueba no prueba nada.
  for (let y = Math.round(H * 0.26); y < H * 0.8; y++) {
    const f = (y - H * 0.26) / (H * 0.54)
    for (let x = Math.round(W * 0.14); x < W * 0.74; x++) {
      const i = (y * W + x) * 4
      datos[i] = Math.round(150 - 110 * f)
      datos[i + 1] = Math.round(178 - 126 * f)
      datos[i + 2] = Math.round(198 - 130 * f)
    }
  }
  return { ancho: W, alto: H, datos }
}

// Pano 2,40 x 1,60 m, casi de frente con una fuga leve a la derecha:
// es como salen las fotos de verdad.
const quad: Quad = [
  { x: 0.14, y: 0.27 }, { x: 0.735, y: 0.295 },
  { x: 0.73, y: 0.785 }, { x: 0.145, y: 0.795 },
]
const ANCHO_MM = 2400
const ALTO_MM = 1600

const propPano = ANCHO_MM / ALTO_MM
const propMascara = fila.mascaraAncho / fila.mascaraAlto
const marco = marcoDesdeMm(30, ANCHO_MM, ALTO_MM)

for (const modo of ['mosaico', 'recortar'] as const) {
  const t = prepararTransforme({ modo, escala: 0.5 }, propPano, propMascara, fila.interior)
  const areaMetal = 1 - areaLibreVisible(mascara, t, marco, 400)

  for (const [etiqueta, calidad] of [['arrastrando', 1], ['soltado', 3]] as const) {
    const base = { anchoFoto: W, altoFoto: H, quad, piramide, transforme: t, marco,
                   color: COLOR_MATERIAL.galvanizado, areaMetal, calidad }
    const t0 = performance.now()
    const r = renderizarPano(base)
    const ms = performance.now() - t0
    if (!r.ok) throw new Error(r.error.kind)

    const salida = componer(fachada(), r.value)
    const cab = Buffer.from(`P6\n${W} ${H}\n255\n`, 'ascii')
    const rgb = Buffer.alloc(W * H * 3)
    for (let p = 0; p < W * H; p++) {
      rgb[p * 3] = salida.datos[p * 4]!
      rgb[p * 3 + 1] = salida.datos[p * 4 + 1]!
      rgb[p * 3 + 2] = salida.datos[p * 4 + 2]!
    }
    writeFileSync(`/tmp/render-${modo}-${etiqueta}.ppm`, Buffer.concat([cab, rgb]))
    console.log(`  ${modo.padEnd(9)} ${etiqueta.padEnd(12)} ${ms.toFixed(0).padStart(4)} ms   ` +
                `capa ${r.value.ancho}x${r.value.alto}   area metal ${(areaMetal * 100).toFixed(1)}%`)
  }
}
