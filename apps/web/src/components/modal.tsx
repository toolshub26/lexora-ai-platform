"use client";

import * as React from "react";

export interface ModalProps {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({
  open,
  title,
  children,
  onClose,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "var(--card)",
          color: "var(--foreground)",
          border: "1px solid var(--card-border)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 20px 50px rgba(0,0,0,.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.4rem",
              fontWeight: 700,
            }}
          >
            {title}
          </h2>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--foreground)",
              cursor: "pointer",
              fontSize: "1.5rem",
              lineHeight: 1,
            }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
