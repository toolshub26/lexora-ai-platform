"use client";

import { useState } from "react";
import { useOrganization } from "@/features/organization";
import { aiService } from "../services/ai-service";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const { active, isLoading: organizationLoading } = useOrganization();

  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm Lexora AI. How can I help you today?",
    },
  ]);

  const organizationId = active?.organization.id ?? null;

  const handleSend = async (message: string) => {
    if (!organizationId || loading) return;

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    const result = await aiService.sendMessage(message, organizationId);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: result.success
          ? result.response
          : result.error ?? "AI service request failed.",
      },
    ]);

    setLoading(false);
  };

  if (organizationLoading) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 text-sm text-slate-400">
        Loading organization context...
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-6">
        <div className="text-sm font-semibold text-amber-300">
          No active organization
        </div>
        <p className="mt-2 text-xs text-amber-200/70">
          AI Assistant requires an active organization membership.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-6">
      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
        {messages.map((message, index) => (
          <ChatMessage
            key={`${message.role}-${index}`}
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
