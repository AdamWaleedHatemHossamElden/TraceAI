import {
  createContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthUser, AuthContextValue } from '../types/auth';
import { MOCK_USER, mockDelay } from '../mocks/auth.mock';

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ─── Login ────────────────────────────────────────────────────────────────
  // MOCK: Simulates an API call and sets in-memory auth state.
  // TODO: Replace with authApi.login({ email, password }) when backend is ready.
  //       Store the returned access token in a module-level variable (not localStorage)
  //       and attach it in api/client.ts request interceptor.
  const login = useCallback(
    async (_email: string, _password: string): Promise<void> => {
      setIsLoading(true);
      try {
        await mockDelay();
        setUser(MOCK_USER);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ─── Register ─────────────────────────────────────────────────────────────
  // MOCK: Simulates an API call and sets in-memory auth state.
  // TODO: Replace with authApi.register({ name, email, password }) when backend is ready.
  const register = useCallback(
    async (_name: string, _email: string, _password: string): Promise<void> => {
      setIsLoading(true);
      try {
        await mockDelay();
        setUser(MOCK_USER);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ─── Logout ───────────────────────────────────────────────────────────────
  // TODO: Call authApi.logout() and clear the stored token when backend is ready.
  const logout = useCallback((): void => {
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
