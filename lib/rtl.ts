/**
 * lib/rtl.ts
 * RTL (Right-to-Left) helpers for Arabic support.
 *
 * React Native handles RTL at the platform level via I18nManager.
 * This module provides utilities to configure and use RTL consistently.
 */

import { I18nManager } from 'react-native';

/**
 * Configure RTL layout.
 * Requires an app reload on iOS/Android to take effect persistency.
 */
export function setRTL(enable: boolean): void {
  I18nManager.forceRTL(enable);
  I18nManager.allowRTL(enable);
}

/**
 * Returns whether the app is currently in RTL mode.
 */
export function isRTL(): boolean {
  return I18nManager.isRTL;
}

/**
 * Returns a text alignment value based on RTL state or book language.
 */
export function getTextAlign(isArabicBook?: boolean): 'right' | 'left' {
  return (I18nManager.isRTL || isArabicBook) ? 'right' : 'left';
}

/**
 * Flips left/right padding/margin values for RTL.
 */
export function flipHorizontal(ltr: number, rtl: number): number {
  return I18nManager.isRTL ? rtl : ltr;
}

/**
 * Returns a direction-aware flex row.
 */
export function getRowDirection(isArabicBook?: boolean): 'row' | 'row-reverse' {
  return (I18nManager.isRTL || isArabicBook) ? 'row-reverse' : 'row';
}

export const RTL_MARK = '\u200F'; // RIGHT-TO-LEFT MARK
export const LTR_MARK = '\u200E'; // LEFT-TO-RIGHT MARK

