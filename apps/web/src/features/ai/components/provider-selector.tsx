"use client";

interface ProviderSelectorProps {
  providers: string[];
  value: string;
  onChange: (provider: string) => void;
}

export function ProviderSelector({
  providers,
  value,
  onChange,
}: ProviderSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold">
        AI Provider
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border bg-white p-3 dark:bg-neutral-900"
      >
        {providers.map((provider) => (
          <option key={provider} value={provider}>
            {provider}
          </option>
        ))}
      </select>
    </div>
  );
}
