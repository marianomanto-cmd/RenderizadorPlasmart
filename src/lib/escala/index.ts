/**
 * Referencia de escala: el vendedor marca una línea sobre la foto y dice cuánto
 * mide. De ahí sale cuántos píxeles de la foto son un metro, y con eso la app
 * calcula sola las medidas de cada paño en vez de que haya que tipearlas.
 *
 * Se define ANTES de marcar ningún paño, así que es una escala global de la
 * foto. Vale la pena decir en voz alta qué supone eso: en una foto con
 * perspectiva, un metro cerca de la cámara son muchos más píxeles que un metro
 * contra el fondo, así que este número es correcto A LA DISTANCIA donde se
 * trazó la línea y se va desviando con la profundidad.
 *
 * Por eso la instrucción en pantalla no es un adorno: la línea va sobre la
 * misma pared donde van a ir los paños. Cumpliendo eso el error es chico, y las
 * tres fotos de referencia que tenemos están casi de frente, que es el caso
 * donde mejor funciona. Todo esto es estimativo y la medición formal viene
 * después.
 */
import type { Point, Quad } from '../geometry/types.js'
import { type Result, err, ok } from '../result.js'
import { type Mm, desdeM, mm } from '../units/index.js'

/** Los dos extremos en coordenadas normalizadas de la foto, y cuánto mide. */
export interface Referencia {
  readonly a: Point
  readonly b: Point
  readonly metros: number
}

export type ErrorEscala =
  | { readonly kind: 'linea-muy-corta' }
  | { readonly kind: 'medida-invalida' }

/** Mínimo de píxeles de largo para que la línea sirva de referencia. */
const MINIMO_PX = 24

export function mensajeDeErrorEscala(e: ErrorEscala): string {
  switch (e.kind) {
    case 'linea-muy-corta':
      return 'La línea quedó muy corta. Marcá un tramo más largo para que la medida sea confiable.'
    case 'medida-invalida':
      return 'Poné cuánto mide esa línea, en metros.'
  }
}

/** Largo de la línea en píxeles reales de la foto. */
export function largoEnPixeles(ref: Referencia, anchoFoto: number, altoFoto: number): number {
  return Math.hypot((ref.b.x - ref.a.x) * anchoFoto, (ref.b.y - ref.a.y) * altoFoto)
}

/** Cuántos píxeles de la foto son un metro. */
export function pixelesPorMetro(
  ref: Referencia,
  anchoFoto: number,
  altoFoto: number,
): Result<number, ErrorEscala> {
  if (!Number.isFinite(ref.metros) || ref.metros <= 0) {
    return err({ kind: 'medida-invalida' })
  }
  const largo = largoEnPixeles(ref, anchoFoto, altoFoto)
  if (!Number.isFinite(largo) || largo < MINIMO_PX) {
    return err({ kind: 'linea-muy-corta' })
  }
  return ok(largo / ref.metros)
}

/**
 * Medidas del cuadrilátero a partir de la escala.
 *
 * Cada lado se toma como el promedio de los dos opuestos: en una foto casi de
 * frente los dos son casi iguales, y en una con algo de fuga el promedio es la
 * mejor estimación de un solo número. Las esquinas vienen normalizadas, así que
 * hay que devolverles la forma multiplicando por el tamaño de la foto.
 */
export function medirQuad(
  quad: Quad,
  pxPorMetro: number,
  anchoFoto: number,
  altoFoto: number,
): { readonly ancho: Mm; readonly alto: Mm } {
  const largo = (p: Point, q: Point) =>
    Math.hypot((q.x - p.x) * anchoFoto, (q.y - p.y) * altoFoto)

  const anchoPx = (largo(quad[0], quad[1]) + largo(quad[3], quad[2])) / 2
  const altoPx = (largo(quad[0], quad[3]) + largo(quad[1], quad[2])) / 2

  if (!(pxPorMetro > 0)) return { ancho: mm(0), alto: mm(0) }
  return { ancho: desdeM(anchoPx / pxPorMetro), alto: desdeM(altoPx / pxPorMetro) }
}
