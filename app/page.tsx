'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from './ds/Button.js'
import { Kicker } from './ds/Kicker.js'
import { Stat } from './ds/Stat.js'
import { Tag } from './ds/Tag.js'
import { LINEAS, cargarIndice, cargarPiramide, type ModeloCatalogo } from '../src/app-lib/catalogo.js'
import { normalizarFoto, type FotoNormalizada } from '../src/app-lib/foto.js'
import { numero, porcentaje } from '../src/app-lib/formato.js'
import {
  medirQuad,
  mensajeDeErrorEscala,
  pixelesPorMetro,
  type Referencia,
} from '../src/lib/escala/index.js'
import { mensajeDeError, validarQuad } from '../src/lib/geometry/index.js'
import type { Point, Quad } from '../src/lib/geometry/types.js'
import {
  FORMATOS,
  despiezar,
  mejorFormato,
  resumen,
  resumenMaterial,
  type Despiece,
  type FormatoChapa,
} from '../src/lib/layout/index.js'
import {
  areaLibreVisible,
  marcoDesdeMm,
  prepararTransformeDespiece,
  type Marco,
  type TransformePatron,
} from '../src/lib/pattern/ajuste.js'
import type { Piramide } from '../src/lib/pattern/piramide.js'
import {
  NOMBRE_PRESET,
  PRESETS,
  presupuestar,
  textoDelAviso,
  type Preset,
} from '../src/lib/engines/index.js'
import type { Linea } from '../src/lib/pattern/types.js'
import { COLOR_MATERIAL, renderizarPano } from '../src/lib/render/index.js'
import { calcular } from '../src/lib/takeoff/index.js'
import { NOMBRE_MATERIAL, aCm, desdeCm, mm, type Material } from '../src/lib/units/index.js'

const NOMBRE_LINEA: Record<Linea, string> = {
  botanicos: 'Botánicos', geometricos: 'Geométricos',
  abstractos: 'Abstractos', ornamentales: 'Ornamentales',
}
const MARCO_MM = 30
const ESPESOR_MM = 2

/** Un paño marcado sobre la foto. Una fachada suele tener varios. */
interface PanoEnFoto {
  readonly id: number
  readonly esquinas: Quad
  readonly anchoCm: number
  readonly altoCm: number
  readonly modeloId: string
  readonly material: Material
  readonly formato: string
}

/** Arranca como rectángulo: las fotos salen casi de frente. */
const nuevoPano = (id: number, anterior?: PanoEnFoto): PanoEnFoto => {
  let esquinas: Quad = [
    { x: 0.10, y: 0.26 }, { x: 0.44, y: 0.26 }, { x: 0.44, y: 0.74 }, { x: 0.10, y: 0.74 },
  ]
  if (anterior) {
    // Al lado del anterior, con un respiro: en una fachada lo típico es paño,
    // pared, paño. Si no entra a la derecha, baja en diagonal.
    const ancho = anterior.esquinas[1].x - anterior.esquinas[0].x
    const corrimiento = ancho + 0.04
    esquinas = anterior.esquinas[1].x + corrimiento <= 0.98
      ? (anterior.esquinas.map((p) => ({ x: p.x + corrimiento, y: p.y })) as unknown as Quad)
      : (anterior.esquinas.map((p) => ({
          x: Math.min(0.97, p.x + 0.05), y: Math.min(0.97, p.y + 0.06),
        })) as unknown as Quad)
  }
  return {
    id,
    esquinas,
    anchoCm: anterior?.anchoCm ?? 240,
    altoCm: anterior?.altoCm ?? 200,
    modeloId: anterior?.modeloId ?? 'B.01',
    material: anterior?.material ?? 'galvanizado',
    formato: anterior?.formato ?? 'auto',
  }
}

interface Calculado {
  readonly transforme: TransformePatron
  readonly marco: Marco
  readonly libre: number
  readonly despiece: Despiece
  readonly chapa: FormatoChapa
  readonly piramide: Piramide
}

/**
 * El trabajo va en tres pasos y en este orden: primero entra la foto, después
 * se le da la escala, y recién ahí se marcan los paños. La escala no puede ir
 * después: es lo que permite que las medidas de cada paño salgan solas del
 * cuadrilátero en vez de tipearlas.
 */
