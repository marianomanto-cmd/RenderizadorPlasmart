import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  DIBUJO_ENTERO,
  SIN_MARCO,
  areaLibreVisible,
  enElMarco,
  esMetal,
  hayMetalEnPano,
  marcoDesdeMm,
  prepararTransforme,
} from './ajuste.js'
import {
  areaLibre,
  desempaquetarMascara,
  empaquetarMascara,
  mascaraDesdeFuncion,
} from './mascara.js'
import type { AjustePatron, Mascara } from './types.js'

const RAIZ3 = Math.sqrt(3)

describe('área libre contra la fórmula cerrada', () => {
  // El brief pide comprobar el conteo de píxeles contra los dos casos que sí
  // tienen fórmula: círculos en cuadro y al tresbolillo. Es la red de seguridad
  // del número que después sostiene el peso.

  it('círculos en cuadro, dentro del 1%', () => {
    const k = 4 // 4 x 4 círculos
    const r = 0.09 // radio, en fracción del lado
    const m = mascaraDesdeFuncion(2048, 2048, (x, y) => {
      for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) {
          const cx = (i + 0.5) / k
          const cy = (j + 0.5) / k
          if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return false
        }
      }
      return true
    })
    const analitico = k * k * Math.PI * r * r
    const medido = areaLibre(m)
    expect(Math.abs(medido - analitico) / analitico).toBeLessThan(0.01)
  })

  it('círculos al tresbolillo, dentro del 1%', () => {
    // La celda que se repite NO es el rectángulo obvio. Para una red triangular
    // de paso p, la celda rectangular mide p por p·raíz(3) y contiene DOS
    // círculos: uno repartido entre las cuatro esquinas y otro entero en el
    // medio. Elegir mal la celda da un número equivocado y la fórmula analítica
    // no te salva, porque los dos lados estarían mal a la vez.
    const r = 0.25
    const centros: readonly (readonly [number, number])[] = [
      [0, 0], [1, 0], [0, RAIZ3], [1, RAIZ3], [0.5, RAIZ3 / 2],
    ]
    const m = mascaraDesdeFuncion(1024, Math.round(1024 * RAIZ3), (x, yn) => {
      const y = yn * RAIZ3
      for (const [cx, cy] of centros) {
        if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return false
      }
      return true
    })
    const analitico = (2 * Math.PI * r * r) / RAIZ3
    const medido = areaLibre(m)
    expect(Math.abs(medido - analitico) / analitico).toBeLessThan(0.01)
  })

  it('una máscara toda metal da cero y una toda aire da uno', () => {
    expect(areaLibre(mascaraDesdeFuncion(64, 64, () => true))).toBe(0)
    expect(areaLibre(mascaraDesdeFuncion(64, 64, () => false))).toBe(1)
  })

  it('media y media da la mitad', () => {
    expect(areaLibre(mascaraDesdeFuncion(64, 64, (x) => x < 0.5))).toBeCloseTo(0.5, 10)
  })
})

describe('los tres modos de ajuste', () => {
  const PROP_MASCARA = 0.5 // el dibujo del catálogo es vertical, 1:2

  const modos = (escala = 1): readonly AjustePatron[] => [
    { modo: 'estirar', escala },
    { modo: 'mosaico', escala },
    { modo: 'recortar', escala },
  ]

  it('cuando el paño tiene la misma forma que el dibujo, los tres coinciden', () => {
    // Es la mejor prueba de que la formulación está bien planteada: si el paño
    // ya tiene la proporción del dibujo, no hay nada que decidir, y los tres
    // modos tienen que dar exactamente la misma transformación.
    const ts = modos().map((a) => prepararTransforme(a, PROP_MASCARA, PROP_MASCARA))
    const [primero] = ts
    for (const t of ts) {
      expect(t.escalaU).toBeCloseTo(primero!.escalaU, 12)
      expect(t.desplazU).toBeCloseTo(primero!.desplazU, 12)
      expect(t.escalaV).toBeCloseTo(primero!.escalaV, 12)
      expect(t.desplazV).toBeCloseTo(primero!.desplazV, 12)
    }
    expect(primero!.escalaU).toBeCloseTo(1, 12)
    expect(primero!.desplazU).toBeCloseTo(0, 12)
  })

  it('recortar y mosaico NO deforman el dibujo, estirar sí', () => {
    // Una distancia del dibujo se estira igual a lo ancho que a lo alto si y
    // solo si  escalaU · propMascara / propPano === escalaV.
    const noDeforma = (a: AjustePatron, P: number): boolean => {
      const t = prepararTransforme(a, P, PROP_MASCARA)
      return Math.abs((t.escalaU * PROP_MASCARA) / P - t.escalaV) < 1e-12
    }
    for (const P of [0.25, 0.5, 1, 2, 4]) {
      expect(noDeforma({ modo: 'recortar', escala: 1 }, P)).toBe(true)
      expect(noDeforma({ modo: 'mosaico', escala: 1 }, P)).toBe(true)
      expect(noDeforma({ modo: 'mosaico', escala: 0.3 }, P)).toBe(true)
      // estirar solo no deforma cuando las formas ya coinciden
      expect(noDeforma({ modo: 'estirar', escala: 1 }, P)).toBe(P === PROP_MASCARA)
    }
  })

  it('recortar siempre tapa el paño entero', () => {
    for (const P of [0.25, 0.5, 1, 2, 4, 8]) {
      const t = prepararTransforme({ modo: 'recortar', escala: 1 }, P, PROP_MASCARA)
      for (const u of [0, 0.5, 1]) {
        for (const v of [0, 0.5, 1]) {
          const mu = t.escalaU * u + t.desplazU
          const mv = t.escalaV * v + t.desplazV
          expect(mu).toBeGreaterThanOrEqual(-1e-9)
          expect(mu).toBeLessThanOrEqual(1 + 1e-9)
          expect(mv).toBeGreaterThanOrEqual(-1e-9)
          expect(mv).toBeLessThanOrEqual(1 + 1e-9)
        }
      }
    }
  })

  it('mosaico repite la cantidad de veces que dice la escala', () => {
    const rayas: Mascara = mascaraDesdeFuncion(256, 512, (_x, y) => y < 0.5)
    // escala 0.5 = dos repeticiones a lo alto, así que v y v+0.5 caen en el
    // mismo lugar del dibujo.
    const t = prepararTransforme({ modo: 'mosaico', escala: 0.5 }, 1, 0.5)
    for (const v of [0.05, 0.17, 0.33, 0.49]) {
      expect(hayMetalEnPano(rayas, t, 0.5, v)).toBe(hayMetalEnPano(rayas, t, 0.5, v + 0.5))
    }
  })
})

