"use client";

import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles = {
  primary: {
    background: "var(--primary)",
    color: "#ffffff",
    border: "none",
  },
  secondary: {
    background: "var(--card)",
    color: "var(--foreground)",
    border: "1px solid var(--card-border)",
  },
  outline: {
    background: "transparent",
    color: "var(--foreground)",
    border: "1px solid var(--card-border)",
  },
  danger: {
    background: "var(--danger)",
    color: "#ffffff",
    border: "none",
  },
} as const;

const sizeStyles = {
  sm: {
    padding: "8px 14px",
    fontSize: "0.875rem",
  },
  md: {
    padding: "12px 20px",
    fontSize: "1rem",
  },
  lg: {
    padding: "16px 28px",
    fontSize: "1.125rem",
  },
} as const;

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  children,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        borderRadius: "12px",
        fontWeight: 600,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.65 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        transition: "all .25s ease",
        userSelect: "none",
        ...style,
      }}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
