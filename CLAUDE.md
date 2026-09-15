# Plasmart "Signal" — reglas de diseño para esta app

Copiar este archivo al root del repo de la app (o mergearlo con el CLAUDE.md existente)
y copiar `design-system/` dentro del proyecto. El handoff completo está en el README
del paquete; `APP_PATTERNS.md` cubre componentes de app que el sistema base no trae.

## Fuente de verdad

- Tokens: `design-system/tokens/*.css` (o `tokens.json` / `tailwind.plasmart.js`).
  **Nunca** hardcodear un color, tamaño o easing: usar `var(--*)`.
- Primitivas: `design-system/components/`. Antes de escribir un componente nuevo,
  verificar que no exista ahí.
- Guía de marca: `design-system/DESIGN_SYSTEM_GUIDE.md`.
- Ejemplo compuesto: `reference-ui/website/`.

## Invariantes

1. Dark only. `--bg #08090b` página, `--bg-2 #0d0f13` hundido, `--panel #111419` cards.
   Sin tema claro, sin toggle.
2. Texto en 3 escalones: `--text #eef0f3` (títulos y valores), `--muted #8a8f99`
   (párrafos y labels — el default de lectura), `--faint #4f545d` (índices, disabled).
3. Un acento: `--accent #6e7bff`. Como gotero, nunca como fondo de bloque.
   Verde `#25d366` solo para el punto de WhatsApp.
4. Sora para todo; peso 200 arriba de ~40px, 400 en body, 500 en botones.
   JetBrains Mono uppercase para labels, índices, specs y datos numéricos.
5. Bordes hairline 1px `rgba(255,255,255,.10)` (`.20` para controles). Radios 2/4/6/pill.
6. Sin sombras salvo glow indigo; drop shadow solo en nav fija y popovers.
7. Easing `cubic-bezier(.19,1,.22,1)`; 250ms micro, 350ms default, 550ms reveal,
   800ms paneles. Respetar `prefers-reduced-motion`.
8. Copy en español rioplatense con voseo. Sin emoji. Flechas → ↓ ↗ ↳ como única
   filigrana. Coma decimal.
9. Atmósfera: en pantallas de marca (login, landing, splash, empty states grandes)
   aplicar `.plasmart-bg` + `.plasmart-grain`. En pantallas densas de app, no.
10. Foco visible siempre: `outline: 2px solid var(--accent); outline-offset: 3px`.

## Antipatrones (rechazar si aparecen)

- Gradientes decorativos, glassmorphism fuera del chrome fijo, neón multicolor.
- Cards con radio grande (12–16px) y sombra suave — no es este sistema.
- Indigo como fondo de sección, de card o de tabla.
- Title Case en titulares; texto centrado en bloques largos.
- Iconos de librerías mixtas, emoji, íconos rellenos (salvo WhatsApp).
- Densidad tipo dashboard genérico: si una vista pide densidad, ver `APP_PATTERNS.md`.
- Inglés en la UI (existe un mirror en inglés, pero el canónico es es-AR).

## Checklist antes de dar una vista por terminada

- [ ] Cero hex literales en el diff; todo por token.
- [ ] Contraste: texto normal ≥ 4.5:1 sobre su fondo (`--muted` sobre `--bg` cumple;
      `--faint` solo para metadata no crítica).
- [ ] Touch targets ≥ 44px.
- [ ] Estados cubiertos: default, hover, focus-visible, active, disabled, loading, error, vacío.
- [ ] Funciona con `prefers-reduced-motion: reduce` sin perder contenido.
- [ ] Copy en es-AR con voseo, sin emoji.

---

# Arquitectura de esta app

Renderizador de celosías: el vendedor saca la foto de un frente, marca cuatro
esquinas, elige un modelo del catálogo y le muestra al cliente cómo queda.

Ver `DECISIONES.md` para el alcance y todo lo acordado.

## La regla que manda sobre el resto

**La geometría es determinística. Lo generativo es cosmético y viene después.**

El render sale de una homografía y de un dibujo del catálogo, nunca de un modelo
de imagen. Si el mismo frente diera dos renders distintos en dos visitas, el
vendedor quedaría como que improvisa, y eso es lo único que esta herramienta
vende.

## Módulos puros

```
src/lib/units/     milímetros con marca de tipo, conversiones, materiales
src/lib/geometry/  homografía, inversión, validación del cuadrilátero
src/lib/pattern/   máscaras del catálogo, modos de ajuste, pirámide
src/lib/render/    composición sobre la foto
src/lib/takeoff/   superficie, área libre, chapas, recorte, peso   (pendiente)
```

Ninguno importa React, ni Next, ni el DOM. **Si alguno necesita un `window`,
algo se diseñó mal.** El canvas es un consumidor de estas funciones, no su dueño,
y por eso todo esto se prueba sin abrir un navegador.

Corolario: si una función tiene que ser correcta, primero se escribe cómo se
comprueba que lo es.

## Unidades

Adentro todo en milímetros, con marca de tipo para que una conversión silenciosa
no compile. **El vendedor carga en centímetros**, porque es la unidad que
Plasmart ya le pide al cliente. Coma decimal en pantalla, como manda el sistema.

## Excepción declarada a "cero hex literales"

`src/lib/render/types.ts` define `COLOR_MATERIAL` con los colores del acero, el
galvanizado y el inoxidable. **No son tokens y no deben serlo**: son el color
físico de una chapa dibujada sobre una foto, o sea contenido, no interfaz. Un
token del sistema ahí haría que el paño cambie de color si algún día se retoca la
paleta, y el paño tiene que verse como la chapa que se va a cortar.

Todo lo demás va por `var(--*)`.

## El sol de Córdoba contra el tema oscuro

El sistema es oscuro y no se discute. Pero esta app se usa **parado en la vereda
al sol**, que es la peor condición posible para una pantalla oscura: el reflejo
suma un piso de luminancia y el contraste efectivo se desploma.

No se cambia la marca. Se compensa adentro del sistema:

- En pantallas de trabajo, el texto que el vendedor **necesita** leer va en
  `--text`, nunca en `--muted`. `--muted` queda para lo prescindible.
- `--faint` no se usa afuera. Nada de metadata al sol.
- Las cuatro manijas de las esquinas van bien por encima de los 44px y con el
  contraste más alto que permita el sistema.
- La foto es la parte brillante de la pantalla y es donde está el trabajo, así
  que el problema afecta sobre todo a los controles, no al render.

Hay que confirmarlo en la calle, con sol, antes de dar la pantalla por terminada.
