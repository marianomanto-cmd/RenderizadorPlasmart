import { describe, expect, it } from 'vitest'
import {
  MOTOR_NULO,
  NOMBRE_PRESET,
  PRESETS,
  mensajeDeFallo,
  presupuestar,
  textoDelAviso,
  type MotorImagen,
} from './index.js'

const motor = (costoPorRenderUsd: number): MotorImagen => ({
  ...MOTOR_NULO, nombre: 'prueba', version: '1', costoPorRenderUsd,
})

describe('presets', () => {
  it('son una lista cerrada y todos tienen nombre', () => {
    // Nunca hay un campo de texto libre: si el vendedor escribiera, el mismo
    // frente daría dos renders distintos en dos visitas.
    expect(PRESETS.length).toBeGreaterThan(0)
    for (const p of PRESETS) expect(NOMBRE_PRESET[p]).toBeTruthy()
  })
})

describe('el aviso de costo', () => {
  it('con costo configurado dice cuánto sale', () => {
    const p = presupuestar(motor(0.25), 0)
    expect(p.conocido).toBe(true)
    expect(textoDelAviso(p)).toBe('Este render cuesta unos US$ 0,25.')
  })

  it('suma lo que va gastado en la sesión', () => {
    const p = presupuestar(motor(0.25), 4)
    expect(p.gastadoUsd).toBeCloseTo(1, 9)
    expect(textoDelAviso(p)).toContain('Van 4 renders en esta sesión, US$ 1,00 en total')
  })

  it('en singular cuando va uno solo', () => {
    expect(textoDelAviso(presupuestar(motor(0.5), 1))).toContain('Van 1 render en esta sesión')
  })

  it('sin costo configurado lo DICE, no muestra cero ni inventa', () => {
    // Una cifra inventada es peor que ninguna: el vendedor decide sobre un
    // número falso.
    const p = presupuestar(motor(0), 3)
    expect(p.conocido).toBe(false)
    expect(p.gastadoUsd).toBe(0)
    expect(textoDelAviso(p)).toMatch(/no está configurado/)
    expect(textoDelAviso(p)).not.toMatch(/US\$ 0,00/)
  })

  it('un costo absurdo tampoco se toma por bueno', () => {
    for (const malo of [Number.NaN, -1, Number.POSITIVE_INFINITY]) {
      expect(presupuestar(motor(malo), 1).conocido).toBe(false)
    }
  })

  it('usa coma decimal, como manda el sistema', () => {
    expect(textoDelAviso(presupuestar(motor(1.5), 0))).toContain('US$ 1,50')
  })
})

describe('cuando no hay motor', () => {
  it('el motor nulo falla con un motivo, no con un error suelto', async () => {
    await expect(MOTOR_NULO.ambientar({
      compuesto: new Uint8Array(), preset: 'tarde',
      contexto: { materiales: [], superficieM2: 0, panos: 0 }, semilla: 1,
    })).rejects.toThrow()
  })

  it('cada motivo tiene un texto que termina en el render exacto', () => {
    // La ausencia de ambientación se degrada mostrando el render exacto con un
    // aviso discreto. Nunca un error.
    for (const f of [
      { kind: 'sin-configurar' }, { kind: 'sin-red' },
      { kind: 'rechazado', detalle: 'x' }, { kind: 'fidelidad', puntaje: 0.3 },
    ] as const) {
      expect(mensajeDeFallo(f)).toMatch(/render exacto/)
    }
  })
})
