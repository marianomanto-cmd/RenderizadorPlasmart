/**
 * Tipos de la geometría. Puro: no importa React, ni Next, ni el DOM.
 */

/**
 * Punto en coordenadas NORMALIZADAS de la foto: (0,0) es la esquina superior
 * izquierda y (1,1) la inferior derecha, sea cual sea el tamaño en píxeles.
 *
 * Se guardan así y no en píxeles a propósito. Si mañana la foto se vuelve a
 * codificar en otro tamaño, o se dibuja una miniatura, o se exporta al doble de
 * resolución, las esquinas siguen valiendo sin reescalar nada. Es lo que hace
 * que reabrir una obra al otro día devuelva los puntos exactamente donde
 * quedaron.
 */
export interface Point {
  readonly x: number
  readonly y: number
}

/**
 * Las cuatro esquinas del paño, en orden: arriba-izquierda, arriba-derecha,
 * abajo-derecha, abajo-izquierda. Es el mismo orden en el que se recorre el
 * cuadrado unitario (0,0) (1,0) (1,1) (0,1).
 */
export type Quad = readonly [Point, Point, Point, Point]

/**
 * Homografía de 3x3, guardada por nombre y no por índice para que se lea igual
 * que la fórmula:
 *
 *     | a b c |
 *     | d e f |
 *     | g h i |
 *
 * En la matriz directa `i` siempre vale 1. En la inversa no, porque está
 * definida a menos de una escala.
 */
export interface Homography {
  readonly a: number
  readonly b: number
  readonly c: number
  readonly d: number
  readonly e: number
  readonly f: number
  readonly g: number
  readonly h: number
  readonly i: number
}

/** Coordenada dentro del paño. (0,0) arriba-izquierda, (1,1) abajo-derecha. */
export interface UV {
  readonly u: number
  readonly v: number
}

/**
 * Por qué un cuadrilátero no sirve. Son estados de la pantalla, no bugs:
 * el vendedor arrastró un punto a un lugar imposible y hay que decírselo.
 */
export type ErrorGeometria =
  /** Algún número es NaN o infinito. */
  | { readonly kind: 'no-finito' }
  /** Los cuatro puntos están encimados o alineados: el paño no tiene superficie. */
  | { readonly kind: 'area-nula'; readonly areaRelativa: number }
  /** Las esquinas están en sentido antihorario: el paño saldría espejado. */
  | { readonly kind: 'orden-invertido' }
  /** Una esquina se metió para adentro, o dos lados se cruzan. */
  | { readonly kind: 'no-convexo'; readonly esquina: 0 | 1 | 2 | 3 }
  /** Tres puntos quedaron en línea recta. */
  | { readonly kind: 'puntos-colineales'; readonly denRelativo: number }
  /**
   * El horizonte cruza el paño. No existe ningún plano en el espacio que se
   * proyecte en esa forma; pasa cuando se arrastra una esquina más allá del
   * punto de fuga.
   */
  | { readonly kind: 'horizonte-cruza'; readonly w: readonly [number, number, number, number] }

/** Texto para mostrar en pantalla. La librería no sabe de idiomas; esto sí. */
export function mensajeDeError(e: ErrorGeometria): string {
  switch (e.kind) {
    case 'no-finito':
      return 'Hay un punto con un valor inválido.'
    case 'area-nula':
      return 'El paño quedó sin superficie. Separá las esquinas.'
    case 'orden-invertido':
      return 'Las esquinas están cruzadas. Revisá el orden.'
    case 'no-convexo':
      return 'Una esquina quedó metida para adentro. No se puede usar esa forma.'
    case 'puntos-colineales':
      return 'Tres esquinas quedaron en línea recta. No se puede usar esa forma.'
    case 'horizonte-cruza':
      return 'Esa forma no corresponde a una superficie plana. Acercá las esquinas.'
  }
}
