Plasmart's surface card: a `--panel` fill with a hairline border and a 4px radius — no drop shadow. Pass `image` for a media well that sits in grayscale and resaturates (with a slight zoom + lift) on hover, the way project cards behave on the site.

```jsx
<Card image="assets/portfolio-cuad-02.webp" aspect="4/5">
  <div className="mono">01 · Gómez</div>
</Card>
```

Set `hover={false}` for a static card. Body `children` are optional — an image-only card omits them.
