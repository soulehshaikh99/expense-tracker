'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage immediately to avoid flash
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'system';
    try {
      const saved = localStorage.getItem('theme-preference') as Theme | null;
      return saved || 'system';
    } catch {
      return 'system';
    }
  };

  const getInitialResolvedTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    try {
      const saved = localStorage.getItem('theme-preference') as Theme | null;
      if (saved === 'dark') return 'dark';
      if (saved === 'light') return 'light';
      // If 'system' or null, detect system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(getInitialResolvedTheme);
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Apply theme to HTML element
  const applyTheme = (themeToApply: 'light' | 'dark') => {
    const root = document.documentElement;
    if (themeToApply === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setResolvedTheme(themeToApply);
  };

  // Set theme and persist to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme-preference', newTheme);

    if (newTheme === 'system') {
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
    } else {
      applyTheme(newTheme);
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    // Get saved preference or default to system
    const savedTheme = localStorage.getItem('theme-preference') as Theme | null;
    const initialTheme = savedTheme || 'system';
    
    // Update state if needed
    setThemeState(initialTheme);

    // Apply initial theme immediately (in case script didn't run or was overridden)
    if (initialTheme === 'system') {
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
    } else {
      applyTheme(initialTheme);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      // Read current theme from localStorage to avoid stale closure
      const currentTheme = localStorage.getItem('theme-preference') as Theme | null;
      if (currentTheme === 'system' || !currentTheme) {
        const systemTheme = getSystemTheme();
        applyTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Update theme when system preference changes (only if theme is 'system')
  useEffect(() => {
    if (theme === 'system') {
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
    }
  }, [theme]);

  // Always provide context, but use default values until mounted
  const contextValue = mounted 
    ? { theme, resolvedTheme, setTheme }
    : { 
        theme: getInitialTheme(), 
        resolvedTheme: getInitialResolvedTheme(), 
        setTheme: () => {} 
      };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

