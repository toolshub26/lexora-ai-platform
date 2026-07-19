"use client";

import { useState } from "react";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm Lexora AI. How can I help you today?",
    },
  ]);

  const handleSend = async (message: string) => {
    const userMessage: Message = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    // TODO: Replace with actual AI provider
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `You said: ${message}`,
        },
      ]);

      setLoading(false);
    }, 800);
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-6">
      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border bg-white p-6 dark:bg-neutral-900">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
          />
        ))}

        {loading && (
          <ChatMessage
            role="assistant"
            content="Thinking..."
          />
        )}
      </div>

      <ChatInput
        loading={loading}
        onSend={handleSend}
      />
    </div>
  );
}
