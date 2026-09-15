import React from "react";

/**
 * ArrowLink — the brand's mono, uppercase micro-link with a hairline that
 * extends on hover. Used for "Diseñemos tu fachada", "Ver proyectos", etc.
 */
export function ArrowLink({ children, href = "#", style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-mono)",
        letterSpacing: ".12em",
        textTransform: "uppercase",
        color: hover ? "var(--text)" : "var(--muted)",
        transition: "color .3s var(--ease)",
        textDecoration: "none",
        ...style,
      }}
      {...rest}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        style={{
          width: hover ? 46 : 28,
          height: 1,
          background: "currentColor",
          transition: "width .35s var(--ease)",
          flex: "0 0 auto",
        }}
      />
    </a>
  );
}
