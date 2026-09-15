export type { Point, Quad, Homography, UV, ErrorGeometria } from './types.js'
export { mensajeDeError } from './types.js'
export { validarQuad, areaDoble, diagonalCuadrada, centroide } from './quad.js'
export {
  homografiaDesdeQuad,
  homografiaConInversa,
  invertir,
  aplicar,
  aplicarInversa,
  dentroDelPano,
} from './homography.js'
