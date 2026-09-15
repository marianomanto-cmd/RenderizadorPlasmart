export type { Mascara, Linea, Modelo } from './types.js'
export { NOMBRE_LINEA } from './types.js'
export {
  crearMascara,
  mascaraDesdeFuncion,
  areaLibre,
  hayMetal,
  desempaquetarMascara,
  empaquetarMascara,
} from './mascara.js'
export type { TransformePatron, Marco } from './ajuste.js'
export {
  prepararTransformeDespiece,
  dentroDelPatron,
  hayMetalEnPano,
  esMetal,
  areaLibreVisible,
  marcoDesdeMm,
  SIN_MARCO,
} from './ajuste.js'
export type { Piramide } from './piramide.js'
export { construirPiramide, coberturaEnNivel } from './piramide.js'
