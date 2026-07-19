"use client";

interface AIStatusProps {
  provider: string;
  model: string;
  status?: "ready" | "thinking" | "error";
}

export function AIStatus({
  provider,
  model,
  status = "ready",
}: AIStatusProps) {
  const color =
    status === "ready"
      ? "bg-green-500"
      : status === "thinking"
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
      <div>
        <h3 className="text-sm font-semibold">Lexora AI Status</h3>

        <p className="text-sm text-neutral-500">
          {provider} • {model}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${color}`} />

        <span className="text-sm font-medium capitalize">
          {status}
        </span>
      </div>
    </div>
  );
}
