/**
 * Los números que ve el cliente. Puro.
 *
 * TODOS SON ORIENTATIVOS. Esta app muestra cómo queda, no cotiza: si el trabajo
 * se confirma viene una medición formal y un presupuesto detallado. La pantalla
 * tiene que decirlo con todas las letras.
 */
import { DENSIDAD, type Material, type Mm, aM, superficieM2 } from '../units/index.js'

export interface FormatoChapa {
  readonly ancho: Mm
  readonly alto: Mm
}

export interface EntradaTakeoff {
  readonly ancho: Mm
  readonly alto: Mm
  /** Fracción de 0 a 1 del paño que es agujero, medida sobre lo que se ve. */
  readonly areaLibre: number
  readonly material: Material
  readonly espesor: Mm
  readonly chapa: FormatoChapa
}

export interface Takeoff {
  /** m² del paño. */
  readonly superficie: number
  /** Fracción de 0 a 1. */
  readonly areaLibre: number
  /** Chapas enteras que hacen falta. Grilla simple, NO es un anidado. */
  readonly chapas: number
  /** Fracción de 0 a 1 de la chapa comprada que se tira. */
  readonly recorte: number
  /** kg del paño terminado: lo que va a colgar de la fachada. */
  readonly pesoPano: number
  /** kg de chapa a comprar, sin descontar los agujeros. */
  readonly pesoChapa: number
}

export function calcular(e: EntradaTakeoff): Takeoff {
  const superficie = superficieM2(e.ancho, e.alto)

  // Grilla simple: cuántas chapas enteras entran a lo ancho por cuántas a lo
  // alto. NO es un anidado de producción, y la pantalla lo dice. Un anidado de
  // verdad acomoda las piezas y saca bastante menos chapa; esto sirve para
  // tener una idea parada en la vereda.
  const aLoAncho = Math.ceil(e.ancho / e.chapa.ancho)
  const aLoAlto = Math.ceil(e.alto / e.chapa.alto)
  const chapas = Math.max(1, aLoAncho * aLoAlto)

  const superficieComprada = chapas * superficieM2(e.chapa.ancho, e.chapa.alto)
  const recorte = superficieComprada > 0 ? 1 - superficie / superficieComprada : 0

  const espesorM = aM(e.espesor)
  const densidad = DENSIDAD[e.material]

  return {
    superficie,
    areaLibre: e.areaLibre,
    chapas,
    recorte,
    // El paño terminado pesa menos que la chapa: los agujeros no pesan.
    pesoPano: superficie * (1 - e.areaLibre) * espesorM * densidad,
    // Lo que hay que comprar sí pesa entero. Con 40% de área libre los dos
    // números difieren muchísimo, y sirven para cosas distintas: uno es lo que
    // carga la estructura, el otro es lo que se paga.
    pesoChapa: superficieComprada * espesorM * densidad,
  }
}

export const CHAPAS: Record<string, FormatoChapa> = {
  '1000x2000': { ancho: 1000 as Mm, alto: 2000 as Mm },
  '1220x2440': { ancho: 1220 as Mm, alto: 2440 as Mm },
}
