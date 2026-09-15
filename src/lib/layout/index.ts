/**
 * Despiece: cómo se cubre una superficie con paños de tamaño comercial.
 *
 * Esto es el corazón del asunto y el error que había antes. Un paño NO es un
 * dibujo elástico que se estira hasta tapar lo que sea: es una chapa de medida
 * comercial, y una fachada se cubre poniendo varias, una al lado de la otra,
 * recortando las de los bordes.
 *
 * O sea que el tamaño del motivo NO es una decisión de diseño: lo fija la
 * chapa. Un B.01 sobre una chapa de 1000 x 2000 tiene hojas de un tamaño
 * determinado. Si la pared mide cuatro metros, se ven cuatro B.01, cada uno del
 * tamaño que realmente va a tener, con sus juntas a la vista.
 *
 * El catálogo lo venía diciendo: 53 de los 63 modelos están dibujados a 1:2,
 * que es exactamente la proporción de 1000 x 2000 y de 1220 x 2440.
 */
import { type Mm, aM, mm, superficieM2 } from '../units/index.js'

export interface FormatoChapa {
  readonly nombre: string
  readonly ancho: Mm
  readonly alto: Mm
}

export const FORMATOS: readonly FormatoChapa[] = [
  { nombre: '1000 × 2000', ancho: mm(1000), alto: mm(2000) },
  { nombre: '1220 × 2440', ancho: mm(1220), alto: mm(2440) },
  { nombre: '1500 × 3000', ancho: mm(1500), alto: mm(3000) },
]

/** Un paño individual dentro de la superficie. */
export interface Pano {
  readonly fila: number
  readonly columna: number
  /** Posición de la esquina superior izquierda, desde el origen de la superficie. */
  readonly x: Mm
  readonly y: Mm
  /** Medida real de este paño. Todos iguales: la superficie repartida pareja. */
  readonly ancho: Mm
  readonly alto: Mm
  /** Si aprovecha la chapa completa. Con reparto equitativo suele sobrar algo. */
  readonly entero: boolean
}

export interface Despiece {
  readonly panos: readonly Pano[]
  readonly columnas: number
  readonly filas: number
  /** Medida del paño sin recortar, que es lo que se repite. */
  readonly panoAncho: Mm
  readonly panoAlto: Mm
  readonly enteros: number
  readonly recortados: number
  readonly total: number
  /** m² de chapa que hay que comprar (paños enteros, recortados o no). */
  readonly superficieComprada: number
  /** m² de la superficie a cubrir. */
  readonly superficieCubierta: number
  /**
   * Cuántas chapas de material se usan realmente, con decimales. Es el número
   * del que sale "una chapa y media": el material da 1,5 aunque haya que
   * comprar 2.
   */
  readonly chapasDeMaterial: number
  /** Fracción de 0 a 1 de la chapa comprada que se tira. */
  readonly desperdicio: number
}

/**
 * Medida del paño que sale de una chapa para un modelo dado.
 *
 * El modelo se lleva al ALTO de la chapa manteniendo su proporción, y su ancho
 * natural define el ancho del paño. Para los 53 modelos que están a 1:2 esto da
 * exactamente la chapa entera. Para los diez que no —hay algunos a 1:3— da un
 * paño más angosto, que es lo que realmente se corta de esa chapa.
 */
export function medidaDelPano(chapa: FormatoChapa, propModelo: number): { ancho: Mm; alto: Mm } {
  const alto = chapa.alto
  const ancho = mm(Math.min(chapa.ancho, alto * propModelo))
  return { ancho, alto }
}

/**
 * Reparte la superficie en paños IGUALES.
 *
 * Primero se calcula cuántos paños hacen falta como mínimo —o sea, cuántas
 * veces entra la chapa— y después la superficie se divide en esa cantidad de
 * partes iguales. No se ponen chapas enteras desde un borde dejando un recorte
 * flaco del otro lado: en una fachada eso se ve pésimo y no es lo que se hace.
 *
 * Es lo que en el taller significa "una chapa y media": el material da eso,
 * pero el patrón de corte se reparte equitativamente entre los paños.
 *
 * Consecuencia buena para el render: como la cantidad de paños es entera, el
 * dibujo se repite un número exacto de veces y nunca queda medio motivo cortado
 * contra un borde.
 */
