import * as React from "react";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  /** Default "outline". */
  variant?: "outline" | "accent" | "solid";
}

/** Small mono pill for specs, statuses, filters and metadata. */
export function Tag(props: TagProps): JSX.Element;
