import * as React from "react";
import { IconName } from "./Icon";

/**
 * Plasmart pill button with the signature indigo fill that rises on hover.
 */
export interface ButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, "style"> {
  children?: React.ReactNode;
  /** Visual style. Default "outline". */
  variant?: "solid" | "outline" | "ghost";
  /** Default "md". */
  size?: "sm" | "md" | "lg";
  /** Trailing icon — an IconName string or a custom node. */
  icon?: IconName | React.ReactNode;
  /** Drift toward the cursor on hover (factor .4) — the brand's hero/contact CTAs. */
  magnetic?: boolean;
  /** Render as an anchor by passing href (or set `as`). */
  href?: string;
  as?: "button" | "a";
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
