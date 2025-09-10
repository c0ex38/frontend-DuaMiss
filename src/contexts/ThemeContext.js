import { createContext, useContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  const [accentColor, setAccentColor] = useState(() => {
    const saved = localStorage.getItem('accentColor');
    return saved || 'emerald';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('accentColor', accentColor);
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-accent', accentColor);
  }, [theme, accentColor]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const themes = {
    light: {
      bg: 'bg-gradient-to-br from-gray-50 to-white',
      cardBg: 'bg-white/80',
      text: 'text-gray-800',
      textSecondary: 'text-gray-600',
      border: 'border-white/20'
    },
    dark: {
      bg: 'bg-gradient-to-br from-gray-900 to-black',
      cardBg: 'bg-gray-800/80',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      border: 'border-gray-700/20'
    }
  };

  const accentColors = {
    emerald: 'emerald',
    blue: 'blue', 
    purple: 'purple',
    pink: 'pink',
    orange: 'orange'
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      accentColor,
      setAccentColor,
      colors: themes[theme],
      accentColors,
      isDark: theme === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
