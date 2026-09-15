import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plasmart · Renderizador de celosías',
  description: 'Mostrale al cliente cómo queda la celosía sobre la foto de su propio frente.',
  icons: { icon: '/marca/favicon.png', apple: '/marca/apple-touch-icon.png' },
  manifest: '/manifest.webmanifest',
  // Instalada en la pantalla de inicio, iOS deja de desalojar los datos
  // guardados y la app abre sin la barra de Safari. Es condición para que el
  // paso 6 (andar sin señal) tenga dónde apoyarse.
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Celosías' },
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
