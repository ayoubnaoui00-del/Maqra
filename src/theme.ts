// src/theme.ts
import { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  background: '#131313',
  primary: '#d4af37', // Gold
  primaryContainer: '#d4af37',
  primaryFixed: '#ffe088',
  primaryFixedDim: '#e9c349',
  secondary: '#ffe088',
  tertiary: '#d0c5af',
  surface: '#201f1f',
  surfaceContainer: '#201f1f',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerHighest: '#353534',
  onPrimary: '#131313',
  onBackground: '#e5e2e1',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#d0c5af',
  outlineVariant: '#4d4635',
  error: '#8f1d1d',
  danger: '#8f1d1d',
  onError: '#ffffff',
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
    fontFamily: 'MedievalSharp_400Regular',
    fontSize: 32,
    fontWeight: '400' as const,
    lineHeight: 40,
    letterSpacing: -0.02,
  },
  headlineMd: {
    fontFamily: 'MedievalSharp_400Regular',
    fontSize: 24,
    fontWeight: '400' as const,
    lineHeight: 32,
  },
  bodyLg: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  labelSm: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.05,
  },
};

export type Theme = typeof colors & typeof spacing & typeof typography;