describe('área libre de lo que realmente se ve', () => {
  // Un dibujo con más agujeros arriba que abajo. Al recortar un paño ancho, se
  // ve solo la franja del medio, así que el número que va en pantalla no es el
  // del catálogo.
  const desparejo = mascaraDesdeFuncion(512, 1024, (_x, y) => y > 0.35)

  it('con estirar se ve el dibujo entero, así que coincide con el catálogo', () => {
    const t = prepararTransforme({ modo: 'estirar', escala: 1 }, 3, 0.5)
    expect(areaLibreVisible(desparejo, t, SIN_MARCO, 256)).toBeCloseTo(areaLibre(desparejo), 2)
  })

  it('con recortar en un paño ancho se ve otra cosa, y hay que decirlo', () => {
    const delCatalogo = areaLibre(desparejo)
    const t = prepararTransforme({ modo: 'recortar', escala: 1 }, 6, 0.5)
    const visible = areaLibreVisible(desparejo, t, SIN_MARCO, 256)
    expect(Math.abs(visible - delCatalogo)).toBeGreaterThan(0.05)
  })
})

interface Fila {
    id: string
    linea: string
    segmentos: number
    ancho: number
    alto: number
    areaLibre: number
  mascaraAncho: number
  mascaraAlto: number
  mascara: string
}
const indiceGlobal: Fila[] = JSON.parse(readFileSync('public/modelos/indice.json', 'utf8'))

describe('el catálogo extraído del PDF', () => {
  const indice = indiceGlobal

  it('están los 63 modelos', () => {
    expect(indice).toHaveLength(63)
    expect(new Set(indice.map((m) => m.id)).size).toBe(63)
  })

  it('las cuatro líneas tienen la cantidad que dice el catálogo', () => {
    const porLinea = (l: string) => indice.filter((m) => m.linea === l).length
    expect(porLinea('botanicos')).toBe(16)
    expect(porLinea('ornamentales')).toBe(3)
    expect(porLinea('geometricos')).toBe(18)
    expect(porLinea('abstractos')).toBe(26)
  })

  it('ninguno quedó con una caja chica ni con dos segmentos', () => {
    // Este test existe por un bug real: el extractor agarró un adorno de 16 x 18
    // puntos en vez del paño de B.25 y le calculó 93,5% de área libre. Un paño
    // que es 93% agujero no se sostiene, pero nadie lo mira si no falla algo.
    for (const m of indice) {
      expect(m.ancho, m.id).toBeGreaterThan(150)
      expect(m.alto, m.id).toBeGreaterThan(150)
      expect(m.segmentos, m.id).toBeGreaterThan(100)
    }
  })

  it('el área libre de todos cae en un rango que se puede fabricar', () => {
    for (const m of indice) {
      expect(m.areaLibre, m.id).toBeGreaterThan(0.05)
      expect(m.areaLibre, m.id).toBeLessThan(0.70)
    }
  })

  it('las máscaras tienen la proporción del dibujo', () => {
    for (const m of indice) {
      const propDibujo = m.ancho / m.alto
      const propMascara = m.mascaraAncho / m.mascaraAlto
      expect(Math.abs(propMascara - propDibujo) / propDibujo, m.id).toBeLessThan(0.01)
    }
  })
})

