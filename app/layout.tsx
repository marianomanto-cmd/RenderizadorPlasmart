import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plasmart · Renderizador de celosías',
  description: 'Mostrale al cliente cómo queda la celosía sobre la foto de su propio frente.',
  icons: { icon: '/marca/favicon.png', apple: '/marca/apple-touch-icon.png' },
}

export const viewport: Viewport = {
  themeColor: '#08090b',
  width: 'device-width',
  initialScale: 1,
  // Sin maximumScale: bloquear el zoom es una barrera de accesibilidad, y el
  // arrastre ya está protegido con touch-action en el lienzo.
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  )
}
