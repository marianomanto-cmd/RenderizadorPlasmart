/** Formato argentino: coma decimal, como manda el sistema de diseño. */

export function numero(valor: number, decimales = 2): string {
  return valor.toLocaleString('es-AR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

export const porcentaje = (fraccion: number): string => `${numero(fraccion * 100, 1)}`
