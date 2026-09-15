import * as React from "react";

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The number, as a string to preserve es-AR comma decimals, e.g. "12,7". */
  value: React.ReactNode;
  /** Mono indigo unit, e.g. "mm", "años", "m". */
  unit?: string;
  /** Muted caption under the number. */
  label?: string;
  style?: React.CSSProperties;
}

/** Giant thin Sora figure with a mono indigo unit and muted label — the stats band. */
export function Stat(props: StatProps): JSX.Element;
