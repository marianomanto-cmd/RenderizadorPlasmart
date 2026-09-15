import { type Result, ok, err } from '../result.js'
import type { ErrorGeometria, Point, Quad } from './types.js'

/**
 * Todos los umbrales son RELATIVOS al tamaño del cuadrilátero, nunca absolutos.
 *
 * Es el error que más fácil se comete acá: un epsilon fijo es correcto para una
 * foto y equivocado para otra, porque el mismo 0,5 es ruido en un paño grande y
 * es una medida real en uno chico. Al dividir por el cuadrado de la diagonal,
 * el número queda sin unidades y vale igual para cualquier tamaño.
 */
const EPS_AREA = 1e-6
const EPS_CRUZ = 1e-9

const resta = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y })

/** Producto cruz en 2D: da el doble del área con signo del triángulo a-b-c. */
const cruz = (a: Point, b: Point, c: Point): number => {
  const u = resta(b, a)
  const v = resta(c, b)
  return u.x * v.y - u.y * v.x
}

/** Cuadrado de la diagonal de la caja que contiene al cuadrilátero. */
export function diagonalCuadrada(q: Quad): number {
  const xs = [q[0].x, q[1].x, q[2].x, q[3].x]
  const ys = [q[0].y, q[1].y, q[2].y, q[3].y]
  const ancho = Math.max(...xs) - Math.min(...xs)
  const alto = Math.max(...ys) - Math.min(...ys)
  return ancho * ancho + alto * alto
}

/**
 * Doble del área con signo (fórmula del cordón de zapato).
 *
 * En coordenadas de imagen, con la y creciendo hacia abajo, el orden
 * arriba-izq → arriba-der → abajo-der → abajo-izq da un valor POSITIVO.
 * Si sale negativo, las esquinas están al revés.
 */
export function areaDoble(q: Quad): number {
  let s = 0
  for (let i = 0; i < 4; i++) {
    const a = q[i] as Point
    const b = q[(i + 1) % 4] as Point
    s += a.x * b.y - b.x * a.y
  }
  return s
}

/**
 * Comprueba que los cuatro puntos formen un cuadrilátero usable.
 *
 * Es barata a propósito: la pantalla la llama en cada cuadro mientras el dedo
 * arrastra, para poder pintar el paño en rojo antes de intentar renderizar.
 */
export function validarQuad(q: Quad): Result<Quad, ErrorGeometria> {
  for (const p of q) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) {
      return err({ kind: 'no-finito' })
    }
  }

  const diag2 = diagonalCuadrada(q)
  if (diag2 <= 0) {
    return err({ kind: 'area-nula', areaRelativa: 0 })
  }

  // Primero el tamaño y después el signo: en un cuadrilátero aplastado el signo
  // no significa nada, así que preguntarle el orden sería contestar al azar.
  const area2 = areaDoble(q)
  const areaRelativa = area2 / diag2
  if (Math.abs(areaRelativa) < EPS_AREA) {
    return err({ kind: 'area-nula', areaRelativa })
  }
  if (areaRelativa < 0) {
    return err({ kind: 'orden-invertido' })
  }

  // Convexidad: los cuatro giros tienen que ir para el mismo lado. Esto agarra
  // tanto una esquina metida para adentro como dos lados cruzados en moño.
  // El giro i ocurre EN el vértice (i+1)%4, que es el que hay que señalar.
  const giros: readonly [number, number, number, number] = [
    cruz(q[0], q[1], q[2]),
    cruz(q[1], q[2], q[3]),
    cruz(q[2], q[3], q[0]),
    cruz(q[3], q[0], q[1]),
  ]
  const vertices: readonly [0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3] = [1, 2, 3, 0]
  for (let i = 0; i < 4; i++) {
    const giro = giros[i] as number
    if (giro / diag2 <= EPS_CRUZ) {
      return err({ kind: 'no-convexo', esquina: vertices[i] as 0 | 1 | 2 | 3 })
    }
  }

  return ok(q)
}

/** Centro del cuadrilátero. Sirve como punto que con certeza cae adentro. */
export function centroide(q: Quad): Point {
  return {
    x: (q[0].x + q[1].x + q[2].x + q[3].x) / 4,
    y: (q[0].y + q[1].y + q[2].y + q[3].y) / 4,
  }
}
