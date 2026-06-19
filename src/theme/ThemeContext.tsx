// src/theme/ThemeContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { colors, spacing, typography } from '../theme';

export type Theme = typeof colors & typeof spacing & typeof typography;

const ThemeContext = createContext<Theme>(null as any);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return <ThemeContext.Provider value={{ ...colors, ...spacing, ...typography }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