export function despiezar(
  anchoSuperficie: Mm,
  altoSuperficie: Mm,
  chapa: FormatoChapa,
  propModelo: number,
): Despiece {
  const maximo = medidaDelPano(chapa, propModelo)

  const columnas = Math.max(1, Math.ceil(anchoSuperficie / maximo.ancho))
  const filas = Math.max(1, Math.ceil(altoSuperficie / maximo.alto))

  // La medida real de cada paño: la superficie repartida en partes iguales.
  const panoAncho = mm(anchoSuperficie / columnas)
  const panoAlto = mm(altoSuperficie / filas)

  const panos: Pano[] = []
  for (let fila = 0; fila < filas; fila++) {
    for (let columna = 0; columna < columnas; columna++) {
      panos.push({
        fila,
        columna,
        x: mm(columna * panoAncho),
        y: mm(fila * panoAlto),
        ancho: panoAncho,
        alto: panoAlto,
        // "Entero" quiere decir que aprovecha la chapa completa. Con reparto
        // equitativo casi siempre sobra algo, y está bien: es el recorte.
        entero: maximo.ancho - panoAncho < 1 && maximo.alto - panoAlto < 1,
      })
    }
  }

  const superficieChapa = superficieM2(chapa.ancho, chapa.alto)
  // Cada paño sale de una chapa. Un anidado de produccion puede sacar dos paños
  // angostos de la misma, pero eso no se estima parado en la vereda.
  const superficieComprada = panos.length * superficieChapa
  const superficieCubierta = superficieM2(anchoSuperficie, altoSuperficie)

  return {
    panos,
    columnas,
    filas,
    panoAncho,
    panoAlto,
    enteros: panos.filter((p) => p.entero).length,
    recortados: panos.filter((p) => !p.entero).length,
    total: panos.length,
    superficieComprada,
    superficieCubierta,
    // Cuántas chapas de material se usan de verdad. Es el número del que sale
    // "una chapa y media".
    chapasDeMaterial: superficieChapa > 0 ? superficieCubierta / superficieChapa : 0,
    desperdicio: superficieComprada > 0 ? 1 - superficieCubierta / superficieComprada : 0,
  }
}

/**
 * Elige el formato que necesita menos chapas. Con empate gana el más chico, que
 * es más fácil de manejar y de transportar.
 */
export function mejorFormato(
  ancho: Mm,
  alto: Mm,
  propModelo: number,
  formatos: readonly FormatoChapa[] = FORMATOS,
): FormatoChapa {
  let mejor = formatos[0]!
  let mejorDespiece = despiezar(ancho, alto, mejor, propModelo)
  for (const f of formatos.slice(1)) {
    const d = despiezar(ancho, alto, f, propModelo)
    if (d.total < mejorDespiece.total) {
      mejor = f
      mejorDespiece = d
    }
  }
  return mejor
}

/** Texto para la pantalla: "4 paños de 87,5 × 200 cm". */
export function resumen(d: Despiece): string {
  const cm = (v: Mm) => (v / 10).toLocaleString('es-AR', { maximumFractionDigits: 1 })
  const cuantos = d.total === 1 ? '1 paño' : `${d.total} paños`
  return `${cuantos} de ${cm(d.panoAncho)} × ${cm(d.panoAlto)} cm`
}

/** "1,5 chapas de material" — lo que se usa, no lo que se compra. */
export function resumenMaterial(d: Despiece): string {
  const n = d.chapasDeMaterial.toLocaleString('es-AR', { maximumFractionDigits: 2 })
  return `${n} ${d.chapasDeMaterial === 1 ? 'chapa' : 'chapas'} de material`
}

export { aM }
