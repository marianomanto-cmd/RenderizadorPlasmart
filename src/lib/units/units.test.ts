import { describe, expect, it } from 'vitest'
import {
  DENSIDAD,
  ESPESOR_MAX,
  ESPESOR_MIN,
  LARGO_MAX_PLEGADO,
  MATERIALES,
  aCm,
  aM,
  desdeCm,
  desdeM,
  mm,
  redondear,
  superficieM2,
} from './index.js'

describe('conversiones', () => {
  it('el vendedor carga en centímetros y adentro queda en milímetros', () => {
    // Plasmart ya le pide las medidas al cliente en centímetros por WhatsApp.
    expect(desdeCm(240)).toBe(2400)
    expect(desdeCm(110)).toBe(1100)
  })

  it('ida y vuelta por centímetros no pierde nada', () => {
    for (const cm of [1, 12.5, 240, 305.5]) {
      expect(aCm(desdeCm(cm))).toBeCloseTo(cm, 12)
    }
  })

  it('ida y vuelta por metros no pierde nada', () => {
    for (const m of [0.5, 1, 2.44, 3]) {
      expect(aM(desdeM(m))).toBeCloseTo(m, 12)
    }
  })

  it('redondea al milímetro entero, que es como se corta', () => {
    expect(redondear(mm(2400.4))).toBe(2400)
    expect(redondear(mm(2400.6))).toBe(2401)
  })
})

describe('superficie', () => {
  it('un paño de 2,40 x 1,10 m da 2,64 m2', () => {
    expect(superficieM2(desdeCm(240), desdeCm(110))).toBeCloseTo(2.64, 10)
  })

  it('un metro cuadrado da exactamente uno', () => {
    expect(superficieM2(desdeM(1), desdeM(1))).toBe(1)
  })
})

describe('materiales', () => {
  it('son los tres del catálogo, sin aluminio', () => {
    expect([...MATERIALES]).toEqual(['acero', 'inoxidable', 'galvanizado'])
  })

  it('todos tienen densidad', () => {
    for (const material of MATERIALES) {
      expect(DENSIDAD[material]).toBeGreaterThan(0)
    }
  })

  it('el inoxidable pesa más que el acero común', () => {
    expect(DENSIDAD.inoxidable).toBeGreaterThan(DENSIDAD.acero)
  })
})

describe('límites del taller', () => {
  it('los espesores del catálogo', () => {
    expect(ESPESOR_MIN).toBe(1.25)
    expect(ESPESOR_MAX).toBe(25.4)
  })

  it('el plegado llega a 3 metros', () => {
    expect(LARGO_MAX_PLEGADO).toBe(3000)
  })
})
