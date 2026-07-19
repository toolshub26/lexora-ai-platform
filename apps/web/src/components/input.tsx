"use client";

import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ style, ...props }, ref) => {
    return (
      <input
        ref={ref}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: "var(--card)",
          color: "var(--foreground)",
          border: "1px solid var(--card-border)",
          borderRadius: "12px",
          outline: "none",
          fontSize: "1rem",
          transition: "all .25s ease",
          boxSizing: "border-box",
          ...style,
        }}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
