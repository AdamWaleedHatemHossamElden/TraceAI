import {
  createContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { AuthUser, AuthContextValue } from '../types/auth';
import * as authApi from '../api/authApi';
import { tokenStore } from '../utils/tokenStore';

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

// ─── Helper: distinguish auth failures from transient errors ──────────────────
// Returns true only for 401 / 403 responses — a clear signal that the stored
// token is invalid or expired and must be discarded.
// Returns false for network errors, 5xx, or any other transient failure so
// the user is not inadvertently logged out due to backend unavailability.
function isAuthError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    return status === 401 || status === 403;
  }
  return false;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Lazy initialisation: only show the startup loading screen if a token
  // already exists in sessionStorage. New/unauthenticated users skip it entirely.
  const [isInitialising, setIsInitialising] = useState(
    () => tokenStore.get() !== null
  );

  // ─── Startup: restore session ─────────────────────────────────────────────
  // Runs once on mount. If a token is present, calls GET /auth/me to verify it
  // and restore the user. Sets isInitialising to false when done regardless of
  // the outcome so ProtectedRoute can proceed.
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      // No token in storage — nothing to restore.
      return;
    }

    let cancelled = false;

    async function restoreSession(): Promise<void> {
      try {
        const { user: currentUser } = await authApi.getMe();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (err) {
        if (!cancelled) {
          // Only clear the token when the backend explicitly rejects it (401/403).
          // On network errors or 5xx responses, the token may still be valid —
          // leave it in place so the user is not logged out unnecessarily.
          if (isAuthError(err)) {
            tokenStore.clear();
          }
          // user remains null; ProtectedRoute will redirect to /login.
        }
      } finally {
        if (!cancelled) {
          setIsInitialising(false);
        }
      }
    }

    void restoreSession();

    // Prevent state updates if the component unmounts before the call resolves.
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────
  // Calls POST /auth/login, stores the token, and sets the user.
  // Throws on failure so LoginPage can catch and display the error.
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      try {
        const { user: loggedInUser, accessToken } = await authApi.login({
          email,
          password,
        });
        tokenStore.set(accessToken);
        setUser(loggedInUser);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ─── Register ─────────────────────────────────────────────────────────────
  // Calls POST /auth/register, stores the token, and sets the user.
  // Throws on failure so RegisterPage can catch and display the error.
  const register = useCallback(
    async (fullName: string, email: string, password: string): Promise<void> => {
      setIsLoading(true);
      try {
        const { user: newUser, accessToken } = await authApi.register({
          fullName,
          email,
          password,
        });
        tokenStore.set(accessToken);
        setUser(newUser);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ─── Logout ───────────────────────────────────────────────────────────────
  // Clears the token and resets user state. No backend call is needed because
  // the backend only issues short-lived access tokens with no server-side session.
  const logout = useCallback((): void => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    isInitialising,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