type Paso = 'foto' | 'escala' | 'trabajo'

export default function Pagina() {
  const [paso, setPaso] = useState<Paso>('foto')
  const [foto, setFoto] = useState<FotoNormalizada | null>(null)
  const [referencia, setReferencia] = useState<Referencia | null>(null)
  const [metrosTexto, setMetrosTexto] = useState('1')
  const [trazando, setTrazando] = useState(false)
  const [motorConfig, setMotorConfig] = useState<{ configurado: boolean; costoPorRenderUsd: number } | null>(null)
  const [modalRender, setModalRender] = useState(false)
  const [preset, setPreset] = useState<Preset>('tarde')
  const [rendersHechos, setRendersHechos] = useState(0)
  const [ambientando, setAmbientando] = useState(false)
  const [avisoRender, setAvisoRender] = useState<string | null>(null)
  const [panos, setPanos] = useState<PanoEnFoto[]>([nuevoPano(1)])
  const [activo, setActivo] = useState(0)
  const [catalogo, setCatalogo] = useState<ModeloCatalogo[]>([])
  const [linea, setLinea] = useState<Linea>('botanicos')
  const [arrastrando, setArrastrando] = useState<number | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [cargadas, setCargadas] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const marcoRef = useRef<HTMLDivElement>(null)
  const capaRef = useRef<HTMLCanvasElement | null>(null)
  const pedidoRef = useRef<number | null>(null)
  const archivoRef = useRef<HTMLInputElement>(null)
  const piramidesRef = useRef(new Map<string, Piramide>())

  /** Píxeles de la foto por metro real. Es la base de todas las medidas. */
  const escala = useMemo(() => {
    if (!foto || !referencia) return null
    const r = pixelesPorMetro(referencia, foto.ancho, foto.alto)
    return r.ok ? r.value : null
  }, [foto, referencia])

  /** Medidas que salen del cuadrilátero, en centímetros enteros. */
  const medirDesdeEsquinas = useCallback((esquinas: Quad) => {
    if (!foto || escala === null) return null
    const m = medirQuad(esquinas, escala, foto.ancho, foto.alto)
    return { anchoCm: Math.max(1, Math.round(aCm(m.ancho))), altoCm: Math.max(1, Math.round(aCm(m.alto))) }
  }, [foto, escala])

  const pano = panos[activo] ?? panos[0]!
  const modelo = useMemo(
    () => catalogo.find((m) => m.id === pano.modeloId) ?? catalogo[0],
    [catalogo, pano.modeloId],
  )

  const cambiar = useCallback((cambios: Partial<PanoEnFoto>) => {
    setPanos((prev) => prev.map((p, i) => (i === activo ? { ...p, ...cambios } : p)))
  }, [activo])

  // ---- catálogo ----
  useEffect(() => { cargarIndice().then(setCatalogo).catch((e) => setAviso(String(e))) }, [])

  // Si hay motor de imagen y a qué costo. Lo contesta el servidor, que es el
  // único que ve la clave.
  useEffect(() => {
    fetch('/api/ambientar')
      .then((r) => r.json())
      .then(setMotorConfig)
      .catch(() => setMotorConfig({ configurado: false, costoPorRenderUsd: 0 }))
  }, [])

  useEffect(() => {
    if (catalogo.length === 0) return
    let vivo = true
    for (const id of new Set(panos.map((p) => p.modeloId))) {
      if (piramidesRef.current.has(id)) continue
      const m = catalogo.find((c) => c.id === id)
      if (!m) continue
      cargarPiramide(m)
        .then((pir) => {
          if (!vivo) return
          piramidesRef.current.set(id, pir)
          setCargadas((n) => n + 1)
        })
        .catch((e) => setAviso(String(e)))
    }
    return () => { vivo = false }
  }, [panos, catalogo])

  // ---- el despiece de cada paño ----
  const calculados = useMemo<(Calculado | null)[]>(() => {
    void cargadas // recalcular cuando llega una pirámide nueva
    return panos.map((p) => {
      const m = catalogo.find((c) => c.id === p.modeloId)
      const piramide = piramidesRef.current.get(p.modeloId)
      if (!m || !piramide) return null

      const anchoMm = desdeCm(p.anchoCm || 1)
      const altoMm = desdeCm(p.altoCm || 1)
      const propModelo = m.mascaraAncho / m.mascaraAlto
      const chapa: FormatoChapa = p.formato === 'auto'
        ? mejorFormato(anchoMm, altoMm, propModelo)
        : FORMATOS.find((f) => f.nombre === p.formato) ?? FORMATOS[0]!

      const despiece = despiezar(anchoMm, altoMm, chapa, propModelo)
      const transforme = prepararTransformeDespiece(despiece.columnas, despiece.filas)
      const marco = marcoDesdeMm(MARCO_MM, despiece.panoAncho, despiece.panoAlto)
      const libre = areaLibreVisible(piramide.niveles[0]!, transforme, marco, 180)
      return { transforme, marco, libre, despiece, chapa, piramide }
    })
  }, [panos, catalogo, cargadas])

  /** Los números que dice el vendedor son los del conjunto, no los de un paño. */
  const total = useMemo(() => {
    let superficie = 0, panosTotal = 0, peso = 0, metal = 0, chapas = 0
    for (let i = 0; i < panos.length; i++) {
      const c = calculados[i]
      if (!c) continue
      const t = calcular({
        despiece: c.despiece, areaLibre: c.libre,
        material: panos[i]!.material, espesor: mm(ESPESOR_MM),
      })
      superficie += t.superficie
      panosTotal += t.panos
      peso += t.pesoPano
      metal += t.superficie * (1 - t.areaLibre)
      chapas += t.chapasDeMaterial
    }
    return {
      superficie, panos: panosTotal, peso, chapas,
      // Área libre del conjunto: ponderada por superficie, no un promedio suelto.
      areaLibre: superficie > 0 ? 1 - metal / superficie : 0,
    }
  }, [panos, calculados])

  /**
   * El despiece que daría CADA formato de chapa, para poder elegir viendo el
   * desperdicio en vez de a ciegas. El calce nunca es perfecto y la diferencia
   * entre un formato y otro puede ser grande.
   */
  const opcionesDeChapa = useMemo(() => {
    const m = catalogo.find((c) => c.id === pano.modeloId)
    if (!m) return []
    const anchoMm = desdeCm(pano.anchoCm || 1)
    const altoMm = desdeCm(pano.altoCm || 1)
    const prop = m.mascaraAncho / m.mascaraAlto
    return FORMATOS.map((f) => ({ formato: f, despiece: despiezar(anchoMm, altoMm, f, prop) }))
  }, [catalogo, pano.modeloId, pano.anchoCm, pano.altoCm])

  /** La que menos tira. Lo que se paga es la chapa entera, así que el
   *  desperdicio ES el costo, y por eso va marcada. */
  const mejorOpcion = useMemo(() => {
    if (opcionesDeChapa.length === 0) return null
    return opcionesDeChapa.reduce((a, b) =>
      b.despiece.desperdicio < a.despiece.desperdicio - 0.005 ? b : a,
    )
  }, [opcionesDeChapa])

  const validez = useMemo(() => validarQuad(pano.esquinas), [pano.esquinas])

  // ---- dibujar todos los paños ----
  const dibujar = useCallback((calidad: number, escalaRender: number) => {
    const cv = canvasRef.current
    if (!cv || !foto) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    if (cv.width !== foto.ancho || cv.height !== foto.alto) {
      cv.width = foto.ancho
      cv.height = foto.alto
    }
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.drawImage(foto.bitmap, 0, 0, cv.width, cv.height)
    if (paso !== 'trabajo') return // midiendo la escala se ve la foto pelada

    const capa = (capaRef.current ??= document.createElement('canvas'))
    const cctx = capa.getContext('2d')
    if (!cctx) return

    for (let i = 0; i < panos.length; i++) {
      const c = calculados[i]
      if (!c) continue
      const r = renderizarPano({
        anchoFoto: Math.max(1, Math.round(foto.ancho * escalaRender)),
        altoFoto: Math.max(1, Math.round(foto.alto * escalaRender)),
        quad: panos[i]!.esquinas, piramide: c.piramide,
        transforme: c.transforme, marco: c.marco,
        color: COLOR_MATERIAL[panos[i]!.material],
        areaMetal: 1 - c.libre, calidad,
      })
      if (!r.ok || r.value.ancho === 0) continue

      capa.width = r.value.ancho
      capa.height = r.value.alto
      const img = cctx.createImageData(r.value.ancho, r.value.alto)
      img.data.set(r.value.datos)
      cctx.putImageData(img, 0, 0)

      const k = 1 / escalaRender
      ctx.drawImage(capa, r.value.x * k, r.value.y * k, r.value.ancho * k, r.value.alto * k)
    }
  }, [foto, panos, calculados, paso])

  useEffect(() => {
    if (pedidoRef.current !== null) cancelAnimationFrame(pedidoRef.current)
    const enVuelo = arrastrando !== null
    pedidoRef.current = requestAnimationFrame(() => {
      dibujar(enVuelo ? 1 : 3, enVuelo ? 0.5 : 1)
      pedidoRef.current = null
    })
    return () => { if (pedidoRef.current !== null) cancelAnimationFrame(pedidoRef.current) }
  }, [dibujar, arrastrando])

  // ---- foto ----
  const alElegirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setAviso(null)
    try {
      setFoto(await normalizarFoto(archivo))
      setReferencia(null)
      setMetrosTexto('1')
      setPanos([nuevoPano(1)])
      setActivo(0)
      setPaso('escala')
    } catch {
      setAviso('No se pudo leer esa imagen. Probá con otra.')
    }
    e.target.value = ''
  }

  // ---- arrastre de esquinas ----
  const alBajarDedo = (i: number) => (ev: React.PointerEvent<HTMLButtonElement>) => {
    ev.preventDefault()
    const caja = marcoRef.current?.getBoundingClientRect()
    if (!caja) return
    ev.currentTarget.setPointerCapture(ev.pointerId)
    setArrastrando(i)

    const inicio = { x: ev.clientX, y: ev.clientY }
    const punto = pano.esquinas[i as 0]!
    const mover = (m: PointerEvent) => {
      // Se mueve por DIFERENCIA, no a la posición del dedo: así el dedo no tapa
      // el punto y se puede afinar sin verlo.
      const x = Math.min(1, Math.max(0, punto.x + (m.clientX - inicio.x) / caja.width))
      const y = Math.min(1, Math.max(0, punto.y + (m.clientY - inicio.y) / caja.height))
      setPanos((prev) => prev.map((p, k) => {
        if (k !== activo) return p
        const q = [...p.esquinas] as unknown as { x: number; y: number }[]
        q[i] = { x, y }
        const esquinas = q as unknown as Quad
        // Las medidas salen del cuadrilátero: mover una esquina las actualiza.
        // Si el vendedor las corrigió a mano, la corrección dura hasta que
        // vuelva a tocar las esquinas, que es cuando deja de ser válida.
        return { ...p, esquinas, ...(medirDesdeEsquinas(esquinas) ?? {}) }
      }))
    }
    const soltar = () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
      window.removeEventListener('pointercancel', soltar)
      setArrastrando(null)
    }
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
    window.addEventListener('pointercancel', soltar)
  }

  // ---- trazar la referencia de escala ----
  const puntoEnFoto = (ev: { clientX: number; clientY: number }): Point | null => {
    const caja = marcoRef.current?.getBoundingClientRect()
    if (!caja || caja.width === 0 || caja.height === 0) return null
    return {
      x: Math.min(1, Math.max(0, (ev.clientX - caja.left) / caja.width)),
      y: Math.min(1, Math.max(0, (ev.clientY - caja.top) / caja.height)),
    }
  }

  const alTrazar = (ev: React.PointerEvent<HTMLDivElement>) => {
    ev.preventDefault()
    const inicio = puntoEnFoto(ev)
    if (!inicio) return
    ev.currentTarget.setPointerCapture(ev.pointerId)
    setTrazando(true)
    setReferencia({ a: inicio, b: inicio, metros: Number(metrosTexto) || 1 })

    const mover = (m: PointerEvent) => {
      const fin = puntoEnFoto(m)
      if (fin) setReferencia((r) => (r ? { ...r, b: fin } : r))
    }
    const soltar = () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
      window.removeEventListener('pointercancel', soltar)
      setTrazando(false)
    }
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
    window.addEventListener('pointercancel', soltar)
  }

  const errorEscala = useMemo(() => {
    if (!foto || !referencia) return null
    const r = pixelesPorMetro(referencia, foto.ancho, foto.alto)
    return r.ok ? null : mensajeDeErrorEscala(r.error)
  }, [foto, referencia])

  const confirmarEscala = () => {
    if (escala === null) return
    setPanos((prev) => prev.map((p) => ({ ...p, ...(medirDesdeEsquinas(p.esquinas) ?? {}) })))
    setPaso('trabajo')
  }

  // ---- ambientación (fase 2) ----
  const presupuesto = useMemo(() => presupuestar(
    { nombre: 'motor', version: '1', costoPorRenderUsd: motorConfig?.costoPorRenderUsd ?? 0,
      ambientar: () => Promise.reject(new Error('n/a')) },
    rendersHechos,
  ), [motorConfig, rendersHechos])

  const ambientar = async () => {
    setModalRender(false)
    setAmbientando(true)
    setAvisoRender(null)
    try {
      const r = await fetch('/api/ambientar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ preset, semilla: 1 }),
      })
      const datos = await r.json()
      if (!r.ok || !datos.ok) {
        // La ausencia de ambientación se degrada mostrando el render exacto con
        // un aviso discreto. Nunca un error.
        setAvisoRender('La ambientación todavía no está configurada. Lo que ves es el render exacto.')
        return
      }
      setRendersHechos((n) => n + 1)
    } catch {
      setAvisoRender('Sin conexión para ambientar. Lo que ves es el render exacto.')
    } finally {
      setAmbientando(false)
    }
  }

  // ---- compartir ----
  const compartir = async () => {
    const cv = canvasRef.current
    if (!cv) return
    const blob = await new Promise<Blob | null>((res) => cv.toBlob(res, 'image/png'))
    if (!blob) return
    const nombre = 'plasmart.png'
    const archivo = new File([blob], nombre, { type: 'image/png' })
    if (navigator.canShare?.({ files: [archivo] })) {
      try { await navigator.share({ files: [archivo], title: 'Plasmart' }); return } catch { /* cancelado */ }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombre
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const agregar = () => {
    setPanos((prev) => {
      const p = nuevoPano(Math.max(...prev.map((x) => x.id)) + 1, prev[prev.length - 1])
      return [...prev, { ...p, ...(medirDesdeEsquinas(p.esquinas) ?? {}) }]
    })
    setActivo(panos.length)
  }
  const quitar = () => {
    if (panos.length === 1) return
    setPanos((prev) => prev.filter((_, i) => i !== activo))
    setActivo((a) => Math.max(0, a - 1))
  }

  const deLaLinea = catalogo.filter((m) => m.linea === linea)
  const calc = calculados[activo]

  return (
    <main className="app">
      {/* Sin `capture`: así el teléfono ofrece cámara Y galería en vez de forzar
          la cámara. La foto puede venir de cualquiera de las dos. */}
      <input ref={archivoRef} type="file" accept="image/*" onChange={alElegirFoto} hidden />

      <header className="barra">
        <img src="/marca/plasmart-logo-white.png" alt="Plasmart" />
        <Kicker>Celosías</Kicker>
      </header>

      <div className="lienzo">
        {paso === 'foto' || !foto ? (
          <div className="vacio">
            <Kicker>Paso 1 de 3</Kicker>
            <h1>Sacá o subí la foto del <em>frente</em></h1>
            <p>Parate enfrente y encuadrá derecho. Si ya la tenés en el teléfono, elegila de la galería.</p>
            <Button variant="solid" size="md" icon="camera" onClick={() => archivoRef.current?.click()}>
              Elegir foto
            </Button>
            {aviso && <p style={{ color: 'var(--accent)' }}>{aviso}</p>}
          </div>
        ) : (
          <div ref={marcoRef} style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '100%', lineHeight: 0 }}>
            <canvas ref={canvasRef} />

            {paso === 'escala' && (
              <>
                <div className="capa-escala" onPointerDown={alTrazar}>
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    {referencia && (() => {
                      const { a, b } = referencia
                      // Los topes van perpendiculares a la línea, como una cinta
                      // métrica. El viewBox no conserva la proporción, así que
                      // el largo visual se calcula en unidades del viewBox.
                      const dx = (b.x - a.x) * 100
                      const dy = (b.y - a.y) * 100
                      const largo = Math.hypot(dx, dy) || 1
                      const nx = (-dy / largo) * 2.5
                      const ny = (dx / largo) * 2.5
                      return (
                        <g>
                          <line className="regla-linea"
                            x1={a.x * 100} y1={a.y * 100} x2={b.x * 100} y2={b.y * 100} />
                          <line className="regla-tope"
                            x1={a.x * 100 - nx} y1={a.y * 100 - ny}
                            x2={a.x * 100 + nx} y2={a.y * 100 + ny} />
                          <line className="regla-tope"
                            x1={b.x * 100 - nx} y1={b.y * 100 - ny}
                            x2={b.x * 100 + nx} y2={b.y * 100 + ny} />
                          <circle className="regla-punta" cx={a.x * 100} cy={a.y * 100} r="1.4" />
                          <circle className="regla-punta" cx={b.x * 100} cy={b.y * 100} r="1.4" />
                        </g>
                      )
                    })()}
                  </svg>
                </div>
                {!trazando && (
                  <div className="pista">
                    {referencia
                      ? 'Arrastrá de nuevo para corregir la línea'
                      : 'Arrastrá sobre algo que sepas cuánto mide'}
                  </div>
                )}
              </>
            )}

            {paso === 'trabajo' && pano.esquinas.map((p, i) => (
              <button key={i} className="manija" data-activa={arrastrando === i}
                aria-label={`Esquina ${i + 1} del paño ${activo + 1}`}
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                onPointerDown={alBajarDedo(i)} />
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        {paso === 'escala' && (
          <>
            <div className="bloque">
              <Kicker>Paso 2 de 3</Kicker>
              <p style={{ margin: '12px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text)', lineHeight: 1.55 }}>
                Marcá sobre la foto algo de lo que sepas la medida y decime cuánto
                mide. Con eso la app calcula sola el tamaño de cada paño.
              </p>
              <p style={{ margin: '10px 0 0', fontSize: 'var(--fs-xs)', color: 'var(--muted)', lineHeight: 1.55 }}>
                Sirve el alto de una puerta, el ancho de un portón, una hilada de
                ladrillos. Marcalo sobre la misma pared donde van a ir los paños:
                en una foto, un metro de cerca ocupa más píxeles que uno de lejos.
              </p>
            </div>

            <div className="bloque">
              <span className="titulo">Esa línea mide</span>
              <div className="medida">
                <div className="campo">
                  <label htmlFor="metros">Metros</label>
                  <input id="metros" type="number" inputMode="decimal" min={0.1} max={50} step={0.1}
                    value={metrosTexto}
                    onChange={(e) => {
                      setMetrosTexto(e.target.value)
                      const n = Number(e.target.value)
                      if (Number.isFinite(n) && n > 0) {
                        setReferencia((r) => (r ? { ...r, metros: n } : r))
                      }
                    }} />
                </div>
                <Button variant="solid" size="sm" icon="arrow-right"
                  disabled={escala === null} onClick={confirmarEscala}>
                  Listo
                </Button>
              </div>
              {errorEscala && (
                <p style={{ margin: '12px 0 0', color: 'var(--accent)', fontSize: 'var(--fs-sm)', lineHeight: 1.5 }}>
                  {errorEscala}
                </p>
              )}
              {escala !== null && (
                <p style={{ margin: '12px 0 0', color: 'var(--muted)', fontSize: 'var(--fs-xs)',
                            fontFamily: 'var(--font-mono)', letterSpacing: '.06em' }}>
                  {numero(escala, 0)} px por metro
                </p>
              )}
            </div>

            <div className="pie">
              <Button variant="outline" size="sm" icon="camera" onClick={() => archivoRef.current?.click()}>
                Otra foto
              </Button>
            </div>
          </>
        )}

        {paso === 'trabajo' && (
        <>
        <div className="numeros">
          <div><Stat size="30px" value={numero(total.superficie, 2)} unit="m²" label="Superficie total" /></div>
          <div><Stat size="30px" value={porcentaje(total.areaLibre)} unit="%" label="Área libre" /></div>
          <div><Stat size="30px" value={numero(total.peso, 1)} unit="kg" label="Peso del conjunto" /></div>
          <div><Stat size="30px" value={String(total.panos)} unit={`· ${numero(total.chapas, 1)}`} label="Paños · chapas" /></div>
        </div>

        <div className="bloque">
          <span className="titulo">Escala de la foto</span>
          <div className="escala-actual">
            <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)' }}>
              {referencia ? `La línea marcada mide ${numero(referencia.metros, 2)} m` : 'Sin referencia'}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setPaso('escala')}>Corregir →</Button>
          </div>
        </div>

        <div className="bloque">
          <span className="titulo">Paños marcados</span>
          <div className="segmentado">
            {panos.map((p, i) => (
              <button key={p.id} aria-pressed={i === activo} onClick={() => setActivo(i)}>
                Paño {i + 1}
              </button>
            ))}
            <button onClick={agregar} aria-label="Agregar un paño">+ Agregar</button>
            {panos.length > 1 && (
              <button onClick={quitar} aria-label="Quitar el paño seleccionado">Quitar</button>
            )}
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 'var(--fs-xs)', color: 'var(--muted)', lineHeight: 1.5 }}>
            Una fachada suele tener varios, con pared en el medio. Marcá uno, agregá
            otro y arrastralo a su lugar. Lo de abajo se aplica al paño elegido.
          </p>
        </div>

        {foto && !validez.ok && (
          <div className="bloque" style={{ color: 'var(--accent)', fontSize: 'var(--fs-sm)' }}>
            Paño {activo + 1}: {mensajeDeError(validez.error)}
          </div>
        )}

        <div className="bloque">
          <span className="titulo">Medidas del paño {activo + 1} · de la escala</span>
          <div className="campos">
            <div className="campo">
              <label htmlFor="ancho">Ancho (cm)</label>
              <input id="ancho" type="number" inputMode="numeric" min={10} max={3000} value={pano.anchoCm}
                onChange={(e) => cambiar({ anchoCm: Math.max(1, Number(e.target.value) || 0) })} />
            </div>
            <div className="campo">
              <label htmlFor="alto">Alto (cm)</label>
              <input id="alto" type="number" inputMode="numeric" min={10} max={3000} value={pano.altoCm}
                onChange={(e) => cambiar({ altoCm: Math.max(1, Number(e.target.value) || 0) })} />
            </div>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 'var(--fs-xs)', color: 'var(--muted)', lineHeight: 1.5 }}>
            Salen solas del cuadrilátero y de la escala. Si las corregís a mano,
            la corrección vale hasta que vuelvas a mover una esquina.
          </p>
        </div>

        <div className="bloque">
          <span className="titulo">Modelo {modelo ? `· ${modelo.id}` : ''}</span>
          <div className="lineas" role="tablist">
            {LINEAS.map((l) => (
              <button key={l} role="tab" className="linea-tab" aria-selected={linea === l}
                onClick={() => setLinea(l)}>{NOMBRE_LINEA[l]}</button>
            ))}
          </div>
          <div className="modelos">
            {deLaLinea.map((m) => (
              <button key={m.id} className="modelo" aria-pressed={m.id === pano.modeloId}
                onClick={() => cambiar({ modeloId: m.id })}
                title={`${m.id} · ${porcentaje(m.areaLibre)}% libre`}>
                <img src={`/modelos/thumbs/${m.id}.png`} alt="" loading="lazy" />
                <span>{m.id}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bloque">
          <span className="titulo">Despiece del paño {activo + 1}</span>
          {calc && (
            <p style={{ margin: '0 0 12px', fontSize: 'var(--fs-sm)', color: 'var(--text)', lineHeight: 1.5 }}>
              {resumen(calc.despiece)}
              <span style={{ color: 'var(--muted)' }}> · {resumenMaterial(calc.despiece)}</span>
            </p>
          )}
          <div className="opciones">
            <button className="opcion" aria-pressed={pano.formato === 'auto'}
              onClick={() => cambiar({ formato: 'auto' })}>
              <span>La que convenga</span>
              <span className="dato">{calc ? `→ ${calc.chapa.nombre}` : ''}</span>
            </button>
            {opcionesDeChapa.map(({ formato, despiece }) => {
              const esLaMejor = mejorOpcion?.formato.nombre === formato.nombre
              return (
                <button key={formato.nombre} className="opcion"
                  aria-pressed={pano.formato === formato.nombre}
                  onClick={() => cambiar({ formato: formato.nombre })}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {formato.nombre}
                    {esLaMejor && opcionesDeChapa.length > 1 && (
                      <span className="marca">la que menos tira</span>
                    )}
                  </span>
                  <span className="dato">
                    {despiece.total} {despiece.total === 1 ? 'paño' : 'paños'}
                    {' · '}
                    <span className={esLaMejor ? undefined : 'malo'}>
                      {porcentaje(despiece.desperdicio)}% de desperdicio
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 'var(--fs-xs)', color: 'var(--muted)', lineHeight: 1.5 }}>
            El desperdicio es aproximado y es lo que se paga: la chapa se compra
            entera. Ojo que menos paños no es menos material — una chapa grande
            puede dejar menos juntas y bastante más recorte. El calce nunca es
            perfecto, y un anidado de producción puede sacar dos paños angostos
            de la misma chapa y bajarlo.
          </p>
        </div>

        <div className="bloque">
          <span className="titulo">Material · espesor {numero(ESPESOR_MM, 1)} mm</span>
          <div className="segmentado">
            {(['galvanizado', 'acero', 'inoxidable'] as const).map((k) => (
              <button key={k} aria-pressed={pano.material === k} onClick={() => cambiar({ material: k })}>
                {NOMBRE_MATERIAL[k]}
              </button>
            ))}
          </div>
        </div>

        <div className="pie">
          <Button variant="solid" size="sm" icon="arrow-up-right" disabled={!foto || ambientando}
            onClick={() => { setAvisoRender(null); setModalRender(true) }}>
            {ambientando ? 'Renderizando…' : 'Renderizar'}
          </Button>
          <Button variant="outline" size="sm" icon="share" disabled={!foto} onClick={compartir}>
            Compartir
          </Button>
          {foto && (
            <Button variant="outline" size="sm" icon="camera" onClick={() => archivoRef.current?.click()}>
              Otra foto
            </Button>
          )}
          <Tag>Estimado</Tag>
        </div>

        {avisoRender && (
          <div className="bloque">
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 'var(--fs-sm)', lineHeight: 1.55 }}>
              {avisoRender}
            </p>
          </div>
        )}

        <div className="bloque">
          <p className="aviso" style={{ margin: 0 }}>
            Los números son orientativos y sirven para conversar. Si el trabajo se
            confirma, se hace una medición formal y un presupuesto detallado. Las
            chapas salen de repartir cada superficie en paños iguales, no de un
            anidado de producción: un anidado puede sacar dos paños angostos de la
            misma chapa y bajar el número.
          </p>
        </div>
        </>
        )}
      </div>

      {modalRender && (
        <div className="telon" role="dialog" aria-modal="true" aria-labelledby="t-render"
          onClick={(e) => { if (e.target === e.currentTarget) setModalRender(false) }}>
          <div className="modal">
            <Kicker>Vista definitiva</Kicker>
            <h2 id="t-render">Esto se cobra por <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>render</em></h2>

            <p>{textoDelAviso(presupuesto)}</p>

            <p className="suave">
              El render que ya estás viendo es exacto y no cuesta nada. Esto
              agrega luz, sombra y ambiente encima. El dibujo, las medidas y el
              despiece no cambian.
            </p>

            <div style={{ marginTop: 20 }}>
              <span className="titulo" style={{ display: 'block', marginBottom: 10 }}>Momento del día</span>
              <div className="segmentado">
                {PRESETS.map((k) => (
                  <button key={k} aria-pressed={preset === k} onClick={() => setPreset(k)}>
                    {NOMBRE_PRESET[k]}
                  </button>
                ))}
              </div>
            </div>

            <div className="acciones">
              <Button variant="solid" size="sm" icon="arrow-right" onClick={ambientar}>
                Sí, renderizar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setModalRender(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
