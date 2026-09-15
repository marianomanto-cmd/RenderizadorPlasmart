import * as React from "react";

export type IconName =
  | "arrow-right"
  | "arrow-down"
  | "arrow-up-right"
  | "download"
  | "plus"
  | "minus"
  | "close"
  | "whatsapp";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Which glyph to render. */
  name?: IconName;
  /** Square pixel size. Default 17. */
  size?: number;
  /** Override stroke width (stroked icons only). Default 1.5. */
  strokeWidth?: number;
}

/**
 * Plasmart's inline-SVG icon set: thin (1.5px), round-capped, currentColor.
 * WhatsApp is the single filled brand glyph; everything else is a stroked line icon.
 */
export function Icon(props: IconProps): JSX.Element;
