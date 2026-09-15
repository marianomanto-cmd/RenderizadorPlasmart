'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from './ds/Button.js'
import { Kicker } from './ds/Kicker.js'
import { Stat } from './ds/Stat.js'
import { Tag } from './ds/Tag.js'
import { LINEAS, cargarIndice, cargarPiramide, type ModeloCatalogo } from '../src/app-lib/catalogo.js'
import { normalizarFoto, type FotoNormalizada } from '../src/app-lib/foto.js'
import { numero, porcentaje } from '../src/app-lib/formato.js'
import { mensajeDeError, validarQuad } from '../src/lib/geometry/index.js'
import type { Quad } from '../src/lib/geometry/types.js'
import {
  areaLibreVisible,
  marcoDesdeMm,
  prepararTransforme,
  type TransformePatron,
} from '../src/lib/pattern/ajuste.js'
import type { Piramide } from '../src/lib/pattern/piramide.js'
import type { Linea, ModoAjuste } from '../src/lib/pattern/types.js'
import { COLOR_MATERIAL, renderizarPano } from '../src/lib/render/index.js'
import { CHAPAS, calcular, type Takeoff } from '../src/lib/takeoff/index.js'
import { NOMBRE_MATERIAL, desdeCm, mm, type Material } from '../src/lib/units/index.js'

/** Arrancan como un rectángulo: las fotos salen casi de frente, así que casi
 *  siempre van a estar cerca de donde tienen que ir. */
const ESQUINAS_INICIALES: Quad = [
  { x: 0.18, y: 0.26 }, { x: 0.82, y: 0.26 }, { x: 0.82, y: 0.74 }, { x: 0.18, y: 0.74 },
]

const NOMBRE_LINEA: Record<Linea, string> = {
  botanicos: 'Botánicos', geometricos: 'Geométricos',
  abstractos: 'Abstractos', ornamentales: 'Ornamentales',
}
const NOMBRE_MODO: Record<ModoAjuste, string> = {
  recortar: 'Agrandar', mosaico: 'Repetir', estirar: 'Estirar',
}
const MARCO_MM = 30
const ESPESOR_MM = 2

