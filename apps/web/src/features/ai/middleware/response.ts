export interface AIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export function createSuccessResponse<T>(data: T): AIResponse<T> {
  return {
    success: true,
    data,
  };
}

export function createErrorResponse(message: string): AIResponse {
  return {
    success: false,
    error: message,
  };
}

export function isSuccessResponse<T>(
  response: AIResponse<T>
): response is AIResponse<T> & { success: true; data: T } {
  return response.success;
}
