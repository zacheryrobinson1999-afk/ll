export const DIARY_MAX_RANGE_DAYS = 732;
export const DIARY_MAX_SUMMARY_LENGTH = 20_000;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isDiaryId = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);
export type DiaryInput = { date: string; summary: string };

export function isCalendarDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month! - 1 && date.getUTCDate() === day;
}

export function readDiaryInput(value: unknown): DiaryInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (typeof input.date !== 'string' || !isCalendarDate(input.date) || typeof input.summary !== 'string') return null;
  const summary = input.summary.trim();
  if (!summary || summary.length > DIARY_MAX_SUMMARY_LENGTH) return null;
  return { date: input.date, summary }; // Never accept a client-supplied owner.
}

export function readDiaryRange(from: unknown, to: unknown, today = new Date()): { from: string; to: string } | null {
  if ((from !== undefined && typeof from !== 'string') || (to !== undefined && typeof to !== 'string')) return null;
  const end = typeof to === 'string' ? to : today.toISOString().slice(0, 10);
  if (!isCalendarDate(end)) return null;
  const startDate = new Date(`${end}T00:00:00Z`);
  startDate.setUTCDate(startDate.getUTCDate() - 89);
  const start = typeof from === 'string' ? from : startDate.toISOString().slice(0, 10);
  if (!isCalendarDate(start) || start > end) return null;
  const days = Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000) + 1;
  return days <= DIARY_MAX_RANGE_DAYS ? { from: start, to: end } : null;
}
