# Plasmart Design System — "Signal"

> Ultra-minimalist, futurist brand system for **Plasmart**, a steel laser- &
> plasma-cutting company in Córdoba, Argentina (operating since 2006). Space-black
> surfaces, enormous hair-thin Sora type, generous air, and a single disciplined
> indigo accent used like an eyedropper. Smooth-scroll, scroll-driven reveals.

This project is the reusable design system distilled from Plasmart's production
website. Link `styles.css` (the only entry point) to inherit every token and font;
import the React components from the compiled bundle; copy assets out of `assets/`.

---

## 1. Company & product context

**Plasmart** (Plasmart CBA) is a metalworking shop specializing in precision steel
cutting and bending for two audiences — **architecture** (façades, railings, stairs,
decorative panels) and **industry** (batch production, structural parts, machine parts).

- **Founded:** 2006 · **Location:** Francisco de Arteaga 2895, Córdoba, Argentina
- **Capabilities:** Laser cutting (up to 12.7 mm), plasma cutting (up to 32 mm — HD
  plasma is an uncommon capability in Córdoba), CNC bending (up to 3 m), general
  metalwork, advisory/design, nationwide shipping.
- **Primary CTA / contact channel:** WhatsApp (`+54 9 351 382 0321`).
- **Email:** ventasplasmart@transfil.com.ar · **Quotes:** 24–48 h, accepts DXF/STEP.
- **Language:** the product UI is **Spanish (Argentina)**. Keep copy in es-AR.

