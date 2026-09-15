import { describe, expect, it } from 'vitest'
import { areaDoble, validarQuad } from './quad.js'
import type { Quad } from './types.js'

const q = (
  x0: number, y0: number, x1: number, y1: number,
  x2: number, y2: number, x3: number, y3: number,
): Quad => [
  { x: x0, y: y0 }, { x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 },
]

/** Rectángulo sano: arriba-izq, arriba-der, abajo-der, abajo-izq. */
const RECTANGULO = q(10, 20, 110, 20, 110, 90, 10, 90)

describe('validarQuad', () => {
  it('acepta un rectángulo', () => {
    const r = validarQuad(RECTANGULO)
    expect(r.ok).toBe(true)
  })

  it('acepta un trapecio con fuga fuerte', () => {
    const r = validarQuad(q(30, 10, 170, 40, 150, 190, 50, 150))
    expect(r.ok).toBe(true)
  })

  it('rechaza un NaN', () => {
    const r = validarQuad(q(NaN, 20, 110, 20, 110, 90, 10, 90))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('no-finito')
  })

  it('rechaza un infinito', () => {
    const r = validarQuad(q(10, 20, Infinity, 20, 110, 90, 10, 90))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('no-finito')
  })

  it('rechaza los cuatro puntos encimados', () => {
    const r = validarQuad(q(50, 50, 50, 50, 50, 50, 50, 50))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('area-nula')
  })

  it('rechaza cuatro puntos en línea recta', () => {
    const r = validarQuad(q(0, 0, 10, 10, 20, 20, 30, 30))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('area-nula')
  })

  it('rechaza las esquinas al revés y lo dice', () => {
    // El mismo rectángulo recorrido en sentido antihorario.
    const r = validarQuad(q(10, 20, 10, 90, 110, 90, 110, 20))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('orden-invertido')
  })

  it('rechaza una esquina metida para adentro y dice cuál', () => {
    // p2 arrastrada hacia el centro hasta pasarse.
    const r = validarQuad(q(0, 0, 100, 0, 40, 40, 0, 100))
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('no-convexo')
      if (r.error.kind === 'no-convexo') expect(r.error.esquina).toBe(2)
    }
  })

  it('rechaza un moño simétrico, que da área exactamente cero', () => {
    // Los dos lóbulos del moño tienen áreas iguales y de signo opuesto, así que
    // se cancelan y el área con signo da cero clavado. Lo rechaza por "sin
    // superficie", que es la razón correcta: ese cuadrilátero no encierra nada.
    const r = validarQuad(q(0, 0, 100, 0, 0, 100, 100, 100))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('area-nula')
  })

  it('rechaza un moño asimétrico por no convexo', () => {
    // Acá los lóbulos no se cancelan, el área da positiva y el que lo agarra es
    // el control de convexidad. Señala la esquina donde el recorrido se da
    // vuelta.
    const r = validarQuad(q(0, 0, 100, 0, 0, 100, 60, 100))
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('no-convexo')
      if (r.error.kind === 'no-convexo') expect(r.error.esquina).toBe(2)
    }
  })

  it('rechaza tres puntos alineados aunque el cuarto esté lejos', () => {
    const r = validarQuad(q(0, 0, 50, 0, 100, 0, 50, 80))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(['no-convexo', 'area-nula']).toContain(r.error.kind)
  })

  it('el umbral es relativo al tamaño: el mismo paño chiquito también pasa', () => {
    // Si el umbral fuera absoluto, este cuadrilátero de menos de un píxel de
    // lado se rechazaría por "sin superficie" a pesar de ser un rectángulo
    // perfecto. Es el bug clásico de los epsilon fijos.
    const r = validarQuad(q(0, 0, 0.001, 0, 0.001, 0.0007, 0, 0.0007))
    expect(r.ok).toBe(true)
  })
})

describe('areaDoble', () => {
  it('da positivo con el orden correcto en coordenadas de imagen', () => {
    expect(areaDoble(RECTANGULO)).toBeGreaterThan(0)
  })

  it('vale el doble del área del rectángulo', () => {
    expect(areaDoble(RECTANGULO)).toBeCloseTo(2 * 100 * 70, 9)
  })

  it('cambia de signo al invertir el recorrido', () => {
    const alReves = q(10, 20, 10, 90, 110, 90, 110, 20)
    expect(areaDoble(alReves)).toBeCloseTo(-areaDoble(RECTANGULO), 9)
  })
})
