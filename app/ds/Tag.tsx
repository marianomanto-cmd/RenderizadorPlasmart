'use client'
import type { CSSProperties, ReactNode } from 'react'

const VARIANTES = {
  outline: { border: '1px solid var(--line-2)', color: 'var(--muted)', background: 'transparent' },
  accent: { border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--accent-12)' },
  solid: { border: '1px solid var(--text)', color: 'var(--bg)', background: 'var(--text)' },
} as const

/** Pill mono chico para specs, estados y filtros. */
export function Tag({ children, variant = 'outline', style }: {
  children: ReactNode; variant?: keyof typeof VARIANTES; style?: CSSProperties
}) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono-sm)', letterSpacing: '.1em',
      textTransform: 'uppercase', padding: '5px 11px', borderRadius: 'var(--radius-pill)',
      lineHeight: 1, whiteSpace: 'nowrap', ...VARIANTES[variant], ...style,
    }}>
      {children}
    </span>
  )
}
