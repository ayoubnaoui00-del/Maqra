/**
 * components/SearchBar.tsx
 * Animated search bar with filter chips (MAQ-20).
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  I18nManager,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ReadingStatus } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, STATUS_LABELS, ANIMATION_DURATION } from '../constants';

const FILTER_OPTIONS: { label: string; value: ReadingStatus | 'all' }[] = [
  { label: 'الكل (حالة)', value: 'all' },
  { label: STATUS_LABELS.reading, value: 'reading' },
  { label: STATUS_LABELS.want_to_read, value: 'want_to_read' },
  { label: STATUS_LABELS.completed, value: 'completed' },
  { label: STATUS_LABELS.paused, value: 'paused' },
];

const LANG_OPTIONS = [
  { label: 'الكل (لغة)', value: 'all' },
  { label: 'العربية', value: 'ar' },
  { label: 'الفرنسية', value: 'fr' },
  { label: 'الإنجليزية', value: 'en' },
];

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  activeFilter: ReadingStatus | 'all';
  onFilterChange: (filter: ReadingStatus | 'all') => void;
  activeLangFilter: string;
  onLangFilterChange: (lang: string) => void;
}

export default function SearchBar({
  value,
  onChangeText,
  activeFilter,
  onFilterChange,
  activeLangFilter,
  onLangFilterChange,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useSharedValue<string>(COLORS.border);

  const animatedInputStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  function handleFocus() {
    setIsFocused(true);
    borderColor.value = withTiming(COLORS.primary, { duration: ANIMATION_DURATION.fast });
  }

  function handleBlur() {
    setIsFocused(false);
    borderColor.value = withTiming(COLORS.border, { duration: ANIMATION_DURATION.fast });
  }

  return (
    <View style={styles.container}>
      {/* Search input */}
      <Animated.View style={[styles.inputWrapper, animatedInputStyle]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="ابحث عن كتاب..."
          placeholderTextColor={COLORS.textMuted}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Filter chips (Status) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filters}
      >
        {FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onFilterChange(opt.value)}
            style={[
              styles.chip,
              activeFilter === opt.value && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                activeFilter === opt.value && styles.chipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter chips (Language) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filters}
      >
        {LANG_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onLangFilterChange(opt.value)}
            style={[
              styles.chip,
              activeLangFilter === opt.value && styles.chipActiveLang,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                activeLangFilter === opt.value && styles.chipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform_pad(),
    gap: SPACING.sm,
  },
  searchIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearBtn: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  filters: {
    marginHorizontal: -SPACING.lg,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipActiveLang: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
  },
});

// Small platform helper
function Platform_pad() {
  const { Platform } = require('react-native');
  return Platform.OS === 'ios' ? 12 : 10;
}
