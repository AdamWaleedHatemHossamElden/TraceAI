import type { AuthUser } from '../types/auth';

// ─── Mock user returned after a successful mock login / register ──────────────
// Replace this with real user data from the backend when auth is implemented.

export const MOCK_USER: AuthUser = {
  id: 'mock-user-1',
  name: 'Adam',
  email: 'adam@example.com',
};

// ─── Simulated network delay ──────────────────────────────────────────────────
// Gives the UI a realistic loading state during mock auth operations.

export function mockDelay(ms = 900): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
