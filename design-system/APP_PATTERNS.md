# Extender "Signal" a UI de aplicación

El sistema base nació para un sitio de marketing: tipografía enorme, mucho aire, pocas
superficies. Una app necesita formularios, tablas, navegación persistente y feedback.
Estas son las reglas para agregarlos sin romper la marca. Todo lo de acá es
**extensión derivada de los tokens**, no invención: cada valor sale de
`design-system/tokens/`.

## Principio de densidad

El sitio usa `--section-y` (80–180px) y Sora 200 a 150px. Una app no.
Dos registros conviven:

- **Registro marca** (login, onboarding, splash, pantallas de un solo mensaje,
  empty states grandes): tipografía display, aire de sitio, `.plasmart-bg` + grano.
- **Registro trabajo** (listas, tablas, formularios, detalle): escala chica,
  `--space-3` a `--space-6` entre elementos, sin grano, sin glow ambiente.
  Títulos de sección en mono uppercase (`--fs-mono`) en vez de H2 gigante; el H1 de
  pantalla baja a 28–34px Sora 200–300.

Regla práctica: en registro trabajo, ningún texto arriba de 34px salvo una cifra
protagonista (`Stat`).

## Layout de app

- **Shell:** barra superior 64px + sidebar 260px (colapsada 68px). Separadas del
  contenido por hairline `--line`, no por sombra ni por cambio de fondo.
- Fondo del shell: `--bg`. Paneles de contenido: `--panel` con hairline y `--radius-sm`.
  Modales y drawers: `--bg-2` con `--radius-md`.
- Contenido con `max-width: var(--maxw)` solo en vistas anchas; los formularios se
  limitan a 560–720px.
- Sticky headers de app: `background: rgba(8,9,11,.72); backdrop-filter: var(--blur-glass)`
  + hairline inferior + `--shadow-nav` recién al scrollear.

## Navegación

- **Ítem de sidebar:** alto 44px, padding `0 var(--space-4)`, mono? no — Sora 400 15px,
  color `--muted`. Hover: color `--text` + desplazamiento de 4px a la derecha
  (transición `.25s var(--ease)`). Activo: color `--text` + barra indigo de 2px a la
  izquierda (`box-shadow: 0 0 8px var(--accent-soft)`), fondo transparente — nunca un
  bloque indigo.
- **Tabs:** label mono uppercase 12px, `--muted`; activo `--text` con hairline indigo de
  2px abajo. Sin pills rellenas.
- **Breadcrumb:** mono 11px, separador `/`, último segmento `--text`.

## Formularios

- **Input / select / textarea:** alto 48px (textarea libre), fondo `--bg-2`,
  borde `1px solid var(--line-2)`, `--radius-md`, padding `0 14px`, Sora 400 15px,
  color `--text`. Placeholder `--faint`.
- Focus: borde `--accent` + `box-shadow: var(--glow-accent-sm)`; sin outline doble.
- **Label:** mono uppercase 11px, tracking `--ls-label`, color `--muted`, 8px de aire.
- **Ayuda:** 14px `--faint`. **Error:** 14px `--accent` + borde `--accent` en el campo.
  No se introduce rojo: en este sistema el acento también señala el error.
  Si el producto necesita semántica de color completa, declararlo como extensión y
  derivar success/warn/danger desaturados (ej. `#4fbf8b`, `#d4a24a`, `#e05a5a`) usados
  solo en texto e íconos, nunca como relleno.
- **Checkbox / radio:** 18px, borde `--line-2`, `--radius-xs` (radio: círculo);
  marcado = relleno `--accent` con tick blanco 1.5px.
- **Toggle:** 40×22px pill, off `--line-2`, on `--accent`, perilla blanca 16px,
  transición `.25s var(--ease)`.
- **Botones:** usar `Button`. `solid` = acción primaria (uno por vista), `outline` =
  secundaria, `ghost` = terciaria/cancelar. En app usar `size="sm"` (44px) y
  `magnetic={false}`: el drift magnético es lenguaje de landing.

## Tablas y listas

- Header: mono uppercase 11px `--muted`, hairline abajo, sin fondo propio.
- Fila: alto 56px (compacta 44px), hairline entre filas, sin zebra.
  Hover: fondo `rgba(255,255,255,.03)` + el valor clave pasa de `--muted` a `--text`.
- Celdas numéricas en JetBrains Mono, alineadas a la derecha, tabular.
- Fila seleccionada: barra indigo 2px a la izquierda.
- Estados/labels de fila: `Tag`. Para listas de proceso o capacidades, `CapabilityRow`.
- Paginación: mono 12px, "01 / 12" como readout, flechas `Icon`.

## Feedback

- **Modal:** fondo `--bg-2`, hairline, `--radius-md`, `--shadow-pop`, ancho 480–640px,
  padding `--space-6`. Backdrop `rgba(8,9,11,.72)` + `blur(12px)`. Entrada 350ms
  `var(--ease)`: opacidad + 8px de subida. Cerrar con `Icon name="close"`.
- **Toast:** esquina inferior derecha, `--panel`, hairline, `--radius-md`, texto 15px,
  punto indigo 6px con glow al inicio. Auto-dismiss 4s con barra de progreso indigo 2px.
- **Loading:** no spinners genéricos. Skeleton = bloque `--panel` con barrido
  `rgba(255,255,255,.04)` de 1.2s. Para procesos con progreso, barra 2px indigo con
  glow (el mismo lenguaje del scroll-progress y del accordion del sitio).
  Para carga de app completa, el contador 0→100 mono del loader del sitio.
- **Empty state:** registro marca. Kicker mono, titular Sora 200 de 28–34px con la
  última palabra en indigo, una línea `--muted`, un `Button`. Sin ilustración.

## Datos y gráficos

- Serie principal indigo `--accent`; series secundarias en la rampa de grises
  (`--muted`, `--faint`) o en indigo con opacidad. No paletas categóricas de colores.
- Grillas y ejes: hairline `--line`, labels mono 11px `--muted`.
- Áreas: relleno `--accent-12`. Punto activo: círculo indigo con `--glow-accent-sm`.
- Cifras destacadas: `Stat` (Sora 200 + unidad mono indigo).

## Mobile

- Touch targets ≥ 44px. Gutter `var(--pad)` (20px en el extremo chico).
- Sin cursor custom ni magnetic en touch.
- Tab bar inferior: 56px + safe area, fondo `rgba(8,9,11,.72)` + `blur(12px)`,
  hairline arriba; ícono activo `--text` con punto indigo de 4px debajo.
- El grano se puede desactivar en mobile por costo de render.

## Accesibilidad

- `--muted` sobre `--bg` ≈ 6.6:1 — apto para body. `--faint` ≈ 2.8:1 — solo metadata
  decorativa, nunca información necesaria.
- Indigo `--accent` sobre `--bg` ≈ 6:1 — apto para texto e íconos. Texto blanco sobre
  relleno indigo ≈ 4.5:1 — apto.
- Foco siempre visible (`outline: 2px solid var(--accent)`), incluso donde el diseño
  esconda el cursor.
- `prefers-reduced-motion`: sin scroll suave, sin cursor custom, sin reveals; todo en
  su estado final legible.
