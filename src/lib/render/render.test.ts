import { describe, expect, it } from 'vitest'
import { aplicarInversa, homografiaConInversa } from '../geometry/homography.js'
import type { Quad } from '../geometry/types.js'
import {
  SIN_MARCO,
  areaLibreVisible,
  esMetal,
  marcoDesdeMm,
  prepararTransformeDespiece,
} from '../pattern/ajuste.js'
import { mascaraDesdeFuncion } from '../pattern/mascara.js'
import { construirPiramide } from '../pattern/piramide.js'
import { coberturaEnNivel } from '../pattern/piramide.js'
import { componer, renderizarPano } from './render.js'
import { COLOR_MATERIAL, type CapaPano, type EspecRender, type Imagen } from './types.js'

const q = (
  x0: number, y0: number, x1: number, y1: number,
  x2: number, y2: number, x3: number, y3: number,
): Quad => [
  { x: x0, y: y0 }, { x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 },
]

/** Casi de frente, que es como salen las fotos de verdad. */
const CASI_FRENTE = q(0.15, 0.2, 0.85, 0.22, 0.86, 0.78, 0.14, 0.76)
/** Con fuga fuerte, parado a un costado del frente. */
const EN_ANGULO = q(0.12, 0.28, 0.78, 0.12, 0.88, 0.82, 0.18, 0.7)

/** Rayas verticales: mitad metal, mitad aire, con área libre exacta 1/2. */
const RAYAS = mascaraDesdeFuncion(256, 512, (x) => Math.floor(x * 16) % 2 === 0)
const TODO_METAL = mascaraDesdeFuncion(64, 128, () => true)
const TODO_AIRE = mascaraDesdeFuncion(64, 128, () => false)

const P_RAYAS = construirPiramide(RAYAS)
const P_METAL = construirPiramide(TODO_METAL)
const P_AIRE = construirPiramide(TODO_AIRE)

function spec(over: Partial<EspecRender> = {}): EspecRender {
  const transforme = prepararTransformeDespiece(1, 1)
  return {
    anchoFoto: 240,
    altoFoto: 180,
    quad: CASI_FRENTE,
    piramide: P_RAYAS,
    transforme,
    marco: SIN_MARCO,
    color: COLOR_MATERIAL.galvanizado,
    areaMetal: 0.5,
    calidad: 3,
    ...over,
  }
}

const debeSerOk = (r: ReturnType<typeof renderizarPano>): CapaPano => {
  if (!r.ok) throw new Error(`esperaba ok, vino ${r.error.kind}`)
  return r.value
}

/**
 * Recorre los píxeles de la capa diciendo, para cada uno, si su centro cae
 * adentro del paño. Se usa la geometría de verdad y no una copia, que para eso
 * ya está probada aparte.
 */
function porPixel(
  e: EspecRender,
  c: CapaPano,
  visita: (alfa: number, adentro: boolean) => void,
): void {
  const enPx: Quad = [0, 1, 2, 3].map((k) => ({
    x: e.quad[k as 0]!.x * e.anchoFoto,
    y: e.quad[k as 0]!.y * e.altoFoto,
  })) as unknown as Quad
  const h = homografiaConInversa(enPx)
  if (!h.ok) throw new Error('quad inválido en el test')
  for (let py = 0; py < c.alto; py++) {
    for (let px = 0; px < c.ancho; px++) {
      const uv = aplicarInversa(h.value.inversa, c.x + px + 0.5, c.y + py + 0.5)
      const adentro = uv !== null && uv.u >= 0 && uv.u <= 1 && uv.v >= 0 && uv.v <= 1
      visita(c.datos[(py * c.ancho + px) * 4 + 3]! / 255, adentro)
    }
  }
}

/**
 * Cobertura promedio sobre los píxeles de ADENTRO del paño.
 *
 * Tiene que incluir los agujeros, que valen cero. Promediar solo los píxeles
 * que tienen algo pintado sería promediar nada más que el metal, y daría
 * siempre cerca de uno midiera lo que midiera.
 */
function coberturaMedia(e: EspecRender, c: CapaPano): number {
  let suma = 0
  let cuantos = 0
  porPixel(e, c, (alfa, adentro) => {
    if (adentro) { suma += alfa; cuantos++ }
  })
  return cuantos === 0 ? 0 : suma / cuantos
}

