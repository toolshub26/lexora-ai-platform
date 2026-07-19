"use client";

import * as React from "react";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "danger";
}

const variants = {
  primary: {
    background: "var(--primary)",
    color: "#fff",
  },
  success: {
    background: "#16a34a",
    color: "#fff",
  },
  warning: {
    background: "#d97706",
    color: "#fff",
  },
  danger: {
    background: "#dc2626",
    color: "#fff",
  },
} as const;

export default function Badge({
  variant = "primary",
  style,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...variants[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
