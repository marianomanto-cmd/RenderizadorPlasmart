import { describe, expect, it } from 'vitest'
import { FORMATOS, despiezar } from '../layout/index.js'
import { desdeCm, mm } from '../units/index.js'
import { calcular } from './index.js'

const CHAPA = FORMATOS[0]! // 1000 × 2000
const PROP = 0.5

/** Pared de 3,50 × 2,00 m: cuatro paños iguales de 87,5 × 200 cm. */
const despiece = despiezar(desdeCm(350), desdeCm(200), CHAPA, PROP)

const base = {
  despiece,
  areaLibre: 0.336,
  material: 'acero' as const,
  espesor: mm(2),
}

describe('superficie y paños', () => {
  it('la superficie sale del despiece', () => {
    expect(calcular(base).superficie).toBeCloseTo(7, 9)
  })

  it('los paños también', () => {
    expect(calcular(base).panos).toBe(4)
  })

  it('el material usado lleva decimales, y es lo que se dice en el taller', () => {
    // 7 m2 sobre chapas de 2 m2 = 3,5 chapas de material, pero se compran 4.
    expect(calcular(base).chapasDeMaterial).toBeCloseTo(3.5, 9)
    expect(calcular(base).chapasACompar).toBe(4)
  })

  it('el desperdicio es lo que sobra de lo comprado', () => {
    expect(calcular(base).desperdicio).toBeCloseTo(1 / 8, 9)
  })
})

describe('los dos pesos', () => {
  it('el conjunto terminado pesa menos que la chapa comprada', () => {
    const t = calcular(base)
    expect(t.pesoPano).toBeLessThan(t.pesoChapa)
  })

  it('el conjunto: superficie por lo macizo por espesor por densidad', () => {
    // 7 m2 x (1 - 0,336) x 0,002 m x 7850 kg/m3
    expect(calcular(base).pesoPano).toBeCloseTo(7 * 0.664 * 0.002 * 7850, 6)
  })

  it('la chapa comprada no descuenta los agujeros', () => {
    // 4 chapas de 2 m2 = 8 m2 x 0,002 m x 7850
    expect(calcular(base).pesoChapa).toBeCloseTo(8 * 0.002 * 7850, 6)
    expect(calcular({ ...base, areaLibre: 0 }).pesoChapa).toBeCloseTo(calcular(base).pesoChapa, 9)
  })

  it('el inoxidable pesa más que el acero con todo lo demás igual', () => {
    expect(calcular({ ...base, material: 'inoxidable' }).pesoPano)
      .toBeGreaterThan(calcular(base).pesoPano)
  })

  it('con más área libre el conjunto pesa menos', () => {
    expect(calcular({ ...base, areaLibre: 0.5 }).pesoPano)
      .toBeLessThan(calcular({ ...base, areaLibre: 0.1 }).pesoPano)
  })

  it('un paño todo agujero no pesa nada', () => {
    expect(calcular({ ...base, areaLibre: 1 }).pesoPano).toBeCloseTo(0, 12)
  })
})

describe('la chapa grande cambia los números', () => {
  it('con 1220 × 2440 hacen falta menos paños para la misma pared', () => {
    const grande = despiezar(desdeCm(350), desdeCm(200), FORMATOS[1]!, PROP)
    expect(calcular({ ...base, despiece: grande }).panos)
      .toBeLessThan(calcular(base).panos)
  })

  it('pero la superficie cubierta es la misma', () => {
    const grande = despiezar(desdeCm(350), desdeCm(200), FORMATOS[1]!, PROP)
    expect(calcular({ ...base, despiece: grande }).superficie)
      .toBeCloseTo(calcular(base).superficie, 9)
  })
})