describe('la capa que devuelve', () => {
  it('sale recortada a la caja del paño, no del tamaño de la foto', () => {
    const c = debeSerOk(renderizarPano(spec()))
    expect(c.ancho).toBeLessThan(240)
    expect(c.alto).toBeLessThan(180)
    // El paño va de x 0,14 a 0,86 sobre 240 px. La caja se redondea hacia
    // afuera para no comerse el borde suavizado, así que suma hasta dos píxeles.
    expect(c.x).toBe(Math.floor(0.14 * 240))
    expect(c.ancho).toBe(Math.ceil(0.86 * 240) - Math.floor(0.14 * 240))
  })

  it('un cuadrilátero imposible devuelve un error con nombre, no una capa rota', () => {
    const r = renderizarPano(spec({ quad: q(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5) }))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('area-nula')
  })

  it('el mismo pedido dos veces da byte por byte lo mismo', () => {
    // Si el mismo frente diera dos renders distintos en dos visitas, el vendedor
    // quedaría como que improvisa. Es lo único que esta herramienta vende.
    const a = debeSerOk(renderizarPano(spec({ quad: EN_ANGULO })))
    const b = debeSerOk(renderizarPano(spec({ quad: EN_ANGULO })))
    expect([...a.datos]).toEqual([...b.datos])
  })
})

describe('lo de afuera del paño queda intacto', () => {
  it('ningún píxel de afuera del paño queda pintado de lleno', () => {
    // El invariante de verdad, dicho directo: donde el centro del píxel cae
    // fuera del paño, no puede haber metal macizo. Se permite algo de gris
    // porque el borde se suaviza, y ese suavizado es justamente lo que se quiere.
    const e = spec({ quad: EN_ANGULO, piramide: P_METAL, areaMetal: 1 })
    const c = debeSerOk(renderizarPano(e))
    let afueraOpacos = 0
    porPixel(e, c, (alfa, adentro) => {
      if (!adentro && alfa > 0.75) afueraOpacos++
    })
    expect(afueraOpacos).toBe(0)
  })

  it('una máscara todo aire no pinta absolutamente nada', () => {
    const c = debeSerOk(renderizarPano(spec({ piramide: P_AIRE, areaMetal: 0 })))
    expect(c.datos.every((v) => v === 0)).toBe(true)
  })

  it('con marco, el borde del paño sí es macizo aunque el dibujo sea todo aire', () => {
    const marco = marcoDesdeMm(60, 2400, 1100)
    const c = debeSerOk(renderizarPano(spec({ piramide: P_AIRE, areaMetal: 0, marco })))
    expect(c.datos.some((v, i) => i % 4 === 3 && v > 200)).toBe(true)
  })
})

describe('el render y el presupuesto dicen lo mismo', () => {
  // Es el test que más ata el sistema: el agujero que se ve en la pantalla tiene
  // que ser el mismo número que le decimos al cliente. Si alguna vez se
  // separan, uno de los dos está mintiendo.
  it('la cobertura media coincide con el área de metal calculada', () => {
    for (const quad of [CASI_FRENTE, EN_ANGULO]) {
      const t = prepararTransformeDespiece(1, 1)
      const areaMetal = 1 - areaLibreVisible(RAYAS, t, SIN_MARCO, 256)
      const e = spec({ quad, transforme: t, areaMetal })
      expect(coberturaMedia(e, debeSerOk(renderizarPano(e)))).toBeCloseTo(areaMetal, 1)
    }
  })
})

describe('el suavizado no cambia el promedio, solo el ruido', () => {
  // Es la garantía contra el muaré dicha como propiedad: tomar más muestras
  // tiene que afinar el dibujo, nunca oscurecerlo ni aclararlo.
  it('arrastrando y al soltar dan la misma cobertura media', () => {
    // Esta es LA garantía. Bajar la calidad puede volver el dibujo más borroso,
    // pero nunca puede oscurecer ni aclarar el paño, porque entonces el render
    // y el número del presupuesto se separarían según qué tan rápido se arrastre.
    const a = spec({ quad: EN_ANGULO, calidad: 1 })
    const b = spec({ quad: EN_ANGULO, calidad: 3 })
    expect(coberturaMedia(a, debeSerOk(renderizarPano(a))))
      .toBeCloseTo(coberturaMedia(b, debeSerOk(renderizarPano(b))), 1)
  })

  it('arrastrando también se ve el dibujo, no un gris plano', () => {
    // Antes de la pirámide, a calidad 1 el paño salía gris parejo: promediar
    // todo a un número arreglaba el muaré pero borraba el dibujo, y el vendedor
    // arrastraba sin ver nada. Con la pirámide se lee el dibujo ya achicado, que
    // conserva la estructura. Esto lo mide: tiene que haber contraste de verdad,
    // no un tono uniforme.
    const contraste = (e: EspecRender): number => {
      const c = debeSerOk(renderizarPano(e))
      const vs: number[] = []
      porPixel(e, c, (alfa, adentro) => { if (adentro) vs.push(alfa) })
      const media = vs.reduce((a, b) => a + b, 0) / vs.length
      return Math.sqrt(vs.reduce((a, b) => a + (b - media) ** 2, 0) / vs.length)
    }
    // un gris plano daria cerca de cero
    expect(contraste(spec({ quad: EN_ANGULO, calidad: 1 }))).toBeGreaterThan(0.2)
    expect(contraste(spec({ quad: EN_ANGULO, calidad: 3 }))).toBeGreaterThan(0.2)
  })
})

