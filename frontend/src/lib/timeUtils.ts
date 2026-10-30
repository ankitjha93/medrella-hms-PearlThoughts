/**
 * Time calculation and formatting utilities for Medrella HMS
 */

/**
 * Accurately calculates consultation end time from start time and duration in minutes
 * e.g. "10:00 AM" + 30 mins -> "10:30 AM"
 */
export function calculateEndTime(startTime: string, durationMinutes: number = 30): string {
  if (!startTime) return '';
  const match = startTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return startTime;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const newHours24 = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;

  const newPeriod = newHours24 >= 12 ? 'PM' : 'AM';
  let newHours12 = newHours24 % 12;
  if (newHours12 === 0) newHours12 = 12;

  return `${String(newHours12).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')} ${newPeriod}`;
}

/**
 * Formats a consultation time window cleanly
 * e.g. "10:00 AM – 10:30 AM"
 */
export function formatConsultationWindow(
  startTime?: string,
  endTime?: string,
  fallbackTime?: string,
  durationMinutes: number = 30
): string {
  const start = startTime || fallbackTime;
  if (!start) return '';
  const end = endTime || calculateEndTime(start, durationMinutes);
  return `${start} – ${end}`;
}

