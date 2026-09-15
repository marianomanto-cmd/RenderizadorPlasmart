import type { Mascara } from './types.js'

/** Arma una máscara vacía (todo metal). */
export function crearMascara(ancho: number, alto: number): Mascara {
  return { ancho, alto, datos: new Uint8Array(ancho * alto).fill(1) }
}

/**
 * Arma una máscara evaluando una función. Se usa para los tests, donde hace
 * falta un dibujo cuya área libre se conozca por fórmula.
 *
 * `esMetal` recibe el centro del píxel en coordenadas [0,1].
 */
export function mascaraDesdeFuncion(
  ancho: number,
  alto: number,
  esMetal: (x: number, y: number) => boolean,
): Mascara {
  const datos = new Uint8Array(ancho * alto)
  for (let iy = 0; iy < alto; iy++) {
    for (let ix = 0; ix < ancho; ix++) {
      datos[iy * ancho + ix] = esMetal((ix + 0.5) / ancho, (iy + 0.5) / alto) ? 1 : 0
    }
  }
  return { ancho, alto, datos }
}

/**
 * Fracción del dibujo que es agujero, contando píxeles.
 *
 * Se cuenta en vez de calcularse con una fórmula por tipo de patrón. Para estos
 * 63 modelos no existe fórmula: B.01 son hojas. Y contar vale igual para
 * cualquier dibujo que venga después, incluido un DXF nuevo.
 */
export function areaLibre(m: Mascara): number {
  let agujeros = 0
  for (let i = 0; i < m.datos.length; i++) {
    if (m.datos[i] === 0) agujeros++
  }
  return agujeros / m.datos.length
}

/**
 * Desempaqueta una máscara guardada como un bit por píxel.
 *
 * El catálogo viaja así, en binario crudo y no como PNG, para que cargarlo no
 * dependa de un decodificador de imágenes. Eso deja `lib/pattern` pura y le
 * saca al navegador la necesidad de un canvas solo para leer el catálogo, que
 * es justo lo que tiene que andar sin señal.
 *
 * Bit en 1 es metal, leyendo de izquierda a derecha dentro de cada byte.
 */
export function desempaquetarMascara(bits: Uint8Array, ancho: number, alto: number): Mascara {
  const total = ancho * alto
  const esperados = (total + 7) >> 3
  if (bits.length < esperados) {
    throw new Error(`máscara incompleta: ${bits.length} bytes, se esperaban ${esperados}`)
  }
  const datos = new Uint8Array(total)
  for (let i = 0; i < total; i++) {
    datos[i] = (bits[i >> 3]! >> (7 - (i & 7))) & 1
  }
  return { ancho, alto, datos }
}

/** Empaqueta de vuelta. Sirve sobre todo para comprobar que la ida y vuelta cierra. */
export function empaquetarMascara(m: Mascara): Uint8Array {
  const bits = new Uint8Array((m.datos.length + 7) >> 3)
  for (let i = 0; i < m.datos.length; i++) {
    if (m.datos[i] === 1) bits[i >> 3]! |= 128 >> (i & 7)
  }
  return bits
}

/** ¿Hay metal en este punto de la máscara? Coordenadas en [0,1]. */
export function hayMetal(m: Mascara, mu: number, mv: number): boolean {
  const ix = Math.min(m.ancho - 1, Math.max(0, Math.floor(mu * m.ancho)))
  const iy = Math.min(m.alto - 1, Math.max(0, Math.floor(mv * m.alto)))
  return m.datos[iy * m.ancho + ix] === 1
}
