// Core data types for Maqra

export type ReadingStatus = 'reading' | 'completed' | 'want_to_read' | 'paused';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUri?: string; // local URI or remote URL
  totalPages: number;
  currentPage: number;
  status: ReadingStatus;
  rating?: number; // 1–5
  notes?: string;
  addedAt: string; // ISO date string
  completedAt?: string; // ISO date string
  genre?: string;
  language?: 'ar' | 'fr' | 'en' | string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  startTime: string; // ISO date string
  endTime?: string; // ISO date string
  durationSeconds: number;
  pagesRead: number;
  startPage: number;
  endPage: number;
}

export interface UserProfile {
  name: string;
  avatarUri?: string;
  yearlyGoal: number; // target books per year
  joinedAt: string; // ISO date string
  rtlEnabled?: boolean;
}

export interface ReadingStats {
  totalBooksRead: number;
  totalPagesRead: number;
  totalReadingTimeSeconds: number;
  currentStreak: number; // consecutive days
  longestStreak: number;
  booksPerMonth: Record<string, number>; // "YYYY-MM" -> count
  averageSessionMinutes: number;
}
