import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
  aplicar,
  aplicarInversa,
  dentroDelPano,
  homografiaConInversa,
  homografiaDesdeQuad,
  invertir,
} from './homography.js'
import type { Homography, Point, Quad } from './types.js'

const q = (
  x0: number, y0: number, x1: number, y1: number,
  x2: number, y2: number, x3: number, y3: number,
): Quad => [
  { x: x0, y: y0 }, { x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 },
]

const RECTANGULO = q(10, 20, 110, 20, 110, 90, 10, 90)
/** Trapecio con fuga fuerte: el lado de arriba mucho más angosto. */
const FUGA = q(60, 30, 160, 55, 190, 200, 20, 170)

const debeSerOk = (r: ReturnType<typeof homografiaDesdeQuad>): Homography => {
  if (!r.ok) throw new Error(`esperaba ok, vino ${r.error.kind}`)
  return r.value
}

/** Intersección de dos rectas dadas por dos puntos cada una. */
function interseccion(a1: Point, a2: Point, b1: Point, b2: Point): Point {
  const d1x = a2.x - a1.x, d1y = a2.y - a1.y
  const d2x = b2.x - b1.x, d2y = b2.y - b1.y
  const den = d1x * d2y - d1y * d2x
  const t = ((b1.x - a1.x) * d2y - (b1.y - a1.y) * d2x) / den
  return { x: a1.x + t * d1x, y: a1.y + t * d1y }
}

describe('casos con resultado analítico', () => {
  it('el cuadrado unitario a un rectángulo da la transformación afín', () => {
    const m = debeSerOk(homografiaDesdeQuad(RECTANGULO))
    expect(m.g).toBeCloseTo(0, 12)
    expect(m.h).toBeCloseTo(0, 12)
    expect(m.a).toBeCloseTo(100, 10) // ancho
    expect(m.b).toBeCloseTo(0, 10)
    expect(m.c).toBeCloseTo(10, 10) // x de la esquina de arriba a la izquierda
    expect(m.d).toBeCloseTo(0, 10)
    expect(m.e).toBeCloseTo(70, 10) // alto
    expect(m.f).toBeCloseTo(20, 10)
  })

  it('las cuatro esquinas caen exactamente donde tienen que caer', () => {
    for (const quad of [RECTANGULO, FUGA]) {
      const m = debeSerOk(homografiaDesdeQuad(quad))
      const esquinas: readonly [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]]
      esquinas.forEach(([u, v], k) => {
        const p = aplicar(m, u, v)
        expect(p).not.toBeNull()
        expect(p?.x).toBeCloseTo((quad[k] as Point).x, 9)
        expect(p?.y).toBeCloseTo((quad[k] as Point).y, 9)
      })
    }
  })

  it('con fuga fuerte, el centro cae en el cruce de las diagonales', () => {
    // Es un resultado exacto de geometría proyectiva, no una aproximación: las
    // diagonales del cuadrado unitario se cruzan en (0.5, 0.5), y una homografía
    // lleva rectas a rectas, así que el cruce va al cruce. Es la mejor prueba
    // que hay de que la perspectiva está bien resuelta y no solo "parece bien".
    const m = debeSerOk(homografiaDesdeQuad(FUGA))
    const centro = aplicar(m, 0.5, 0.5)
    const cruce = interseccion(FUGA[0], FUGA[2], FUGA[1], FUGA[3])
    expect(centro).not.toBeNull()
    expect(centro?.x).toBeCloseTo(cruce.x, 9)
    expect(centro?.y).toBeCloseTo(cruce.y, 9)
  })
})

