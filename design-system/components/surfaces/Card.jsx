import React from "react";

/**
 * Card — Plasmart surface. A panel fill with a hairline border and a small
 * radius; depth comes from the line, not a shadow. Optional "image" header
 * (photo desaturated, resaturates on hover) and "hover" lift.
 */
export function Card({
  children,
  image,           // image URL for the top media well
  alt = "",
  aspect = "4/5",  // media aspect ratio
  hover = true,
  padding = 24,
  style,
  ...rest
}) {
  const [h, setH] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: "var(--panel)",
        border: "1px solid",
        borderColor: hover && h ? "var(--line-2)" : "var(--line)",
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
        transition: "border-color .4s var(--ease), transform .5s var(--ease)",
        transform: hover && h ? "translateY(-3px)" : "none",
        ...style,
      }}
      {...rest}
    >
      {image && (
        <div style={{ position: "relative", aspectRatio: aspect, overflow: "hidden", background: "var(--bg-2)" }}>
          <img
            src={image}
            alt={alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: h ? "none" : "grayscale(.3)",
              transform: h ? "scale(1.03)" : "scale(1)",
              transition: "filter .5s var(--ease), transform .7s var(--ease)",
            }}
          />
        </div>
      )}
      {children != null && (
        <div style={{ padding: typeof padding === "number" ? padding : padding }}>{children}</div>
      )}
    </div>
  );
}
