/**
 * components/BookCard.tsx
 * Animated book card for the library list (MAQ-18).
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  I18nManager,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Book } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, STATUS_LABELS } from '../constants';

interface BookCardProps {
  book: Book;
  onPress: (book: Book) => void;
  index?: number;
}

function getStatusColor(status: Book['status']): string {
  switch (status) {
    case 'reading': return COLORS.statusReading;
    case 'completed': return COLORS.statusCompleted;
    case 'want_to_read': return COLORS.statusWantToRead;
    case 'paused': return COLORS.statusPaused;
  }
}

export default function BookCard({ book, onPress, index = 0 }: BookCardProps) {
  const progress = book.totalPages > 0 ? book.currentPage / book.totalPages : 0;
  const statusColor = getStatusColor(book.status);

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(book)}
        activeOpacity={0.85}
      >
        {/* Cover */}
        <View style={styles.coverContainer}>
          {book.coverUri ? (
            <Image source={{ uri: book.coverUri }} style={styles.cover} resizeMode="cover" />
          ) : (
            <View style={[styles.cover, styles.coverPlaceholder]}>
              <Text style={styles.coverInitial}>
                {book.title.charAt(0)}
              </Text>
            </View>
          )}
          {/* Status dot */}
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {book.author}
          </Text>

          {/* Status badge */}
          <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {STATUS_LABELS[book.status]}
            </Text>
          </View>

          {/* Progress bar (only when reading) */}
          {book.status === 'reading' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {book.currentPage}/{book.totalPages}
              </Text>
            </View>
          )}

          {/* Rating */}
          {book.rating !== undefined && (
            <Text style={styles.rating}>
              {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  coverContainer: {
    position: 'relative',
  },
  cover: {
    width: 64,
    height: 88,
    borderRadius: BORDER_RADIUS.sm,
  },
  coverPlaceholder: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverInitial: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statusDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.bgCard,
  },
  info: {
    flex: 1,
    marginLeft: I18nManager.isRTL ? 0 : SPACING.md,
    marginRight: I18nManager.isRTL ? SPACING.md : 0,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    marginBottom: 3,
  },
  author: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    marginBottom: SPACING.xs,
  },
  badge: {
    alignSelf: I18nManager.isRTL ? 'flex-end' : 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    minWidth: 50,
  },
  rating: {
    fontSize: 12,
    color: COLORS.accent,
    marginTop: 2,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
});