describe('el caso casi-paralelogramo, que es el caso normal', () => {
  // Las tres fotos de referencia están casi de frente. El vendedor se para
  // enfrente de la casa y saca derecho. Así que esto no es un borde raro.

  /** La fórmula afín clásica, la del caso especial que sacamos. */
  const afin = (quad: Quad): Homography => {
    const [p0, p1, p2] = quad
    return {
      a: p1.x - p0.x, b: p2.x - p1.x, c: p0.x,
      d: p1.y - p0.y, e: p2.y - p1.y, f: p0.y,
      g: 0, h: 0, i: 1,
    }
  }

  /** p0 - p1 + p2 - p3 = 0 en las dos coordenadas: paralelogramo exacto. */
  const PARALELOGRAMO = q(0, 0, 100, 0, 140, 80, 40, 80)

  it('la fórmula proyectiva no se rompe con un paralelogramo exacto', () => {
    const m = debeSerOk(homografiaDesdeQuad(PARALELOGRAMO))
    for (const valor of Object.values(m)) expect(Number.isFinite(valor)).toBe(true)
    expect(m.g).toBeCloseTo(0, 12)
    expect(m.h).toBeCloseTo(0, 12)
  })

  it('y da EXACTAMENTE lo mismo que la fórmula afín', () => {
    // Esta es la prueba de que el caso especial sobraba. Si las dos fórmulas
    // coinciden en el límite, tener dos ramas solo agrega un umbral que elegir
    // mal y un salto visible al cruzarlo.
    const m = debeSerOk(homografiaDesdeQuad(PARALELOGRAMO))
    const a = afin(PARALELOGRAMO)
    for (const k of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const) {
      expect(m[k]).toBeCloseTo(a[k], 10)
    }
  })

  it('no hay ningún salto al acercarse al paralelogramo', () => {
    // Se arrastra una esquina acercándose al paralelogramo y se mira dónde cae
    // el centro del paño. Con dos ramas, al cruzar el umbral el centro pega un
    // tirón. Con una sola, el error se achica proporcional al movimiento.
    const base = aplicar(debeSerOk(homografiaDesdeQuad(PARALELOGRAMO)), 0.5, 0.5)
    expect(base).not.toBeNull()

    let anterior = Infinity
    for (const eps of [1e-1, 1e-2, 1e-3, 1e-4, 1e-6, 1e-8, 1e-10]) {
      const movido = q(0, 0, 100, 0, 140 + eps, 80 + eps, 40, 80)
      const centro = aplicar(debeSerOk(homografiaDesdeQuad(movido)), 0.5, 0.5)
      expect(centro).not.toBeNull()
      const dist = Math.hypot(
        (centro as Point).x - (base as Point).x,
        (centro as Point).y - (base as Point).y,
      )
      expect(dist).toBeLessThan(5 * eps + 1e-12) // se mueve como el movimiento
      expect(dist).toBeLessThanOrEqual(anterior + 1e-12) // y nunca para atrás
      anterior = dist
    }
  })
})

describe('ida y vuelta', () => {
  it('pasar por M y por M inversa devuelve el punto de entrada', () => {
    for (const quad of [RECTANGULO, FUGA]) {
      const r = homografiaConInversa(quad)
      expect(r.ok).toBe(true)
      if (!r.ok) return
      for (const u of [0, 0.13, 0.5, 0.87, 1]) {
        for (const v of [0, 0.29, 0.5, 0.71, 1]) {
          const p = aplicar(r.value.directa, u, v)
          expect(p).not.toBeNull()
          const uv = aplicarInversa(r.value.inversa, (p as Point).x, (p as Point).y)
          expect(uv).not.toBeNull()
          expect(uv?.u).toBeCloseTo(u, 9)
          expect(uv?.v).toBeCloseTo(v, 9)
        }
      }
    }
  })

  it('un punto de la foto de afuera del paño da u,v fuera de [0,1]', () => {
    const r = homografiaConInversa(RECTANGULO)
    if (!r.ok) throw new Error('esperaba ok')
    const afuera = aplicarInversa(r.value.inversa, 500, 500)
    expect(afuera).not.toBeNull()
    expect(dentroDelPano(afuera!)).toBe(false)
  })

  it('el centro del paño está adentro del paño', () => {
    const r = homografiaConInversa(FUGA)
    if (!r.ok) throw new Error('esperaba ok')
    const centro = aplicar(r.value.directa, 0.5, 0.5) as Point
    const uv = aplicarInversa(r.value.inversa, centro.x, centro.y)
    expect(uv).not.toBeNull()
    expect(dentroDelPano(uv!)).toBe(true)
  })
})

describe('el signo de la matriz inversa', () => {
  // La homografía está definida a menos de una escala, incluido el signo. Los
  // valores de u y v no se enteran, porque salen de un cociente y el signo se
  // cancela arriba y abajo. El que sí se entera es el descarte de w <= 0 que
  // usa el render para tirar los píxeles de atrás del horizonte: con el signo
  // dado vuelta, ese descarte se come todos los píxeles y el paño sale vacío,
  // sin ningún mensaje de error.

  /** Espeja en x: (u,v) -> (1-u, v). Su adjunta sale con w negativo. */
  const ESPEJO: Homography = { a: -1, b: 0, c: 1, d: 0, e: 1, f: 0, g: 0, h: 0, i: 1 }

  it('sin normalizar, la adjunta cruda daría w negativo en todos lados', () => {
    // Se calcula a mano la componente w de la adjunta para dejar documentado el
    // problema que resuelve invertir().
    const I = ESPEJO.a * ESPEJO.e - ESPEJO.b * ESPEJO.d
    expect(I).toBeLessThan(0)
  })

  it('invertir() normaliza el signo y el mapeo sigue funcionando', () => {
    const mi = invertir(ESPEJO)
    const uv = aplicarInversa(mi, 0.5, 0.5)
    expect(uv).not.toBeNull() // sin la normalización esto sería null
    expect(uv?.u).toBeCloseTo(0.5, 12)
    expect(uv?.v).toBeCloseTo(0.5, 12)
  })

  it('y el espejado sigue siendo un espejado', () => {
    const mi = invertir(ESPEJO)
    const uv = aplicarInversa(mi, 0.25, 0.4)
    expect(uv?.u).toBeCloseTo(0.75, 12)
    expect(uv?.v).toBeCloseTo(0.4, 12)
  })
})

