import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

const THEME_KEY = 'pokemon-explorer-theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from localStorage and system preference on mount
  useEffect(() => {
    const loadTheme = () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      try {
        // Check localStorage first
        const storedTheme = localStorage.getItem(THEME_KEY) as Theme;
        
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
          setTheme(storedTheme);
        } else {
          // Fall back to system preference
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const systemTheme: Theme = systemPrefersDark ? 'dark' : 'light';
          setTheme(systemTheme);
          localStorage.setItem(THEME_KEY, systemTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        setTheme('light');
      }

      setIsLoading(false);
    };

    loadTheme();
  }, []);

  // Apply theme to document when it changes
  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) {
      return;
    }

    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, isLoading]);

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_KEY, newTheme);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  }, [theme]);

  // Set specific theme
  const setSpecificTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_KEY, newTheme);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  }, []);

  return {
    theme,
    isLoading,
    toggleTheme,
    setTheme: setSpecificTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
}