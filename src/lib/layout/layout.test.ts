import { describe, expect, it } from 'vitest'
import { desdeCm, mm } from '../units/index.js'
import {
  FORMATOS,
  despiezar,
  medidaDelPano,
  mejorFormato,
  resumen,
  resumenMaterial,
} from './index.js'

const CHAPA_1000 = FORMATOS[0]!
const CHAPA_1220 = FORMATOS[1]!
const PROP_1A2 = 0.5 // los 53 modelos que están a 1:2

describe('la medida del paño la fija la chapa, no la superficie', () => {
  it('un modelo a 1:2 usa la chapa entera', () => {
    const p = medidaDelPano(CHAPA_1000, PROP_1A2)
    expect(p.ancho).toBe(1000)
    expect(p.alto).toBe(2000)
  })

  it('en la chapa grande, el mismo modelo da un paño más grande', () => {
    const p = medidaDelPano(CHAPA_1220, PROP_1A2)
    expect(p.ancho).toBe(1220)
    expect(p.alto).toBe(2440)
  })

  it('un modelo a 1:3 da un paño más angosto que la chapa', () => {
    // Hay diez modelos así en el catálogo (A.23, A.25, A.35, G.18...). Se cortan
    // más angostos de la misma chapa.
    const p = medidaDelPano(CHAPA_1000, 1 / 3)
    expect(p.alto).toBe(2000)
    expect(p.ancho).toBeCloseTo(666.67, 1)
  })

  it('un modelo cuadrado nunca se pasa del ancho de la chapa', () => {
    // A.21 es 1:1. Al alto de la chapa querría 2000 de ancho y no entra.
    const p = medidaDelPano(CHAPA_1000, 1)
    expect(p.ancho).toBe(1000)
  })
})

describe('despiece con reparto equitativo', () => {
  // La regla: primero cuántos paños hacen falta como mínimo, después la
  // superficie se divide en esa cantidad de partes IGUALES. Nunca chapas
  // enteras desde un borde con un recorte flaco del otro lado.

  it('una pared de 4 x 2 m da 4 paños que aprovechan la chapa entera', () => {
    const d = despiezar(desdeCm(400), desdeCm(200), CHAPA_1000, PROP_1A2)
    expect(d.columnas).toBe(4)
    expect(d.filas).toBe(1)
    expect(d.total).toBe(4)
    expect(d.panoAncho).toBe(1000)
    expect(d.enteros).toBe(4)
  })

  it('3,50 m NO son tres chapas y un recorte de 50: son cuatro paños de 87,5', () => {
    const d = despiezar(desdeCm(350), desdeCm(200), CHAPA_1000, PROP_1A2)
    expect(d.total).toBe(4)
    expect(d.panoAncho).toBe(875)
    // todos exactamente iguales
    for (const pano of d.panos) expect(pano.ancho).toBe(875)
    expect(d.enteros).toBe(0) // ninguno usa la chapa completa: todos se recortan
  })

  it('los paños son todos iguales, sea cual sea la medida', () => {
    for (const cm of [130, 233, 350, 407, 512]) {
      const d = despiezar(desdeCm(cm), desdeCm(210), CHAPA_1000, PROP_1A2)
      const anchos = new Set(d.panos.map((p) => p.ancho))
      const altos = new Set(d.panos.map((p) => p.alto))
      expect(anchos.size, `ancho ${cm}`).toBe(1)
      expect(altos.size, `alto ${cm}`).toBe(1)
    }
  })

  it('ningún paño se pasa de la chapa: todos son cortables', () => {
    for (const cm of [130, 233, 350, 407, 512, 1180]) {
      const d = despiezar(desdeCm(cm), desdeCm(390), CHAPA_1000, PROP_1A2)
      expect(d.panoAncho, `ancho ${cm}`).toBeLessThanOrEqual(1000)
      expect(d.panoAlto, `alto ${cm}`).toBeLessThanOrEqual(2000)
    }
  })

  it('usa la menor cantidad posible de paños', () => {
    // 3,50 m con paños de hasta 1000: menos de 4 es imposible.
    const d = despiezar(desdeCm(350), desdeCm(200), CHAPA_1000, PROP_1A2)
    expect(d.columnas).toBe(4)
    expect((d.columnas - 1) * 1000).toBeLessThan(3500)
  })

  it('una superficie más chica que una chapa es un solo paño', () => {
    const d = despiezar(desdeCm(80), desdeCm(90), CHAPA_1000, PROP_1A2)
    expect(d.total).toBe(1)
    expect(d.panos[0]!.ancho).toBe(800)
    expect(d.panos[0]!.alto).toBe(900)
  })

  it('los paños cubren la superficie entera, sin huecos ni encimarse', () => {
    const ancho = desdeCm(350)
    const alto = desdeCm(430)
    const d = despiezar(ancho, alto, CHAPA_1000, PROP_1A2)
    let suma = 0
    for (const pano of d.panos) suma += pano.ancho * pano.alto
    expect(suma).toBeCloseTo(ancho * alto, 6)
    for (const pano of d.panos) {
      expect(pano.x + pano.ancho).toBeLessThanOrEqual(ancho + 1e-6)
      expect(pano.y + pano.alto).toBeLessThanOrEqual(alto + 1e-6)
    }
  })

  it('"una chapa y media" es el material que se usa, no lo que se compra', () => {
    // 1,50 x 2,00 m = 3 m2. Una chapa de 1000x2000 son 2 m2, asi que el
    // material da 1,5 chapas. Pero salen 2 paños de 750, o sea 2 chapas.
    const d = despiezar(desdeCm(150), desdeCm(200), CHAPA_1000, PROP_1A2)
    expect(d.chapasDeMaterial).toBeCloseTo(1.5, 9)
    expect(d.total).toBe(2)
    expect(d.superficieComprada).toBeCloseTo(4, 9)
    expect(resumenMaterial(d)).toBe('1,5 chapas de material')
  })

  it('el desperdicio es lo que sobra de la chapa comprada', () => {
    const d = despiezar(desdeCm(350), desdeCm(200), CHAPA_1000, PROP_1A2)
    expect(d.superficieComprada).toBeCloseTo(8, 9)
    expect(d.superficieCubierta).toBeCloseTo(7, 9)
    expect(d.desperdicio).toBeCloseTo(1 / 8, 9)
  })

  it('si entra justo no se desperdicia nada', () => {
    const d = despiezar(mm(2000), mm(2000), CHAPA_1000, PROP_1A2)
    expect(d.total).toBe(2)
    expect(d.desperdicio).toBeCloseTo(0, 9)
    expect(d.chapasDeMaterial).toBeCloseTo(2, 9)
  })
})