describe('componer sobre la foto', () => {
  const foto = (): Imagen => {
    const datos = new Uint8ClampedArray(240 * 180 * 4)
    for (let i = 0; i < datos.length; i += 4) {
      datos[i] = 200; datos[i + 1] = 100; datos[i + 2] = 50; datos[i + 3] = 255
    }
    return { ancho: 240, alto: 180, datos }
  }

  it('donde no hay metal, la foto queda tal cual: por el agujero se ve el vidrio', () => {
    const c = debeSerOk(renderizarPano(spec({ piramide: P_AIRE, areaMetal: 0 })))
    const salida = componer(foto(), c)
    expect([...salida.datos]).toEqual([...foto().datos])
  })

  it('donde el metal es macizo, tapa la foto con el color del material', () => {
    const c = debeSerOk(renderizarPano(spec({ piramide: P_METAL, areaMetal: 1 })))
    const salida = componer(foto(), c)
    // el centro del paño está bien adentro
    const i = (Math.round(180 * 0.5) * 240 + Math.round(240 * 0.5)) * 4
    expect(salida.datos[i]).toBeCloseTo(COLOR_MATERIAL.galvanizado.r, 0)
    expect(salida.datos[i + 1]).toBeCloseTo(COLOR_MATERIAL.galvanizado.g, 0)
  })

  it('no toca nada fuera de la caja del paño', () => {
    const c = debeSerOk(renderizarPano(spec({ piramide: P_METAL, areaMetal: 1 })))
    const salida = componer(foto(), c)
    expect(salida.datos[0]).toBe(200) // esquina de la foto, lejos del paño
    expect(salida.datos[1]).toBe(100)
  })
})

describe('imagen de referencia', () => {
  /** Dibuja el alfa como texto, para que un cambio se vea en el diff. */
  function comoTexto(c: CapaPano, cols = 36, filas = 14): string {
    const escala = ' .:-=+*#%@'
    const lineas: string[] = []
    for (let fy = 0; fy < filas; fy++) {
      let linea = ''
      for (let fx = 0; fx < cols; fx++) {
        let suma = 0
        let n = 0
        const px0 = Math.floor((fx * c.ancho) / cols)
        const px1 = Math.max(px0 + 1, Math.floor(((fx + 1) * c.ancho) / cols))
        const py0 = Math.floor((fy * c.alto) / filas)
        const py1 = Math.max(py0 + 1, Math.floor(((fy + 1) * c.alto) / filas))
        for (let py = py0; py < py1; py++) {
          for (let px = px0; px < px1; px++) {
            suma += c.datos[(py * c.ancho + px) * 4 + 3]! / 255
            n++
          }
        }
        const v = n === 0 ? 0 : suma / n
        linea += escala[Math.min(escala.length - 1, Math.round(v * (escala.length - 1)))]
      }
      lineas.push(linea)
    }
    return lineas.join('\n')
  }

  it('el paño en ángulo se dibuja exactamente igual que siempre', () => {
    // Cualquier cambio que mueva un píxel del patrón tiene que romper esto, y
    // el diff muestra QUÉ cambió en vez de decir que un hash no coincide.
    const c = debeSerOk(renderizarPano(spec({ quad: EN_ANGULO, calidad: 3 })))
    expect('\n' + comoTexto(c) + '\n').toMatchInlineSnapshot(`
      "
                               :=+.       
                   . .==  *%%  -@@=       
         . .- -*. %%  %@. =@@. .@@#       
      +=.@:-@-:@= *@- +@= .@@+  #@@.      
      =% %+ %+ %# -@* :@%  #@%  =@@=      
      .@:=% +% +@. @@  %@. =@@: :@@%      
       #+.@:-@::@= *@- *@+ .@@+  %@@.     
       -% #+ %+ %% -@* -@%  *@%  +@@+     
       .@:=% +# +@: %@..@@: -@@: .@@%     
        *+.@-:@.:@+ +@- *@+ .@@+  %@@:    
        -% #* %= %% -@* -@%  *@%  =@@+    
         *.=% *# +@: %@..@@: -@@: .@@%    
               . .-: -*: *%+  @@+  #@@:   
                              :::  -+*-   
      "
    `)
  })
})

