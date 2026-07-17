"use client";

import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";

export function Chat() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex-1 space-y-4">
        <ChatMessage
          role="assistant"
          content="Hello! I'm Lexora AI. How can I help you today?"
        />
      </div>

      <ChatInput />
    </div>
  );
}
