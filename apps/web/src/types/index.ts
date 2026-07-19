export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export type ThemeMode = "light" | "dark" | "system";

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export interface BaseEntity extends Timestamped {
  id: string;
}
