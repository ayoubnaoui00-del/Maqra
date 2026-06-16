/**
 * store/useBookStore.ts
 * Zustand store for books and reading sessions with AsyncStorage persistence.
 * Covers MAQ-13 (store structure), MAQ-14 (books CRUD), MAQ-15 (sessions CRUD & streaks), MAQ-16 (AsyncStorage).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, ReadingSession, UserProfile, ReadingStatus } from '../types';
import { today, formatDate, calculateStreak, monthKey } from '../lib/date';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── State Shape ─────────────────────────────────────────────────────────────

interface BookState {
  // Data
  books: Book[];
  sessions: ReadingSession[];
  profile: UserProfile;

  // Active reading session (not persisted across app restarts)
  activeSessionId: string | null;
  activeSessionStartTime: string | null;

  // ── Book CRUD ────────────────────────────────────────────────────────────
  addBook: (book: Omit<Book, 'id' | 'addedAt' | 'currentPage' | 'status'> & { currentPage?: number; status?: ReadingStatus }) => Book;
  updateBook: (id: string, updates: Partial<Omit<Book, 'id'>>) => void;
  deleteBook: (id: string) => void;
  setBookStatus: (id: string, status: ReadingStatus) => void;
  updateReadingProgress: (id: string, currentPage: number) => void;
  rateBook: (id: string, rating: number) => void;

  // ── Session CRUD ─────────────────────────────────────────────────────────
  startSession: (bookId: string, startPage: number) => string;
  endSession: (sessionId: string, endPage: number) => void;
  cancelSession: (sessionId: string) => void;
  getBookSessions: (bookId: string) => ReadingSession[];

  // ── Computed / Stats ─────────────────────────────────────────────────────
  getBook: (id: string) => Book | undefined;
  getBooksByStatus: (status: ReadingStatus) => Book[];
  getCurrentStreak: () => number;
  getLongestStreak: () => number;
  getTotalReadingTimeSeconds: () => number;
  getBooksPerMonth: () => Record<string, number>;
  getYearlyProgress: () => { completed: number; goal: number };

  // ── Profile ──────────────────────────────────────────────────────────────
  updateProfile: (updates: Partial<UserProfile>) => void;
}

// ─── Default profile ─────────────────────────────────────────────────────────

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  avatarUri: undefined,
  yearlyGoal: 12,
  joinedAt: new Date().toISOString(),
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useBookStore = create<BookState>()(
  persist(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────────────────────
      books: [],
      sessions: [],
      profile: DEFAULT_PROFILE,
      activeSessionId: null,
      activeSessionStartTime: null,

      // ── Book CRUD ──────────────────────────────────────────────────────────

      addBook: (bookInput) => {
        const newBook: Book = {
          id: generateId(),
          addedAt: new Date().toISOString(),
          currentPage: 0,
          status: 'want_to_read',
          ...bookInput,
        };
        set((state) => ({ books: [newBook, ...state.books] }));
        return newBook;
      },

      updateBook: (id, updates) => {
        set((state) => ({
          books: state.books.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
      },

      deleteBook: (id) => {
        set((state) => ({
          books: state.books.filter((b) => b.id !== id),
          sessions: state.sessions.filter((s) => s.bookId !== id),
        }));
      },

      setBookStatus: (id, status) => {
        set((state) => ({
          books: state.books.map((b) => {
            if (b.id !== id) return b;
            const updates: Partial<Book> = { status };
            if (status === 'completed') {
              updates.completedAt = new Date().toISOString();
              updates.currentPage = b.totalPages;
            }
            return { ...b, ...updates };
          }),
        }));
      },

      updateReadingProgress: (id, currentPage) => {
        set((state) => ({
          books: state.books.map((b) => {
            if (b.id !== id) return b;
            const completed = currentPage >= b.totalPages;
            return {
              ...b,
              currentPage,
              status: completed ? 'completed' : b.status === 'want_to_read' ? 'reading' : b.status,
              completedAt: completed ? new Date().toISOString() : b.completedAt,
            };
          }),
        }));
      },

      rateBook: (id, rating) => {
        get().updateBook(id, { rating: Math.max(1, Math.min(5, rating)) });
      },

      // ── Session CRUD ───────────────────────────────────────────────────────

      startSession: (bookId, startPage) => {
        const id = generateId();
        const startTime = new Date().toISOString();
        const newSession: ReadingSession = {
          id,
          bookId,
          startTime,
          durationSeconds: 0,
          pagesRead: 0,
          startPage,
          endPage: startPage,
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: id,
          activeSessionStartTime: startTime,
        }));
        return id;
      },

      endSession: (sessionId, endPage) => {
        const { activeSessionStartTime } = get();
        const endTime = new Date().toISOString();
        const startTime = activeSessionStartTime ?? endTime;
        const durationSeconds = Math.round(
          (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
        );

        set((state) => {
          const session = state.sessions.find((s) => s.id === sessionId);
          if (!session) return {};

          const pagesRead = Math.max(0, endPage - session.startPage);

          const updatedSessions = state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, endTime, durationSeconds, pagesRead, endPage }
              : s
          );

          return {
            sessions: updatedSessions,
            activeSessionId: null,
            activeSessionStartTime: null,
          };
        });

        // Update reading progress on the book
        const session = get().sessions.find((s) => s.id === sessionId);
        if (session) {
          get().updateReadingProgress(session.bookId, endPage);
        }
      },

      cancelSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          activeSessionId: null,
          activeSessionStartTime: null,
        }));
      },

      getBookSessions: (bookId) => {
        return get().sessions.filter((s) => s.bookId === bookId);
      },

      // ── Computed ───────────────────────────────────────────────────────────

      getBook: (id) => get().books.find((b) => b.id === id),

      getBooksByStatus: (status) =>
        get().books.filter((b) => b.status === status),

      getCurrentStreak: () => {
        const dates = get()
          .sessions.filter((s) => s.durationSeconds > 0)
          .map((s) => formatDate(new Date(s.startTime)));
        return calculateStreak(dates);
      },

      getLongestStreak: () => {
        const dates = [...new Set(
          get()
            .sessions.filter((s) => s.durationSeconds > 0)
            .map((s) => formatDate(new Date(s.startTime)))
        )].sort();

        if (!dates.length) return 0;
        let longest = 1;
        let current = 1;
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1]);
          const curr = new Date(dates[i]);
          const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
          if (diff === 1) {
            current++;
            longest = Math.max(longest, current);
          } else {
            current = 1;
          }
        }
        return longest;
      },

      getTotalReadingTimeSeconds: () =>
        get().sessions.reduce((acc, s) => acc + s.durationSeconds, 0),

      getBooksPerMonth: () => {
        const result: Record<string, number> = {};
        get()
          .books.filter((b) => b.status === 'completed' && b.completedAt)
          .forEach((b) => {
            const key = monthKey(b.completedAt!);
            result[key] = (result[key] ?? 0) + 1;
          });
        return result;
      },

      getYearlyProgress: () => {
        const year = new Date().getFullYear();
        const completed = get().books.filter(
          (b) =>
            b.status === 'completed' &&
            b.completedAt?.startsWith(String(year))
        ).length;
        return { completed, goal: get().profile.yearlyGoal };
      },

      // ── Profile ────────────────────────────────────────────────────────────

      updateProfile: (updates) => {
        set((state) => ({
          profile: { ...state.profile, ...updates },
        }));
      },
    }),
    {
      name: 'maqra-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist the active session runtime state
      partialize: (state) => ({
        books: state.books,
        sessions: state.sessions,
        profile: state.profile,
      }),
    }
  )
);
