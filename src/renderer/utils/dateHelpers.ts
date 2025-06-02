import { SWEDISH_DAYS, type SwedishDay } from '../types';

/**
 * Format date in Swedish format (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format date and time in Swedish format
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Format time in Swedish format (HH:MM)
 */
export function formatTime(date: Date): string {
  return date.toLocaleString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get Swedish day name from date
 */
export function getSwedishDayName(date: Date): SwedishDay {
  const dayIndex = date.getDay();
  // JavaScript Date.getDay() returns 0 for Sunday, 1 for Monday, etc.
  // Our SWEDISH_DAYS array starts with Monday, so we need to adjust
  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return SWEDISH_DAYS[adjustedIndex];
}

/**
 * Get current week dates (Monday to Sunday)
 */
export function getCurrentWeekDates(): Date[] {
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  
  // Adjust to get Monday (if today is Sunday, go back 6 days, otherwise go back currentDay-1 days)
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
  monday.setDate(today.getDate() - daysFromMonday);
  
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDates.push(date);
  }
  
  return weekDates;
}

/**
 * Get week dates for a specific date
 */
export function getWeekDates(baseDate: Date): Date[] {
  const currentDay = baseDate.getDay();
  const monday = new Date(baseDate);
  
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
  monday.setDate(baseDate.getDate() - daysFromMonday);
  
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDates.push(date);
  }
  
  return weekDates;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the current week
 */
export function isCurrentWeek(date: Date): boolean {
  const weekDates = getCurrentWeekDates();
  const targetDate = formatDate(date);
  return weekDates.some(weekDate => formatDate(weekDate) === targetDate);
}

/**
 * Get relative day description in Swedish
 */
export function getRelativeDayDescription(date: Date): string {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Idag';
  if (diffDays === 1) return 'Imorgon';
  if (diffDays === -1) return 'Igår';
  if (diffDays > 1 && diffDays <= 7) return `Om ${diffDays} dagar`;
  if (diffDays < -1 && diffDays >= -7) return `För ${Math.abs(diffDays)} dagar sedan`;
  
  return getSwedishDayName(date);
}

/**
 * Parse work hours string and return start/end times
 */
export function parseWorkHours(workHours: string): { start?: string; end?: string; type?: string } {
  if (!workHours) return {};
  
  const cleaned = workHours.trim().toLowerCase();
  
  // Handle special cases
  if (cleaned === 'heldag') return { type: 'heldag' };
  if (cleaned === 'natt') return { type: 'natt' };
  if (cleaned === 'dag') return { type: 'dag' };
  if (cleaned === 'kväll') return { type: 'kväll' };
  if (cleaned === 'beredskap') return { type: 'beredskap' };
  if (cleaned === 'jour') return { type: 'jour' };
  
  // Parse time ranges like "08:00-16:00" or "8-16"
  const timeRangeMatch = cleaned.match(/(\d{1,2}):?(\d{2})?-(\d{1,2}):?(\d{2})?/);
  if (timeRangeMatch) {
    const [, startHour, startMinute = '00', endHour, endMinute = '00'] = timeRangeMatch;
    return {
      start: `${startHour.padStart(2, '0')}:${startMinute}`,
      end: `${endHour.padStart(2, '0')}:${endMinute}`
    };
  }
  
  return { type: 'custom' };
}

/**
 * Check if two work hour periods overlap
 */
export function doWorkHoursOverlap(hours1: string, hours2: string): boolean {
  const parsed1 = parseWorkHours(hours1);
  const parsed2 = parseWorkHours(hours2);
  
  // If either has no specific times, assume no overlap
  if (!parsed1.start || !parsed1.end || !parsed2.start || !parsed2.end) {
    return false;
  }
  
  const start1 = timeToMinutes(parsed1.start);
  const end1 = timeToMinutes(parsed1.end);
  const start2 = timeToMinutes(parsed2.start);
  const end2 = timeToMinutes(parsed2.end);
  
  return start1 < end2 && start2 < end1;
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Get week number (ISO 8601)
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
