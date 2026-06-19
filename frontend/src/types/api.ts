// ─── Standard API error shape (from API_CONTRACT.md) ─────────────────────────

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details: ApiErrorDetail[];
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}

// ─── Health endpoint response shapes (from openapi.yaml) ─────────────────────

export interface HealthResponse {
  status: string;
  service: string;
  timestamp?: string;
}

// ─── UI-level status type used by health components ──────────────────────────

export type ServiceStatus = 'loading' | 'online' | 'offline';

export interface ServiceHealth {
  status: ServiceStatus;
  service: string;
  message?: string;
  timestamp?: string;
}
