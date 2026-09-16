/**
 * Motores de imagen para la ambientación. Fase 2.
 *
 * LA REGLA QUE MANDA: el render exacto ya está bien. El motor de imagen no lo
 * mejora, lo decora. Recibe el compuesto exacto como referencia y solo puede
 * tocar iluminación, sombra y entorno. Nunca el dibujo, nunca el despiece,
 * nunca la geometría.
 *
 * Eso no se consigue pidiéndoselo amablemente: un modelo de imagen devuelve
 * algo que PARECE chapa cortada, con el dibujo corrido y las juntas inventadas.
 * Por eso la salida pasa por el oráculo de fidelidad antes de mostrarse, y si no
 * pasa, se muestra el render exacto con un aviso discreto. Nunca un error.
 *
 * La interfaz tiene una sola operación a propósito. Los modelos de imagen
 * cambian cada pocos meses; cambiar de proveedor tiene que costar una línea de
 * configuración, no una refactorización.
 */

/** Ambientaciones posibles. Lista cerrada: el vendedor elige, no escribe. */
export type Preset = 'mediodia' | 'tarde' | 'nublado' | 'nocturna'

export const PRESETS: readonly Preset[] = ['mediodia', 'tarde', 'nublado', 'nocturna']

export const NOMBRE_PRESET: Record<Preset, string> = {
  mediodia: 'Mediodía',
  tarde: 'Tarde',
  nublado: 'Nublado',
  nocturna: 'De noche',
}

/**
 * Nunca hay un campo de texto libre en la pantalla del vendedor. El prompt lo
 * arma la app con lo que ya sabe: material, color, paso, superficie, hora. Si
 * el vendedor escribiera, el mismo frente daría dos renders distintos en dos
 * visitas, y se rompe lo único que esta herramienta vende.
 */
export interface Pedido {
  /** El render exacto, ya compuesto sobre la foto. PNG. */
  readonly compuesto: Uint8Array
  readonly preset: Preset
  /** Lo que la app sabe del trabajo y usa para armar el prompt. */
  readonly contexto: {
    readonly materiales: readonly string[]
    readonly superficieM2: number
    readonly panos: number
  }
  /** Fija para que el mismo pedido dé el mismo resultado. */
  readonly semilla: number
}

export interface Ambientado {
  readonly imagen: Uint8Array
  readonly motor: string
  readonly version: string
  readonly preset: Preset
  readonly semilla: number
}

export type FalloMotor =
  | { readonly kind: 'sin-configurar' }
  | { readonly kind: 'sin-red' }
  | { readonly kind: 'rechazado'; readonly detalle: string }
  | { readonly kind: 'fidelidad'; readonly puntaje: number }

export function mensajeDeFallo(f: FalloMotor): string {
  switch (f.kind) {
    case 'sin-configurar':
      return 'La ambientación todavía no está configurada. Este es el render exacto.'
    case 'sin-red':
      return 'Sin conexión para ambientar. Este es el render exacto.'
    case 'rechazado':
      return 'No se pudo ambientar. Este es el render exacto.'
    case 'fidelidad':
      return 'La ambientación cambió el dibujo, así que se descartó. Este es el render exacto.'
  }
}

export interface MotorImagen {
  readonly nombre: string
  readonly version: string
  /**
   * Lo que sale cada render, en dólares.
   *
   * Sale de configuración y NO de una tabla escrita a mano en el código: los
   * precios cambian y una cifra inventada en la pantalla es peor que ninguna,
   * porque el vendedor decide sobre un número falso. Si vale 0, la pantalla
   * avisa que el costo no está configurado en vez de decir que es gratis.
   */
  readonly costoPorRenderUsd: number
  ambientar(pedido: Pedido): Promise<Ambientado>
}

/**
 * El motor que hay cuando no hay ninguno. Existe para que todo el camino
 * —botón, aviso de costo, llamada, degradación— se pueda construir y probar sin
 * una clave, y para que la ausencia de motor sea un estado normal y no un
 * agujero.
 */
export const MOTOR_NULO: MotorImagen = {
  nombre: 'ninguno',
  version: '0',
  costoPorRenderUsd: 0,
  ambientar() {
    return Promise.reject(Object.assign(new Error('sin motor'), { fallo: { kind: 'sin-configurar' } }))
  },
}

/** Lo que la pantalla muestra en el aviso antes de gastar. */
export interface Presupuesto {
  readonly costoUsd: number
  /** Si el costo está configurado. Si no, la pantalla lo dice en vez de mentir. */
  readonly conocido: boolean
  /** Cuántos renders van en esta sesión y cuánto suman. */
  readonly rendersHechos: number
  readonly gastadoUsd: number
}

export function presupuestar(motor: MotorImagen, rendersHechos: number): Presupuesto {
  const costoUsd = motor.costoPorRenderUsd
  const conocido = Number.isFinite(costoUsd) && costoUsd > 0
  return {
    costoUsd: conocido ? costoUsd : 0,
    conocido,
    rendersHechos,
    gastadoUsd: conocido ? costoUsd * rendersHechos : 0,
  }
}

/** Texto del aviso. En dólares y con coma decimal, como manda el sistema. */
export function textoDelAviso(p: Presupuesto): string {
  if (!p.conocido) {
    return 'El costo por render todavía no está configurado, así que no puedo decirte cuánto sale este. Configuralo antes de usarlo con clientes.'
  }
  const usd = (n: number) => n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const base = `Este render cuesta unos US$ ${usd(p.costoUsd)}.`
  if (p.rendersHechos === 0) return base
  const cuantos = p.rendersHechos === 1 ? '1 render' : `${p.rendersHechos} renders`
  return `${base} Van ${cuantos} en esta sesión, US$ ${usd(p.gastadoUsd)} en total.`
}
