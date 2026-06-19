import type { UserRole } from './api';

// ─── Auth types ───────────────────────────────────────────────────────────────
// AuthUser mirrors the backend PublicUser shape exactly.

export type { UserRole };

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True while a login or register API call is in flight. Disables submit buttons. */
  isLoading: boolean;
  /** True only during the startup GET /auth/me session-restore check.
   *  ProtectedRoute renders a loading screen instead of redirecting while this is true. */
  isInitialising: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
