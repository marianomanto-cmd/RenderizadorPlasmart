import { hayMetal } from './mascara.js'
import type { Mascara } from './types.js'

/**
 * Cómo se lleva un punto de la superficie a un punto del dibujo.
 *
 * Antes esto tenía tres "modos" —estirar, repetir, recortar— como si el tamaño
 * del motivo fuera una decisión de diseño. No lo es: **lo fija la chapa**. Una
 * superficie se cubre con N paños de medida comercial y cada paño lleva el
 * dibujo completo, escalado a esa chapa. Si la pared mide cuatro metros se ven
 * cuatro paños, cada uno del tamaño que realmente va a tener.
 *
 * Como el despiece reparte la superficie en partes iguales, la cantidad de
 * paños es entera, así que la transformación es una multiplicación por un
 * entero y un `frac`. Nunca queda medio motivo cortado contra un borde.
 */
export interface TransformePatron {
  readonly escalaU: number
  readonly desplazU: number
  readonly escalaV: number
  readonly desplazV: number
  readonly repetir: boolean
  readonly mu0: number
  readonly muRango: number
  readonly mv0: number
  readonly mvRango: number
}

const frac = (x: number): number => x - Math.floor(x)

/**
 * La transformación de un despiece: tantas repeticiones del dibujo como paños
 * haya, a lo ancho y a lo alto.
 *
 * Se usa el dibujo ENTERO, marco incluido. El marco dibujado de cada modelo no
 * es un estorbo a sacar: es el borde macizo de esa chapa, y la línea que se ve
 * entre repetición y repetición es la junta entre dos paños. En las obras de
 * Plasmart esa junta se ve, y tiene que verse en el render.
 */
export function prepararTransformeDespiece(columnas: number, filas: number): TransformePatron {
  return {
    escalaU: Math.max(1, columnas),
    desplazU: 0,
    escalaV: Math.max(1, filas),
    desplazV: 0,
    repetir: true,
    mu0: 0,
    muRango: 1,
    mv0: 0,
    mvRango: 1,
  }
}

/**
 * El borde macizo sin perforar, en fracción de cada lado DEL PAÑO.
 *
 * Es de cada paño y no del conjunto: cada chapa lleva su propio borde por
 * fijación y rigidez. Son los 30 mm que se acordaron.
 */
export interface Marco {
  readonly u: number
  readonly v: number
}

export const SIN_MARCO: Marco = { u: 0, v: 0 }

/** Ojo: se mide contra el PAÑO, no contra la superficie entera. */
export function marcoDesdeMm(grosorMm: number, panoAnchoMm: number, panoAltoMm: number): Marco {
  return {
    u: Math.min(0.49, grosorMm / Math.max(1, panoAnchoMm)),
    v: Math.min(0.49, grosorMm / Math.max(1, panoAltoMm)),
  }
}

/** Posición dentro del paño que le toca a este punto de la superficie. */
export function dentroDelPatron(t: TransformePatron, u: number, v: number): { mu: number; mv: number } {
  const a = t.escalaU * u + t.desplazU
  const b = t.escalaV * v + t.desplazV
  return { mu: t.repetir ? frac(a) : a, mv: t.repetir ? frac(b) : b }
}

/** ¿Hay metal en este punto de la superficie? (u,v) en [0,1]. */
export function hayMetalEnPano(
  mascara: Mascara,
  t: TransformePatron,
  u: number,
  v: number,
): boolean {
  const { mu, mv } = dentroDelPatron(t, u, v)
  return hayMetal(mascara, t.mu0 + mu * t.muRango, t.mv0 + mv * t.mvRango)
}

/** La pregunta que hace el render en cada píxel: ¿acá hay metal? */
export function esMetal(
  mascara: Mascara,
  t: TransformePatron,
  marco: Marco,
  u: number,
  v: number,
): boolean {
  const { mu, mv } = dentroDelPatron(t, u, v)
  if (mu < marco.u || mu > 1 - marco.u || mv < marco.v || mv > 1 - marco.v) return true
  return hayMetal(mascara, t.mu0 + mu * t.muRango, t.mv0 + mv * t.mvRango)
}

/**
 * Área libre de lo que REALMENTE se ve.
 *
 * No es la del catálogo: el catálogo describe el dibujo completo sobre una
 * chapa entera, y acá los paños pueden estar recortados y llevar su marco.
 * Este es el número que va en pantalla.
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
