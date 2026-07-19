"use client";

import * as React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, style, ...props }, ref) => {
    return (
      <select
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
          cursor: "pointer",
          transition: "all .25s ease",
          boxSizing: "border-box",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export default Select;
