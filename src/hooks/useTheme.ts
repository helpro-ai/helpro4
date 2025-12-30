import { useLayoutEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
const THEME_KEY = 'helpro.theme';

function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem(THEME_KEY)) as ThemeMode | null;
    return stored === 'light' ? 'light' : 'dark';
  });

  useLayoutEffect(() => {
    applyTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return { theme, toggleTheme };
}
