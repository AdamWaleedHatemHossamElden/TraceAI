// ─── Session token store ──────────────────────────────────────────────────────
// Wraps sessionStorage so the rest of the application never touches storage
// keys directly. Using sessionStorage (not localStorage) means the token is
// cleared automatically when the browser tab is closed.
//
// No refresh-token logic is included because the backend currently issues
// one-hour access tokens only.

const KEY = 'traceai_token';

export const tokenStore = {
  /** Returns the stored access token, or null if none exists. */
  get(): string | null {
    return sessionStorage.getItem(KEY);
  },

  /** Saves the access token to sessionStorage. */
  set(token: string): void {
    sessionStorage.setItem(KEY, token);
  },

  /** Removes the access token from sessionStorage. */
  clear(): void {
    sessionStorage.removeItem(KEY);
  },
};