export default function Pagina() {
  const [foto, setFoto] = useState<FotoNormalizada | null>(null)
  const [esquinas, setEsquinas] = useState<Quad>(ESQUINAS_INICIALES)
  const [anchoCm, setAnchoCm] = useState(240)
  const [altoCm, setAltoCm] = useState(110)
  const [catalogo, setCatalogo] = useState<ModeloCatalogo[]>([])
  const [modeloId, setModeloId] = useState('B.01')
  const [linea, setLinea] = useState<Linea>('botanicos')
  const [modo, setModo] = useState<ModoAjuste>('recortar')
  const [material, setMaterial] = useState<Material>('galvanizado')
  const [piramide, setPiramide] = useState<Piramide | null>(null)
  const [arrastrando, setArrastrando] = useState<number | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const marcoRef = useRef<HTMLDivElement>(null)
  const capaRef = useRef<HTMLCanvasElement | null>(null)
  const pedidoRef = useRef<number | null>(null)
  const archivoRef = useRef<HTMLInputElement>(null)

  const modelo = useMemo(
    () => catalogo.find((m) => m.id === modeloId) ?? catalogo[0],
    [catalogo, modeloId],
  )

  // ---- catálogo ----
  useEffect(() => { cargarIndice().then(setCatalogo).catch((e) => setAviso(String(e))) }, [])
  useEffect(() => {
    if (!modelo) return
    let vivo = true
    cargarPiramide(modelo).then((p) => { if (vivo) setPiramide(p) }).catch((e) => setAviso(String(e)))
    return () => { vivo = false }
  }, [modelo])

  // ---- cómo se acomoda el dibujo, y cuánto agujero queda a la vista ----
  const ajuste = useMemo(() => {
    if (!modelo || !piramide) return null
    const anchoMm = desdeCm(anchoCm || 1)
    const altoMm = desdeCm(altoCm || 1)
    const propPano = anchoMm / altoMm
    const propMascara = modelo.mascaraAncho / modelo.mascaraAlto
    const marco = marcoDesdeMm(MARCO_MM, anchoMm, altoMm)
    const transforme: TransformePatron = prepararTransforme(
      { modo, escala: 0.5 }, propPano, propMascara, modelo.interior,
    )
    // Lo que se ve, no lo que dice el catálogo: al agrandar y recortar se ve
    // solo un pedazo del dibujo, y ese pedazo puede tener más agujeros.
    const libre = areaLibreVisible(piramide.niveles[0]!, transforme, marco, 220)
    return { transforme, marco, libre, anchoMm, altoMm }
  }, [modelo, piramide, modo, anchoCm, altoCm])

  const numeros: Takeoff | null = useMemo(() => {
    if (!ajuste) return null
    return calcular({
      ancho: ajuste.anchoMm, alto: ajuste.altoMm, areaLibre: ajuste.libre,
      material, espesor: mm(ESPESOR_MM), chapa: CHAPAS['1000x2000']!,
    })
  }, [ajuste, material])

  const validez = useMemo(() => validarQuad(esquinas), [esquinas])

  // ---- dibujar ----
  const dibujar = useCallback((calidad: number, escalaRender: number) => {
    const cv = canvasRef.current
    if (!cv || !foto || !piramide || !ajuste) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    if (cv.width !== foto.ancho || cv.height !== foto.alto) {
      cv.width = foto.ancho
      cv.height = foto.alto
    }
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.drawImage(foto.bitmap, 0, 0, cv.width, cv.height)

    const r = renderizarPano({
      anchoFoto: Math.max(1, Math.round(foto.ancho * escalaRender)),
      altoFoto: Math.max(1, Math.round(foto.alto * escalaRender)),
      quad: esquinas, piramide, transforme: ajuste.transforme, marco: ajuste.marco,
      color: COLOR_MATERIAL[material], areaMetal: 1 - ajuste.libre, calidad,
    })
    if (!r.ok || r.value.ancho === 0) return

    const capa = (capaRef.current ??= document.createElement('canvas'))
    capa.width = r.value.ancho
    capa.height = r.value.alto
    const cctx = capa.getContext('2d')
    if (!cctx) return
    const img = cctx.createImageData(r.value.ancho, r.value.alto)
    img.data.set(r.value.datos)
    cctx.putImageData(img, 0, 0)

    const k = 1 / escalaRender
    ctx.drawImage(capa, r.value.x * k, r.value.y * k, r.value.ancho * k, r.value.alto * k)
  }, [foto, piramide, ajuste, esquinas, material])

  useEffect(() => {
    if (pedidoRef.current !== null) cancelAnimationFrame(pedidoRef.current)
    // Arrastrando: media resolución y una muestra, que da vista previa fluida.
    // Al soltar: resolución completa. Los dos dan el mismo tono, solo cambia el
    // enfoque, así que el paño no cambia de color al soltar el dedo.
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
      setEsquinas(ESQUINAS_INICIALES)
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
    const punto = esquinas[i as 0]!
    const mover = (m: PointerEvent) => {
      // Se mueve por DIFERENCIA, no a la posición del dedo: así el dedo no tapa
      // el punto y se puede afinar sin verlo.
      const x = Math.min(1, Math.max(0, punto.x + (m.clientX - inicio.x) / caja.width))
      const y = Math.min(1, Math.max(0, punto.y + (m.clientY - inicio.y) / caja.height))
      setEsquinas((prev) => {
        const q = [...prev] as unknown as { x: number; y: number }[]
        q[i] = { x, y }
        return q as unknown as Quad
      })
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

  // ---- compartir ----
  const compartir = async () => {
    const cv = canvasRef.current
    if (!cv) return
    const blob = await new Promise<Blob | null>((res) => cv.toBlob(res, 'image/png'))
    if (!blob) return
    const nombre = `plasmart-${modeloId}.png`
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

  const deLaLinea = catalogo.filter((m) => m.linea === linea)

  return (
    <main className="app">
      <input ref={archivoRef} type="file" accept="image/*" capture="environment"
        onChange={alElegirFoto} hidden />

      <header className="barra">
        <img src="/marca/plasmart-logo-white.png" alt="Plasmart" />
        <Kicker>Celosías</Kicker>
      </header>

      <div className="lienzo">
        {!foto ? (
          <div className="vacio">
            <Kicker>Paso 1 de 3</Kicker>
            <h1>Sacá la foto del <em>frente</em></h1>
            <p>Parate enfrente y encuadrá derecho. Después marcás las cuatro esquinas del paño.</p>
            <Button variant="solid" size="md" icon="camera" onClick={() => archivoRef.current?.click()}>
              Sacar foto
            </Button>
            {aviso && <p style={{ color: 'var(--accent)' }}>{aviso}</p>}
          </div>
        ) : (
          <div ref={marcoRef} style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '100%', lineHeight: 0 }}>
            <canvas ref={canvasRef} />
            {esquinas.map((p, i) => (
              <button key={i} className="manija" data-activa={arrastrando === i}
                aria-label={`Esquina ${i + 1}`}
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                onPointerDown={alBajarDedo(i)} />
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        {numeros && (
          <div className="numeros">
            <div><Stat size="30px" value={numero(numeros.superficie, 2)} unit="m²" label="Superficie" /></div>
            <div><Stat size="30px" value={porcentaje(numeros.areaLibre)} unit="%" label="Área libre" /></div>
            <div><Stat size="30px" value={numero(numeros.pesoPano, 1)} unit="kg" label="Peso del paño" /></div>
            <div><Stat size="30px" value={String(numeros.chapas)} unit={`· ${porcentaje(numeros.recorte)}%`} label="Chapas · recorte" /></div>
          </div>
        )}

        {foto && !validez.ok && (
          <div className="bloque" style={{ color: 'var(--accent)', fontSize: 'var(--fs-sm)' }}>
            {mensajeDeError(validez.error)}
          </div>
        )}

        <div className="bloque">
          <span className="titulo">Medidas del paño</span>
          <div className="campos">
            <div className="campo">
              <label htmlFor="ancho">Ancho (cm)</label>
              <input id="ancho" type="number" inputMode="numeric" min={10} max={1200} value={anchoCm}
                onChange={(e) => setAnchoCm(Math.max(1, Number(e.target.value) || 0))} />
            </div>
            <div className="campo">
              <label htmlFor="alto">Alto (cm)</label>
              <input id="alto" type="number" inputMode="numeric" min={10} max={1200} value={altoCm}
                onChange={(e) => setAltoCm(Math.max(1, Number(e.target.value) || 0))} />
            </div>
          </div>
          {altoCm > 300 && (
            <p style={{ color: 'var(--accent)', fontSize: 'var(--fs-xs)', marginTop: 10, marginBottom: 0 }}>
              El plegado llega a 3 m. Más que eso no sale de una sola pieza.
            </p>
          )}
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
              <button key={m.id} className="modelo" aria-pressed={m.id === modeloId}
                onClick={() => setModeloId(m.id)} title={`${m.id} · ${porcentaje(m.areaLibre)}% libre`}>
                <img src={`/modelos/thumbs/${m.id}.png`} alt="" loading="lazy" />
                <span>{m.id}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bloque">
          <span className="titulo">Cómo se acomoda el dibujo</span>
          <div className="segmentado">
            {(['recortar', 'mosaico', 'estirar'] as const).map((k) => (
              <button key={k} aria-pressed={modo === k} onClick={() => setModo(k)}>{NOMBRE_MODO[k]}</button>
            ))}
          </div>
        </div>

        <div className="bloque">
          <span className="titulo">Material · espesor {numero(ESPESOR_MM, 1)} mm</span>
          <div className="segmentado">
            {(['galvanizado', 'acero', 'inoxidable'] as const).map((k) => (
              <button key={k} aria-pressed={material === k} onClick={() => setMaterial(k)}>
                {NOMBRE_MATERIAL[k]}
              </button>
            ))}
          </div>
        </div>

        <div className="pie">
          <Button variant="solid" size="sm" icon="share" disabled={!foto} onClick={compartir}>
            Compartir
          </Button>
          {foto && (
            <Button variant="outline" size="sm" icon="camera" onClick={() => archivoRef.current?.click()}>
              Otra foto
            </Button>
          )}
          <Tag>Estimado</Tag>
        </div>

        <div className="bloque">
          <p className="aviso" style={{ margin: 0 }}>
            Los números son orientativos y sirven para conversar. Si el trabajo se
            confirma, se hace una medición formal y un presupuesto detallado. Las
            chapas salen de una grilla simple, no de un anidado de producción.
          </p>
        </div>
      </div>
    </main>
  )
}
