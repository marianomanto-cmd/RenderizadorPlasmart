export type { Mascara, ModoAjuste, Linea, Modelo, AjustePatron } from './types.js'
export { MODOS_AJUSTE, NOMBRE_MODO, NOMBRE_LINEA, AJUSTE_POR_DEFECTO } from './types.js'
export {
  crearMascara,
  mascaraDesdeFuncion,
  areaLibre,
  hayMetal,
  desempaquetarMascara,
  empaquetarMascara,
} from './mascara.js'
export type { TransformePatron, Interior, Marco } from './ajuste.js'
export {
  prepararTransforme,
  hayMetalEnPano,
  esMetal,
  areaLibreVisible,
  marcoDesdeMm,
  enElMarco,
  DIBUJO_ENTERO,
  SIN_MARCO,
} from './ajuste.js'
export type { Piramide } from './piramide.js'
export { construirPiramide, coberturaEnNivel } from './piramide.js'
