/**
 * Resultado explícito en vez de excepciones.
 *
 * La geometría puede fallar por datos del usuario (cuatro puntos mal puestos),
 * y eso no es un bug: es un estado que la pantalla tiene que saber mostrar.
 * Por eso el error viaja en el tipo de retorno y el compilador obliga a mirarlo.
 */

export interface Ok<T> {
  readonly ok: true
  readonly value: T
}

export interface Err<E> {
  readonly ok: false
  readonly error: E
}

export type Result<T, E> = Ok<T> | Err<E>

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value })
export const err = <E>(error: E): Err<E> => ({ ok: false, error })
