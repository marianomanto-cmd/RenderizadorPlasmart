import * as React from "react";

/**
 * Hover-reveal capability/process list row — Plasmart's "Capacidades" pattern.
 */
export interface CapabilityRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Mono index, e.g. "01". */
  index?: React.ReactNode;
  /** Large capability name, e.g. "Corte láser". */
  name: React.ReactNode;
  /** Right-aligned mono spec, e.g. "↳ hasta 12,7 mm". */
  spec?: React.ReactNode;
  /** Description that fades in on hover and persists. */
  description?: React.ReactNode;
  style?: React.CSSProperties;
}

export function CapabilityRow(props: CapabilityRowProps): JSX.Element;
