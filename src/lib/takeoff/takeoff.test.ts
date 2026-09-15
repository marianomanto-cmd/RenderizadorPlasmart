import { describe, expect, it } from 'vitest'
import { desdeCm, mm } from '../units/index.js'
import { CHAPAS, calcular } from './index.js'

const base = {
  ancho: desdeCm(240),
  alto: desdeCm(110),
  areaLibre: 0.336,
  material: 'acero' as const,
  espesor: mm(2),
  chapa: CHAPAS['1000x2000']!,
}

describe('superficie', () => {
  it('2,40 x 1,10 m da 2,64 m2', () => {
    expect(calcular(base).superficie).toBeCloseTo(2.64, 9)
  })
})

describe('chapas', () => {
  it('es una grilla simple, no un anidado', () => {
    // 2400 de ancho no entra en 1000: hacen falta 3 a lo ancho.
    // 1100 de alto no entra en 2000: 1 a lo alto. Total 3.
    expect(calcular(base).chapas).toBe(3)
  })

  it('un paño que entra justo en una chapa da una chapa', () => {
    expect(calcular({ ...base, ancho: desdeCm(100), alto: desdeCm(200) }).chapas).toBe(1)
  })

  it('un paño diminuto igual consume una chapa entera', () => {
    expect(calcular({ ...base, ancho: desdeCm(10), alto: desdeCm(10) }).chapas).toBe(1)
  })

  it('con chapa más grande hacen falta menos', () => {
    const a = calcular(base).chapas
    const b = calcular({ ...base, chapa: CHAPAS['1220x2440']! }).chapas
    expect(b).toBeLessThanOrEqual(a)
  })
})

describe('recorte', () => {
  it('es lo que sobra de la chapa comprada', () => {
    // 3 chapas de 1000 x 2000 = 6 m2 compradas para un paño de 2,64 m2
    expect(calcular(base).recorte).toBeCloseTo(1 - 2.64 / 6, 9)
  })

  it('un paño que entra justo no recorta nada', () => {
    expect(calcular({ ...base, ancho: desdeCm(100), alto: desdeCm(200) }).recorte).toBeCloseTo(0, 9)
  })

  it('siempre cae entre 0 y 1', () => {
    for (const cm of [10, 99, 100, 101, 240, 305]) {
      const r = calcular({ ...base, ancho: desdeCm(cm) }).recorte
      expect(r).toBeGreaterThanOrEqual(0)
      expect(r).toBeLessThan(1)
    }
  })
})

describe('los dos pesos', () => {
  it('el paño terminado pesa menos que la chapa comprada', () => {
    const t = calcular(base)
    expect(t.pesoPano).toBeLessThan(t.pesoChapa)
  })

  it('el paño: superficie por lo macizo por espesor por densidad', () => {
    // 2,64 m2 x (1 - 0,336) x 0,002 m x 7850 kg/m3
    expect(calcular(base).pesoPano).toBeCloseTo(2.64 * 0.664 * 0.002 * 7850, 6)
  })

  it('la chapa comprada no descuenta los agujeros', () => {
    const t = calcular(base)
    const sinAgujeros = calcular({ ...base, areaLibre: 0 })
    expect(t.pesoChapa).toBeCloseTo(sinAgujeros.pesoChapa, 9)
  })

  it('el inoxidable pesa más que el acero con todo lo demás igual', () => {
    expect(calcular({ ...base, material: 'inoxidable' }).pesoPano)
      .toBeGreaterThan(calcular(base).pesoPano)
  })

  it('con más área libre el paño pesa menos', () => {
    expect(calcular({ ...base, areaLibre: 0.5 }).pesoPano)
      .toBeLessThan(calcular({ ...base, areaLibre: 0.1 }).pesoPano)
  })

  it('un paño todo agujero no pesa nada', () => {
    expect(calcular({ ...base, areaLibre: 1 }).pesoPano).toBeCloseTo(0, 12)
  })
})
