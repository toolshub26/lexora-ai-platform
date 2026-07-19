"use client";

import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = {
  none: "0",
  sm: "12px",
  md: "20px",
  lg: "32px",
} as const;

export default function Card({
  padding = "md",
  style,
  children,
  ...props
}: CardProps) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: "16px",
        padding: paddings[padding],
        boxShadow: "0 12px 40px rgba(0,0,0,.25)",
        transition: "all .25s ease",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
