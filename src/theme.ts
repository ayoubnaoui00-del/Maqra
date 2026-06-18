// src/theme.ts
import { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  primary: '#0052cc',
  primaryContainer: '#0052cc',
  secondary: '#e2725b',
  tertiary: '#48bd91',
  background: '#FCF9F7',
  surface: '#f9f9fc',
  onPrimary: '#ffffff',
  onBackground: '#1a1c1e',
  onSurface: '#1a1c1e',
  error: '#ba1a1a',
  onError: '#ffffff',
  // additional semantic colors
};

export const spacing = {
  unit: 4,
  marginMobile: 20,
  stackSm: 8,
  stackMd: 16,
  stackLg: 32,
  gutter: 16,
};

export const typography = {
  displayLg: {
    fontFamily: 'Be Vietnam Pro',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.02,
  },
  headlineMd: {
    fontFamily: 'Be Vietnam Pro',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  bodyLg: {
    fontFamily: 'Be Vietnam Pro',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: 'Be Vietnam Pro',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  labelSm: {
    fontFamily: 'Be Vietnam Pro',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.05,
  },
};

export type Theme = typeof colors & typeof spacing & typeof typography;
