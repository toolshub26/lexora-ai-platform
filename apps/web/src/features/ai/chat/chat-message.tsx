
"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({
  role,
  content,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-3xl rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
        }`}
      >
        <div className="mb-2 text-xs font-semibold uppercase opacity-70">
          {isUser ? "You" : "Lexora AI"}
        </div>

        <p className="whitespace-pre-wrap break-words">
          {content}
        </p>
      </div>
    </div>
  );
}
