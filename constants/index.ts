// Compatibility layer: re-export new theme tokens
import { colors, spacing, typography } from '../src/theme';

export const COLORS = colors;
export const SPACING = spacing;
export const FONTS = typography;

export const STATUS_LABELS: Record<string, string> = {
  reading: 'Reading',
  completed: 'Completed',
  want_to_read: 'Want to Read',
  paused: 'Paused',
};

export const STATUS_LABELS_FR: Record<string, string> = {
  reading: 'En cours',
  completed: 'Terminé',
  want_to_read: 'À lire',
  paused: 'En pause',
};

export const APP_NAME = 'Maqra';

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