describe('empaquetado de máscaras', () => {
  it('la ida y vuelta devuelve la misma máscara', () => {
    const original = mascaraDesdeFuncion(37, 23, (x, y) => (x * 7 + y * 11) % 0.3 < 0.15)
    const vuelta = desempaquetarMascara(empaquetarMascara(original), 37, 23)
    expect(vuelta.ancho).toBe(37)
    expect(vuelta.alto).toBe(23)
    expect([...vuelta.datos]).toEqual([...original.datos])
  })

  it('protesta si faltan bytes en vez de devolver basura', () => {
    expect(() => desempaquetarMascara(new Uint8Array(2), 64, 64)).toThrow(/incompleta/)
  })

  it('lee una máscara real del catálogo y el área libre coincide con el índice', () => {
    const fila = indiceGlobal.find((m) => m.id === 'B.01')!
    const bits = new Uint8Array(readFileSync(`public/modelos/${fila.mascara}`))
    const m = desempaquetarMascara(bits, fila.mascaraAncho, fila.mascaraAlto)
    // El índice mide con suavizado (sub-píxel) y esto cuenta píxeles enteros,
    // así que se permite medio punto de diferencia.
    expect(areaLibre(m)).toBeCloseTo(fila.areaLibre, 2)
  })
})

describe('el marco macizo del paño', () => {
  it('30 mm en un paño de 2400 x 1100 da la fracción de cada lado', () => {
    const m = marcoDesdeMm(30, 2400, 1100)
    expect(m.u).toBeCloseTo(30 / 2400, 12)
    expect(m.v).toBeCloseTo(30 / 1100, 12)
  })

  it('los bordes son metal y el centro no', () => {
    const m = marcoDesdeMm(30, 2400, 1100)
    expect(enElMarco(m, 0.001, 0.5)).toBe(true)
    expect(enElMarco(m, 0.999, 0.5)).toBe(true)
    expect(enElMarco(m, 0.5, 0.001)).toBe(true)
    expect(enElMarco(m, 0.5, 0.999)).toBe(true)
    expect(enElMarco(m, 0.5, 0.5)).toBe(false)
  })

  it('el marco tapa el dibujo: donde hay marco siempre hay metal', () => {
    const todoAire = mascaraDesdeFuncion(64, 128, () => false)
    const t = prepararTransforme({ modo: 'estirar', escala: 1 }, 2, 0.5)
    const marco = marcoDesdeMm(30, 2400, 1100)
    expect(esMetal(todoAire, t, marco, 0.5, 0.5)).toBe(false)
    expect(esMetal(todoAire, t, marco, 0.002, 0.5)).toBe(true)
  })
})

describe('repetir sin arrastrar el marco del modelo', () => {
  // El bug que esto arregla se ve: repetir el dibujo tal cual repite su marco
  // macizo y aparece una grilla de líneas negras a lo largo de todo el paño.
  const interior = { x0: 0.05, x1: 0.95, y0: 0.025, y1: 0.975 }

  it('al repetir se usa solo el interior del dibujo', () => {
    const t = prepararTransforme({ modo: 'mosaico', escala: 0.5 }, 3, 0.5, interior)
    expect(t.mu0).toBeCloseTo(0.05, 12)
    expect(t.muRango).toBeCloseTo(0.9, 12)
    expect(t.mv0).toBeCloseTo(0.025, 12)
    expect(t.mvRango).toBeCloseTo(0.95, 12)
  })

  it('un dibujo que es todo marco y nada más nunca se muestrea adentro del marco', () => {
    // El modelo es marco macizo por fuera y aire por dentro. Al repetirlo solo
    // por el interior, no tiene que aparecer nunca metal.
    const soloMarco = mascaraDesdeFuncion(400, 800, (x, y) =>
      x < 0.05 || x > 0.95 || y < 0.025 || y > 0.975,
    )
    const t = prepararTransforme({ modo: 'mosaico', escala: 0.4 }, 3, 0.5, interior)
    let metal = 0
    for (let i = 0; i < 40; i++) {
      for (let j = 0; j < 40; j++) {
        if (hayMetalEnPano(soloMarco, t, (i + 0.5) / 40, (j + 0.5) / 40)) metal++
      }
    }
    expect(metal).toBe(0)
  })

  it('los otros dos modos siguen usando el dibujo entero, marco incluido', () => {
    for (const modo of ['estirar', 'recortar'] as const) {
      const t = prepararTransforme({ modo, escala: 1 }, 3, 0.5, interior)
      expect(t.mu0).toBe(DIBUJO_ENTERO.x0)
      expect(t.muRango).toBe(1)
      expect(t.mv0).toBe(DIBUJO_ENTERO.y0)
      expect(t.mvRango).toBe(1)
    }
  })

  it('al repetir, el motivo tampoco se deforma', () => {
    const muRango = interior.x1 - interior.x0
    const mvRango = interior.y1 - interior.y0
    const propInterior = 0.5 * (muRango / mvRango)
    for (const P of [0.5, 1, 3, 6]) {
      const t = prepararTransforme({ modo: 'mosaico', escala: 0.4 }, P, 0.5, interior)
      // misma condición que antes, pero con la proporción del interior
      expect(Math.abs((t.escalaU * propInterior) / P - t.escalaV)).toBeLessThan(1e-12)
    }
  })
})
