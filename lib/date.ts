/**
 * lib/date.ts
 * Date/time helpers for reading sessions and streaks.
 */

/**
 * Returns today's date as a "YYYY-MM-DD" string in local time.
 */
export function today(): string {
  const d = new Date();
  return formatDate(d);
}

/**
 * Formats a Date object as "YYYY-MM-DD".
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the "YYYY-MM" month key for grouping books per month.
 */
export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/**
 * Formats seconds into "Xh Xm" display string.
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/**
 * Checks if two ISO date strings are on consecutive calendar days.
 */
export function areConsecutiveDays(a: string, b: string): boolean {
  const dateA = new Date(a);
  const dateB = new Date(b);
  const diffMs = Math.abs(dateA.getTime() - dateB.getTime());
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Calculates reading streak from a sorted array of "YYYY-MM-DD" session dates.
 */
export function calculateStreak(sessionDates: string[]): number {
  if (!sessionDates.length) return 0;

  const unique = [...new Set(sessionDates)].sort((a, b) => b.localeCompare(a));
  const todayStr = today();

  // If no session today or yesterday, streak is broken
  if (unique[0] !== todayStr && !areConsecutiveDays(unique[0], todayStr)) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < unique.length - 1; i++) {
    if (areConsecutiveDays(unique[i + 1], unique[i])) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Returns a human-readable relative date in Arabic.
 */
export function relativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
