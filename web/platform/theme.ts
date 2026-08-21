import { get, writable } from 'svelte/store';

export type Theme = 'dark' | 'light';
const THEME_KEY = 'uma:theme';

function preferredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark';
}

export const theme = writable<Theme>('dark');

export function initializeTheme(): void {
  const value = preferredTheme();
  theme.set(value);
  document.documentElement.dataset.theme = value;
}

export function setTheme(value: Theme): void {
  theme.set(value);
  document.documentElement.dataset.theme = value;
  window.localStorage.setItem(THEME_KEY, value);
}

export function toggleTheme(): void { setTheme(get(theme) === 'dark' ? 'light' : 'dark'); }