describe('elección de formato', () => {
  it('elige el que necesita menos chapas', () => {
    // 2,40 x 2,40: con 1000x2000 son 3x2 = 6; con 1220x2440 son 2x1 = 2.
    const ancho = desdeCm(240)
    const alto = desdeCm(240)
    expect(despiezar(ancho, alto, CHAPA_1000, PROP_1A2).total).toBe(6)
    expect(despiezar(ancho, alto, CHAPA_1220, PROP_1A2).total).toBe(2)
    expect(mejorFormato(ancho, alto, PROP_1A2).nombre).toBe('1220 × 2440')
  })

  it('con empate gana el más chico, que es más fácil de manejar', () => {
    const f = mejorFormato(desdeCm(90), desdeCm(90), PROP_1A2)
    expect(f.nombre).toBe('1000 × 2000')
  })
})

describe('el texto que lee el vendedor', () => {
  it('dice cuántos paños y de qué medida', () => {
    expect(resumen(despiezar(desdeCm(400), desdeCm(200), CHAPA_1000, PROP_1A2)))
      .toBe('4 paños de 100 × 200 cm')
    expect(resumen(despiezar(desdeCm(350), desdeCm(200), CHAPA_1000, PROP_1A2)))
      .toBe('4 paños de 87,5 × 200 cm')
  })
  it('en singular cuando es uno solo', () => {
    expect(resumen(despiezar(desdeCm(80), desdeCm(90), CHAPA_1000, PROP_1A2)))
      .toBe('1 paño de 80 × 90 cm')
  })
})

describe('la chapa de 1500 × 3000', () => {
  const CHAPA_1500 = FORMATOS[2]!

  it('está en el catálogo de formatos', () => {
    expect(CHAPA_1500.nombre).toBe('1500 × 3000')
    expect(CHAPA_1500.ancho).toBe(1500)
    expect(CHAPA_1500.alto).toBe(3000)
  })

  it('también es 1:2, así que los modelos entran enteros', () => {
    const p = medidaDelPano(CHAPA_1500, PROP_1A2)
    expect(p.ancho).toBe(1500)
    expect(p.alto).toBe(3000)
  })

  it('cubre la misma pared con menos paños', () => {
    const ancho = desdeCm(350)
    const alto = desdeCm(280)
    expect(despiezar(ancho, alto, CHAPA_1000, PROP_1A2).total).toBe(8) // 4 x 2
    expect(despiezar(ancho, alto, CHAPA_1500, PROP_1A2).total).toBe(3) // 3 x 1
  })

  it('y la elige sola cuando conviene', () => {
    expect(mejorFormato(desdeCm(350), desdeCm(280), PROP_1A2).nombre).toBe('1500 × 3000')
  })

  it('pero no cuando la pared es chica: gana la que desperdicia menos', () => {
    // Una pared de 0,90 x 1,80 entra en cualquiera. Con empate a un paño gana
    // la más chica, que desperdicia mucho menos chapa.
    const chica = despiezar(desdeCm(90), desdeCm(180), CHAPA_1000, PROP_1A2)
    const grande = despiezar(desdeCm(90), desdeCm(180), CHAPA_1500, PROP_1A2)
    expect(chica.total).toBe(grande.total)
    expect(chica.desperdicio).toBeLessThan(grande.desperdicio)
    expect(mejorFormato(desdeCm(90), desdeCm(180), PROP_1A2).nombre).toBe('1000 × 2000')
  })
})
