# Plasmart "Signal" website — UI kit

High-fidelity, click-through recreation of the Plasmart marketing site (the "V3 /
Signal" version). It composes the design-system component primitives — it does **not**
re-implement them.

## Run
Open `index.html`. It links the global `styles.css`, loads the compiled component
bundle (`_ds_bundle.js`), then mounts the screen scripts. Spanish (es-AR) copy.

## Screens / sections (each its own JSX, exported to `window`)
- `Nav.jsx` — fixed top bar; transparent → blurred space-black once scrolled.
- `Hero.jsx` — full-viewport, bottom-aligned: kicker, giant thin H1 (indigo accent
  phrase), two magnetic CTAs (`Button`), services line + scroll cue, attenuated
  full-bleed image behind a darkening gradient.
- `Manifesto.jsx` — big thin statement (final resolved state of the scroll word-scrub).
- `Applications.jsx` — **auto-rotating accordion** (5.2s) with an indigo progress bar;
  active panel expands and resaturates, inactive panels show a vertical label.
- `Capabilities.jsx` — hover-reveal list (`CapabilityRow`) + the stats band (`Stat`).
- `Projects.jsx` — 3-column project grid of `Card`s (grayscale → color on hover);
  the middle column is offset to echo the site's per-column parallax.
- `Contact.jsx` — centered mega H2 with indigo final word + CTAs + mono data line.
- `Footer.jsx` — infinite marquee, big logo, link columns, copyright.
- `index.html` — composes all of the above behind a 0→100 `Loader` and adds the
  floating WhatsApp button.

## Fidelity notes (intentional simplifications)
The production site uses GSAP + Lenis for smooth scroll, scroll-scrubbed reveals, a
custom cursor and per-column parallax. This kit reproduces the **visual end-state** and
the key interactions that read without a scroll engine: the loader, the auto-rotating
applications accordion, hover reveals on capabilities and project cards, magnetic
buttons, and the marquee. Scroll-scrub word reveal and parallax are shown resolved.

For full-fidelity motion, see `marianomanto-cmd/plasmart-website` (`v3.js`,
`DESIGN_HANDOFF.md`) — https://github.com/marianomanto-cmd/plasmart-website
