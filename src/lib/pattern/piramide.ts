import type { Mascara } from './types.js'

/**
 * Pirámide de niveles de la máscara: el dibujo entero, a la mitad, a un cuarto,
 * y así hasta un píxel.
 *
 * Por qué hace falta. La máscara tiene 2048 píxeles de ancho y en la pantalla el
 * paño ocupa unos 600, o bastante menos en la parte lejana de una fachada en
 * fuga. Un píxel de pantalla cubre entonces varios agujeros. Muestrear ahí da
 * muaré: aparecen bandas y remolinos que no existen en la chapa, y el cliente
 * los ve.
 *
 * Promediar todo a un solo número arregla el muaré pero borra el dibujo: el paño
 * queda gris plano. Guardar el dibujo ya achicado, en cambio, conserva la
 * estructura a cada escala. Es lo que hace cualquier motor de texturas desde
 * hace cuarenta años, y acá resuelve el problema entero.
 *
 * Cada nivel guarda COBERTURA de 0 a 255, no blanco y negro: en el nivel 1 un
 * píxel que era mitad metal y mitad aire vale 128, y esa media tinta es
 * justamente la información que evita el muaré.
 */
export interface Piramide {
  readonly niveles: readonly Mascara[]
  /** Cobertura de metal de 0 a 255 por píxel, paralelo a `niveles`. */
  readonly cobertura: readonly Uint8Array[]
  readonly ancho: number
  readonly alto: number
}

export function construirPiramide(m: Mascara): Piramide {
  const niveles: Mascara[] = [m]
  const cobertura: Uint8Array[] = [Uint8Array.from(m.datos, (v) => (v === 1 ? 255 : 0))]

  let ancho = m.ancho
  let alto = m.alto
  let actual = cobertura[0]!

  while (ancho > 1 || alto > 1) {
    const nAncho = Math.max(1, ancho >> 1)
    const nAlto = Math.max(1, alto >> 1)
    const siguiente = new Uint8Array(nAncho * nAlto)

    for (let y = 0; y < nAlto; y++) {
      const y0 = Math.min(alto - 1, y * 2)
      const y1 = Math.min(alto - 1, y * 2 + 1)
      for (let x = 0; x < nAncho; x++) {
        const x0 = Math.min(ancho - 1, x * 2)
        const x1 = Math.min(ancho - 1, x * 2 + 1)
        siguiente[y * nAncho + x] =
          (actual[y0 * ancho + x0]! +
            actual[y0 * ancho + x1]! +
            actual[y1 * ancho + x0]! +
            actual[y1 * ancho + x1]! +
            2) >> 2
      }
    }

    cobertura.push(siguiente)
    niveles.push({
      ancho: nAncho,
      alto: nAlto,
      datos: Uint8Array.from(siguiente, (v) => (v >= 128 ? 1 : 0)),
    })
    ancho = nAncho
    alto = nAlto
    actual = siguiente
  }

  return { niveles, cobertura, ancho: m.ancho, alto: m.alto }
}

/**
 * Cobertura de metal, de 0 a 1, en un punto del dibujo, leyendo el nivel que
 * corresponde a la huella.
 *
 * `huella` es cuántos píxeles del dibujo original cubre un píxel de pantalla. Se
 * mezclan los dos niveles que la rodean, porque saltar de golpe de un nivel al
 * siguiente se ve como un escalón mientras el dedo arrastra.
 */
export function coberturaEnNivel(p: Piramide, huella: number, mu: number, mv: number): number {
  const ultimo = p.cobertura.length - 1
  const nivelExacto = huella <= 1 ? 0 : Math.log2(huella)
  const bajo = Math.max(0, Math.min(ultimo, Math.floor(nivelExacto)))
  const alto = Math.min(ultimo, bajo + 1)
  const t = Math.max(0, Math.min(1, nivelExacto - bajo))

  const a = leer(p, bajo, mu, mv)
  if (bajo === alto || t === 0) return a
  return a + (leer(p, alto, mu, mv) - a) * t
}

function leer(p: Piramide, nivel: number, mu: number, mv: number): number {
  const m = p.niveles[nivel]!
  const datos = p.cobertura[nivel]!
  let ix = (mu * m.ancho) | 0
  let iy = (mv * m.alto) | 0
  if (ix < 0) ix = 0
  else if (ix >= m.ancho) ix = m.ancho - 1
  if (iy < 0) iy = 0
  else if (iy >= m.alto) iy = m.alto - 1
  return datos[iy * m.ancho + ix]! / 255
}
