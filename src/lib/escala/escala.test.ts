import { describe, expect, it } from 'vitest'
import type { Quad } from '../geometry/types.js'
import { largoEnPixeles, medirQuad, mensajeDeErrorEscala, pixelesPorMetro } from './index.js'

const FOTO = { ancho: 2000, alto: 1000 }
const ref = (ax: number, ay: number, bx: number, by: number, metros: number) =>
  ({ a: { x: ax, y: ay }, b: { x: bx, y: by }, metros })

describe('largo de la línea', () => {
  it('devuelve el largo en píxeles reales, no en normalizados', () => {
    // media foto a lo ancho = 1000 px
    expect(largoEnPixeles(ref(0.25, 0.5, 0.75, 0.5, 1), FOTO.ancho, FOTO.alto)).toBeCloseTo(1000, 6)
  })

  it('una línea vertical usa el alto, que acá es distinto del ancho', () => {
    // media foto a lo alto = 500 px
    expect(largoEnPixeles(ref(0.5, 0.25, 0.5, 0.75, 1), FOTO.ancho, FOTO.alto)).toBeCloseTo(500, 6)
  })

  it('una diagonal sale por Pitágoras', () => {
    expect(largoEnPixeles(ref(0, 0, 0.5, 0.5, 1), FOTO.ancho, FOTO.alto))
      .toBeCloseTo(Math.hypot(1000, 500), 6)
  })
})

describe('píxeles por metro', () => {
  it('una línea de 1000 px que mide 2 m da 500 px por metro', () => {
    const r = pixelesPorMetro(ref(0.25, 0.5, 0.75, 0.5, 2), FOTO.ancho, FOTO.alto)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toBeCloseTo(500, 9)
  })

  it('rechaza una medida en cero o negativa', () => {
    for (const m of [0, -1, Number.NaN]) {
      const r = pixelesPorMetro(ref(0.25, 0.5, 0.75, 0.5, m), FOTO.ancho, FOTO.alto)
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error.kind).toBe('medida-invalida')
    }
  })

  it('rechaza una línea de dos píxeles: no sirve de referencia', () => {
    const r = pixelesPorMetro(ref(0.5, 0.5, 0.5005, 0.5, 1), FOTO.ancho, FOTO.alto)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('linea-muy-corta')
  })

  it('los dos errores tienen texto para la pantalla', () => {
    expect(mensajeDeErrorEscala({ kind: 'linea-muy-corta' })).toMatch(/corta/)
    expect(mensajeDeErrorEscala({ kind: 'medida-invalida' })).toMatch(/metros/)
  })
})

describe('medidas del paño a partir de la escala', () => {
  /** Rectángulo de media foto de ancho por media de alto: 1000 x 500 px. */
  const RECT: Quad = [
    { x: 0.25, y: 0.25 }, { x: 0.75, y: 0.25 }, { x: 0.75, y: 0.75 }, { x: 0.25, y: 0.75 },
  ]

  it('con 500 px por metro, ese rectángulo mide 2 x 1 m', () => {
    const m = medirQuad(RECT, 500, FOTO.ancho, FOTO.alto)
    expect(m.ancho).toBeCloseTo(2000, 6)
    expect(m.alto).toBeCloseTo(1000, 6)
  })

  it('al doble de escala, el mismo paño mide la mitad', () => {
    const m = medirQuad(RECT, 1000, FOTO.ancho, FOTO.alto)
    expect(m.ancho).toBeCloseTo(1000, 6)
    expect(m.alto).toBeCloseTo(500, 6)
  })

  it('con fuga, cada lado es el promedio de los dos opuestos', () => {
    // arriba angosto, abajo ancho: el promedio queda en el medio
    const trapecio: Quad = [
      { x: 0.35, y: 0.25 }, { x: 0.65, y: 0.25 }, { x: 0.75, y: 0.75 }, { x: 0.25, y: 0.75 },
    ]
    const m = medirQuad(trapecio, 500, FOTO.ancho, FOTO.alto)
    // arriba 0,30 de foto = 600 px; abajo 0,50 = 1000 px; promedio 800 px = 1,6 m
    expect(m.ancho).toBeCloseTo(1600, 6)
  })

  it('una escala inválida no devuelve infinito ni NaN', () => {
    for (const k of [0, -5, Number.NaN]) {
      const m = medirQuad(RECT, k, FOTO.ancho, FOTO.alto)
      expect(Number.isFinite(m.ancho)).toBe(true)
      expect(Number.isFinite(m.alto)).toBe(true)
    }
  })

  it('la línea y el paño son coherentes: medir el propio paño lo devuelve', () => {
    // Si la línea se traza justo sobre el lado de arriba del paño y se dice que
    // mide 2 m, el paño tiene que dar 2 m de ancho.
    const r = pixelesPorMetro(ref(0.25, 0.25, 0.75, 0.25, 2), FOTO.ancho, FOTO.alto)
    if (!r.ok) throw new Error('esperaba ok')
    expect(medirQuad(RECT, r.value, FOTO.ancho, FOTO.alto).ancho).toBeCloseTo(2000, 6)
  })
})
