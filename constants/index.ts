// App-wide constants

export const APP_NAME = 'مقرأ'; // Maqra in Arabic

// Design tokens
export const COLORS = {
  // Primary palette — deep indigo/violet
  primary: '#6C4CF1',
  primaryLight: '#8A70F5',
  primaryDark: '#4A30CC',

  // Accent — warm amber for Arabic warmth
  accent: '#F5A623',
  accentLight: '#F7BE5A',

  // Neutral backgrounds
  bg: '#0F0E17',
  bgCard: '#1A1827',
  bgCardAlt: '#221F33',
  surface: '#2A2640',

  // Text
  textPrimary: '#F0EDF8',
  textSecondary: '#9B97B4',
  textMuted: '#5C5875',

  // Status
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Reading statuses
  statusReading: '#6C4CF1',
  statusCompleted: '#4CAF50',
  statusWantToRead: '#F5A623',
  statusPaused: '#9B97B4',

  // Border
  border: '#2E2A45',
  borderFocus: '#6C4CF1',
} as const;

export const FONTS = {
  regular: 'System',
  bold: 'System',
  // We will load custom Arabic-friendly fonts if available
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 350,
  slow: 600,
} as const;

// Reading status labels (Arabic primary)
export const STATUS_LABELS: Record<string, string> = {
  reading: 'أقرأ الآن',
  completed: 'أتممت',
  want_to_read: 'أريد القراءة',
  paused: 'متوقف',
};

export const STATUS_LABELS_FR: Record<string, string> = {
  reading: 'En cours',
  completed: 'Terminé',
  want_to_read: 'À lire',
  paused: 'En pause',
};
