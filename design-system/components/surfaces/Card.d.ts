import * as React from "react";

/**
 * Plasmart surface card — panel fill, hairline border, tiny radius, no drop shadow.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** Optional media URL shown in a top image well (grayscale → color on hover). */
  image?: string;
  alt?: string;
  /** Media aspect ratio, e.g. "4/5" (default), "16/9". */
  aspect?: string;
  /** Lift + resaturate on hover. Default true. */
  hover?: boolean;
  /** Body padding in px. Default 24. */
  padding?: number;
  style?: React.CSSProperties;
}

export function Card(props: CardProps): JSX.Element;
