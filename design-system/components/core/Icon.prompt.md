Plasmart's tiny inline-SVG icon set — thin (1.5px) round-capped line icons in `currentColor`, plus the one filled WhatsApp brand glyph. Use inside buttons, links and meta rows; never reach for emoji or another icon library.

```jsx
<Icon name="arrow-right" size={17} />
<Icon name="whatsapp" size={26} style={{ color: "var(--accent)" }} />
```

Names: `arrow-right`, `arrow-down`, `arrow-up-right`, `download`, `plus`, `minus`, `close`, `whatsapp`. Icons inherit the current text color, so set color on the parent. Default `size` 17 (26 for the floating WhatsApp button), default `strokeWidth` 1.5.
