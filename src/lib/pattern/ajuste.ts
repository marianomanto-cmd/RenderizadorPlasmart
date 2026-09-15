import { hayMetal } from './mascara.js'
import type { AjustePatron, Mascara } from './types.js'

/**
 * Los tres modos de ajuste son, los tres, una transformación lineal del punto
 * del paño al punto del dibujo, más un "repetir" opcional. Por eso se calcula
 * una sola vez por render y no una vez por píxel: adentro del bucle quedan dos
 * multiplicaciones y una suma.
 */
export interface TransformePatron {
  readonly escalaU: number
  readonly desplazU: number
  readonly escalaV: number
  readonly desplazV: number
  readonly repetir: boolean
  /**
   * Qué pedazo del dibujo se usa. Normalmente el dibujo entero (0 y 1), pero al
   * repetir se usa solo el interior, sin el marco macizo que trae cada modelo:
   * si se repitiera el marco, aparecería una grilla de líneas negras y el paño
   * parecería una pared de azulejos.
   */
  readonly mu0: number
  readonly muRango: number
  readonly mv0: number
  readonly mvRango: number
}

/** El rectángulo del dibujo que queda adentro del marco macizo. */
export interface Interior {
  readonly x0: number
  readonly x1: number
  readonly y0: number
  readonly y1: number
}

export const DIBUJO_ENTERO: Interior = { x0: 0, x1: 1, y0: 0, y1: 1 }

const frac = (x: number): number => x - Math.floor(x)

/**
 * Prepara la transformación.
 *
 * `propPano` es ancho dividido alto del paño REAL, en milímetros.
 * `propMascara` es lo mismo para el dibujo del catálogo.
 *
 * Las cuentas están hechas en unidades de "altos de paño": el paño mide
 * propPano de ancho por 1 de alto, y el dibujo mide propMascara por 1 antes de
 * escalarlo. Trabajar así saca los milímetros de la cuenta y deja solo formas,
 * que es de lo único que depende el ajuste.
 */
export function prepararTransforme(
  ajuste: AjustePatron,
  propPano: number,
  propMascara: number,
  interior: Interior = DIBUJO_ENTERO,
): TransformePatron {
  const P = propPano
  const M = propMascara
  const entero = { mu0: 0, muRango: 1, mv0: 0, mvRango: 1 }

  if (ajuste.modo === 'estirar') {
    // El dibujo se deforma hasta llenar el paño.
    return { escalaU: 1, desplazU: 0, escalaV: 1, desplazV: 0, repetir: false, ...entero }
  }

  if (ajuste.modo === 'recortar') {
    // Se agranda el dibujo, sin deformarlo, hasta que tape el paño entero, y se
    // centra. Siempre sobra dibujo por dos lados; eso es lo que se pierde.
    const escala = Math.max(P / M, 1)
    const W = M * escala
    const H = escala
    return {
      escalaU: P / W,
      desplazU: -(P - W) / (2 * W),
      escalaV: 1 / H,
      desplazV: -(1 - H) / (2 * H),
      repetir: false,
      ...entero,
    }
  }

  // mosaico: el dibujo mantiene su forma y se repite. `escala` dice qué
  // fracción del alto del paño ocupa una repetición. Se centra una repetición
  // en el medio del paño para que no quede media hoja pegada contra un borde.
  // Se repite SOLO el interior, así que la proporción que hay que respetar es
  // la del interior y no la del dibujo con su marco.
  const muRango = interior.x1 - interior.x0
  const mvRango = interior.y1 - interior.y0
  const Mint = M * (muRango / mvRango)

  const H = ajuste.escala
  const W = Mint * H
  return {
    escalaU: P / W,
    desplazU: 0.5 - P / (2 * W),
    escalaV: 1 / H,
    desplazV: 0.5 - 1 / (2 * H),
    repetir: true,
    mu0: interior.x0,
    muRango,
    mv0: interior.y0,
    mvRango,
  }
}

/**
 * El marco macizo del paño, en fracción de cada lado.
 *
 * Es una propiedad del paño y no del dibujo: son los 30 mm sin perforar que
 * llevan los paños por fijación y rigidez. Al repetir el dibujo se le saca el
 * marco a cada repetición y se pone este, uno solo, alrededor de todo.
 */
export interface Marco {
  readonly u: number
  readonly v: number
}

export const SIN_MARCO: Marco = { u: 0, v: 0 }

export function marcoDesdeMm(grosorMm: number, anchoMm: number, altoMm: number): Marco {
  return { u: grosorMm / anchoMm, v: grosorMm / altoMm }
}

export const enElMarco = (marco: Marco, u: number, v: number): boolean =>
  u < marco.u || u > 1 - marco.u || v < marco.v || v > 1 - marco.v

/** ¿Hay metal en este punto del paño? (u,v) en [0,1]. */
export function hayMetalEnPano(
  mascara: Mascara,
  t: TransformePatron,
  u: number,
  v: number,
): boolean {
  const mu0 = t.escalaU * u + t.desplazU
  const mv0 = t.escalaV * v + t.desplazV
  const mu = t.mu0 + (t.repetir ? frac(mu0) : mu0) * t.muRango
  const mv = t.mv0 + (t.repetir ? frac(mv0) : mv0) * t.mvRango
  return hayMetal(mascara, mu, mv)
}

/** La pregunta que hace el render en cada píxel: ¿acá hay metal? */
export function esMetal(
  mascara: Mascara,
  t: TransformePatron,
  marco: Marco,
  u: number,
  v: number,
): boolean {
  return enElMarco(marco, u, v) || hayMetalEnPano(mascara, t, u, v)
}

/**
 * Área libre de lo que REALMENTE se ve en el paño, que no siempre es la del
 * catálogo.
 *
 * Con `recortar` se ve solo un pedazo del dibujo, y ese pedazo puede tener más
 * o menos agujeros que el promedio. El número del catálogo describe el dibujo
 * entero; este describe este paño. Es el que va en pantalla.
 */
export function areaLibreVisible(
  mascara: Mascara,
  t: TransformePatron,
  marco: Marco = SIN_MARCO,
  muestras = 512,
): number {
  let agujeros = 0
  for (let iy = 0; iy < muestras; iy++) {
    const v = (iy + 0.5) / muestras
    for (let ix = 0; ix < muestras; ix++) {
      const u = (ix + 0.5) / muestras
      if (!esMetal(mascara, t, marco, u, v)) agujeros++
    }
  }
  return agujeros / (muestras * muestras)
}
