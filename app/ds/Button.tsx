'use client'
import { type ButtonHTMLAttributes, type CSSProperties, type ReactNode, useState } from 'react'
import { Icon, type IconName } from './Icon.js'

type Props = {
  children: ReactNode
  variant?: 'solid' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: IconName
  disabled?: boolean
  style?: CSSProperties
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'>

/**
 * Botón del sistema: pill, borde hairline y el relleno índigo que sube desde
 * abajo. Sin drift magnético: eso es lenguaje de landing, no de app.
 */
export function Button({ children, variant = 'outline', size = 'sm', icon, disabled = false, style, ...rest }: Props) {
  const [activo, setActivo] = useState(false)
  const altos = { sm: 44, md: 58, lg: 66 }
  const pads = { sm: '0 20px', md: '0 30px', lg: '0 38px' }
  const fuentes = { sm: 13, md: 15, lg: 16 }
  const solido = variant === 'solid'
  const fantasma = variant === 'ghost'
  const encendido = activo && !disabled && !fantasma

  return (
    <button
      disabled={disabled}
      onPointerEnter={() => !disabled && setActivo(true)}
      onPointerLeave={() => setActivo(false)}
      onPointerDown={() => !disabled && setActivo(true)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        position: 'relative', height: altos[size], padding: fantasma ? 0 : pads[size],
        borderRadius: fantasma ? 0 : 'var(--radius-pill)',
        fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: fuentes[size], lineHeight: 1,
        border: fantasma ? 'none' : '1px solid',
        borderColor: fantasma ? 'transparent' : disabled ? 'var(--line)' : encendido ? 'var(--accent)' : solido ? 'var(--text)' : 'var(--line-2)',
        background: fantasma ? 'transparent' : solido ? 'var(--text)' : 'transparent',
        color: disabled ? 'var(--faint)' : encendido ? '#fff' : solido ? 'var(--bg)' : 'var(--text)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        overflow: 'hidden', opacity: disabled ? 0.55 : 1,
        transition: 'color .3s var(--ease), border-color .3s var(--ease)',
        WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
        ...style,
      }}
      {...rest}
    >
      {!fantasma && (
        <span aria-hidden="true" style={{
          position: 'absolute', inset: 0, background: 'var(--accent)', borderRadius: 'var(--radius-pill)',
          transform: encendido ? 'translateY(0)' : 'translateY(101%)',
          transition: 'transform .5s var(--ease)', zIndex: 0,
        }} />
      )}
      <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span>{children}</span>
        {icon && <Icon name={icon} size={size === 'sm' ? 14 : 17} />}
      </span>
    </button>
  )
}
