
"use client";

import { useState } from "react";

interface ChatInputProps {
  onSend?: (message: string) => void;
  loading?: boolean;
}

export function ChatInput({
  onSend,
  loading = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const send = () => {
    const value = message.trim();

    if (!value || loading) return;

    onSend?.(value);
    setMessage("");
  };

  return (
    <div className="flex items-end gap-3 rounded-2xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
      <textarea
        rows={2}
        value={message}
        placeholder="Ask Lexora AI anything..."
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        className="flex-1 resize-none rounded-xl border p-3 outline-none"
      />

      <button
        type="button"
        onClick={send}
        disabled={loading}
        className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
