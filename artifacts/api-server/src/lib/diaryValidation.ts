export const DIARY_MAX_RANGE_DAYS = 732;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isDiaryId = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);

export type DiaryInput = {
  workDate: string; startTime: string | null; endTime: string | null; durationMinutes: number | null;
  title: string; craneModel: string | null; craneId: string | null; systemCategory: string | null;
  faultSymptom: string | null; diagnosis: string | null; workPerformed: string; partsUsed: string | null;
  outcome: string | null; followUpRequired: boolean; followUpNotes: string | null; documentId: string | null;
  workshopNoteId: string | null; tags: string[];
};

export function isCalendarDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month! - 1 && date.getUTCDate() === day;
}

function text(value: unknown, max: number, required = false): string | null | undefined {
  if (value === null || value === undefined || value === '') return required ? undefined : null;
  if (typeof value !== 'string') return undefined;
  const result = value.trim();
  return result && result.length <= max ? result : required ? undefined : null;
}

export function readDiaryInput(value: unknown): DiaryInput | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const workDate = typeof input.workDate === 'string' ? input.workDate : '';
  const title = text(input.title, 180, true);
  const workPerformed = text(input.workPerformed, 20_000, true);
  if (!isCalendarDate(workDate) || !title || !workPerformed) return null;
  const optional = {
    craneModel: text(input.craneModel, 120), craneId: text(input.craneId, 160), systemCategory: text(input.systemCategory, 120),
    faultSymptom: text(input.faultSymptom, 4_000), diagnosis: text(input.diagnosis, 8_000), partsUsed: text(input.partsUsed, 4_000),
    outcome: text(input.outcome, 4_000), followUpNotes: text(input.followUpNotes, 4_000), documentId: text(input.documentId, 160),
  };
  if (Object.values(optional).some((item) => item === undefined)) return null;
  const startTime = input.startTime === null || input.startTime === '' || input.startTime === undefined ? null : typeof input.startTime === 'string' && TIME.test(input.startTime) ? input.startTime : undefined;
  const endTime = input.endTime === null || input.endTime === '' || input.endTime === undefined ? null : typeof input.endTime === 'string' && TIME.test(input.endTime) ? input.endTime : undefined;
  const durationMinutes = input.durationMinutes === null || input.durationMinutes === '' || input.durationMinutes === undefined ? null : Number.isInteger(input.durationMinutes) && Number(input.durationMinutes) >= 0 && Number(input.durationMinutes) <= 10_080 ? Number(input.durationMinutes) : undefined;
  const workshopNoteId = input.workshopNoteId === null || input.workshopNoteId === '' || input.workshopNoteId === undefined ? null : typeof input.workshopNoteId === 'string' && UUID.test(input.workshopNoteId) ? input.workshopNoteId : undefined;
  if (startTime === undefined || endTime === undefined || durationMinutes === undefined || workshopNoteId === undefined || typeof input.followUpRequired !== 'boolean' || !Array.isArray(input.tags) || input.tags.length > 20) return null;
  const tags = [...new Set(input.tags.map((tag) => typeof tag === 'string' ? tag.trim() : '').filter(Boolean))];
  if (tags.some((tag) => tag.length > 50)) return null;
  return { workDate, startTime, endTime, durationMinutes, title, workPerformed, followUpRequired: input.followUpRequired, workshopNoteId, tags, ...optional } as DiaryInput;
}

export function readDiaryRange(from: unknown, to: unknown, today = new Date()): { from: string; to: string } | null {
  const end = typeof to === 'string' ? to : today.toISOString().slice(0, 10);
  const startDate = new Date(`${end}T00:00:00Z`); startDate.setUTCDate(startDate.getUTCDate() - 89);
  const start = typeof from === 'string' ? from : startDate.toISOString().slice(0, 10);
  if (!isCalendarDate(start) || !isCalendarDate(end) || start > end) return null;
  const days = Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000) + 1;
  return days <= DIARY_MAX_RANGE_DAYS ? { from: start, to: end } : null;
}

export function withDiaryOwner(input: DiaryInput, technicianId: string): DiaryInput & { technicianId: string } {
  return { ...input, technicianId };
}
