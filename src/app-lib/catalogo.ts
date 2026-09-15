/**
 * Carga del catálogo.
 *
 * Las máscaras viajan en binario crudo de un bit por píxel, así que cargarlas no
 * depende de ningún decodificador de imágenes: es un fetch y desempaquetar. Eso
 * es lo que después va a permitir que el catálogo entero viva en el teléfono y
 * la app ande sin señal.
 */
import { desempaquetarMascara } from '../lib/pattern/mascara.js'
import { construirPiramide, type Piramide } from '../lib/pattern/piramide.js'
import type { Linea } from '../lib/pattern/types.js'

export interface ModeloCatalogo {
  readonly id: string
  readonly linea: Linea
  readonly mascara: string
  readonly mascaraAncho: number
  readonly mascaraAlto: number
  readonly areaLibre: number
  readonly interior: { readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number }
}

const BASE = '/modelos'
let indice: ModeloCatalogo[] | null = null
const piramides = new Map<string, Piramide>()

export async function cargarIndice(): Promise<ModeloCatalogo[]> {
  if (indice) return indice
  const r = await fetch(`${BASE}/indice.json`)
  if (!r.ok) throw new Error(`no se pudo cargar el catálogo (${r.status})`)
  indice = (await r.json()) as ModeloCatalogo[]
  return indice
}

/** Trae la máscara y arma su pirámide. Se hace una vez por modelo y queda en memoria. */
export async function cargarPiramide(m: ModeloCatalogo): Promise<Piramide> {
  const guardada = piramides.get(m.id)
  if (guardada) return guardada

  const r = await fetch(`${BASE}/${m.mascara}`)
  if (!r.ok) throw new Error(`no se pudo cargar el modelo ${m.id} (${r.status})`)
  const bits = new Uint8Array(await r.arrayBuffer())
  const piramide = construirPiramide(desempaquetarMascara(bits, m.mascaraAncho, m.mascaraAlto))
  piramides.set(m.id, piramide)
  return piramide
}

export const LINEAS: readonly Linea[] = ['botanicos', 'geometricos', 'abstractos', 'ornamentales']
