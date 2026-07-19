"use client";

import * as React from "react";

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export default function Spinner({
  size = 24,
  style,
  ...props
}: SpinnerProps) {
  return (
    <>
      <style>{`
        @keyframes spinner-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div
        style={{
          width: size,
          height: size,
          border: "3px solid var(--card-border)",
          borderTop: "3px solid var(--primary)",
          borderRadius: "50%",
          animation: "spinner-rotate 0.8s linear infinite",
          display: "inline-block",
          ...style,
        }}
        {...props}
      />
    </>
  );
}
