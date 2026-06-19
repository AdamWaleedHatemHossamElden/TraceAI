import type { ApiErrorResponse } from '../types/api';

// ─── Extract a human-readable message from an Axios error ────────────────────

export function parseApiError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { data?: ApiErrorResponse } };
    const apiError = axiosError.response?.data?.error;
    if (apiError?.message) return apiError.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred. Please try again.';
}

// ─── Extract per-field validation errors from an Axios error ─────────────────

export function parseFieldErrors(error: unknown): Record<string, string> {
  const fields: Record<string, string> = {};
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { data?: ApiErrorResponse } };
    const details = axiosError.response?.data?.error?.details ?? [];
    for (const d of details) {
      fields[d.field] = d.message;
    }
  }
  return fields;
}

// ─── Check if an error is a network / server-unreachable error ────────────────

export function isNetworkError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const e = error as { code?: string };
    return e.code === 'ERR_NETWORK' || e.code === 'ECONNREFUSED';
  }
  return false;
}