describe('el camino rápido coincide con las funciones de referencia', () => {
  it('la cuenta escrita a mano adentro del bucle da lo mismo que esMetal()', () => {
    // El bucle del render tiene copiada a mano la cuenta de aplicarInversa() y
    // esMetal(), porque llamarlas creaba un objeto por muestra y eso era casi
    // todo el tiempo de render. Dos implementaciones de lo mismo se separan
    // solas con el tiempo, así que esto las ata: si alguna vez dejan de
    // coincidir, falla acá y no en la calle.
    const e = spec({ quad: EN_ANGULO, piramide: P_RAYAS, marco: marcoDesdeMm(40, 2400, 1100) })
    const enPx: Quad = [0, 1, 2, 3].map((k) => ({
      x: e.quad[k as 0]!.x * e.anchoFoto,
      y: e.quad[k as 0]!.y * e.altoFoto,
    })) as unknown as Quad
    const h = homografiaConInversa(enPx)
    if (!h.ok) throw new Error('quad inválido')
    const mi = h.value.inversa

    let comparados = 0
    for (let y = 0; y < e.altoFoto; y += 3) {
      for (let x = 0; x < e.anchoFoto; x += 3) {
        const fx = x + 0.5
        const fy = y + 0.5
        const referencia = aplicarInversa(mi, fx, fy)

        // la misma cuenta, escalar
        const w = mi.g * fx + mi.h * fy + mi.i
        if (!(w > 0)) { expect(referencia).toBeNull(); continue }
        const u = (mi.a * fx + mi.b * fy + mi.c) / w
        const v = (mi.d * fx + mi.e * fy + mi.f) / w
        expect(referencia).not.toBeNull()
        expect(u).toBeCloseTo(referencia!.u, 12)
        expect(v).toBeCloseTo(referencia!.v, 12)

        if (u < 0 || u > 1 || v < 0 || v > 1) continue
        // y en el nivel 0 la pirámide tiene que decir exactamente lo mismo que
        // la máscara original
        const t = e.transforme
        const enMarco =
          u < e.marco.u || u > 1 - e.marco.u || v < e.marco.v || v > 1 - e.marco.v
        if (!enMarco) {
          let mu = t.escalaU * u + t.desplazU
          let mv = t.escalaV * v + t.desplazV
          if (t.repetir) { mu -= Math.floor(mu); mv -= Math.floor(mv) }
          const cob = coberturaEnNivel(e.piramide, 1, t.mu0 + mu * t.muRango, t.mv0 + mv * t.mvRango)
          expect(cob === 1).toBe(esMetal(RAYAS, t, e.marco, u, v))
        }
        comparados++
      }
    }
    expect(comparados).toBeGreaterThan(500) // que de verdad haya comparado algo
  })

})

describe('renderizar más chico para que el arrastre vaya fluido', () => {
  it('a media resolución la cobertura promedio no cambia', () => {
    // Es lo que permite mostrar una vista previa liviana mientras el dedo se
    // mueve: si achicar la resolución oscureciera o aclarara el paño, la vista
    // previa estaría mintiendo y al soltar el dedo el paño cambiaría de tono.
    // No hizo falta ninguna API nueva: como las esquinas se guardan
    // normalizadas, alcanza con pasar la mitad del tamaño de la foto.
    const entera = spec({ quad: EN_ANGULO, calidad: 3 })
    const mitad = spec({ quad: EN_ANGULO, calidad: 3, anchoFoto: 120, altoFoto: 90 })
    expect(coberturaMedia(entera, debeSerOk(renderizarPano(entera))))
      .toBeCloseTo(coberturaMedia(mitad, debeSerOk(renderizarPano(mitad))), 1)
  })

  it('a media resolución la capa mide la mitad', () => {
    const mitad = debeSerOk(renderizarPano(spec({ anchoFoto: 120, altoFoto: 90 })))
    const entera = debeSerOk(renderizarPano(spec()))
    expect(mitad.ancho).toBeLessThan(entera.ancho * 0.6)
  })
})
