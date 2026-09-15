import type { Quad } from '../geometry/types.js'
import type { Piramide } from '../pattern/piramide.js'
import type { Marco, TransformePatron } from '../pattern/ajuste.js'

export interface RGB {
  readonly r: number
  readonly g: number
  readonly b: number
}

/** Colores naturales de cada material, que es lo único que se vende. */
export const COLOR_MATERIAL = {
  acero: { r: 58, g: 61, b: 66 },
  galvanizado: { r: 154, g: 160, b: 166 },
  inoxidable: { r: 184, g: 189, b: 194 },
} as const

/**
 * El paño ya dibujado, en RGBA, recortado a su propia caja.
 *
 * No devuelve la foto entera a propósito. Mientras el dedo arrastra, la foto no
 * cambia: se dibuja una vez abajo y solo se recalcula esta capa, que ocupa una
 * fracción de la pantalla. Devolver la foto completa en cada cuadro sería
 * repintar millones de píxeles que no cambiaron.
 *
 * El alfa es la cobertura de metal: 255 es chapa maciza, 0 es agujero y por ahí
 * se ve la foto de atrás. Eso es lo que hace que una celosía delante de un
 * vidrio deje ver el vidrio.
 */
export interface CapaPano {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
  readonly datos: Uint8ClampedArray
}

export interface Imagen {
  readonly ancho: number
  readonly alto: number
  readonly datos: Uint8ClampedArray
}

export interface EspecRender {
  readonly anchoFoto: number
  readonly altoFoto: number
  /** Las cuatro esquinas, normalizadas [0,1] sobre la foto. */
  readonly quad: Quad
  readonly piramide: Piramide
  readonly transforme: TransformePatron
  readonly marco: Marco
  readonly color: RGB
  /**
   * Fracción del paño que es metal. Ya no se usa para dibujar (de eso se
   * encarga la pirámide) pero se deja en la espec porque es el número que va en
   * pantalla, y tenerlo acá al lado hace evidente que el render y el
   * presupuesto tienen que coincidir. Hay un test que lo comprueba.
   */
  readonly areaMetal: number
  /**
   * Muestras por eje. 1 mientras el dedo arrastra, 3 al soltar.
   *
   * Solo sirve para afinar el BORDE del paño. El detalle del dibujo ya no
   * depende de esto: lo resuelve la pirámide, que lee el nivel que corresponde
   * al tamaño en pantalla. Por eso alcanza con tan pocas muestras.
   */
  readonly calidad: number
}
