"use client";

import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ style, rows = 5, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: "var(--card)",
          color: "var(--foreground)",
          border: "1px solid var(--card-border)",
          borderRadius: "12px",
          outline: "none",
          resize: "vertical",
          fontSize: "1rem",
          lineHeight: 1.6,
          transition: "all .25s ease",
          boxSizing: "border-box",
          ...style,
        }}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
