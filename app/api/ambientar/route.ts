import { NextResponse } from 'next/server'
import { PRESETS, type FalloMotor, type Preset } from '../../../src/lib/engines/index.js'

/**
 * Ambientación. Corre EN EL SERVIDOR, y ese es el punto.
 *
 * La clave del motor de imagen nunca llega al navegador. Se lee acá, de una
 * variable de entorno, y no sale de acá. Si alguna vez aparece un
 * `NEXT_PUBLIC_` delante de una clave de un proveedor, es un bug.
 *
 * Mientras no haya motor configurado, esto responde 'sin-configurar' y la
 * pantalla muestra el render exacto con un aviso discreto. Esa degradación no
 * es un caso de borde: es el comportamiento normal de la fase 1, y por eso el
 * camino completo existe antes que el motor.
 */

export const runtime = 'nodejs'

interface Cuerpo {
  readonly preset?: string
  readonly semilla?: number
}

const fallo = (f: FalloMotor, estado: number) =>
  NextResponse.json({ ok: false, fallo: f }, { status: estado })

export async function POST(req: Request) {
  let cuerpo: Cuerpo
  try {
    cuerpo = (await req.json()) as Cuerpo
  } catch {
    return fallo({ kind: 'rechazado', detalle: 'pedido ilegible' }, 400)
  }

  if (!PRESETS.includes(cuerpo.preset as Preset)) {
    return fallo({ kind: 'rechazado', detalle: 'preset desconocido' }, 400)
  }

  const clave = process.env.OPENAI_API_KEY
  if (!clave) {
    return fallo({ kind: 'sin-configurar' }, 503)
  }

  // Acá va el adaptador del motor. Se enchufa cuando esté la clave cargada y
  // verificada la documentación del proveedor: el modelo es un valor de
  // configuración, no algo escrito a mano en el código.
  return fallo({ kind: 'sin-configurar' }, 503)
}

/** Para que la pantalla sepa si puede ofrecer el botón y a qué costo. */
export function GET() {
  const configurado = Boolean(process.env.OPENAI_API_KEY)
  const costo = Number(process.env.COSTO_RENDER_USD ?? '0')
  return NextResponse.json({
    configurado,
    costoPorRenderUsd: Number.isFinite(costo) && costo > 0 ? costo : 0,
  })
}
