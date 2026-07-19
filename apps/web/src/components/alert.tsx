"use client";

import * as React from "react";

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
}

const variants = {
  info: {
    background: "#1e3a8a",
    border: "#3b82f6",
    color: "#ffffff",
  },
  success: {
    background: "#14532d",
    border: "#22c55e",
    color: "#ffffff",
  },
  warning: {
    background: "#78350f",
    border: "#f59e0b",
    color: "#ffffff",
  },
  error: {
    background: "#7f1d1d",
    border: "#ef4444",
    color: "#ffffff",
  },
} as const;

export default function Alert({
  variant = "info",
  style,
  children,
  ...props
}: AlertProps) {
  const colors = variants[variant];

  return (
    <div
      role="alert"
      style={{
        padding: "16px",
        borderRadius: "12px",
        border: `1px solid ${colors.border}`,
        background: colors.background,
        color: colors.color,
        fontSize: "0.95rem",
        lineHeight: 1.6,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
