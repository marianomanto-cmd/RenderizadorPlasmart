import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  SIN_MARCO,
  areaLibreVisible,
  dentroDelPatron,
  esMetal,

  marcoDesdeMm,
  prepararTransformeDespiece,
} from './ajuste.js'
import {
  areaLibre,
  desempaquetarMascara,
  empaquetarMascara,
  mascaraDesdeFuncion,
} from './mascara.js'


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

describe('el despiece manda sobre el dibujo', () => {
  // El tamaño del motivo no es una decisión de diseño: lo fija la chapa. Una
  // superficie se cubre con N paños y cada uno lleva el dibujo entero.

  it('se repite tantas veces como paños haya', () => {
    const t = prepararTransformeDespiece(4, 1)
    expect(t.escalaU).toBe(4)
    expect(t.escalaV).toBe(1)
    expect(t.repetir).toBe(true)
  })

  it('usa el dibujo entero, con su marco: esa línea es la junta', () => {
    const t = prepararTransformeDespiece(3, 2)
    expect(t.mu0).toBe(0)
    expect(t.muRango).toBe(1)
    expect(t.mv0).toBe(0)
    expect(t.mvRango).toBe(1)
  })

  it('cada paño arranca el dibujo desde cero: nunca queda medio motivo cortado', () => {
    // Como la cantidad de paños es entera, el borde de cada paño cae justo en
    // el borde del dibujo. Es lo que da el reparto equitativo.
    const t = prepararTransformeDespiece(4, 1)
    for (const columna of [0, 1, 2, 3]) {
      const inicio = dentroDelPatron(t, columna / 4 + 1e-9, 0.5)
      expect(inicio.mu).toBeCloseTo(0, 6)
    }
  })

  it('un solo paño es el dibujo sin repetir', () => {
    const t = prepararTransformeDespiece(1, 1)
    const a = dentroDelPatron(t, 0.25, 0.75)
    expect(a.mu).toBeCloseTo(0.25, 12)
    expect(a.mv).toBeCloseTo(0.75, 12)
  })

  it('el centro de cada paño cae en el centro del dibujo', () => {
    const t = prepararTransformeDespiece(3, 2)
    for (const c of [0, 1, 2]) {
      for (const f of [0, 1]) {
        const p = dentroDelPatron(t, (c + 0.5) / 3, (f + 0.5) / 2)
        expect(p.mu).toBeCloseTo(0.5, 9)
        expect(p.mv).toBeCloseTo(0.5, 9)
      }
    }
  })
})

describe('el marco macizo es de CADA paño, no del conjunto', () => {
  // Es el error que hay que no cometer: si el marco se midiera contra la
  // superficie entera, los paños del medio saldrían sin borde y el conjunto se
  // vería como una sola pieza gigante en vez de como las chapas que es.
  const todoAire = mascaraDesdeFuncion(64, 128, () => false)
  const t = prepararTransformeDespiece(4, 1)
  const marco = marcoDesdeMm(30, 875, 2000) // contra el PAÑO, no la superficie

  it('30 mm sobre un paño de 87,5 cm dan la fracción del paño', () => {
    expect(marco.u).toBeCloseTo(30 / 875, 12)
    expect(marco.v).toBeCloseTo(30 / 2000, 12)
  })

  it('hay borde macizo en los cuatro paños, no solo en las puntas', () => {
    for (const columna of [0, 1, 2, 3]) {
      const justoDespuesDelBorde = columna / 4 + 0.0005
      expect(esMetal(todoAire, t, marco, justoDespuesDelBorde, 0.5), `paño ${columna}`).toBe(true)
    }
  })

  it('y en el medio de cada paño no hay nada, porque el dibujo es todo aire', () => {
    for (const columna of [0, 1, 2, 3]) {
      expect(esMetal(todoAire, t, marco, (columna + 0.5) / 4, 0.5)).toBe(false)
    }
  })

  it('sin marco, un dibujo todo aire no pinta nada en ningún lado', () => {
    for (const u of [0.001, 0.25, 0.5, 0.999]) {
      expect(esMetal(todoAire, t, SIN_MARCO, u, 0.5)).toBe(false)
    }
  })
})

describe('área libre de lo que realmente se ve', () => {
  it('con un paño y sin marco coincide con la del dibujo', () => {
    const m = mascaraDesdeFuncion(256, 512, (x) => Math.floor(x * 8) % 2 === 0)
    const t = prepararTransformeDespiece(1, 1)
    expect(areaLibreVisible(m, t, SIN_MARCO, 256)).toBeCloseTo(areaLibre(m), 2)
  })

  it('repetir el dibujo no cambia cuánto agujero hay', () => {
    // Cubrir la misma pared con 1 paño o con 4 no cambia la proporción de
    // agujero, solo el tamaño del motivo.
    const m = mascaraDesdeFuncion(256, 512, (x) => Math.floor(x * 8) % 2 === 0)
    const uno = areaLibreVisible(m, prepararTransformeDespiece(1, 1), SIN_MARCO, 256)
    const cuatro = areaLibreVisible(m, prepararTransformeDespiece(4, 1), SIN_MARCO, 256)
    expect(cuatro).toBeCloseTo(uno, 2)
  })

  it('más paños dejan MENOS agujero, porque hay más bordes macizos', () => {
    // El marco hay que calcularlo contra el paño de CADA despiece, no una vez y
    // reusarlo: son 30 mm fijos, así que sobre un paño angosto pesan mucho más.
    // Misma pared de 3,50 m, un paño contra seis.
    const m = mascaraDesdeFuncion(256, 512, () => false)
    const uno = areaLibreVisible(
      m, prepararTransformeDespiece(1, 1), marcoDesdeMm(30, 3500, 2000), 256,
    )
    const seis = areaLibreVisible(
      m, prepararTransformeDespiece(6, 1), marcoDesdeMm(30, 3500 / 6, 2000), 256,
    )
    // Con el dibujo todo aire, el agujero que queda es exactamente lo de
    // adentro del marco, y se puede calcular a mano:
    const esperado = (anchoPano: number) =>
      (1 - (2 * 30) / anchoPano) * (1 - (2 * 30) / 2000)
    // Tolerancia relativa del 2%: con seis paños el marco mide apenas un par de
    // muestras de ancho, así que el conteo redondea. Es error de medición del
    // test, no del cálculo.
    const cerca = (medido: number, exacto: number) =>
      Math.abs(medido - exacto) / exacto < 0.02
    expect(cerca(uno, esperado(3500)), `uno=${uno}`).toBe(true)        // ~0,953
    expect(cerca(seis, esperado(3500 / 6)), `seis=${seis}`).toBe(true) // ~0,870
    expect(seis).toBeLessThan(uno)
  })
})

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


