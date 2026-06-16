/**
 * lib/rtl.ts
 * RTL (Right-to-Left) helpers for Arabic support.
 *
 * React Native handles RTL at the platform level via I18nManager.
 * This module provides utilities to configure and use RTL consistently.
 */

import { I18nManager, Platform } from 'react-native';

/**
 * Call this at app startup to force RTL layout for Arabic.
 * Requires an app reload on iOS/Android to take effect.
 */
export function enableRTL(): void {
  if (!I18nManager.isRTL) {
    I18nManager.forceRTL(true);
    I18nManager.allowRTL(true);
  }
}

/**
 * Returns whether the app is currently in RTL mode.
 */
export function isRTL(): boolean {
  return I18nManager.isRTL;
}

/**
 * Returns a text alignment value based on RTL state.
 */
export function getTextAlign(): 'right' | 'left' {
  return I18nManager.isRTL ? 'right' : 'left';
}

/**
 * Flips left/right padding/margin values for RTL.
 * Useful when you need to set asymmetric horizontal spacing.
 */
export function flipHorizontal(ltr: number, rtl: number): number {
  return I18nManager.isRTL ? rtl : ltr;
}

/**
 * Returns a direction-aware flex row.
 * In RTL, row direction stays 'row' but React Native handles
 * the actual mirroring automatically when isRTL is true.
 */
export const rowDirection = I18nManager.isRTL ? 'row-reverse' : 'row';

/**
 * Use this to write text that requires explicit RTL/LTR marks.
 */
export const RTL_MARK = '\u200F'; // RIGHT-TO-LEFT MARK
export const LTR_MARK = '\u200E'; // LEFT-TO-RIGHT MARK
