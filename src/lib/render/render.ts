import { homografiaConInversa } from '../geometry/homography.js'
import { coberturaEnNivel } from '../pattern/piramide.js'
import type { ErrorGeometria, Quad } from '../geometry/types.js'
import { type Result, ok } from '../result.js'
import type { CapaPano, EspecRender, Imagen } from './types.js'

/**
 * Dibuja el paño sobre la foto.
 *
 * Puro: entra y sale un buffer de bytes. No hay canvas en la firma, ni DOM, ni
 * nada del navegador. El canvas es un consumidor de esta función, no su dueño,
 * y por eso todo esto se puede probar sin abrir un navegador.
 */
export function renderizarPano(e: EspecRender): Result<CapaPano, ErrorGeometria> {
  // Las esquinas se guardan normalizadas; acá se pasan a píxeles de la foto.
  const enPx: Quad = [
    { x: e.quad[0].x * e.anchoFoto, y: e.quad[0].y * e.altoFoto },
    { x: e.quad[1].x * e.anchoFoto, y: e.quad[1].y * e.altoFoto },
    { x: e.quad[2].x * e.anchoFoto, y: e.quad[2].y * e.altoFoto },
    { x: e.quad[3].x * e.anchoFoto, y: e.quad[3].y * e.altoFoto },
  ]

  const h = homografiaConInversa(enPx)
  if (!h.ok) return h
  const mi = h.value.inversa

  // Solo se recorre la caja del cuadrilátero, recortada a la foto.
  const xs = enPx.map((p) => p.x)
  const ys = enPx.map((p) => p.y)
  const x0 = Math.max(0, Math.floor(Math.min(...xs)))
  const y0 = Math.max(0, Math.floor(Math.min(...ys)))
  const x1 = Math.min(e.anchoFoto, Math.ceil(Math.max(...xs)))
  const y1 = Math.min(e.altoFoto, Math.ceil(Math.max(...ys)))
  const ancho = Math.max(0, x1 - x0)
  const alto = Math.max(0, y1 - y0)

  const datos = new Uint8ClampedArray(ancho * alto * 4)
  if (ancho === 0 || alto === 0) return ok({ x: x0, y: y0, ancho, alto, datos })

  const { r, g, b } = e.color
  const topeMuestras = Math.max(1, Math.round(e.calidad))

  // A partir de acá el bucle es escalar y sin asignaciones. La version legible
  // de esta cuenta esta en aplicarInversa() y esMetal(); acá está copiada a mano
  // porque llamarlas creaba un objeto {u,v} por muestra, y a un millón y medio
  // de muestras por cuadro eso era casi todo el tiempo de render. Hay un test
  // que compara las dos versiones punto por punto, para que no se separen.
  const { a: ia, b: ib, c: ic, d: id, e: ie, f: if_, g: ig, h: ih, i: ii } = mi
  const { escalaU, desplazU, escalaV, desplazV, repetir, mu0, muRango, mv0, mvRango } = e.transforme
  const marcoU = e.marco.u
  const marcoV = e.marco.v
  const piramide = e.piramide
  const pAncho = piramide.ancho
  const pAlto = piramide.alto

  for (let py = 0; py < alto; py++) {
    const fy = y0 + py + 0.5
    for (let px = 0; px < ancho; px++) {
      const fx = x0 + px + 0.5

      const wc = ig * fx + ih * fy + ii
      if (!(wc > 0)) continue // detrás del horizonte
      const iwc = 1 / wc
      const uc = (ia * fx + ib * fy + ic) * iwc
      const vc = (id * fx + ie * fy + if_) * iwc

      // Descarte rápido: si el centro está muy afuera del paño, ningún punto de
      // este píxel puede caer adentro. Se deja un margen de un píxel para no
      // comerse el borde, que es justo donde hace falta suavizar.
      const margen = 2 / Math.min(ancho, alto)
      if (uc < -margen || uc > 1 + margen || vc < -margen || vc > 1 + margen) continue

      // El jacobiano del mapa inverso, que sirve para dos cosas a la vez: decir
      // cuánto dibujo cubre este píxel (y con eso la pirámide elige el nivel) y
      // decir si el píxel toca el borde del paño.
      const duDx = (ia - uc * ig) * iwc
      const duDy = (ib - uc * ih) * iwc
      const dvDx = (id - vc * ig) * iwc
      const dvDy = (ie - vc * ih) * iwc

      const anchoU = Math.abs(duDx) + Math.abs(duDy)
      const anchoV = Math.abs(dvDx) + Math.abs(dvDy)
      const huella = Math.max(
        anchoU * escalaU * muRango * pAncho,
        anchoV * escalaV * mvRango * pAlto,
      )

      // Supermuestrear solo donde sirve. Adentro del paño el dibujo ya lo
      // resuelve la pirámide, así que una muestra alcanza; las nueve muestras
      // solo hacen falta en el borde, que es una franja de un píxel. Pagarlas en
      // todo el paño era casi todo el costo del render.
      const tocaBorde =
        uc < anchoU || uc > 1 - anchoU || vc < anchoV || vc > 1 - anchoV
      const n = tocaBorde ? topeMuestras : 1
      let suma = 0
      for (let sy = 0; sy < n; sy++) {
        const my = y0 + py + (sy + 0.5) / n
        for (let sx = 0; sx < n; sx++) {
          const mx = x0 + px + (sx + 0.5) / n

          const w = ig * mx + ih * my + ii
          if (!(w > 0)) continue
          const iw = 1 / w
          const u = (ia * mx + ib * my + ic) * iw
          if (u < 0 || u > 1) continue
          const v = (id * mx + ie * my + if_) * iw
          if (v < 0 || v > 1) continue // fuera del paño

          // Primero se averigua en qué paño cae el punto y dónde dentro de ese
          // paño, y RECIÉN AHÍ se mide el marco: el borde macizo es de cada
          // chapa, no del conjunto. Medirlo contra la superficie entera dejaría
          // los paños del medio sin borde.
          let mu = escalaU * u + desplazU
          let mv = escalaV * v + desplazV
          if (repetir) {
            mu -= Math.floor(mu)
            mv -= Math.floor(mv)
          }
          if (mu < marcoU || mu > 1 - marcoU || mv < marcoV || mv > 1 - marcoV) {
            suma += 1
            continue
          }
          suma += coberturaEnNivel(piramide, huella, mu0 + mu * muRango, mv0 + mv * mvRango)
        }
      }

      const cobertura = suma / (n * n)
      if (cobertura <= 0) continue

      const i = (py * ancho + px) * 4
      datos[i] = r
      datos[i + 1] = g
      datos[i + 2] = b
      datos[i + 3] = Math.round(cobertura * 255)
    }
  }

  return ok({ x: x0, y: y0, ancho, alto, datos })
}

