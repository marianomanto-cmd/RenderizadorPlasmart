'use client'
import type { CSSProperties } from 'react'

/** Set de íconos del sistema: SVG inline, trazo 1,5px, puntas redondas, currentColor. */
const T = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const PATHS = {
  'arrow-right': <g {...T}><line x1="3" y1="12" x2="21" y2="12" /><polyline points="14 5 21 12 14 19" /></g>,
  'arrow-down': <g {...T}><line x1="12" y1="3" x2="12" y2="21" /><polyline points="5 14 12 21 19 14" /></g>,
  'arrow-up-right': <g {...T}><line x1="6" y1="18" x2="18" y2="6" /><polyline points="8 6 18 6 18 16" /></g>,
  download: <g {...T}><path d="M12 3v12" /><polyline points="7 10 12 15 17 10" /><path d="M4 19h16" /></g>,
  plus: <g {...T}><line x1="12" y1="4" x2="12" y2="20" /><line x1="4" y1="12" x2="20" y2="12" /></g>,
  minus: <g {...T}><line x1="4" y1="12" x2="20" y2="12" /></g>,
  close: <g {...T}><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></g>,
  camera: <g {...T}><path d="M3 8.5h3.2l1.4-2.2h8.8l1.4 2.2H21v10H3z" /><circle cx="12" cy="13" r="3.4" /></g>,
  share: <g {...T}><path d="M12 3v13" /><polyline points="7 8 12 3 17 8" /><path d="M5 14v5.5h14V14" /></g>,
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 17, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: '0 0 auto', ...style }}>
      {PATHS[name]}
    </svg>
  )
}
