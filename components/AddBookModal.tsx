/**
 * components/AddBookModal.tsx
 * Bottom-sheet modal for adding a new book (MAQ-21).
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  I18nManager,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useBookStore } from '../store/useBookStore';
import { ReadingStatus } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, BORDER_RADIUS as BR, STATUS_LABELS } from '../constants';

interface AddBookModalProps {
  visible: boolean;
  onClose: () => void;
}

const STATUSES: ReadingStatus[] = ['want_to_read', 'reading', 'completed', 'paused'];

export default function AddBookModal({ visible, onClose }: AddBookModalProps) {
  const addBook = useBookStore((s) => s.addBook);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [status, setStatus] = useState<ReadingStatus>('want_to_read');
  const [genre, setGenre] = useState('');

  const isValid = title.trim().length > 0 && Number(totalPages) > 0;

  function handleAdd() {
    if (!isValid) return;
    addBook({
      title: title.trim(),
      author: author.trim() || 'غير محدد',
      totalPages: Number(totalPages),
      status,
      genre: genre.trim() || undefined,
    });
    resetForm();
    onClose();
  }

  function resetForm() {
    setTitle('');
    setAuthor('');
    setTotalPages('');
    setStatus('want_to_read');
    setGenre('');
  }

  function handleCancel() {
    resetForm();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        pointerEvents="box-none"
      >
        <Animated.View
          entering={SlideInDown.springify().damping(18)}
          exiting={SlideOutDown.duration(250)}
          style={styles.sheet}
        >
          {/* Handle */}
          <View style={styles.handle} />

          <Text style={styles.sheetTitle}>إضافة كتاب جديد</Text>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <Text style={styles.label}>عنوان الكتاب *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="أدخل عنوان الكتاب"
              placeholderTextColor={COLORS.textMuted}
              textAlign={I18nManager.isRTL ? 'right' : 'left'}
            />

            {/* Author */}
            <Text style={styles.label}>المؤلف</Text>
            <TextInput
              style={styles.input}
              value={author}
              onChangeText={setAuthor}
              placeholder="اسم المؤلف"
              placeholderTextColor={COLORS.textMuted}
              textAlign={I18nManager.isRTL ? 'right' : 'left'}
            />

            {/* Total pages */}
            <Text style={styles.label}>عدد الصفحات *</Text>
            <TextInput
              style={styles.input}
              value={totalPages}
              onChangeText={setTotalPages}
              placeholder="مثال: 320"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              textAlign={I18nManager.isRTL ? 'right' : 'left'}
            />

            {/* Genre */}
            <Text style={styles.label}>النوع الأدبي</Text>
            <TextInput
              style={styles.input}
              value={genre}
              onChangeText={setGenre}
              placeholder="رواية، فلسفة، علوم..."
              placeholderTextColor={COLORS.textMuted}
              textAlign={I18nManager.isRTL ? 'right' : 'left'}
            />

            {/* Status */}
            <Text style={styles.label}>الحالة</Text>
            <View style={styles.statusRow}>
              {STATUSES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusChip,
                    status === s && styles.statusChipActive,
                  ]}
                  onPress={() => setStatus(s)}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      status === s && styles.statusChipTextActive,
                    ]}
                  >
                    {STATUS_LABELS[s]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addBtn, !isValid && styles.addBtnDisabled]}
                onPress={handleAdd}
                disabled={!isValid}
              >
                <Text style={styles.addText}>إضافة</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.lg,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    marginBottom: 6,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  cancelBtn: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 15,
  },
  addBtn: {
    flex: 2,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
