/**
 * Entrada de fotos. Es de las pocas piezas que tocan el navegador a propósito:
 * decodificar una foto necesita el navegador, la matemática no.
 */

export interface FotoNormalizada {
  readonly bitmap: ImageBitmap
  readonly ancho: number
  readonly alto: number
}

/** Lado largo al que se reescala. Una foto de teléfono así pesa unos 300 KB. */
const LADO_LARGO = 2000

/**
 * Normaliza una foto recién sacada: la rota según el EXIF, la reescala y
 * devuelve el bitmap ya en su orientación final.
 *
 * Se hace UNA sola vez, al entrar, y nunca más. Las fotos de teléfono vienen con
 * una marca de orientación; si no se aplica acá, la foto sale acostada y —peor—
 * las esquinas que se guardaron quedan en un marco distinto del que se recupera
 * mañana. O sea que se rompe justo "reabrir la obra con los puntos donde los
 * dejó", que es la función que más se va a agradecer.
 */
export async function normalizarFoto(archivo: File | Blob): Promise<FotoNormalizada> {
  const original = await createImageBitmap(archivo, { imageOrientation: 'from-image' })

  const escala = Math.min(1, LADO_LARGO / Math.max(original.width, original.height))
  if (escala === 1) {
    return { bitmap: original, ancho: original.width, alto: original.height }
  }

  const ancho = Math.round(original.width * escala)
  const alto = Math.round(original.height * escala)
  const bitmap = await createImageBitmap(original, { resizeWidth: ancho, resizeHeight: alto })
  original.close()
  return { bitmap, ancho, alto }
}
