export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isRequired(value: unknown): boolean {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

export function minLength(value: string, length: number): boolean {
  return value.trim().length >= length;
}
