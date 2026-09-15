'use client'
import type { CSSProperties, ReactNode } from 'react'

/** Línea de estado mono en mayúsculas, con el punto índigo de señal. */
export function Kicker({ children, dot = true, style }: { children: ReactNode; dot?: boolean; style?: CSSProperties }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono-sm)',
      letterSpacing: 'var(--ls-kicker)', textTransform: 'uppercase',
      color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 10, ...style,
    }}>
      {dot && <span aria-hidden="true" style={{
        width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
        boxShadow: '0 0 10px var(--accent)', flex: '0 0 auto',
      }} />}
      {children}
    </span>
  )
}
