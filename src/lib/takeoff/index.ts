/**
 * Los números que ve el cliente. Puro.
 *
 * TODOS SON ORIENTATIVOS. Esta app muestra cómo queda, no cotiza: si el trabajo
 * se confirma viene una medición formal y un presupuesto detallado. La pantalla
 * tiene que decirlo con todas las letras.
 *
 * El conteo de chapas no se calcula acá: sale del despiece, que es quien sabe
 * cómo se reparte la superficie en paños de medida comercial.
 */
import type { Despiece } from '../layout/index.js'
import { DENSIDAD, type Material, type Mm, aM } from '../units/index.js'

export interface EntradaTakeoff {
  readonly despiece: Despiece
  /** Fracción de 0 a 1 del paño que es agujero, medida sobre lo que se ve. */
  readonly areaLibre: number
  readonly material: Material
  readonly espesor: Mm
}

export interface Takeoff {
  /** m² de la superficie cubierta. */
  readonly superficie: number
  /** Fracción de 0 a 1. */
  readonly areaLibre: number
  /** Cuántos paños salen, de medida comercial o recortados. */
  readonly panos: number
  /** Chapas de material que se usan, con decimales: "1,5 chapas". */
  readonly chapasDeMaterial: number
  /** Chapas enteras que hay que comprar, una por paño. */
  readonly chapasACompar: number
  /** Fracción de 0 a 1 de la chapa comprada que se tira. */
  readonly desperdicio: number
  /** kg del conjunto terminado: lo que va a colgar de la fachada. */
  readonly pesoPano: number
  /** kg de chapa a comprar, sin descontar los agujeros. */
  readonly pesoChapa: number
}

export function calcular(e: EntradaTakeoff): Takeoff {
  const d = e.despiece
  const espesorM = aM(e.espesor)
  const densidad = DENSIDAD[e.material]

  return {
    superficie: d.superficieCubierta,
    areaLibre: e.areaLibre,
    panos: d.total,
    chapasDeMaterial: d.chapasDeMaterial,
    chapasACompar: d.total,
    desperdicio: d.desperdicio,
    // El conjunto terminado pesa menos que la chapa: los agujeros no pesan.
    pesoPano: d.superficieCubierta * (1 - e.areaLibre) * espesorM * densidad,
    // Lo que hay que comprar sí pesa entero. Con 40% de área libre los dos
    // números difieren muchísimo, y sirven para cosas distintas: uno es lo que
    // carga la estructura, el otro es lo que se paga.
    pesoChapa: d.superficieComprada * espesorM * densidad,
  }
}
