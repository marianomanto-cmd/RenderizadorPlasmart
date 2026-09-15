import React from "react";

/**
 * Tag — a small mono pill/label. "outline" is a hairline chip; "accent"
 * tints indigo; "solid" is a filled near-white chip. For specs, statuses,
 * filters and metadata.
 */
export function Tag({ children, variant = "outline", style, ...rest }) {
  const variants = {
    outline: { border: "1px solid var(--line-2)", color: "var(--muted)", background: "transparent" },
    accent: { border: "1px solid var(--accent)", color: "var(--accent)", background: "var(--accent-12)" },
    solid: { border: "1px solid var(--text)", color: "var(--bg)", background: "var(--text)" },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-mono-sm)",
        letterSpacing: ".1em",
        textTransform: "uppercase",
        padding: "5px 11px",
        borderRadius: "var(--radius-pill)",
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...(variants[variant] || variants.outline),
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
