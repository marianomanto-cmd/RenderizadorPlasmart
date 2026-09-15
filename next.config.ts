import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,

  // La librería pura importa con extensión .js apuntando a archivos .ts, que es
  // lo correcto para ESM y lo que entiende TypeScript. Webpack no lo resuelve
  // solo, así que se le dice acá. Alternativa era sacarle las extensiones a la
  // librería, pero entonces dejaría de ser ESM válido fuera de un bundler.
  webpack(config) {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.tsx', '.jsx'],
    }
    return config
  },

  // Las máscaras del catálogo no cambian nunca: se cachean para siempre.
  async headers() {
    return [
      {
        source: '/modelos/:ruta*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

export default config
