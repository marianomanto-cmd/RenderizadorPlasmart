/**
 * Unidades.
 *
 * Regla del proyecto: adentro todo es milímetro entero. El centímetro y el
 * metro existen solo en la pantalla. La mitad de los bugs de este dominio son
 * conversiones silenciosas, así que el milímetro lleva marca de tipo: un número
 * suelto no entra donde se espera un Mm sin pasar por una conversión explícita.
 *
 * El vendedor carga en CENTÍMETROS. No es un capricho: es la unidad que
 * Plasmart ya le pide al cliente por WhatsApp ("envianos fotos y medidas en
 * centímetros"), así que la app habla el mismo idioma que el negocio.
 */

declare const marcaMm: unique symbol

/** Milímetros. Unidad interna del proyecto. */
export type Mm = number & { readonly [marcaMm]: true }

/** Construye un Mm a partir de un número que ya está en milímetros. */
export const mm = (valor: number): Mm => valor as Mm

export const desdeCm = (cm: number): Mm => mm(cm * 10)
export const desdeM = (m: number): Mm => mm(m * 1000)

export const aCm = (valor: Mm): number => valor / 10
export const aM = (valor: Mm): number => valor / 1000

/** Redondea a milímetro entero, que es como se corta y como se cotiza. */
export const redondear = (valor: Mm): Mm => mm(Math.round(valor))

/** Superficie en metros cuadrados a partir de dos medidas en milímetros. */
export const superficieM2 = (ancho: Mm, alto: Mm): number => aM(ancho) * aM(alto)

/**
 * Materiales que corta Plasmart, según el catálogo: acero, acero inoxidable y
 * chapa galvanizada, de 1,25 mm a 25,4 mm. El aluminio aparecía en el brief
 * pero no en el catálogo; si lo hacen, se agrega una línea acá.
 */
export type Material = 'acero' | 'inoxidable' | 'galvanizado'

export const MATERIALES: readonly Material[] = ['acero', 'inoxidable', 'galvanizado']

/** kg/m³ */
export const DENSIDAD: Record<Material, number> = {
  acero: 7850,
  inoxidable: 8000,
  galvanizado: 7850,
}

export const NOMBRE_MATERIAL: Record<Material, string> = {
  acero: 'Acero',
  inoxidable: 'Acero inoxidable',
  galvanizado: 'Chapa galvanizada',
}

/** Espesores que maneja el taller, en milímetros. */
export const ESPESOR_MIN: Mm = mm(1.25)
export const ESPESOR_MAX: Mm = mm(25.4)

/** Largo máximo de plegado. Más que esto no sale de una sola pieza. */
export const LARGO_MAX_PLEGADO: Mm = mm(3000)
