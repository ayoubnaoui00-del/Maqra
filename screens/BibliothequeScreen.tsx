/**
 * screens/BibliothequeScreen.tsx
 * Main library dashboard screen (MAQ-17, MAQ-18, MAQ-19, MAQ-20, MAQ-21).
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  I18nManager,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useBookStore } from '../store/useBookStore';
import { Book, ReadingStatus } from '../types';
import BookCard from '../components/BookCard';
import ProgressRing from '../components/ProgressRing';
import SearchBar from '../components/SearchBar';
import AddBookModal from '../components/AddBookModal';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';

interface Props {
  onSelectBook: (book: Book) => void;
  onGoToProfile: () => void;
}

export default function BibliothequeScreen({ onSelectBook, onGoToProfile }: Props) {
  const books = useBookStore((s) => s.books);
  const getYearlyProgress = useBookStore((s) => s.getYearlyProgress);
  const getCurrentStreak = useBookStore((s) => s.getCurrentStreak);
  const getTotalReadingTimeSeconds = useBookStore((s) => s.getTotalReadingTimeSeconds);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ReadingStatus | 'all'>('all');
  const [activeLangFilter, setActiveLangFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const yearly = getYearlyProgress();
  const currentStreak = getCurrentStreak();
  const totalMinutes = Math.floor(getTotalReadingTimeSeconds() / 60);

  // Search + filter logic (MAQ-20)
  const filteredBooks = useMemo(() => {
    let result = books;
    if (activeFilter !== 'all') {
      result = result.filter((b) => b.status === activeFilter);
    }
    if (activeLangFilter !== 'all') {
      result = result.filter((b) => b.language === activeLangFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.genre?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [books, activeFilter, activeLangFilter, searchQuery]);

  const readingCount = books.filter((b) => b.status === 'reading').length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <BookCard book={item} onPress={onSelectBook} index={index} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery || activeFilter !== 'all'
                ? 'لا توجد نتائج'
                : 'مكتبتك فارغة'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || activeFilter !== 'all'
                ? 'حاول البحث بكلمة أخرى'
                : 'ابدأ بإضافة كتابك الأول'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <Animated.View entering={FadeIn.duration(400)}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>مرحباً 👋</Text>
                <Text style={styles.headerTitle}>مكتبتي</Text>
              </View>
              <TouchableOpacity onPress={onGoToProfile} style={styles.avatarBtn}>
                <Text style={styles.avatarIcon}>👤</Text>
              </TouchableOpacity>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <StatPill label="أقرأ الآن" value={String(readingCount)} icon="📖" />
              <StatPill label="أيام متتالية" value={String(currentStreak)} icon="🔥" />
              <StatPill label="دقائق قراءة" value={String(totalMinutes)} icon="⏱️" />
            </View>

            {/* Yearly goal progress ring */}
            {books.length > 0 && (
              <View style={styles.goalCard}>
                <View style={styles.goalText}>
                  <Text style={styles.goalTitle}>هدف السنة</Text>
                  <Text style={styles.goalSubtitle}>
                    {yearly.completed} من أصل {yearly.goal} كتاب
                  </Text>
                  <Text style={styles.goalDescription}>
                    {yearly.goal - yearly.completed > 0
                      ? `تبقى ${yearly.goal - yearly.completed} كتاب`
                      : '🎉 أنجزت هدفك!'}
                  </Text>
                </View>
                <ProgressRing
                  progress={yearly.goal > 0 ? yearly.completed / yearly.goal : 0}
                  completed={yearly.completed}
                  goal={yearly.goal}
                  size={110}
                />
              </View>
            )}

            {/* Search + filters */}
            <View style={styles.searchSection}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                activeLangFilter={activeLangFilter}
                onLangFilterChange={setActiveLangFilter}
              />
            </View>

            {/* Section title */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeFilter === 'all' && activeLangFilter === 'all' ? 'جميع الكتب' : 'النتائج'} ({filteredBooks.length})
              </Text>
            </View>
          </Animated.View>
        }
      />

      {/* FAB — Add book */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddBookModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatPill({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={statStyles.pill}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  pill: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  icon: { fontSize: 20, marginBottom: 4 },
  value: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  label: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
});

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  avatarIcon: { fontSize: 20 },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  goalCard: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: SPACING.md,
  },
  goalText: { flex: 1 },
  goalTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  goalSubtitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  goalDescription: {
    fontSize: 12,
    color: COLORS.accent,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    marginTop: 4,
    fontWeight: '600',
  },
  searchSection: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  emptyIcon: { fontSize: 56, marginBottom: SPACING.md },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: I18nManager.isRTL ? undefined : 24,
    left: I18nManager.isRTL ? 24 : undefined,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  fabIcon: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 34,
  },
});
