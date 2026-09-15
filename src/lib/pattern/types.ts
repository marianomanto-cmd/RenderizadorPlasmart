/**
 * Tipos del patrón. Puro: no importa React, ni Next, ni el DOM.
 *
 * El catálogo de Plasmart no es chapa perforada: son 63 modelos de corte
 * decorativo, dibujos con nombre propio (B.01 son hojas, G.02 es un laberinto).
 * Así que acá no se GENERA nada a partir de un paso y una abertura; se CARGA el
 * dibujo del modelo y se responde, para cada punto del paño, si ahí hay metal o
 * hay aire.
 */

/**
 * El dibujo de un modelo, ya rasterizado a blanco y negro.
 *
 * Se rasteriza una sola vez, fuera de la app, porque los 63 modelos no cambian
 * nunca. La misma máscara sirve para cuatro cosas distintas: el render la
 * consulta por píxel (un módulo y un índice, sin geometría), el área libre es
 * contarla, el color del campo lejano es su promedio, y en la fase 2 es contra
 * ella que se mide si el motor de imagen respetó el dibujo.
 *
 * `datos` tiene un byte por píxel: 1 es metal, 0 es agujero.
 */
export interface Mascara {
  readonly ancho: number
  readonly alto: number
  readonly datos: Uint8Array
}

/** Una línea del catálogo. */
export type Linea = 'botanicos' | 'ornamentales' | 'geometricos' | 'abstractos'

export const NOMBRE_LINEA: Record<Linea, string> = {
  botanicos: 'Botánicos',
  ornamentales: 'Ornamentales',
  geometricos: 'Geométricos',
  abstractos: 'Abstractos',
}

/** Una entrada del catálogo, tal como sale del PDF oficial. */
export interface Modelo {
  readonly id: string
  readonly linea: Linea
  readonly mascara: string
  readonly mascaraAncho: number
  readonly mascaraAlto: number
  /** Medido una vez sobre el dibujo completo, no estimado con una fórmula. */
  readonly areaLibre: number
}
