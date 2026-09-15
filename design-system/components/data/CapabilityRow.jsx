import React from "react";

/**
 * CapabilityRow — the brand's signature hover-reveal list row. A mono index,
 * a giant thin name (muted → text on hover), a description that fades in and
 * stays, and a mono spec on the right. On hover the row indents and an indigo
 * tick appears at the left edge.
 */
export function CapabilityRow({ index, name, spec, description, style, ...rest }) {
  const [h, setH] = React.useState(false);
  const [seen, setSeen] = React.useState(false);
  return (
    <div
      onMouseEnter={() => {
        setH(true);
        setSeen(true);
      }}
      onMouseLeave={() => setH(false)}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "70px auto 1fr auto",
        alignItems: "center",
        gap: 24,
        padding: "32px 0",
        paddingLeft: h ? 28 : 0,
        borderBottom: "1px solid var(--line)",
        transition: "padding-left .5s var(--ease)",
        cursor: "default",
        ...style,
      }}
      {...rest}
    >
      {/* indigo tick */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          width: 12,
          height: 1,
          background: "var(--accent)",
          transform: h ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform .45s var(--ease)",
        }}
      />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: h ? "var(--accent)" : "var(--faint)", transition: "color .4s var(--ease)" }}>
        {index}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 200,
          fontSize: "clamp(26px, 4vw, 60px)",
          letterSpacing: "-.03em",
          whiteSpace: "nowrap",
          color: h ? "var(--text)" : "var(--muted)",
          transition: "color .4s var(--ease)",
        }}
      >
        {name}
      </span>
      <span
        style={{
          fontSize: 15,
          lineHeight: 1.45,
          color: "var(--muted)",
          maxWidth: "52ch",
          paddingLeft: 26,
          opacity: seen || h ? 1 : 0,
          transform: seen || h ? "none" : "translateY(4px)",
          transition: "opacity .55s var(--ease), transform .55s var(--ease)",
        }}
      >
        {description}
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--faint)", textAlign: "right", letterSpacing: ".08em" }}>
        {spec}
      </span>
    </div>
  );
}
