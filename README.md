# Renderizador Plasmart

Herramienta de venta para mostrarle al cliente cómo queda un paño de corte
decorativo sobre la foto de su propio frente.

Ver [DECISIONES.md](./DECISIONES.md) para el alcance, lo acordado y el estado.

## Cómo correrlo

```bash
npm install
npm run check      # typecheck + tests
npm run test:watch # tests en vivo
```

## Estructura

```
src/lib/units/      milímetros con marca de tipo, conversiones, materiales
src/lib/geometry/   homografía, inversión, validación del cuadrilátero
```

Estas carpetas son **puras**: no importan React, ni Next, ni el DOM. Si alguna
necesita un `window`, algo se diseñó mal.
