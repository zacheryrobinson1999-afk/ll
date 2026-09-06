import type { diaryEntries } from '@workspace/db';
import type { DiaryInput } from './diaryValidation';

export type DiaryRow = typeof diaryEntries.$inferSelect;
export type DailySummary = { id: string; date: string; summary: string; updatedAt: Date; fromLegacy: boolean };
export type DiaryStore = {
  list(owner: string, range: { from: string; to: string }): Promise<DiaryRow[]>;
  findDate(owner: string, id: string): Promise<string | null>;
  save(owner: string, input: DiaryInput): Promise<DiaryRow>;
};

function legacyText(row: DiaryRow): string {
  return [row.title, row.workPerformed,
    ...([
      ['Start time', row.startTime], ['End time', row.endTime], ['Duration (minutes)', row.durationMinutes],
      ['Crane/model', row.craneModel], ['Crane ID', row.craneId], ['System', row.systemCategory],
      ['Fault/symptom', row.faultSymptom], ['Diagnosis', row.diagnosis], ['Parts used', row.partsUsed],
      ['Outcome', row.outcome], ['Follow-up', row.followUpNotes], ['Document', row.documentId],
      ['Workshop note', row.workshopNoteId],
    ] as const).filter(([, value]) => value !== null && value !== '').map(([label, value]) => `${label}: ${value}`),
    row.followUpRequired ? 'Follow-up required' : '', row.tags.length ? `Tags: ${row.tags.join(', ')}` : '',
  ].filter(Boolean).join('\n');
}

export function dailySummaries(rows: DiaryRow[]): DailySummary[] {
  const byDate = new Map<string, DiaryRow[]>();
  for (const row of rows) byDate.set(row.workDate, [...(byDate.get(row.workDate) ?? []), row]);
  return [...byDate].sort(([a], [b]) => b.localeCompare(a)).map(([date, group]) => {
    group.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id));
    const saved = group.find(row => row.dailySummary !== null);
    const row = saved ?? group[0]!;
    return { id: row.id, date, summary: saved ? saved.dailySummary! : group.map(legacyText).join('\n\n'),
      updatedAt: new Date(Math.max(...group.map(item => item.updatedAt.getTime()))), fromLegacy: !saved };
  });
}

export function createDiaryService(store: DiaryStore) {
  return {
    async list(owner: string, range: { from: string; to: string }) {
      return dailySummaries(await store.list(owner, range));
    },
    async get(owner: string, date: string) {
      return dailySummaries(await store.list(owner, { from: date, to: date }))[0] ?? null;
    },
    findDate: (owner: string, id: string) => store.findDate(owner, id),
    async save(owner: string, input: DiaryInput) {
      return dailySummaries([await store.save(owner, input)])[0]!;
    },
  };
}
