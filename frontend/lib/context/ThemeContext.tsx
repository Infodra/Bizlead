'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
}


const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Only dark theme is supported
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export function useThemeSafe() {
  const context = useContext(ThemeContext);
  // Return a default context if not within provider
  return context || { theme: 'dark' as Theme };
}
