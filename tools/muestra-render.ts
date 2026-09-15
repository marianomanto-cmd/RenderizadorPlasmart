/**
 * Renderiza un modelo sobre una fachada sintetica, con el codigo real, y
 * muestra el despiece: con cuantos panos de medida comercial se cubre.
 *
 *   npx tsx tools/muestra-render.ts B.01 350 200
 */
import { readFileSync, writeFileSync } from 'node:fs'
import type { Quad } from '../src/lib/geometry/types.js'
import { FORMATOS, despiezar, resumen, resumenMaterial } from '../src/lib/layout/index.js'
import {
  areaLibreVisible,
  marcoDesdeMm,
  prepararTransformeDespiece,
} from '../src/lib/pattern/ajuste.js'
import { desempaquetarMascara } from '../src/lib/pattern/mascara.js'
import { construirPiramide } from '../src/lib/pattern/piramide.js'
import { componer, renderizarPano } from '../src/lib/render/render.js'
import { COLOR_MATERIAL, type Imagen } from '../src/lib/render/types.js'
import { desdeCm } from '../src/lib/units/index.js'

const W = 1400
const H = 900
const id = process.argv[2] ?? 'B.01'
const ANCHO = desdeCm(Number(process.argv[3] ?? 350))
const ALTO = desdeCm(Number(process.argv[4] ?? 200))

interface Fila {
  id: string; mascara: string; mascaraAncho: number; mascaraAlto: number
}
const indice: Fila[] = JSON.parse(readFileSync('public/modelos/indice.json', 'utf8'))
const fila = indice.find((m) => m.id === id)!
const mascara = desempaquetarMascara(
  new Uint8Array(readFileSync(`public/modelos/${fila.mascara}`)),
  fila.mascaraAncho, fila.mascaraAlto,
)
const piramide = construirPiramide(mascara)
const propModelo = fila.mascaraAncho / fila.mascaraAlto

/** Pared clara con una abertura oscura. Hace falta contraste de verdad. */
function fachada(): Imagen {
  const datos = new Uint8ClampedArray(W * H * 4)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      const ruido = ((x * 7919 + y * 104729) % 23) - 11
      let r: number, g: number, b: number
      if (y < H * 0.16) { r = 150; g = 185; b = 215 }
      else if (y > H * 0.86) { r = 120; g = 118; b = 112 }
      else if (y > H * 0.24 && y < H * 0.82 && x > W * 0.08 && x < W * 0.93) {
        const f = (y - H * 0.24) / (H * 0.58)
        r = Math.round(150 - 112 * f); g = Math.round(178 - 128 * f); b = Math.round(198 - 132 * f)
      } else { r = 196 + ruido; g = 192 + ruido; b = 184 + ruido }
      datos[i] = r; datos[i + 1] = g; datos[i + 2] = b; datos[i + 3] = 255
    }
  }
  return { ancho: W, alto: H, datos }
}

// Casi de frente con una fuga leve, como salen las fotos de verdad.
const quad: Quad = [
  { x: 0.08, y: 0.245 }, { x: 0.928, y: 0.262 },
  { x: 0.925, y: 0.815 }, { x: 0.083, y: 0.822 },
]

console.log(`${id}  superficie ${ANCHO / 10} × ${ALTO / 10} cm`)
for (const chapa of FORMATOS) {
  const d = despiezar(ANCHO, ALTO, chapa, propModelo)
  const t = prepararTransformeDespiece(d.columnas, d.filas)
  const marco = marcoDesdeMm(30, d.panoAncho, d.panoAlto)
  const areaMetal = 1 - areaLibreVisible(mascara, t, marco, 300)

  const r = renderizarPano({
    anchoFoto: W, altoFoto: H, quad, piramide, transforme: t, marco,
    color: COLOR_MATERIAL.galvanizado, areaMetal, calidad: 3,
  })
  if (!r.ok) throw new Error(r.error.kind)

  const salida = componer(fachada(), r.value)
  const rgb = Buffer.alloc(W * H * 3)
  for (let p = 0; p < W * H; p++) {
    rgb[p * 3] = salida.datos[p * 4]!
    rgb[p * 3 + 1] = salida.datos[p * 4 + 1]!
    rgb[p * 3 + 2] = salida.datos[p * 4 + 2]!
  }
  writeFileSync(
    `/tmp/despiece-${chapa.ancho}.ppm`,
    Buffer.concat([Buffer.from(`P6\n${W} ${H}\n255\n`, 'ascii'), rgb]),
  )
  console.log(
    `  chapa ${chapa.nombre}:  ${resumen(d)}  ·  ${resumenMaterial(d)}  ·  ` +
    `${d.columnas}×${d.filas}  ·  area libre ${((1 - areaMetal) * 100).toFixed(1)}%  ·  ` +
    `desperdicio ${(d.desperdicio * 100).toFixed(1)}%`,
  )
}
