import React from "react";
import { Icon } from "./Icon.jsx";

/**
 * Plasmart button — pill, hairline border, and the signature indigo "fill"
 * that slides up from the bottom on hover. Optional magnetic drift toward
 * the cursor (the brand's hero/contact CTAs). Sora medium.
 *
 * Variants: "solid" (near-white field → indigo fill), "outline" (transparent
 * → indigo fill), "ghost" (no border, text only).
 */
export function Button({
  children,
  variant = "outline",
  size = "md",
  icon,            // IconName | ReactNode — trailing glyph
  magnetic = false,
  as = "button",
  href,
  disabled = false,
  style,
  onMouseMove,
  onMouseLeave,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const ref = React.useRef(null);

  const heights = { sm: 44, md: 58, lg: 66 };
  const pads = { sm: "0 20px", md: "0 30px", lg: "0 38px" };
  const fonts = { sm: 13, md: 15, lg: 16 };
  const h = heights[size] || heights.md;

  const isSolid = variant === "solid";
  const isGhost = variant === "ghost";

  const handleMove = (e) => {
    if (magnetic && ref.current && !disabled) {
      const r = ref.current.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.4;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.4;
      setOffset({ x, y });
    }
    onMouseMove?.(e);
  };
  const handleLeave = (e) => {
    setHover(false);
    setOffset({ x: 0, y: 0 });
    onMouseLeave?.(e);
  };

  const baseColor = isSolid ? "var(--bg)" : "var(--text)";
  const textColor = disabled ? "var(--faint)" : hover && !isGhost ? "#fff" : isGhost && hover ? "var(--text)" : baseColor;

  const wrapStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    position: "relative",
    height: h,
    padding: isGhost ? 0 : pads[size] || pads.md,
    borderRadius: isGhost ? 0 : "var(--radius-pill)",
    fontFamily: "var(--font-display)",
    fontWeight: 500,
    fontSize: fonts[size] || fonts.md,
    letterSpacing: 0,
    lineHeight: 1,
    border: isGhost ? "none" : "1px solid",
    borderColor: isGhost
      ? "transparent"
      : disabled
      ? "var(--line)"
      : hover
      ? "var(--accent)"
      : isSolid
      ? "var(--text)"
      : "var(--line-2)",
    background: isGhost ? "transparent" : isSolid ? "var(--text)" : "transparent",
    color: textColor,
    cursor: disabled ? "not-allowed" : "pointer",
    overflow: "hidden",
    opacity: disabled ? 0.55 : 1,
    transform: `translate(${offset.x}px, ${offset.y}px)`,
    transition:
      "color .3s var(--ease), border-color .3s var(--ease), transform .5s var(--ease)",
    textDecoration: "none",
    WebkitTapHighlightColor: "transparent",
    ...style,
  };

  const fillStyle = {
    position: "absolute",
    inset: 0,
    background: "var(--accent)",
    borderRadius: "var(--radius-pill)",
    transform: hover && !disabled && !isGhost ? "translateY(0)" : "translateY(101%)",
    transition: "transform .5s var(--ease)",
    zIndex: 0,
  };

  const iconEl =
    typeof icon === "string" ? <Icon name={icon} size={size === "sm" ? 14 : 17} /> : icon;

  const Tag = href ? "a" : as;

  return (
    <Tag
      ref={ref}
      href={href}
      style={wrapStyle}
      aria-disabled={disabled || undefined}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {!isGhost && <span style={fillStyle} aria-hidden="true" />}
      <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 12 }}>
        <span>{children}</span>
        {iconEl}
      </span>
    </Tag>
  );
}
