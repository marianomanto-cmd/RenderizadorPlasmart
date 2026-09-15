import React from "react";

/**
 * Kicker — the mono, uppercase, wide-tracked status line that sits above
 * headings. Optional glowing indigo "signal" dot at the left.
 */
export function Kicker({ children, dot = true, style, ...rest }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-mono-sm)",
        letterSpacing: "var(--ls-kicker)",
        textTransform: "uppercase",
        color: "var(--muted)",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        ...style,
      }}
      {...rest}
    >
      {dot && (
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 10px var(--accent)",
            flex: "0 0 auto",
          }}
        />
      )}
      {children}
    </span>
  );
}
