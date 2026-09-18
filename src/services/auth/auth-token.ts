const TOKEN_KEY = 'auth_token';

export function getAuthToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem(TOKEN_KEY)?.trim() || undefined;
}

export function setAuthToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token.trim());
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(TOKEN_KEY);
}
