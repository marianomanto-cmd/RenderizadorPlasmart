import React from "react";

/**
 * Plasmart icon set — inline SVG, 1.5px stroke, round caps, currentColor.
 * The brand uses a tiny, utilitarian set: arrows carry most of the meaning;
 * WhatsApp is the one filled brand glyph. Icons inherit text color.
 */

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const PATHS = {
  "arrow-right": (
    <g {...STROKE}>
      <line x1="3" y1="12" x2="21" y2="12" />
      <polyline points="14 5 21 12 14 19" />
    </g>
  ),
  "arrow-down": (
    <g {...STROKE}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <polyline points="5 14 12 21 19 14" />
    </g>
  ),
  "arrow-up-right": (
    <g {...STROKE}>
      <line x1="6" y1="18" x2="18" y2="6" />
      <polyline points="8 6 18 6 18 16" />
    </g>
  ),
  download: (
    <g {...STROKE}>
      <path d="M12 3v12" />
      <polyline points="7 10 12 15 17 10" />
      <path d="M4 19h16" />
    </g>
  ),
  plus: (
    <g {...STROKE}>
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </g>
  ),
  minus: (
    <g {...STROKE}>
      <line x1="4" y1="12" x2="20" y2="12" />
    </g>
  ),
  close: (
    <g {...STROKE}>
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </g>
  ),
  whatsapp: (
    // single filled brand glyph
    <path
      fill="currentColor"
      d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.38-.49.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.01-2.41.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.65.49.24.57.81 1.97.88 2.11.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.12.58.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.42.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.65-.14.27.1 1.69.8 1.98.94.29.14.48.22.55.34.07.12.07.7-.17 1.38z"
    />
  ),
};

export function Icon({ name = "arrow-right", size = 17, strokeWidth, style, ...rest }) {
  const path = PATHS[name] || PATHS["arrow-right"];
  const isStroked = name !== "whatsapp";
  const g =
    strokeWidth && isStroked
      ? React.cloneElement(path, { strokeWidth })
      : path;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", flex: "0 0 auto", ...style }}
      {...rest}
    >
      {g}
    </svg>
  );
}
