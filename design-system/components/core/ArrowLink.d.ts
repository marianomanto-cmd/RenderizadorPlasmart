import * as React from "react";

export interface ArrowLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
  href?: string;
}

/** Mono uppercase micro-link with a trailing hairline that extends on hover. */
export function ArrowLink(props: ArrowLinkProps): JSX.Element;
