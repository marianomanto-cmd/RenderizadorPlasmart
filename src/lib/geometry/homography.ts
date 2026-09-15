import { type Result, ok, err } from '../result.js'
import { centroide } from './quad.js'
import { validarQuad } from './quad.js'
import type { ErrorGeometria, Homography, Point, Quad, UV } from './types.js'

/**
 * `g` y `h` salen de dividir un área por otra área, así que no tienen unidades.
 * Por eso acá sí va un umbral absoluto, al revés que en quad.ts.
 */
const EPS_W = 1e-9
const EPS_DEN = 1e-9

/**
 * Homografía que lleva el cuadrado unitario (0,0) (1,0) (1,1) (0,1) a las
 * cuatro esquinas del paño.
 *
 * Es la formulación clásica de Heckbert, CON UNA DIFERENCIA IMPORTANTE: no
 * tiene el caso especial afín.
 *
 * La versión habitual pregunta si el cuadrilátero es "casi" un paralelogramo y,
 * si lo es, usa una fórmula distinta. Eso está mal por dos motivos. El primero
 * es que ese "casi" hay que medirlo con un umbral en píxeles, y no existe un
 * umbral que sea correcto para una foto de 4000 px y para una de 800. El
 * segundo es que produce un salto visible: arrastrando una esquina hacia el
 * paralelogramo, el patrón pega un tirón justo al cruzar el umbral.
 *
 * Y resulta que no hace falta. El denominador `den` es el doble del área del
 * triángulo p1-p2-p3, que NO tiende a cero cuando el cuadrilátero tiende a
 * paralelogramo. En ese límite `g` y `h` tienden suavemente a cero y las dos
 * fórmulas coinciden exactamente. Un solo camino, sin umbral y sin salto.
 *
 * Importa más de lo que parece: las tres fotos de referencia que tenemos están
 * casi de frente, porque el vendedor se para enfrente de la casa y saca derecho.
 * El caso "casi paralelogramo" no es una rareza, es el caso normal.
 */
export function homografiaDesdeQuad(q: Quad): Result<Homography, ErrorGeometria> {
  const valido = validarQuad(q)
  if (!valido.ok) return valido

  const [p0, p1, p2, p3] = q

  const sx = p0.x - p1.x + p2.x - p3.x
  const sy = p0.y - p1.y + p2.y - p3.y

  const dx1 = p1.x - p2.x
  const dx2 = p3.x - p2.x
  const dy1 = p1.y - p2.y
  const dy2 = p3.y - p2.y

  const den = dx1 * dy2 - dx2 * dy1

  // Con un cuadrilátero ya validado como convexo esto no debería dispararse
  // nunca, pero dividir por algo sin mirarlo es la forma más barata de que
  // aparezca un NaN tres módulos más abajo.
  const xs = [p0.x, p1.x, p2.x, p3.x]
  const ys = [p0.y, p1.y, p2.y, p3.y]
  const ancho = Math.max(...xs) - Math.min(...xs)
  const alto = Math.max(...ys) - Math.min(...ys)
  const diag2 = ancho * ancho + alto * alto
  const denRelativo = den / diag2
  if (!Number.isFinite(denRelativo) || Math.abs(denRelativo) < EPS_DEN) {
    return err({ kind: 'puntos-colineales', denRelativo })
  }

  const g = (sx * dy2 - dx2 * sy) / den
  const h = (dx1 * sy - sx * dy1) / den

  const m: Homography = {
    a: p1.x - p0.x + g * p1.x,
    b: p3.x - p0.x + h * p3.x,
    c: p0.x,
    d: p1.y - p0.y + g * p1.y,
    e: p3.y - p0.y + h * p3.y,
    f: p0.y,
    g,
    h,
    i: 1,
  }

  // Test de validez exacto y gratis. El peso proyectivo vale
  //     w(u,v) = g*u + h*v + 1
  // así que en las cuatro esquinas del cuadrado unitario vale 1, 1+g, 1+g+h y
  // 1+h. Si alguno no es positivo, el horizonte cruza el paño: no hay ninguna
  // superficie plana en el espacio que se proyecte en esa forma.
  const w: readonly [number, number, number, number] = [1, 1 + g, 1 + g + h, 1 + h]
  if (w.some((valor) => !(valor > EPS_W))) {
    return err({ kind: 'horizonte-cruza', w })
  }

  return ok(m)
}

