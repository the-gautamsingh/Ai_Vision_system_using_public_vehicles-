/**
 * ThemeContext.jsx
 * Provides dark / light mode toggle with localStorage persistence.
 * Sets  data-theme="light" | "dark"  on <html> so CSS variables
 * switch the entire app without any Tailwind dark: prefix needed.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('fv-theme') ?? 'light';
    } catch {
      return 'light';
    }
  });

  /* apply data-theme to <html> every time theme changes */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('fv-theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
