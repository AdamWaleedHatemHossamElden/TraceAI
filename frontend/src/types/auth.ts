// ─── Auth types ───────────────────────────────────────────────────────────────
// Structured to match the future backend auth contract.
// When real endpoints are ready, login/register will call authApi instead of mocks.

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
