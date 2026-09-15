import * as React from "react";

export interface KickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  /** Show the glowing indigo signal dot at the left. Default true. */
  dot?: boolean;
}

/** Mono uppercase status line above headings, with an optional glowing indigo dot. */
export function Kicker(props: KickerProps): JSX.Element;
