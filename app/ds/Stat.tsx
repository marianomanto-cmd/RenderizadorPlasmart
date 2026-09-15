'use client'
import type { CSSProperties } from 'react'

/** Cifra Sora 200 grande, unidad mono índigo, label muted. Coma decimal. */
export function Stat({ value, unit, label, size = 'var(--fs-stat)', style }: {
  value: string; unit?: string; label?: string; size?: string; style?: CSSProperties
}) {
  return (
    <div style={style}>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 200, fontSize: size,
        letterSpacing: '-.04em', lineHeight: 1, color: 'var(--text)',
        display: 'flex', alignItems: 'baseline', gap: 5,
      }}>
        <span>{value}</span>
        {unit && <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '.3em', color: 'var(--accent)', letterSpacing: '.05em',
        }}>{unit}</span>}
      </div>
      {label && <div style={{
        color: 'var(--muted)', fontSize: 'var(--fs-xs)', marginTop: 6,
        fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.1em',
      }}>{label}</div>}
    </div>
  )
}
