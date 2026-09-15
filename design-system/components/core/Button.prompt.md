Plasmart's primary call-to-action: a pill button where an indigo field slides up from the bottom on hover. `solid` is the near-white hero CTA, `outline` is the hairline secondary, `ghost` is text-only. Add `magnetic` for the hero/contact CTAs that drift toward the cursor.

```jsx
<Button variant="solid" icon="arrow-right" magnetic>Pedí tu presupuesto</Button>
<Button variant="outline" icon="download">Descargar catálogo</Button>
<Button variant="ghost">Ver más</Button>
```

Sizes `sm | md | lg` (44 / 58 / 66px tall). Pass `href` to render an `<a>`. `icon` takes an `IconName` string or any node; it sits after the label.