/**
 * Invierte la homografía, que es lo que usa el render: para cada píxel de la
 * pantalla hay que saber qué punto del paño le toca.
 *
 * Se usa la matriz adjunta y NO se divide por el determinante, porque la
 * homografía está definida a menos de una escala y `u` y `v` salen de un
 * cociente: numerador y denominador se escalan igual y el cociente no cambia.
 *
 * Lo que sí cambia con la escala es el SIGNO de `w`, y ahí está la trampa. El
 * render descarta los píxeles con w <= 0 porque quedan detrás del horizonte. Si
 * la adjunta viene con el signo cambiado, ese descarte se come TODOS los
 * píxeles y el paño sale vacío, sin ningún error, según cómo se hayan arrastrado
 * las esquinas.
 *
 * Validar el orden de las esquinas ya evita que eso llegue desde la pantalla.
 * La normalización de acá es el segundo cinturón: `invertir` es una función
 * pública, y puede entrar una matriz armada a mano o un dato viejo guardado
 * antes de que existiera la validación. Cuesta nueve multiplicaciones una vez
 * por render.
 */
export function invertir(m: Homography): Homography {
  const A = m.e * m.i - m.f * m.h
  const B = m.c * m.h - m.b * m.i
  const C = m.b * m.f - m.c * m.e
  const D = m.f * m.g - m.d * m.i
  const E = m.a * m.i - m.c * m.g
  const F = m.c * m.d - m.a * m.f
  const G = m.d * m.h - m.e * m.g
  const H = m.b * m.g - m.a * m.h
  const I = m.a * m.e - m.b * m.d

  // El centro del cuadrado unitario cae con certeza adentro del paño, así que
  // ahí w tiene que ser positivo. Si no lo es, se da vuelta toda la matriz.
  const centro = aplicar(m, 0.5, 0.5)
  const w = centro === null ? -1 : G * centro.x + H * centro.y + I
  const s = w < 0 ? -1 : 1

  return { a: s * A, b: s * B, c: s * C, d: s * D, e: s * E, f: s * F, g: s * G, h: s * H, i: s * I }
}

/** Lleva un punto del paño (u,v) a la foto. Devuelve null si cae detrás del horizonte. */
export function aplicar(m: Homography, u: number, v: number): Point | null {
  const w = m.g * u + m.h * v + m.i
  if (!(w > EPS_W)) return null
  return {
    x: (m.a * u + m.b * v + m.c) / w,
    y: (m.d * u + m.e * v + m.f) / w,
  }
}

/**
 * Lleva un punto de la foto al paño. Recibe la matriz YA INVERTIDA.
 *
 * No recorta contra [0,1] a propósito: el que recorta es el render, y le sale
 * gratis porque preguntar si u y v caen en [0,1] ya recorta contra el
 * cuadrilátero sin hacer ninguna cuenta extra.
 */
export function aplicarInversa(mi: Homography, x: number, y: number): UV | null {
  const w = mi.g * x + mi.h * y + mi.i
  if (!(w > EPS_W)) return null
  return {
    u: (mi.a * x + mi.b * y + mi.c) / w,
    v: (mi.d * x + mi.e * y + mi.f) / w,
  }
}

/** ¿Este punto del paño está adentro del paño? */
export const dentroDelPano = (uv: UV): boolean =>
  uv.u >= 0 && uv.u <= 1 && uv.v >= 0 && uv.v <= 1

/** Atajo: matriz directa e inversa de una sola pasada. */
export function homografiaConInversa(
  q: Quad,
): Result<{ readonly directa: Homography; readonly inversa: Homography }, ErrorGeometria> {
  const r = homografiaDesdeQuad(q)
  if (!r.ok) return r
  return ok({ directa: r.value, inversa: invertir(r.value) })
}

export { centroide }