/*
 * Sobre la huella y el jacobiano, que quedaron adentro del bucle:
 *
 *     du/dx = (A - u·G)/w     du/dy = (B - u·H)/w
 *     dv/dx = (D - v·G)/w     dv/dy = (E - v·H)/w
 *
 * Son ocho restas y cuatro multiplicaciones, y dan a la vez el tamaño del píxel
 * medido en dibujo (para elegir el nivel de la pirámide) y medido en paño (para
 * saber si el píxel toca el borde).
 *
 * Importa más de lo que parece. La máscara tiene 2048 píxeles de ancho y un paño
 * en pantalla ocupa unos 600, así que la huella ronda 3 o 4 incluso de frente, y
 * mucho más en la parte lejana de un paño en fuga. O sea que leer el dibujo
 * achicado no es un caso raro: es el caso normal.
 */

/** Pega la capa del paño sobre la foto. Devuelve una imagen nueva. */
export function componer(foto: Imagen, capa: CapaPano): Imagen {
  const datos = new Uint8ClampedArray(foto.datos)
  for (let py = 0; py < capa.alto; py++) {
    const fy = capa.y + py
    if (fy < 0 || fy >= foto.alto) continue
    for (let px = 0; px < capa.ancho; px++) {
      const fx = capa.x + px
      if (fx < 0 || fx >= foto.ancho) continue
      const o = (py * capa.ancho + px) * 4
      const a = capa.datos[o + 3]! / 255
      if (a === 0) continue
      const d = (fy * foto.ancho + fx) * 4
      datos[d] = capa.datos[o]! * a + datos[d]! * (1 - a)
      datos[d + 1] = capa.datos[o + 1]! * a + datos[d + 1]! * (1 - a)
      datos[d + 2] = capa.datos[o + 2]! * a + datos[d + 2]! * (1 - a)
    }
  }
  return { ancho: foto.ancho, alto: foto.alto, datos }
}