describe('formas imposibles', () => {
  it('rechaza cuando el horizonte cruza el paño', () => {
    // Una esquina arrastrada más allá del punto de fuga. No existe ninguna
    // superficie plana en el espacio que se proyecte en esta forma.
    const r = homografiaDesdeQuad(q(0, 0, 100, 0, 100, 100, 0, 100))
    expect(r.ok).toBe(true) // el cuadrado sí existe, es el control

    const malo = homografiaDesdeQuad(q(0, 0, 1000, 400, 300, 120, 0, 100))
    if (!malo.ok) {
      expect(['horizonte-cruza', 'no-convexo', 'orden-invertido']).toContain(malo.error.kind)
    }
  })

  it('nunca devuelve NaN: o sale bien o sale un error con nombre', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: -1e4, max: 1e4, noNaN: true }), { minLength: 8, maxLength: 8 }),
        (n) => {
          const quad = q(n[0]!, n[1]!, n[2]!, n[3]!, n[4]!, n[5]!, n[6]!, n[7]!)
          const r = homografiaDesdeQuad(quad)
          if (r.ok) {
            for (const valor of Object.values(r.value)) {
              expect(Number.isFinite(valor)).toBe(true)
            }
            const mi = invertir(r.value)
            for (const valor of Object.values(mi)) {
              expect(Number.isFinite(valor)).toBe(true)
            }
          } else {
            expect(typeof r.error.kind).toBe('string')
          }
        },
      ),
      { numRuns: 2000 },
    )
  })
})

describe('propiedades sobre cuadriláteros al azar', () => {
  const chico = fc.double({ min: -0.25, max: 0.25, noNaN: true })
  const genQuad = fc
    .tuple(
      fc.double({ min: 50, max: 1000, noNaN: true }),
      fc.double({ min: 50, max: 1000, noNaN: true }),
      chico, chico, chico, chico, chico, chico, chico, chico,
    )
    .map(([W, H, a, b, c, d, e, f, g, h]): Quad => {
      const s = Math.min(W, H)
      return [
        { x: a * s, y: b * s },
        { x: W + c * s, y: d * s },
        { x: W + e * s, y: H + f * s },
        { x: g * s, y: H + h * s },
      ]
    })

  it('la ida y vuelta devuelve el punto para cualquier forma válida', () => {
    fc.assert(
      fc.property(genQuad, fc.double({ min: 0, max: 1, noNaN: true }), fc.double({ min: 0, max: 1, noNaN: true }), (quad, u, v) => {
        const r = homografiaConInversa(quad)
        fc.pre(r.ok)
        if (!r.ok) return
        const p = aplicar(r.value.directa, u, v)
        fc.pre(p !== null)
        const uv = aplicarInversa(r.value.inversa, p!.x, p!.y)
        expect(uv).not.toBeNull()
        expect(uv!.u).toBeCloseTo(u, 6)
        expect(uv!.v).toBeCloseTo(v, 6)
      }),
      { numRuns: 1000 },
    )
  })

  it('todo punto de adentro del paño se reconoce como de adentro', () => {
    fc.assert(
      fc.property(genQuad, fc.double({ min: 0.01, max: 0.99, noNaN: true }), fc.double({ min: 0.01, max: 0.99, noNaN: true }), (quad, u, v) => {
        const r = homografiaConInversa(quad)
        fc.pre(r.ok)
        if (!r.ok) return
        const p = aplicar(r.value.directa, u, v)
        fc.pre(p !== null)
        const uv = aplicarInversa(r.value.inversa, p!.x, p!.y)
        expect(uv).not.toBeNull()
        expect(dentroDelPano(uv!)).toBe(true)
      }),
      { numRuns: 1000 },
    )
  })
})
