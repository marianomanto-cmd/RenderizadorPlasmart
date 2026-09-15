import React from "react";

/**
 * Stat — giant thin Sora number with a mono indigo unit and a muted label.
 * The animated stats band uses these (20+ años · 12,7 mm · 32 mm · 3 m).
 * Argentine number format (comma decimal) — pass the value as a string.
 */
export function Stat({ value, unit, label, style, ...rest }) {
  return (
    <div style={{ ...style }} {...rest}>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 200,
          fontSize: "var(--fs-stat)",
          letterSpacing: "-.04em",
          lineHeight: 1,
          color: "var(--text)",
          display: "flex",
          alignItems: "baseline",
          gap: 5,
        }}
      >
        <span>{value}</span>
        {unit && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: ".22em",
              color: "var(--accent)",
              letterSpacing: ".05em",
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {label && (
        <div style={{ color: "var(--muted)", fontSize: "var(--fs-xs)", marginTop: 6 }}>{label}</div>
      )}
    </div>
  );
}