### Products / surfaces represented
1. **Marketing website ("V3 / Signal")** — the flagship. A long-scroll landing with a
   loader, video hero, scroll-scrub manifesto, an auto-rotating applications accordion,
   a hover-reveal capabilities list, an animated stats band, a parallax projects grid,
   a centered contact section and a marquee footer. Sister landing pages exist for
   **/arquitectura/** and **/industria/**, plus an **English** mirror (`/en.html`).

There is one public brand surface (the website). The internal tools in the same GitHub
org (production, finance, OT manager, etc.) are separate apps and not part of this
brand system.

### Sources used to build this system
- **GitHub:** `marianomanto-cmd/plasmart-website`
  — https://github.com/marianomanto-cmd/plasmart-website
  The single source of truth. Built from its `DESIGN_HANDOFF.md` (exact tokens, type
  scale, section specs, animation timings), `v3.css` (the full visual system),
  `llms.txt` (verified facts & copy), and the `assets/` folder (logo, project &
  application imagery). **All tokens in this system are lifted verbatim from there.**
- **Live site:** https://www.plasmartcba.com/

> Readers with access should explore the repo above — especially `DESIGN_HANDOFF.md`
> and `v3.css` / `v3.js` — to recreate motion and section behavior at full fidelity.

---

## 2. Content fundamentals (voice & copy)

**Language:** Spanish, Argentina (voseo). All product copy stays in es-AR. An English
mirror exists but Spanish is the canonical voice.

- **Address the reader directly with "vos."** Imperatives use the Argentine voseo form:
  *"Pedí tu presupuesto"*, *"Descargá el catálogo"*, *"Escribinos un mail"*,
  *"Diseñemos tu fachada"*, *"Cotizá tu producción"*. Warm, direct, action-first.
- **First person plural for the company:** *"Unimos ingeniería y diseño…"*,
  *"Trabajamos con materiales de calidad…"*, *"Coordinamos con las mejores empresas…"*.
  Confident, hands-on, never corporate.
- **Tone:** precise, technical, quietly proud. Lets the numbers speak — *"hasta 12,7 mm"*,
  *"hasta 32 mm"*, *"+20 años"*. Argentine number format: **comma decimal** (12,7 not 12.7).
- **Casing:** body and headlines are sentence/lowercase — headlines are *not* title-cased
  (*"Precisión y tecnología en corte de acero"*). Mono labels are **UPPERCASE** with wide
  tracking (*"CÓRDOBA · AR — DESDE 2006"*, *"06 PROCESOS · PLANTA PROPIA"*).
- **Labels & indices are typeset as data:** numbered (`Nº/ 03 — SIGNAL`, `01 · Gómez`,
  `[ 06 procesos · planta propia ]`), bracketed, monospace. Treat metadata like a readout.
- **Punctuation as accent:** a single word or final period is colored indigo to land the
  point — *"corte de acero"*, *"algo **preciso.**"*, *"con precisión **absoluta.**"*.
- **No emoji.** Ever. The bullet/“signal” dot (●) and arrows (→ ↓ ↗ ↳) are the only
  glyph flourishes. Tone is engineered, not playful.
- **Microcopy is short and confident:** CTAs are 2–3 words. Section kickers are a status
  line, not a sentence. Avoid adjectives that don't carry weight.

**Representative copy**
- Hero H1: *"Precisión y tecnología en corte de acero"* ("corte de acero" in indigo).
- Manifesto: *"Unimos ingeniería y diseño para fabricar exactamente la pieza que tu
  proyecto necesita. Con precisión absoluta."*
- Contact H2: *"Construyamos algo preciso."* ("preciso." in indigo).
- CTAs: *"Pedí tu presupuesto →"*, *"Descargar catálogo ↓"*, *"Escribinos un mail"*.

---

## 3. Visual foundations

The whole system is **born dark** — there is no light theme. Restraint is the brand.

### Color
- **Surfaces** step through three space-blacks: `--bg #08090b` (page) → `--bg-2 #0d0f13`
  (recessed/modals) → `--panel #111419` (cards, image wells). Differences are subtle on
  purpose; depth comes from hairlines, not big tonal jumps.
- **Text** is a 3-stop near-white ramp: `--text #eef0f3` → `--muted #8a8f99` →
  `--faint #4f545d`. Most paragraph text is `--muted`; `--faint` is for indices/disabled.
- **One accent:** indigo `--accent #6e7bff`, used like an eyedropper — a single colored
  word, a progress bar, a hover mark, a focus ring, a glowing dot. Never as a fill field.
- **Only other color:** WhatsApp green `#25d366` for the presence dot. No other hues.
- Imagery is **cool and desaturated by default** — photos sit in `grayscale(.3–.5)` and
  resaturate to full color on hover (cards) or when a panel becomes active (accordion).

### Type
- **Sora** does ~everything; **weight 200** at huge sizes is the signature look. Display
  type is fluid (`clamp`), with tight negative tracking (`-.03em` to `-.05em`) and very
  tight line-height (`.94`–`.98`). Hero up to 150px; contact H2 up to 200px.
- **JetBrains Mono** for kickers, indices, specs, stats units and meta — 11–13px,
  UPPERCASE, wide tracking (`.1em`–`.22em`), colored `--muted`.

### Spacing & layout
- Content max width **1480px**, centered, with a fluid gutter `--pad clamp(20px,4.5vw,80px)`.
- **Lots of air.** Sections breathe with `clamp(80px,13vh,180px)` vertical rhythm (the
  manifesto block goes up to `22vh`). Density is low; whitespace is structural.
- Layout leans on **hairline dividers** (`1px var(--line)`) and grid columns rather than
  boxes. Fixed elements: nav (top, `mix-blend-difference` until scrolled), scroll-progress
  bar (2px indigo, top), floating WhatsApp button (bottom-right).

### Backgrounds, texture & atmosphere
- The page is never flat black: a **fixed fractal-noise grain** (SVG turbulence,
  `opacity .04`) sits over everything, and an **ambient indigo glow**
  (`radial-gradient(120% 70% at 50% -10%, rgba(110,123,255,.12), transparent)`) washes
  down from top-center. Add via the `.plasmart-bg` / `.plasmart-grain` helpers.
- Full-bleed photo/video is used behind the hero, **heavily attenuated** (opacity ~.40,
  slight grayscale) under a top-to-bottom darkening gradient for legibility.
- No decorative gradients elsewhere. No purple/blue hero gradients. No pattern tiles.

### Corners, borders, cards & shadows
- **Tiny radii:** 4px is the default (cards, image wells), 6px for modals/inputs, pill
  (100px) for buttons and chips, 2px for focus.
- **Borders are hairlines:** `1px solid rgba(255,255,255,.10)` default, `.20` for stronger
  control outlines. Cards are often *just* a border + `--panel` fill — no shadow.
- **Shadows are avoided.** The only "shadow" is an **indigo glow** (`0 0 8–12px
  var(--accent-soft)`) on progress bars and the signal dot. The scrolled nav and floating
  popovers get a soft black drop (`0 10px 30px rgba(0,0,0,.35)`) — that's the exception.
- **Glass:** scrolled nav and overlays use `backdrop-filter: blur(12px)` over a
  translucent space-black (`rgba(8,9,11,.72)`). Used sparingly, on fixed chrome only.

### Motion (the brand is kinetic)
- **Master easing:** `cubic-bezier(.19,1,.22,1)` — a long, decisive settle (GSAP
  `power3/4.out`, `expo.inOut`). Durations are generous: reveals ~1s, panels `.8s`.
- **Patterns:** line-mask reveals on headlines (text rises from a clipped line),
  fade-up on scroll-in (`[data-rv]`), word-by-word color scrub (gray→white→indigo) on the
  manifesto, parallax columns on the projects grid, magnetic buttons that drift toward the
  cursor, and an indigo "fill" that slides up inside buttons on hover.
- **Loader:** a 0→100 counter that wipes up off-screen.
- **Hover states:** photos resaturate + slight zoom; capability rows indent 28px and the
  name goes `--muted → --text` with an indigo tick appearing at the left; links extend a
  hairline. **Press/active:** subtle, no bounce.
- **Always degrade gracefully:** content is only hidden once the motion libs confirm
  (`html.lib-on`), and `prefers-reduced-motion` disables Lenis, the custom cursor and all
  reveals — everything shows in its final, legible state.

### Custom cursor
- On fine pointers (non-touch, motion allowed): a 30px ring (`mix-blend-mode: difference`)
  + a 4px dot trail the cursor; the ring grows over interactive elements. Off on touch and
  reduced-motion; inputs restore the text caret.

---

## 4. Iconography

Plasmart uses **inline SVG icons only** — no icon font, no sprite sheet, no PNG icons,
no emoji, no Unicode pictographs as UI. The set is deliberately tiny and utilitarian:

- **Arrows** (`→`, `↓`, `↗`, `↳`) — often typed as text glyphs in copy, and as simple
  stroked SVG arrows in buttons/links. Arrows carry most of the "iconography."
- **WhatsApp glyph** — a single filled-path SVG, the one branded icon (primary CTA).
- **Download glyph** — stroked SVG for the catalog CTA.
- **Plus/close** (`+` → rotates 45° to `×`) — for the mobile capabilities accordion.

Style: **1.5px stroke, round caps, currentColor**, sized 14–17px in buttons, 26px for the
floating WhatsApp button. Icons inherit text color and the indigo accent on hover.

This system ships the icons it needs as inline SVG inside the React components (see
`components/icon/`). If you need a broader set for an internal tool, match this style — a
thin (1.5px) stroked, rounded line icon set such as **Lucide** is the closest CDN-available
match; flag any such addition as an extension, not part of the brand mark set.

**Logo / brand mark:** `assets/plasmart-logo.png` is the "plasmart" wordmark set inside a
white leaf/blob (black text — for light backgrounds). `assets/plasmart-logo-white.png` is a
generated white version for the dark UI (nav at ~26–44px height, footer up to 84px).
> ⚠️ The white logo is **derived programmatically** from the supplied PNG (luminance →
> alpha). Ask the client for the official **SVG / white PNG** for pixel-perfect crispness.

---

## 5. Index / manifest

Root entry: **`styles.css`** — `@import`s the four token files below. Link this one file.

**Tokens** (`tokens/`)
- `fonts.css` — Sora + JetBrains Mono (Google Fonts CSS API).
- `colors.css` — surfaces, text ramp, hairlines, indigo accent + semantic aliases.
- `typography.css` — families, weights, fluid type scale, line-heights, tracking.
- `spacing.css` — layout, spacing scale, section rhythm, radii, shadows/glow, motion.
- `base.css` — reset + body defaults, grain/glow helpers, `.kicker` / `.mono` primitives.

**Foundation cards** (`guidelines/`) — specimen `.html` cards for the Design System tab
(colors, type, spacing, motion, logo).

**Components** (`components/<group>/`) — reusable React primitives + `.d.ts`, `.prompt.md`
and a `@dsCard` HTML per directory. `core/` → `Button`, `Tag`, `Kicker`, `ArrowLink`,
`Icon`; `surfaces/` → `Card`, `Stat`; `data/` → `CapabilityRow`. Import from the bundle:
`const { Button } = window.PlasmartDesignSystem_e9cdad`.

**UI kit** (`ui_kits/website/`) — high-fidelity click-through recreation of the Plasmart
"Signal" website (hero, applications, capabilities, projects, contact, footer).

**Templates** (`templates/landing-hero/`) — `Plasmart Landing Hero`, a copyable starting
frame consuming projects can seed from (loads the system via `ds-base.js`).

**Assets** (`assets/`) — logos, application & project imagery, OG covers, favicons.

**`SKILL.md`** — Agent-Skills wrapper so this system can be used as a downloadable skill.

---

_The website UI is in Spanish (es-AR); keep generated copy in Spanish to match the brand._
