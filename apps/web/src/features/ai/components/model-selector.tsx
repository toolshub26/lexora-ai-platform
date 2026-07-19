"use client";

interface ModelSelectorProps {
  models: string[];
  value: string;
  onChange: (model: string) => void;
}

export function ModelSelector({
  models,
  value,
  onChange,
}: ModelSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold">
        AI Model
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border bg-white p-3 dark:bg-neutral-900"
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  );
}
